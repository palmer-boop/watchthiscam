// Self-heal ended YouTube streams. When an operator restarts a stream it gets a new video id and the old one
// becomes a recording. For each dead cam, look on the same channel for a stream that is live now with the same
// (or near-identical) title, and move our cam to it. The cam keeps its page, name and URL.
//   node heal.js          find replacements for the YouTube ids in dead-confirmed.json -> heal.json (old id -> new id)
//   node heal.js apply    also swap them in verified.json, curated.json and overrides.json, and unblock nothing
// Then: node curate.js && (cd .. && node merge.js && node build.js)
const fs = require('fs'), path = require('path');
const R = __dirname, UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const H = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = async u => { try { return await (await fetch(u, { headers: H, signal: AbortSignal.timeout(30000) })).text(); } catch (e) { return ''; } };
const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9぀-ヿ一-鿿가-힯]+/g, ' ').replace(/\b(live|stream|streaming|cam|camera|webcam|4k|hd|24 7|now)\b/g, ' ').replace(/\s+/g, ' ').trim();
const sim = (a, b) => { const A = new Set(norm(a).split(' ').filter(Boolean)), B = new Set(norm(b).split(' ').filter(Boolean)); if (!A.size || !B.size) return 0; let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };
const verified = JSON.parse(fs.readFileSync(path.join(R, 'verified.json'))), vById = {}; verified.forEach(c => vById[c.videoId] = c);
const dead = JSON.parse(fs.readFileSync(path.join(R, 'dead-confirmed.json'))).videoIds || [];
let heal = {}; try { heal = JSON.parse(fs.readFileSync(path.join(R, 'heal.json'))); } catch (e) {}
const chanLive = {};   // channelId -> [{ id, title }] live right now
async function liveOn(ch) {
  if (chanLive[ch]) return chanLive[ch];
  const h = await get('https://www.youtube.com/channel/' + ch + '/streams'), out = [];
  const un = t => { try { return JSON.parse('"' + t + '"'); } catch (e) { return t; } };
  // older page format
  for (const part of h.split('"videoRenderer":{').slice(1)) {
    const chunk = part.slice(0, 6000), id = (chunk.match(/"videoId":"([\w-]{11})"/) || [])[1], t = (chunk.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/) || [])[1];
    if (id && t && /"style":"LIVE"|"iconType":"LIVE"|BADGE_STYLE_TYPE_LIVE_NOW/.test(chunk)) out.push({ id, title: un(t) });
  }
  // current page format: one "lockupViewModel" per video, with a LIVE badge on the thumbnail when it is on air
  for (const chunk of h.split('"lockupViewModel":{').slice(1)) {
    const id = (chunk.match(/"contentId":"([\w-]{11})"/) || [])[1], t = (chunk.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/) || [])[1];
    if (id && t && /"text":"LIVE"|BADGE_STYLE_LIVE|"animatedText":"LIVE"/.test(chunk)) out.push({ id, title: un(t) });
  }
  return chanLive[ch] = out;
}
(async () => {
  const have = new Set(verified.map(c => c.videoId)), used = new Set(Object.values(heal));
  let found = 0, none = 0, noChan = 0;
  for (const old of dead) {
    if (heal[old]) { found++; continue; }
    const c = vById[old]; if (!c) continue;
    const h = await get('https://www.youtube.com/watch?v=' + old), ch = (h.match(/"channelId":"(UC[\w-]{22})"/) || [])[1];
    if (!ch) { noChan++; await sleep(800); continue; }
    await sleep(700);
    const live = (await liveOn(ch)).filter(v => !have.has(v.id) && !used.has(v.id));
    let best = null, bs = 0; for (const v of live) { const s = sim(c.title, v.title); if (s > bs) { bs = s; best = v; } }
    // same title (allowing for a changed date or emoji), or the channel's only live stream and a decent match
    if (best && (bs >= 0.7 || (live.length === 1 && bs >= 0.45))) {
      const w = await get('https://www.youtube.com/watch?v=' + best.id);
      if (/"isLiveNow":true/.test(w) && /"playableInEmbed":true/.test(w) && !/"isFamilySafe":false/.test(w)) { heal[old] = best.id; used.add(best.id); found++; console.log('healed', (c.title || '').slice(0, 44), '->', best.title.slice(0, 44), '(' + bs.toFixed(2) + ')'); }
      else none++;
    } else none++;
    fs.writeFileSync(path.join(R, 'heal.json'), JSON.stringify(heal, null, 1));
    await sleep(900);
  }
  console.log(`HEAL: ${found} of ${dead.length} found a new live stream on the same channel | no match ${none} | channel unknown (video removed) ${noChan}`);
  if (process.argv[2] === 'apply') {
    const swap = f => { const p = path.join(R, f); let j; try { j = JSON.parse(fs.readFileSync(p)); } catch (e) { return; } let n = 0;
      if (Array.isArray(j)) { for (const c of j) if (heal[c.videoId]) { const nw = heal[c.videoId]; c.videoId = nw; if (c.source) c.source = 'https://www.youtube.com/watch?v=' + nw; n++; } }
      else { for (const k of Object.keys(j)) if (heal[k]) { j[heal[k]] = j[k]; delete j[k]; n++; } }
      fs.writeFileSync(p, JSON.stringify(j, null, 1)); console.log('  swapped in', f + ':', n); };
    swap('verified.json'); swap('curated.json'); swap('overrides.json');
  }
})();
