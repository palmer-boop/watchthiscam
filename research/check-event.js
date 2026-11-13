// Before publishing or updating a "happening now" page: is every YouTube cam on it live and embeddable right now?
//   node check-event.js <event-slug>
const fs = require('fs'), path = require('path');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const ev = JSON.parse(fs.readFileSync(path.join(__dirname, 'events.json'))).find(e => e.slug === process.argv[2]);
if (!ev) { console.log('no such event'); process.exit(1); }
const cams = JSON.parse(fs.readFileSync(path.join(__dirname, 'all-cams.json'))), byId = {}; cams.forEach(c => byId[c.id] = c);
(async () => {
  const ids = ev.sections.flatMap(s => s.ids || []); let bad = 0;
  for (const id of ids) {
    const c = byId[id]; if (!c) { console.log('MISSING  ', id); bad++; continue; }
    if (c.type === 'youtube') {
      try {
        const h = await (await fetch('https://www.youtube.com/watch?v=' + c.videoId, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) })).text();
        const live = /"isLiveNow":true/.test(h), emb = /"playableInEmbed":true/.test(h), t = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
        const w = (h.match(/"viewCount":\{"runs":\[\{"text":"([\d,]+)"/) || [])[1] || '?';
        if (!live || !emb) bad++;
        console.log((live && emb ? 'ok       ' : 'NOT LIVE '), id.slice(0, 44).padEnd(44), '|', w, 'watching |', t.replace(' - YouTube', '').slice(0, 60));
      } catch (e) { console.log('ERROR    ', id); bad++; }
      await new Promise(r => setTimeout(r, 900));
    } else if (c.type === 'image') {
      try { const r = await fetch(c.imageUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }); const n = (await r.arrayBuffer()).byteLength; if (!r.ok || n < 2000) bad++; console.log((r.ok && n >= 2000 ? 'ok       ' : 'DEAD IMG '), id.slice(0, 44).padEnd(44), '|', n, 'bytes'); }
      catch (e) { console.log('ERROR    ', id); bad++; }
    } else console.log('player   ', id, '(look at it by hand)');
  }
  console.log(bad ? `\n${bad} of ${ids.length} need attention` : `\nall ${ids.length} fine`);
})();
