// Check each player cam in players-raw.json and take a picture of it -> players.json
//  - ipcamlive: the network's own state API says whether the stream is up (and not domain-locked); live snapshot = thumbnail
//  - everything else: load the player in headless Edge and screenshot it (kept as the cam's thumbnail in src/static/thumbs)
// A human then looks at the pictures (node verify-players.js sheet) before the list is trusted.
//   node verify-players.js          check + screenshot (resumable)
//   node verify-players.js sheet    build contact sheets of every picture in <scratch>/sheets
const fs = require('fs'), path = require('path'), { execFile, execFileSync } = require('child_process');
const R = __dirname, THUMBS = path.join(R, '..', 'src', 'static', 'thumbs');
const WORK = process.env.WTC_SHOTS || path.join(R, 'net', 'shots');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
fs.mkdirSync(THUMBS, { recursive: true }); fs.mkdirSync(WORK, { recursive: true });
const raw = JSON.parse(fs.readFileSync(path.join(R, 'players-raw.json')));
const STATE = path.join(R, 'players-state.json');
let state = {}; try { state = JSON.parse(fs.readFileSync(STATE)); } catch (e) {}

function shot(url, png, prof) {
  return new Promise(res => {
    try { fs.unlinkSync(png); } catch (e) {}
    // Edge's launcher returns at once and the real browser writes the picture a few seconds later: wait for the file.
    const p = execFile(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run', '--autoplay-policy=no-user-gesture-required',
      '--user-data-dir=' + prof, '--window-size=640,360', '--virtual-time-budget=14000', '--screenshot=' + png, url], { timeout: 75000, windowsHide: true }, async () => {
      for (let i = 0; i < 50; i++) { if (fs.existsSync(png) && fs.statSync(png).size > 0) break; await sleep(1000); }
      await sleep(600); res(fs.existsSync(png) ? fs.statSync(png).size : 0);
    });
    p.on('error', () => res(0));
  });
}
const toJpg = (src, dst) => { try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', 'scale=480:270', '-q:v', '5', dst], { windowsHide: true }); return true; } catch (e) { return false; } };

async function main() {
  let n = 0;
  for (const c of raw) {
    const key = slug(c.name), s = state[c.embedUrl] = state[c.embedUrl] || {};
    if (s.done && (s.live || c.network === 'ipcamlive')) continue;
    const jpg = path.join(THUMBS, key + '.jpg');
    if (c.network === 'ipcamlive') {
      const alias = new URL(c.embedUrl).searchParams.get('alias');
      try {
        const j = await (await fetch('https://ipcamlive.com/player/getcamerastreamstate.php?alias=' + encodeURIComponent(alias), { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })).json();
        const d = j.details || {};
        s.live = d.enabled === '1' && d.streamavailable === '1' && d.domainlockenabled !== '1';
        s.why = `enabled=${d.enabled} stream=${d.streamavailable} lock=${d.domainlockenabled}`;
        if (s.live) {
          const r = await fetch('https://ipcamlive.com/player/snapshot.php?alias=' + encodeURIComponent(alias), { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
          const buf = Buffer.from(await r.arrayBuffer());
          if (r.ok && buf.length > 3000) { fs.writeFileSync(path.join(WORK, key + '.jpg'), buf); s.thumb = 'https://ipcamlive.com/player/snapshot.php?alias=' + encodeURIComponent(alias); s.pic = key + '.jpg'; }
          else { s.live = false; s.why += ' no snapshot'; }
        }
      } catch (e) { s.live = false; s.why = 'state error'; }
      s.done = true;
    } else {
      const png = path.join(WORK, key + '.png');
      let size = fs.existsSync(png) ? fs.statSync(png).size : 0;      // a picture from an earlier run is good enough
      if (!size) size = await shot(c.embedUrl, png, path.join(WORK, 'prof'));
      if (!size) { await sleep(1500); size = await shot(c.embedUrl, png, path.join(WORK, 'prof' + Date.now())); }
      s.size = size; s.live = size > 0; s.why = 'screenshot ' + size + ' bytes';
      if (size && toJpg(png, jpg)) { s.thumb = '/thumbs/' + key + '.jpg'; s.pic = key + '.jpg'; fs.copyFileSync(jpg, path.join(WORK, key + '.jpg')); }
      s.done = true;
    }
    fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
    console.log(`${++n} ${s.live ? 'ok  ' : 'DEAD'} ${c.network.padEnd(12)} ${c.name} | ${s.why}`);
    await sleep(400);
  }
  write();
}
// players.json = live ones only, minus anything a human struck out (players-reject.json: list of names).
function write() {
  let reject = []; try { reject = JSON.parse(fs.readFileSync(path.join(R, 'players-reject.json'))); } catch (e) {}
  const rj = new Set(reject);
  const out = raw.filter(c => (state[c.embedUrl] || {}).live && !rj.has(c.name)).map(c => ({ ...c, ...(state[c.embedUrl].thumb ? { thumbUrl: state[c.embedUrl].thumb } : {}) }));
  fs.writeFileSync(path.join(R, 'players.json'), JSON.stringify(out, null, 1));
  console.log(`PLAYERS FINISHED: ${out.length} kept of ${raw.length} (${raw.filter(c => !(state[c.embedUrl] || {}).live).length} not live, ${raw.filter(c => rj.has(c.name)).length} struck out)`);
}
// Contact sheets: 5x4 tiles, numbered in the order of sheet-index.txt.
function sheets() {
  const dir = path.join(WORK, 'sheets'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const list = raw.filter(c => (state[c.embedUrl] || {}).pic && fs.existsSync(path.join(WORK, state[c.embedUrl].pic)));
  list.forEach((c, i) => fs.copyFileSync(path.join(WORK, state[c.embedUrl].pic), path.join(dir, String(i + 1).padStart(3, '0') + '.jpg')));
  fs.writeFileSync(path.join(dir, 'sheet-index.txt'), list.map((c, i) => `${i + 1}\t${c.network}\t${c.name}`).join('\n'));
  const PER = 30, pages = Math.ceil(list.length / PER);
  for (let p = 0; p < pages; p++) {
    // each sheet gets its own folder of same-sized tiles (pictures come in different sizes; mixed sizes confuse the tiler)
    const pd = path.join(dir, 'p' + (p + 1)); fs.mkdirSync(pd);
    list.slice(p * PER, p * PER + PER).forEach((c, i) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(WORK, state[c.embedUrl].pic), '-vf', 'scale=256:144,format=yuvj420p', '-q:v', '4', path.join(pd, String(i + 1).padStart(2, '0') + '.jpg')], { windowsHide: true }));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-start_number', '1', '-i', path.join(pd, '%02d.jpg'), '-frames:v', '1', '-vf', 'tile=6x5', '-q:v', '4', path.join(dir, `sheet${p + 1}.jpg`)], { windowsHide: true });
  }
  console.log('sheets:', pages, 'in', dir, '| pictures:', list.length);
}
if (process.argv[2] === 'sheet') sheets(); else if (process.argv[2] === 'write') write(); else main();
