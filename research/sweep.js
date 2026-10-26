// Freshness sweep: flag dead cams (ended YouTube streams, dead image feeds). node sweep.js
// Writes research/dead.json = [ids] and prints a summary. Does NOT modify the live set.
const fs = require('fs'), path = require('path');
const R = __dirname;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const cams = JSON.parse(fs.readFileSync(path.join(R, 'all-cams.json')));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = s => { console.log(s); fs.appendFileSync(path.join(R, 'sweep-log.txt'), s + '\n'); };

async function ytLive(id) {
  for (let i = 0; i < 4; i++) {
    try {
      const html = await (await fetch('https://www.youtube.com/watch?v=' + id, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(20000) })).text();
      if (!html.includes('ytInitialPlayerResponse')) { await sleep(8000); continue; }   // throttled, retry
      if (/"isLiveNow":true/.test(html)) return 'live';
      if (/"status":"ERROR"|"LOGIN_REQUIRED"|This live stream recording is not available|Private video|been removed/.test(html)) return 'gone';
      return 'notlive';   // ended / waiting room
    } catch { await sleep(4000); }
  }
  return 'unknown';
}
async function imgOk(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!r.ok) return false;
    if (/multipart/.test(ct)) return true;
    if (!/image\//.test(ct)) return false;
    const b = Buffer.from(await r.arrayBuffer());
    return b.length >= 2500;
  } catch { return false; }
}

(async () => {
  const dead = [], flags = {};
  const yt = cams.filter(c => c.type === 'youtube'), img = cams.filter(c => c.type === 'image');
  log(`sweep start: ${yt.length} youtube + ${img.length} image`);
  let n = 0;
  for (const c of yt) {
    const s = await ytLive(c.videoId);
    flags[c.id] = s;
    if (s === 'gone' || s === 'notlive') dead.push(c.id);
    if (++n % 25 === 0) log(`youtube ${n}/${yt.length}, dead so far ${dead.length}`);
    await sleep(1500);
  }
  log(`youtube done, dead ${dead.length}`);
  const q = [...img];
  await Promise.all([0, 1, 2].map(async () => {
    while (q.length) { const c = q.shift(); const ok = await imgOk(c.imageUrl); flags[c.id] = ok ? 'live' : 'dead'; if (!ok) dead.push(c.id); await sleep(300); }
  }));
  fs.writeFileSync(path.join(R, 'dead.json'), JSON.stringify(dead, null, 1));
  fs.writeFileSync(path.join(R, 'sweep-flags.json'), JSON.stringify(flags, null, 1));
  log(`FINISHED: ${dead.length} dead of ${cams.length} (${yt.length} yt + ${img.length} img). dead.json written.`);
})();
