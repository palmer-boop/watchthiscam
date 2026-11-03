// Grow v4: SEASONAL + still-uncovered angles (ski resorts now opening, Christmas markets,
// aurora towns, more islands/wildlife/waterfalls). Discover -> verify -> append live cams.
// node grow4.js   (safe to re-run; dedupes by videoId)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync('grow4-log.txt', s + '\n'); };

const QUERIES = [
  // Ski resorts (northern-hemisphere season just opening — many go live in November)
  'whistler live cam', 'aspen live cam', 'vail live cam', 'breckenridge live cam', 'park city live cam',
  'mammoth mountain live cam', 'lake tahoe ski live cam', 'chamonix live cam', 'st anton live cam', 'kitzbuhel live cam',
  'verbier live cam', 'val thorens live cam', "val d'isere live cam", 'cortina live webcam', 'st moritz live cam',
  'are sweden live cam', 'levi finland live cam', 'bansko live cam', 'niseko live cam', 'soldeu andorra live cam',
  // Christmas markets (live now through December)
  'vienna christmas market live cam', 'prague christmas market live cam', 'cologne christmas market live cam',
  'strasbourg christmas market live cam', 'nuremberg christmas market live cam', 'budapest christmas market live cam',
  'tallinn christmas market live cam', 'dresden christmas market live cam', 'rovaniemi santa live cam',
  // Aurora / northern-lights towns (season now)
  'tromso northern lights live cam', 'abisko aurora live cam', 'fairbanks aurora live cam', 'yellowknife aurora live cam',
  'rovaniemi live webcam', 'kiruna live cam', 'murmansk aurora live cam', 'churchill northern lights live cam',
  // Islands / beaches not yet covered
  'maldives live webcam', 'seychelles live cam', 'mauritius live webcam', 'zanzibar live cam', 'boracay live cam',
  'gili islands live cam', 'koh samui live cam', 'phuket live cam', 'santorini live webcam', 'ibiza live cam',
  'cyprus live webcam', 'crete live webcam', 'sardinia live webcam', 'sicily live webcam', 'corsica live cam',
  // Wildlife niches
  'panda live cam', 'red panda live cam', 'sloth live cam', 'koala live cam', 'meerkat live cam',
  'elephant sanctuary live cam', 'orca live cam', 'seal live cam', 'polar bear live cam', 'flamingo live cam',
  'hippo live cam', 'rhino live cam', 'gorilla live cam', 'tiger live cam', 'reindeer live cam',
  // Waterfalls & nature wonders
  'iguazu falls live cam', 'victoria falls live cam', 'plitvice live cam', 'angel falls live cam', 'yosemite falls live cam',
  'yellowstone old faithful live cam', 'mount hood live cam', 'mount rainier live cam', 'lake louise live cam', 'banff live cam',
  // More world cities with webcam demand
  'krakow live cam', 'gdansk live cam', 'bruges live cam', 'ghent live webcam', 'bergen live cam',
  'stavanger live cam', 'gothenburg live cam', 'helsinki live cam', 'tallinn live webcam', 'riga live cam',
  'ljubljana live cam', 'zagreb live cam', 'dubrovnik live cam', 'split live cam', 'valletta malta live cam',
  'porto live webcam', 'seville live cam', 'valencia live cam', 'naples live webcam', 'bologna live cam',
];

function walk(o, out) { if (!o || typeof o !== 'object') return; if (o.videoRenderer) out.push(o.videoRenderer); for (const k in o) walk(o[k], out); }
const text = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join('')) : '';
const CAM = /(web\s?cam|live\s?cam|\bcam\b|camera|kamera|webkamera|cámara|câmara|camara|telecamera|surf\s?cam|nest|feeder|earthcam|explore\.org|live view|livestream|en vivo|ao vivo|dal vivo|en direct)/i;
const NOT_CAM = /(relax|sleep|music|lofi|lo-fi|radio|news|walking tour|walk\b|driving|drive |tour\b|replay|highlights|asmr|ambience|ambient|meditation|study|chill|gameplay|\bgame\b|podcast|talk|sermon|church service|mass\b|prayer|scanner|atc audio|simulat|flight ?sim|fortnite|minecraft|gta|dashcam|bodycam|\birl\b|wwe|football|soccer|nfl|nba|election|protest|police|trump|biden|crypto|bitcoin|stock|tarot|horoscope)/i;

async function search(q) {
  try {
    const html = await (await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgJAAQ%253D%253D',
      { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(20000) })).text();
    const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    const out = []; if (m) walk(JSON.parse(m[1]), out); return out;
  } catch { return []; }
}
async function verify(c) {
  try {
    const o = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + c.videoId + '&format=json');
    if (o.status !== 200) return false;
    const html = await (await fetch('https://www.youtube.com/watch?v=' + c.videoId, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })).text();
    if (!html.includes('ytInitialPlayerResponse')) return 'throttle';
    if (!/"isLiveNow":true/.test(html) || !/"playableInEmbed":true/.test(html) || /"isFamilySafe":false/.test(html)) return false;
    const d = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/); c.description = d ? JSON.parse('"' + d[1] + '"').slice(0, 400) : '';
    const s = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]*)"/); c.subscribers = s ? s[1] : '';
    return true;
  } catch { return false; }
}

(async () => {
  const verified = JSON.parse(fs.readFileSync('verified.json'));
  const have = new Set(verified.map(c => c.videoId));
  log(`grow4 start: have ${verified.length} verified; ${QUERIES.length} seasonal/fresh queries`);
  const found = new Map();
  for (let i = 0; i < QUERIES.length; i++) {
    const vids = await search(QUERIES[i]);
    for (const v of vids) {
      if (!v.videoId || have.has(v.videoId) || found.has(v.videoId)) continue;
      const title = text(v.title), ch = text(v.ownerText);
      if (!CAM.test(title + ' ' + ch) || NOT_CAM.test(title)) continue;
      found.set(v.videoId, { videoId: v.videoId, title, channel: ch, watching: text(v.viewCountText), cat: 'city', queries: [QUERIES[i]] });
    }
    if ((i + 1) % 20 === 0) log(`searched ${i + 1}/${QUERIES.length}, new candidates ${found.size}`);
    await sleep(900);
  }
  log(`candidates to verify: ${found.size}`);
  const cand = [...found.values()];
  let added = 0, throttled = 0;
  for (let i = 0; i < cand.length; i++) {
    const r = await verify(cand[i]);
    if (r === 'throttle') { throttled++; await sleep(12000); i--; continue; }
    if (r) { verified.push(cand[i]); have.add(cand[i].videoId); added++; }
    if ((i + 1) % 40 === 0) { log(`verified ${i + 1}/${cand.length}, added ${added}`); fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1)); }
    await sleep(1400);
  }
  fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1));
  log(`GROW4 FINISHED: added ${added} new live cams (throttle waits ${throttled}); verified.json now ${verified.length}`);
})();
