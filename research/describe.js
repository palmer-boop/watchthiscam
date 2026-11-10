// For streams whose title and channel do not say where they are: read the opening of the stream's own YouTube
// description, so curate.js can place it (country / US state). Writes yt-desc.json { videoId: first 500 chars }.
// node describe.js need-desc.json   (resumable)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ids = JSON.parse(fs.readFileSync(process.argv[2] || 'need-desc.json'));
let out = {}; try { out = JSON.parse(fs.readFileSync('yt-desc.json')); } catch (e) {}
(async () => {
  const todo = ids.filter(id => !(id in out));
  console.log('descriptions to fetch:', todo.length);
  let n = 0;
  for (const id of todo) {
    try {
      const html = await (await fetch('https://www.youtube.com/watch?v=' + id, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) })).text();
      const m = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
      if (m) { let t = ''; try { t = JSON.parse('"' + m[1] + '"'); } catch (e) {} out[id] = t.replace(/\s+/g, ' ').slice(0, 500); }
      else if (html.includes('ytInitialPlayerResponse')) out[id] = '';
    } catch (e) {}
    if (++n % 25 === 0) { fs.writeFileSync('yt-desc.json', JSON.stringify(out)); console.log('fetched', n, 'of', todo.length); }
    await sleep(1200);
  }
  fs.writeFileSync('yt-desc.json', JSON.stringify(out));
  console.log('DESCRIBE FINISHED:', Object.keys(out).length, 'descriptions on file');
})();
