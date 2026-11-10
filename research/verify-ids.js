// Verify a list of bare YouTube video ids: keep the ones that are live, embeddable and family-safe NOW.
// Title + channel come from YouTube itself (oembed), nothing else. Appends to verified.json.
// node verify-ids.js <ids.json>   (ids.json = ["videoId", ...]; resumable, dedupes)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync('verify-ids-log.txt', s + '\n'); };
const NOT_CAM = /(relax|sleep|music|lofi|lo-fi|radio|\bnews\b|walking tour|driving|replay|highlights|asmr|meditation|study|gameplay|podcast|sermon|church service|\bmass\b|prayer|scanner|simulat|fortnite|minecraft|\bgta\b|dashcam|bodycam|election|protest|trump|biden|crypto|bitcoin|tarot|horoscope)/i;

const ids = [...new Set(JSON.parse(fs.readFileSync(process.argv[2])))];
const verified = JSON.parse(fs.readFileSync('verified.json'));
const have = new Set(verified.map(c => c.videoId));
let BLOCK = { videoIds: [] }; try { BLOCK = JSON.parse(fs.readFileSync('blocklist.json')); } catch (e) {}
const blocked = new Set(BLOCK.videoIds || []);
const DONE = 'verify-ids-done.json';
let done = {}; try { done = JSON.parse(fs.readFileSync(DONE)); } catch (e) {}

async function check(id) {
  try {
    const o = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + id + '&format=json', { signal: AbortSignal.timeout(20000) });
    if (o.status !== 200) return { r: 'not embeddable' };
    const meta = await o.json();
    const html = await (await fetch('https://www.youtube.com/watch?v=' + id, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) })).text();
    if (!html.includes('ytInitialPlayerResponse')) return { r: 'throttle' };
    if (!/"isLiveNow":true/.test(html)) return { r: 'not live' };
    if (!/"playableInEmbed":true/.test(html)) return { r: 'embed blocked' };
    if (/"isFamilySafe":false/.test(html)) return { r: 'not family safe' };
    if (NOT_CAM.test(meta.title || '')) return { r: 'not a cam' };
    const w = html.match(/"viewCount":\{"runs":\[\{"text":"([\d,]+)"/) || html.match(/([\d,]+) watching/);
    const s = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]*)"/);
    return { r: 'ok', c: { videoId: id, title: meta.title || '', channel: meta.author_name || '', watching: w ? w[1].replace(/,/g, '') + ' watching' : '', subscribers: s ? s[1] : '', cat: 'city', queries: [] } };
  } catch (e) { return { r: 'error' }; }
}

(async () => {
  const todo = ids.filter(id => !have.has(id) && !blocked.has(id) && !done[id]);
  log(`verify-ids start: ${ids.length} ids, ${ids.length - todo.length} already known/done, ${todo.length} to check`);
  let added = 0, n = 0; const why = {};
  for (const id of todo) {
    let x = await check(id), tries = 0;
    while (x.r === 'throttle' && tries++ < 4) { await sleep(20000); x = await check(id); }
    if (x.r === 'ok') { verified.push(x.c); have.add(id); added++; }
    if (x.r !== 'throttle' && x.r !== 'error') done[id] = x.r;
    why[x.r] = (why[x.r] || 0) + 1;
    if (++n % 25 === 0) {
      fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1)); fs.writeFileSync(DONE, JSON.stringify(done));
      log(`checked ${n}/${todo.length}, added ${added} | ${JSON.stringify(why)}`);
    }
    await sleep(1300);
  }
  fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1)); fs.writeFileSync(DONE, JSON.stringify(done));
  log(`VERIFY-IDS FINISHED: added ${added} of ${todo.length} checked | ${JSON.stringify(why)} | verified.json now ${verified.length}`);
})();
