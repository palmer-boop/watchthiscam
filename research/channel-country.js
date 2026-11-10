// Last resort for placing a stream: the country its YouTube channel says it is in (channel "About" page).
// Only trusted by curate.js for small local operators (a resort, a town, a harbour), never for worldwide channels.
// Writes yt-chcountry.json { videoId: "United States" | "" }.   node channel-country.js need-country.json   (resumable)
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const H = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ids = JSON.parse(fs.readFileSync(process.argv[2] || 'need-country.json'));
let out = {}; try { out = JSON.parse(fs.readFileSync('yt-chcountry.json')); } catch (e) {}
const byChannel = {};
(async () => {
  const todo = ids.filter(id => !(id in out)); console.log('channel countries to fetch:', todo.length);
  let n = 0;
  for (const id of todo) {
    try {
      const h = await (await fetch('https://www.youtube.com/watch?v=' + id, { headers: H, signal: AbortSignal.timeout(25000) })).text();
      const ch = (h.match(/"channelId":"(UC[\w-]{22})"/) || [])[1];
      if (ch) {
        if (!(ch in byChannel)) {
          await sleep(700);
          const a = await (await fetch('https://www.youtube.com/channel/' + ch + '/about', { headers: H, signal: AbortSignal.timeout(25000) })).text();
          byChannel[ch] = a.includes('ytInitialData') ? ((a.match(/"country":"([^"]+)"/) || [])[1] || '') : null;
        }
        if (byChannel[ch] != null) out[id] = byChannel[ch];
      } else if (h.includes('ytInitialPlayerResponse')) out[id] = '';
    } catch (e) {}
    if (++n % 20 === 0) { fs.writeFileSync('yt-chcountry.json', JSON.stringify(out)); console.log('fetched', n, 'of', todo.length); }
    await sleep(900);
  }
  fs.writeFileSync('yt-chcountry.json', JSON.stringify(out));
  const c = {}; Object.values(out).forEach(v => c[v || '(none given)'] = (c[v || '(none given)'] || 0) + 1);
  console.log('CHANNEL-COUNTRY FINISHED:', JSON.stringify(c));
})();
