// Pull a curated scenic spread from the Windy Webcams API -> more-raw8.json
// node gen-windy.js <API_KEY>
const fs = require('fs'), path = require('path');
const KEY = process.argv[2];
if (!KEY) { console.error('need API key arg'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
// windy category -> our category, and how many to aim for
const CATS = [['beach', 'beach', 80], ['mountain', 'mountain', 90], ['lake', 'nature', 60], ['landscape', 'nature', 110]];
const PER_COUNTRY_CAT = 3;   // keep it spread, not 50 from one country

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
  fs.writeFileSync(path.join(__dirname, 'more-raw8.json'), JSON.stringify(out, null, 1));
  const byCo = {}; out.forEach(c => byCo[c.country] = (byCo[c.country] || 0) + 1);
  console.log('TOTAL', out.length, 'from', Object.keys(byCo).length, 'countries');
})();
