// Grow the set v3: FRESH queries aimed at under-represented country:category buckets
// + newly-live streams. Discover -> verify -> append NEW live cams to verified.json.
// node grow3.js   (safe to re-run; dedupes by videoId)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync('grow3-log.txt', s + '\n'); };

// Fresh angles: iconic landmarks, under-covered countries/regions, niche nature/wildlife,
// non-English terms (surface local-operator cams). Deliberately little overlap with grow.js.
const QUERIES = [
  // Iconic landmarks (new live streams rotate videoIds often)
  'eiffel tower live cam', 'big ben live cam', 'statue of liberty live cam', 'brooklyn bridge live cam',
  'golden gate bridge live cam', 'hollywood sign live cam', 'niagara falls live cam', 'mount fuji live cam',
  'sydney opera house live cam', 'table mountain live cam', 'christ the redeemer live cam', 'trevi fountain live cam',
  'colosseum live cam', 'sagrada familia live cam', 'brandenburg gate live cam', 'red square live cam',
  'grand canyon live cam', 'mount rushmore live cam', 'stonehenge live cam', 'acropolis live cam',
  // Under-covered countries / regions
  'croatia live webcam', 'dubrovnik live cam', 'split croatia live cam', 'slovenia live webcam', 'ljubljana live cam',
  'malta live webcam', 'cyprus live webcam', 'tenerife live webcam', 'gran canaria live cam', 'madeira live webcam',
  'azores live webcam', 'faroe islands live cam', 'greenland live webcam', 'estonia live webcam', 'tallinn live cam',
  'latvia riga live cam', 'lithuania vilnius live cam', 'romania live webcam', 'bucharest live cam', 'bulgaria live webcam',
  'serbia belgrade live cam', 'slovakia live webcam', 'montenegro live cam', 'georgia tbilisi live cam', 'armenia live cam',
  'morocco live webcam', 'tunisia live webcam', 'kenya live safari cam', 'tanzania serengeti live cam', 'botswana live cam',
  'maldives live webcam', 'sri lanka live cam', 'nepal himalaya live cam', 'bhutan live cam', 'cambodia angkor live cam',
  'laos live webcam', 'myanmar live cam', 'taiwan taipei live cam', 'macau live cam', 'mongolia live cam',
  'kazakhstan live cam', 'qatar doha live cam', 'oman live webcam', 'jordan petra live cam', 'lebanon beirut live cam',
  'costa rica live webcam', 'panama live webcam', 'belize live cam', 'ecuador live webcam', 'galapagos live cam',
  'bolivia live cam', 'uruguay montevideo live cam', 'paraguay live cam', 'jamaica live cam', 'barbados live cam',
  'puerto rico live cam', 'dominican republic live cam', 'fiji live webcam', 'tahiti live cam', 'hawaii volcano live cam',
  // Niche nature / wildlife (distinct buckets, rarely capped)
  'coral reef live cam', 'shark live cam', 'jellyfish live cam', 'penguin live cam', 'sea otter live cam',
  'manatee live cam', 'elephant live cam', 'lion live cam', 'hummingbird nest live cam', 'owl nest live cam',
  'wolf live cam', 'bald eagle nest live cam', 'beehive live cam', 'farm animals live cam', 'horse barn live cam',
  'dog shelter live cam', 'kitten rescue live cam', 'tropical fish tank live cam', 'tide pool live cam', 'whale live cam',
  // Scenic landscapes
  'fjord live cam', 'glacier live cam', 'rainforest live cam', 'canyon live cam', 'geyser live cam',
  'sand dunes live cam', 'coral atoll live cam', 'alpine meadow live cam', 'vineyard live cam', 'rice terrace live cam',
  // Transport niches
  'cruise ship port live cam', 'ferry terminal live cam', 'cable car live cam', 'tram live cam', 'space launch pad live cam',
  // Non-English terms (local-operator cams; CAM regex matches camara/camera/kamera/telecamera)
  'webcam en vivo playa', 'camara en vivo ciudad', 'webcam ao vivo praia', 'webcam ao vivo cidade',
  'telecamera dal vivo', 'webcam live direkt', 'live kamera stadt', 'webcam direct plage', 'прямая трансляция вебкамера',
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
  log(`grow3 start: have ${verified.length} verified; ${QUERIES.length} fresh queries`);
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
  log(`GROW3 FINISHED: added ${added} new live cams (throttle waits ${throttled}); verified.json now ${verified.length}`);
})();
