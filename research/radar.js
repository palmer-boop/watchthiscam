// What is happening in the world right now that our cams can see?
// Reads free official feeds and counts our cams near each event, so we know when a news page is worth writing.
//   node radar.js            (needs a fresh build: reads ../dist/meta.js for cam positions)
// Sources: USGS earthquakes, NOAA NHC storms, NASA EONET (storms, wildfires, volcanoes worldwide),
//          US National Weather Service alerts, USGS volcano alert levels (HANS).
const fs = require('fs'), path = require('path');
const UA = 'watchthiscam.com radar (site owner contact via watchthiscam.com/about)';
const get = async (u, json = true) => { try { const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: json ? 'application/geo+json, application/json' : '*/*' }, signal: AbortSignal.timeout(40000) }); if (!r.ok) return null; return json ? await r.json() : await r.text(); } catch (e) { return null; } };
const km = (a, b, c, d) => { const R = 6371, t = Math.PI / 180, x = (c - a) * t, y = (d - b) * t, h = Math.sin(x / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const meta = (() => { const s = fs.readFileSync(path.join(__dirname, '..', 'dist', 'meta.js'), 'utf8'); return JSON.parse(s.slice(s.indexOf('['), s.indexOf(';window.TZS'))); })();
const located = meta.filter(m => m.x);            // 1 = the camera's own position, 2 = its city
const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'all-cams.json')));
const near = (la, ln, r) => located.map(m => ({ m, d: km(la, ln, m.la, m.ln) })).filter(x => x.d <= r).sort((a, b) => a.d - b.d);
const show = (title, la, ln, r, extra) => { const n = near(la, ln, r); return { title, la, ln, r, n: n.length, live: n.filter(x => !x.m.snap).length, top: n.slice(0, 5).map(x => `${x.m.n.slice(0, 34)} (${Math.round(x.d)} km)`), extra }; };
const out = [];
(async () => {
  // Earthquakes: magnitude 5.5+ in the past week
  const q = await get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
  for (const f of (q && q.features) || []) { const p = f.properties, c = f.geometry.coordinates; if (p.mag >= 5.5) out.push({ kind: 'quake', when: new Date(p.time).toISOString().slice(0, 10), ...show(`M${p.mag.toFixed(1)} ${p.place}`, c[1], c[0], 300) }); }
  // Atlantic / East Pacific storms
  const nhc = await get('https://www.nhc.noaa.gov/CurrentStorms.json');
  for (const s of (nhc && nhc.activeStorms) || []) out.push({ kind: 'storm', when: 'now', ...show(`${s.classification || ''} ${s.name} (NHC, ${s.intensity || '?'} kt)`, +s.latitudeNumeric, +s.longitudeNumeric, 600) });
  // Worldwide open events from NASA EONET (last position of each)
  const eo = await get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=8');
  for (const e of (eo && eo.events) || []) { const g = e.geometry[e.geometry.length - 1]; if (!g || g.type !== 'Point') continue; const cat = (e.categories[0] || {}).id;
    out.push({ kind: cat, when: String(g.date).slice(0, 10), ...show(e.title, g.coordinates[1], g.coordinates[0], cat === 'severeStorms' ? 600 : cat === 'volcanoes' ? 150 : 120) }); }
  // US weather warnings, grouped by kind and state, against our cams per state
  const stateCams = {}; for (const c of all) if (c.state) stateCams[c.state] = (stateCams[c.state] || 0) + 1;
  const ABBR = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  const BIG = /blizzard|winter storm warning|ice storm|hurricane|tropical storm|tornado warning|storm surge|extreme (cold|heat)|red flag|tsunami|volcano|avalanche warning|flash flood emergency|high surf warning|lake effect snow warning/i;
  const nws = await get('https://api.weather.gov/alerts/active?status=actual&message_type=alert,update'), groups = {};
  for (const f of (nws && nws.features) || []) { const p = f.properties; if (!BIG.test(p.event || '')) continue; for (const u of ((p.geocode || {}).UGC || [])) { const st = ABBR[u.slice(0, 2)]; if (!st) continue; ((groups[p.event] = groups[p.event] || {})[st] = (groups[p.event][st] || 0) + 1); } }
  const usAlerts = Object.entries(groups).map(([ev, sts]) => ({ ev, states: Object.keys(sts).sort((a, b) => (stateCams[b] || 0) - (stateCams[a] || 0)).map(s => `${s} (${stateCams[s] || 0} cams)`), cams: Object.keys(sts).reduce((a, s) => a + (stateCams[s] || 0), 0) })).sort((a, b) => b.cams - a.cams);
  // US volcanoes above normal (USGS)
  const hans = await get('https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes');
  const volc = (Array.isArray(hans) ? hans : []).map(v => `${v.volcano_name}: ${v.alert_level} / ${v.color_code}${v.sent_utc ? ' (' + String(v.sent_utc).slice(0, 10) + ')' : ''}`);

  out.sort((a, b) => b.n - a.n);
  console.log('=== EVENTS WITH CAMS NEARBY (located cams: ' + located.length + ') ===');
  for (const e of out.filter(e => e.n > 0).slice(0, 25)) console.log(`[${e.kind}] ${e.title} | ${e.when} | ${e.n} cams within ${e.r} km (${e.live} video) | ${e.top.join('; ')}`);
  console.log('\n=== EVENTS WITH NO CAMS NEARBY: ' + out.filter(e => !e.n).length + ' ===');
  console.log(out.filter(e => !e.n).slice(0, 12).map(e => `[${e.kind}] ${e.title.slice(0, 60)} (${e.when})`).join('\n'));
  console.log('\n=== US WEATHER WARNINGS (big ones only) ===');
  console.log(usAlerts.slice(0, 12).map(a => `${a.ev}: ${a.states.slice(0, 8).join(', ')}`).join('\n') || 'none');
  console.log('\n=== US VOLCANOES ABOVE NORMAL (USGS) ===');
  console.log(volc.join('\n') || 'none / feed did not answer');
  console.log('\nfeeds answered:', JSON.stringify({ usgs: !!q, nhc: !!nhc, eonet: !!eo, nws: !!nws, hans: !!hans }));
})();
