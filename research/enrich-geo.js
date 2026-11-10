// Location enrichment for direct-feed cams -> geo.json  { [imageUrl]: { lat, lon, tz, st } }
//  - coords: from the cam itself (windy) or backfilled from cached network data (Caltrans, NZTA, TfL)
//  - tz: real IANA time zone per coordinate (Open-Meteo, timezone=auto) so local time/sunrise are DST-correct
//  - st: US state by point-in-polygon (net/us-states.json, public-domain simplified boundaries)
// node enrich-geo.js   (resumable: only looks up what geo.json lacks)
const fs = require('fs'), path = require('path');
const R = __dirname, N = path.join(R, 'net');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cams = JSON.parse(fs.readFileSync(path.join(R, 'all-cams.json'))).filter(c => c.type === 'image' && c.imageUrl);
let geo = {}; try { geo = JSON.parse(fs.readFileSync(path.join(R, 'geo.json'))); } catch (e) {}

// --- backfill coordinate maps (imageUrl -> [lat, lon]) ---
const back = {};
for (const f of fs.readdirSync(N).filter(f => /^ca\d+\.json$/.test(f))) {
  try {
    for (const row of JSON.parse(fs.readFileSync(path.join(N, f))).data) {
      const c = row.cctv, img = c.imageData && c.imageData.static && c.imageData.static.currentImageURL;
      if (img && c.location && c.location.latitude) back[img] = [+c.location.latitude, +c.location.longitude];
    }
  } catch (e) {}
}
try {
  const xml = fs.readFileSync(path.join(N, 'nzta2.xml'), 'utf8');
  for (const b of xml.match(/<camera>[\s\S]*?<\/camera>/g) || []) {
    const img = (b.match(/<imageUrl>([^<]+)</) || [])[1], la = (b.match(/<latitude>([^<]+)</) || [])[1], lo = (b.match(/<longitude>([^<]+)</) || [])[1];
    if (img && la && lo) back['https://trafficnz.info' + img] = [+la, +lo];
  }
} catch (e) {}
try {
  for (const p of JSON.parse(fs.readFileSync(path.join(N, 'tfl.json')))) {
    const img = ((p.additionalProperties || []).find(a => a.key === 'imageUrl') || {}).value;
    if (img && p.lat) back[img] = [+p.lat, +p.lon];
  }
} catch (e) {}

// --- US states polygons ---
let states = null;
try { states = JSON.parse(fs.readFileSync(path.join(N, 'us-states.json'))).features; } catch (e) { console.log('no us-states.json (state lookup skipped)'); }
const inRing = (x, y, ring) => { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; } return inside; };
const inPoly = (x, y, poly) => inRing(x, y, poly[0]) && !poly.slice(1).some(h => inRing(x, y, h));
function stateOf(lat, lon) {
  if (!states) return null;
  for (const f of states) {
    const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    if (polys.some(p => inPoly(lon, lat, p))) return f.properties.name;
  }
  return null;
}

(async () => {
  let nCoord = 0, nBack = 0;
  for (const c of cams) {
    const g = geo[c.imageUrl] = geo[c.imageUrl] || {};
    if (c.lat != null && c.lon != null) { g.lat = +(+c.lat).toFixed(4); g.lon = +(+c.lon).toFixed(4); }
    else if (back[c.imageUrl]) { g.lat = +back[c.imageUrl][0].toFixed(4); g.lon = +back[c.imageUrl][1].toFixed(4); nBack++; }
    if (g.lat != null) nCoord++; else delete geo[c.imageUrl];
  }
  console.log(`cams: ${cams.length}, with coords: ${nCoord} (backfilled ${nBack})`);

  // time zones in batches
  const need = Object.keys(geo).filter(k => !geo[k].tz);
  console.log('tz lookups needed:', need.length);
  for (let i = 0; i < need.length; i += 60) {
    const part = need.slice(i, i + 60);
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + part.map(k => geo[k].lat).join(',') + '&longitude=' + part.map(k => geo[k].lon).join(',') + '&current=temperature_2m&timezone=auto';
    try {
      const j = await (await fetch(url, { signal: AbortSignal.timeout(30000) })).json();
      const arr = Array.isArray(j) ? j : [j];
      arr.forEach((o, n) => { if (o && o.timezone && part[n]) geo[part[n]].tz = o.timezone; });
    } catch (e) { console.log('tz batch failed at', i, String(e).slice(0, 60)); }
    fs.writeFileSync(path.join(R, 'geo.json'), JSON.stringify(geo));
    await sleep(700);
  }

  // US states
  let nSt = 0;
  const usUrls = new Set(cams.filter(c => c.country === 'US').map(c => c.imageUrl));
  for (const k of Object.keys(geo)) {
    if (!usUrls.has(k)) continue;
    const s = stateOf(geo[k].lat, geo[k].lon); if (s) { geo[k].st = s; nSt++; }
  }
  fs.writeFileSync(path.join(R, 'geo.json'), JSON.stringify(geo));
  const vals = Object.values(geo);
  console.log(`geo.json: ${vals.length} cams, tz ${vals.filter(v => v.tz).length}, US state ${nSt}`);
})();
