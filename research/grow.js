// Grow the set: discover many more live cams on YouTube, verify, append NEW ones to verified.json.
// node grow.js   (safe to re-run; dedupes by videoId)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync('grow-log.txt', s + '\n'); };

// Big query set: world cities + categories + countries.
const CITIES = ['new york','los angeles','chicago','miami','san francisco','seattle','boston','austin','denver','new orleans',
 'london','paris','rome','venice','florence','milan','madrid','barcelona','lisbon','porto','amsterdam','berlin','munich','vienna','prague','budapest','warsaw','zurich','geneva','brussels','copenhagen','stockholm','oslo','helsinki','dublin','edinburgh','reykjavik','athens','istanbul','moscow',
 'tokyo','osaka','kyoto','seoul','beijing','shanghai','hong kong','taipei','bangkok','singapore','kuala lumpur','jakarta','manila','hanoi','mumbai','delhi','dubai','tel aviv',
 'sydney','melbourne','brisbane','perth','auckland','wellington','queenstown',
 'toronto','vancouver','montreal','mexico city','cancun','rio de janeiro','sao paulo','buenos aires','lima','santiago','bogota','cape town','nairobi','cairo','marrakech'];
const CATS = ['beach live cam','surf cam live','harbour live cam','ski resort live cam','mountain live webcam','airport live cam planes',
 'wildlife live cam','zoo live cam','aquarium live cam','bird feeder live cam','safari live cam','volcano live cam','aurora live cam',
 'times square live','las vegas live cam','train station live cam','port live cam ships','lighthouse live cam','national park live cam','river live cam','lake live webcam','waterfall live cam','nightlife live cam','cat cafe live cam'];
const QUERIES = [...CITIES.map(c => c + ' live webcam'), ...CATS];

function walk(o, out) { if (!o || typeof o !== 'object') return; if (o.videoRenderer) out.push(o.videoRenderer); for (const k in o) walk(o[k], out); }
const text = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join('')) : '';
const CAM = /(web\s?cam|live\s?cam|\bcam\b|camera|kamera|webkamera|cámara|câmara|telecamera|surf\s?cam|nest|feeder|earthcam|explore\.org|live view|livestream)/i;
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
  log(`grow start: have ${verified.length} verified; ${QUERIES.length} queries`);
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
  log(`GROW FINISHED: added ${added} new live cams (throttle waits ${throttled}); verified.json now ${verified.length}`);
})();
