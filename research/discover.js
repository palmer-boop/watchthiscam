// Find live webcam streams on YouTube by search (Live filter): node discover.js
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const QUERIES = {
  city: ['times square live cam', 'abbey road crossing live cam', 'shibuya crossing live camera', 'venice live webcam', 'new york live cam',
    'las vegas strip live cam', 'london live webcam', 'paris eiffel tower live cam', 'tokyo live camera', 'prague live webcam',
    'amsterdam live webcam', 'rome live webcam', 'nashville broadway live cam', 'bourbon street live cam', 'hong kong live cam',
    'singapore live cam', 'dubai live cam', 'jackson hole town square live cam', 'key west live cam', 'barcelona live webcam'],
  ireland: ['dublin live webcam', 'galway live cam', 'cork live webcam', 'kerry live webcam', 'ireland live webcam', 'donegal live cam', 'belfast live cam'],
  australia: ['sydney harbour live cam', 'bondi beach live cam', 'gold coast live cam', 'melbourne live cam', 'australia live webcam', 'byron bay live cam'],
  portugal: ['lisbon live webcam', 'porto live webcam', 'algarve live webcam', 'nazare live cam', 'madeira live webcam', 'azores live cam'],
  beach: ['surf cam live', 'hawaii live beach cam', 'caribbean live beach cam', 'bali live cam', 'canary islands live webcam', 'florida beach live cam', 'thailand beach live cam'],
  wildlife: ['africam live', 'explore.org live cam', 'bear cam live', 'eagle nest live cam', 'bird feeder live cam', 'aquarium live cam',
    'panda live cam', 'otter live cam', 'zoo live cam', 'puffin live cam', 'osprey nest live cam', 'cat cafe live cam', 'puppy live cam'],
  nature: ['ski resort live cam', 'alps live webcam', 'volcano live cam', 'northern lights live cam', 'yellowstone live cam', 'niagara falls live cam',
    'mountain live webcam', 'iceland live webcam', 'norway live webcam', 'lake live webcam'],
  transport: ['airport live cam planes', 'harbour live cam ships', 'railway live cam', 'panama canal live cam', 'port live webcam ships',
    'train live cam', 'cruise ship port live cam', 'bridge live cam'],
  space: ['nasa live earth from space', 'iss live stream', 'rocket launch pad live cam'],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

function walk(o, out) {
  if (!o || typeof o !== 'object') return;
  if (o.videoRenderer) out.push(o.videoRenderer);
  for (const k in o) walk(o[k], out);
}
const text = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join('')) : '';

(async () => {
  const seen = new Map();
  for (const [cat, qs] of Object.entries(QUERIES)) {
    for (const q of qs) {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgJAAQ%253D%253D`;
      let html = '';
      try { html = await (await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })).text(); } catch {}
      const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
      const vids = [];
      if (m) walk(JSON.parse(m[1]), vids);
      for (const v of vids) {
        if (seen.has(v.videoId)) { seen.get(v.videoId).queries.push(q); continue; }
        seen.set(v.videoId, {
          videoId: v.videoId, title: text(v.title), channel: text(v.ownerText),
          channelId: v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '',
          watching: text(v.viewCountText), cat, queries: [q],
        });
      }
      console.log(`${cat} | ${q}: ${vids.length}`);
      await sleep(1200);
    }
  }
  fs.writeFileSync('candidates.json', JSON.stringify([...seen.values()], null, 1));
  console.log(`unique streams: ${seen.size}`);
})();
