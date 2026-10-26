// Second Windy pull: more scenic categories, deduped against more-raw8 -> more-raw9.json
// node gen-windy2.js <API_KEY>
const fs = require('fs'), path = require('path');
const KEY = process.argv[2];
if (!KEY) { console.error('need API key arg'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CATS = [['port', 'harbour', 45], ['river', 'nature', 40], ['forest', 'nature', 40], ['square', 'landmark', 35], ['city', 'city', 45]];
const PER_COUNTRY_CAT = 3;

async function page(cat, offset) {
  const url = `https://api.windy.com/webcams/api/v3/webcams?limit=50&offset=${offset}&categories=${cat}&include=location,urls`;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { 'x-windy-api-key': KEY }, signal: AbortSignal.timeout(25000) });
      if (!r.ok) { await sleep(3000); continue; }
      return (await r.json()).webcams || [];
    } catch { await sleep(3000); }
  }
  return [];
}
const clean = t => String(t).replace(/\s*›\s*/g, ' · ').replace(/\s{2,}/g, ' ').trim().slice(0, 60);

(async () => {
  const out = [], seen = new Set();
  try { JSON.parse(fs.readFileSync(path.join(__dirname, 'more-raw8.json'))).forEach(c => { const m = c.imageUrl.match(/current\/(\d+)\//); if (m) seen.add(+m[1]); }); } catch {}
  for (const [wcat, ourCat, target] of CATS) {
    const perCC = {}; let got = 0, offset = 0;
    while (got < target && offset < 600) {
      const batch = await page(wcat, offset); offset += 50;
      if (!batch.length) break;
      for (const w of batch) {
        if (got >= target) break;
        const loc = w.location; if (!loc || loc.latitude == null) continue;
        const cc = (loc.country_code || 'XX').toUpperCase();
        if ((perCC[cc] || 0) >= PER_COUNTRY_CAT) continue;
        if (seen.has(w.webcamId)) continue; seen.add(w.webcamId);
        perCC[cc] = (perCC[cc] || 0) + 1; got++;
        out.push({
          name: clean(w.title), location: [loc.city, loc.country].filter(Boolean).join(', '),
          country: cc, countryName: loc.country || '', category: ourCat,
          imageUrl: `https://imgproxy.windy.com/_/preview/plain/current/${w.webcamId}/original.jpg`,
          lat: +loc.latitude, lon: +loc.longitude, isMjpeg: false, https: true, refreshSeconds: 600,
          operator: 'windy.com', sourcePage: (w.urls && w.urls.detail) || `https://windy.com/webcams/${w.webcamId}`,
          terms: 'Webcam via windy.com; links to the Windy webcam page.', verified: '',
        });
      }
      await sleep(400);
    }
    console.log(wcat, '->', ourCat, ':', got);
  }
  fs.writeFileSync(path.join(__dirname, 'more-raw9.json'), JSON.stringify(out, null, 1));
  console.log('TOTAL', out.length, 'from', new Set(out.map(c => c.country)).size, 'countries');
})();
