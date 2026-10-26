// Verify a YouTube batch is live+embeddable now; append good ones to verified.json. node verify-youtube.js <file>
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const batch = JSON.parse(fs.readFileSync(process.argv[2]));
const verified = JSON.parse(fs.readFileSync('verified.json'));
const have = new Set(verified.map(c => c.videoId));

async function check(c) {
  try {
    const o = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + c.videoId + '&format=json');
    if (o.status !== 200) return 'not embeddable';
    const html = await (await fetch('https://www.youtube.com/watch?v=' + c.videoId, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })).text();
    if (!html.includes('ytInitialPlayerResponse')) return 'throttle';
    if (!/"isLiveNow":true/.test(html)) return 'not live';
    if (!/"playableInEmbed":true/.test(html)) return 'embed blocked';
    if (/"isFamilySafe":false/.test(html)) return 'not family safe';
    const w = html.match(/"viewCount":\{"runs":\[\{"text":"([\d,]+)"/) || html.match(/([\d,]+) watching/);
    c.watching = w ? w[1].replace(/,/g, '') + ' watching' : (c.watching || '');
    return true;
  } catch (e) { return 'error ' + e.message; }
}

(async () => {
  let added = 0;
  for (const c of batch) {
    if (have.has(c.videoId)) { console.log('dup', c.videoId); continue; }
    let r = await check(c), tries = 0;
    while (r === 'throttle' && tries++ < 3) { await sleep(20000); r = await check(c); }
    if (r === true) { verified.push({ videoId: c.videoId, title: c.title, channel: c.channel, watching: c.watching, cat: 'city', queries: ['agent'] }); have.add(c.videoId); added++; console.log('OK  ', c.title.slice(0, 50)); fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1)); }
    else console.log('DROP', r, '|', c.title.slice(0, 50));
    await sleep(5000);
  }
  fs.writeFileSync('verified.json', JSON.stringify(verified, null, 1));
  console.log('added', added, 'of', batch.length, '-> verified.json now', verified.length);
})();
