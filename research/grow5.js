// Grow v5: the WILD ones — genuinely crazy but PUBLICLY-PUBLISHED cams most people never find.
// Deep sea, space, Antarctica, volcano craters, African waterholes, the fish doorbell, etc.
// NEVER unsecured/private/Shodan feeds. node grow5.js (safe to re-run; dedupes by videoId)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync('grow5-log.txt', s + '\n'); };

const QUERIES = [
  // Deep sea / underwater
  'deep sea live cam', 'underwater reef live cam', 'shark live cam aquarium', 'jellyfish live cam', 'octopus live cam',
  'kelp forest live cam monterey', 'coral reef live cam', 'manatee live cam', 'sea otter live cam', 'stingray live cam',
  // Space
  'iss live stream earth', 'nasa live earth from space', 'space station live cam', 'rocket launch pad live cam',
  'spacex starbase live cam', 'international space station live',
  // Polar / remote
  'antarctica live cam', 'penguin live cam antarctica', 'arctic live webcam', 'svalbard live cam', 'reindeer live cam',
  'iceland volcano live cam', 'greenland live cam',
  // Volcano / earth
  'volcano crater live cam', 'lava live cam', 'kilauea live cam', 'etna live cam', 'geyser live cam',
  'yellowstone old faithful live cam', 'hot spring live cam',
  // African / safari wildlife (night predators)
  'africa waterhole live cam', 'safari live cam', 'africam live', 'lion live cam', 'elephant live cam waterhole',
  'leopard live cam', 'hippo live cam', 'rhino live cam', 'giraffe live cam', 'wild dog live cam',
  // Nest / bird / critter cams
  'bear live cam brooks falls', 'bald eagle nest live cam', 'owl nest live cam', 'osprey nest live cam', 'falcon nest live cam',
  'puffin live cam', 'hummingbird nest live cam', 'bat cave live cam', 'beehive live cam', 'ant farm live cam',
  'bird feeder live cam', 'sloth live cam', 'wolf live cam', 'fox den live cam', 'squirrel live cam',
  // Famous quirky
  'fish doorbell live', 'visdeurbel live', 'cat cafe live cam', 'puppy live cam', 'panda live cam',
  // Sky / observatory / aurora
  'aurora all sky live cam', 'northern lights live cam', 'observatory live cam', 'mauna kea live cam', 'night sky live cam telescope',
  'meteor live cam', 'milky way live cam',
  // Transport / industrial oddities
  'panama canal live cam', 'ship bridge live cam', 'cruise ship bridge live cam', 'train cab ride live', 'railway live cam',
  'airport runway live cam', 'lighthouse live cam',
  // Extreme weather
  'storm chaser live cam', 'hurricane live cam', 'lightning live cam', 'tornado live cam',
  // Slow TV / curiosities
  'slow tv live', 'farm live cam', 'cow barn live cam', 'horse stable live cam', 'fish tank live cam',
];

function walk(o, out) { if (!o || typeof o !== 'object') return; if (o.videoRenderer) out.push(o.videoRenderer); for (const k in o) walk(o[k], out); }
const text = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join('')) : '';
const CAM = /(web\s?cam|live\s?cam|\bcam\b|camera|kamera|webkamera|cámara|câmara|camara|telecamera|surf\s?cam|nest|feeder|earthcam|explore\.org|live view|livestream|iss|nasa|safari|africam|waterhole|doorbell|visdeurbel|aquarium|reef|aurora|volcano|geyser)/i;
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
  log(`grow5 start: have ${verified.length} verified; ${QUERIES.length} wild/obscure queries`);
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
  log(`GROW5 FINISHED: added ${added} new wild cams (throttle waits ${throttled}); verified.json now ${verified.length}`);
})();
