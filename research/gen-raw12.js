// Expand DIRECT (non-YouTube) feeds: scenic-biased Caltrans (more districts) + more NZTA.
// Dedupes against existing all-cams.json. node gen-raw12.js -> more-raw12.json
const fs = require('fs'), path = require('path');
const SCENIC = { beach: 1, nature: 1, mountain: 1 };
const have = new Set();
try { for (const c of JSON.parse(fs.readFileSync(path.join(__dirname, 'all-cams.json')))) if (c.imageUrl) have.add(c.imageUrl); } catch (e) {}
const out = [];

// --- Caltrans (California): all coastal/scenic + a few city freeways per district ---
const caFiles = ['ca1.json', 'ca2.json', 'ca3.json', 'ca4.json', 'ca5.json', 'ca7.json', 'ca9.json', 'ca11.json', 'ca12.json'];
function caCat(name, elev) {
  if (/beach|pier|bay|coast|harbor|harbour|ocean|pacific|cliff|malibu|seal|wharf|marina/i.test(name)) return 'beach';
  if (/lake|river|tahoe|falls|creek|canyon|forest/i.test(name)) return 'nature';
  if (elev > 4000 || /summit|pass|mtn|mountain|peak|sierra|mammoth|donner|grade|ridge/i.test(name)) return 'mountain';
  return 'traffic';
}
for (const f of caFiles) {
  let data; try { data = JSON.parse(fs.readFileSync(path.join(__dirname, 'net', f))).data; } catch { continue; }
  const rows = [];
  for (const row of data) {
    const c = row.cctv, loc = c.location, img = c.imageData && c.imageData.static && c.imageData.static.currentImageURL;
    if (!img || !loc || !loc.latitude || have.has(img)) continue;
    const nm = (loc.locationName || '').replace(/\s+/g, ' ').trim();
    rows.push({ lat: +loc.latitude, lon: +loc.longitude, cat: caCat(nm + ' ' + (loc.nearbyPlace || ''), +loc.elevation || 0), nm, place: loc.nearbyPlace, img });
  }
  rows.sort((a, b) => (SCENIC[b.cat] ? 1 : 0) - (SCENIC[a.cat] ? 1 : 0));
  const seen = new Set(); let n = 0, traffic = 0;
  for (const r of rows) {
    const key = Math.round(r.lat / 0.2) + ',' + Math.round(r.lon / 0.2);
    if (seen.has(key)) continue;
    if (!SCENIC[r.cat] && traffic >= 3) continue;
    seen.add(key); if (!SCENIC[r.cat]) traffic++;
    out.push({ name: (r.nm.length > 3 ? r.nm : (r.place || 'California road')).slice(0, 60), location: r.place ? r.place + ', California' : 'California, USA', country: 'US', category: r.cat, imageUrl: r.img, isMjpeg: false, https: true, refreshSeconds: 60, operator: 'Caltrans', sourcePage: 'https://cwwp2.dot.ca.gov/vm/iframemap.htm', terms: 'Caltrans (California DOT), public domain.', verified: '' });
    if (++n >= 14) break;
  }
}

// --- NZTA (New Zealand): scenic-first, wider spread ---
const xml = fs.readFileSync(path.join(__dirname, 'net', 'nzta2.xml'), 'utf8');
const blocks = xml.match(/<camera>[\s\S]*?<\/camera>/g) || [];
const pick = (b, t) => { const m = b.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>')); return m ? m[1].trim() : ''; };
function nzCat(d) {
  if (/beach|bay|coast|harbour|estuary|sea\b/i.test(d)) return 'beach';
  if (/lake|river|gorge|falls|wetland/i.test(d)) return 'nature';
  if (/pass|summit|hill|alps|saddle|range|mt |mount|desert road|crown range|lindis|arthur|haast|remarkable/i.test(d)) return 'mountain';
  return 'traffic';
}
const nzRows = [];
for (const b of blocks) {
  const desc = pick(b, 'description'), img = pick(b, 'imageUrl'), lat = +pick(b, 'startLatitude'), lon = +pick(b, 'startLongitude');
  if (!img || !desc || !lat || have.has('https://trafficnz.info' + img)) continue;
  nzRows.push({ desc, img, lat, lon, cat: nzCat(desc) });
}
nzRows.sort((a, b) => (SCENIC[b.cat] ? 1 : 0) - (SCENIC[a.cat] ? 1 : 0));
const nzSeen = new Set(); let nzN = 0, nzTraffic = 0;
for (const r of nzRows) {
  const key = Math.round(r.lat / 0.2) + ',' + Math.round(r.lon / 0.2);
  if (nzSeen.has(key)) continue;
  if (!SCENIC[r.cat] && nzTraffic >= 12) continue;
  nzSeen.add(key); if (!SCENIC[r.cat]) nzTraffic++;
  out.push({ name: r.desc.slice(0, 60), location: 'New Zealand', country: 'NZ', category: r.cat, imageUrl: 'https://trafficnz.info' + r.img, isMjpeg: false, https: true, refreshSeconds: 120, operator: 'Waka Kotahi NZ Transport Agency', sourcePage: 'https://www.journeys.nzta.govt.nz/traffic-cameras', terms: 'Waka Kotahi NZTA open data (CC BY 4.0).', verified: '' });
  if (++nzN >= 70) break;
}

fs.writeFileSync(path.join(__dirname, 'more-raw12.json'), JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'new direct cams');
const byCat = {}, byCountry = {}; out.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + 1; byCountry[c.country] = (byCountry[c.country] || 0) + 1; });
console.log('by category:', byCat); console.log('by country:', byCountry);
