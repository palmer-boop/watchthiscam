// Second opinion on what sweep.js flagged, before anything is removed.
//   node confirm-dead.js          re-check every id in dead.json, write dead-confirmed.json, print a summary
//   node confirm-dead.js apply    also add the confirmed ones to blocklist.json (then run curate, merge, build)
// A cam is only confirmed dead when:
//   YouTube: the video is gone/private, or it is still not live on this second look (run this at least an hour after the sweep)
//   image:   the address gives an error or stops being an image, twice. A small picture is NOT dead: night shots compress to almost nothing.
const fs = require('fs'), path = require('path');
const R = __dirname, UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cams = JSON.parse(fs.readFileSync(path.join(R, 'all-cams.json'))), byId = {}; cams.forEach(c => byId[c.id] = c);
const dead = JSON.parse(fs.readFileSync(path.join(R, 'dead.json')));
async function yt(id) {
  for (let i = 0; i < 4; i++) {
    try {
      const h = await (await fetch('https://www.youtube.com/watch?v=' + id, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) })).text();
      if (!h.includes('ytInitialPlayerResponse')) { await sleep(10000); continue; }
      if (/"isLiveNow":true/.test(h)) return 'live';
      if (/"status":"ERROR"|"LOGIN_REQUIRED"|Private video|been removed|This video is unavailable/.test(h)) return 'gone';
      // A stream that has ENDED is now just a recording under this id (a restart gets a new id): dead for us.
      // A stream that is merely OFFLINE or waiting to start keeps its id and comes back: leave it alone.
      if (/"isUpcoming":true|LIVE_STREAM_OFFLINE/.test(h)) return 'offline';
      if (/"endTimestamp":"/.test(h)) return 'ended';
      return 'notlive';
    } catch (e) { await sleep(5000); }
  }
  return 'unknown';
}
async function img(url) {
  let bad = 0;
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      if (r.ok && (/image\//.test(ct) || /multipart/.test(ct))) { const n = /multipart/.test(ct) ? 9999 : (await r.arrayBuffer()).byteLength; if (n >= 200) return 'ok'; }
      bad++;
    } catch (e) { bad++; }
    await sleep(3000);
  }
  return bad >= 2 ? 'dead' : 'ok';
}
(async () => {
  const out = { videoIds: [], imageUrls: [], ids: [] }, alive = [], tally = {};
  for (const id of dead) {
    const c = byId[id]; if (!c) continue;
    let res;
    if (c.type === 'youtube') { res = await yt(c.videoId); if (res === 'gone' || res === 'ended') { out.videoIds.push(c.videoId); out.ids.push(id); } else alive.push(id + ' (' + res + ')'); await sleep(1000); }
    else if (c.type === 'image') { res = await img(c.imageUrl); if (res === 'dead') { out.imageUrls.push(c.imageUrl); out.ids.push(id); } else alive.push(id + ' (image fine)'); }
    else continue;
    tally[c.type + ':' + res] = (tally[c.type + ':' + res] || 0) + 1;
  }
  fs.writeFileSync(path.join(R, 'dead-confirmed.json'), JSON.stringify(out, null, 1));
  console.log('second look:', JSON.stringify(tally));
  console.log('confirmed dead:', out.ids.length, '(youtube', out.videoIds.length + ', image', out.imageUrls.length + ') | back alive or never dead:', alive.length);
  console.log('spared:', alive.slice(0, 40).join(', '));
  if (process.argv[2] === 'apply') {
    const bf = path.join(R, 'blocklist.json'); let b = { videoIds: [], imageUrls: [] }; try { b = JSON.parse(fs.readFileSync(bf)); } catch (e) {}
    b.videoIds = [...new Set([...(b.videoIds || []), ...out.videoIds])]; b.imageUrls = [...new Set([...(b.imageUrls || []), ...out.imageUrls])];
    fs.writeFileSync(bf, JSON.stringify(b, null, 1)); console.log('blocklist now:', b.videoIds.length, 'videos,', b.imageUrls.length, 'images');
  }
})();
