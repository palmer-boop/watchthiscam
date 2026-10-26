// Re-verify raw image cams actually return a real image now: node verify-raw.js <file>
// Drops dead URLs, non-images, and tiny fallback/placeholder images. Writes <file>.verified.json
const fs = require('fs');
const file = process.argv[2];
const cams = JSON.parse(fs.readFileSync(file));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function check(c) {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(c.imageUrl, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!r.ok) { clearTimeout(to); return { ok: false, why: 'HTTP ' + r.status }; }
    if (/multipart/.test(ct)) { clearTimeout(to); ctrl.abort(); return { ok: true, why: 'mjpeg', bytes: 0 }; } // live stream
    if (!/image\//.test(ct)) { clearTimeout(to); return { ok: false, why: 'not image (' + ct.slice(0, 30) + ')' }; }
    const buf = Buffer.from(await r.arrayBuffer());
    clearTimeout(to);
    if (buf.length < 2500) return { ok: false, why: 'tiny ' + buf.length + 'b (placeholder?)' };
    return { ok: true, why: ct, bytes: buf.length };
  } catch (e) { return { ok: false, why: String(e.name || e).slice(0, 30) }; }
}

(async () => {
  const kept = [], dropped = [];
  const q = [...cams];
  await Promise.all([0, 1, 2, 3].map(async () => {
    while (q.length) {
      const c = q.shift();
      const r = await check(c);
      if (r.ok) { c._bytes = r.bytes; c.isMjpeg = c.isMjpeg || r.why === 'mjpeg'; kept.push(c); }
      else dropped.push({ name: c.name, why: r.why });
      await sleep(200);
    }
  }));
  fs.writeFileSync(file.replace(/\.json$/, '.verified.json'), JSON.stringify(kept, null, 1));
  console.log(`${file}: kept ${kept.length}, dropped ${dropped.length}`);
  dropped.forEach(d => console.log('  DROP', d.name, '-', d.why));
})();
