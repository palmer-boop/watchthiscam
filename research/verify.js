// Keep real webcams that are live now and allow embedding: node verify.js
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const CAM = /(web\s?cam|live\s?cam|\bcam\b|camera|kamera|webkamera|cámara|câmara|telecamera|surf\s?cam|nest|feeder|earthcam|explore\.org|live view|livestream)/i;
const NOT_CAM = /(relax|sleep|music|lofi|lo-fi|radio|news|walking tour|walk\b|walk |driving|drive |tour\b|replay|highlights|asmr|ambience|ambient|meditation|study|chill|gameplay|game|podcast|talk|sermon|church service|mass\b|prayer|scanner|atc audio|simulat|flight ?sim|fortnite|minecraft|gta|stream ?highlights|dashcam|bodycam|irl|wwe|football|soccer|nfl|nba|vs\.?\b|election|war\b|protest|rally|police|trump|biden|crypto|bitcoin|stock|tarot|horoscope|church live)/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function check(c) {
  const watch = `https://www.youtube.com/watch?v=${c.videoId}`;
  try {
    const o = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`);
    c.embeddable = o.status === 200;
    if (!c.embeddable) return c;
    const html = await (await fetch(watch, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })).text();
    c.liveNow = /"isLiveNow":true/.test(html);
    c.playableInEmbed = /"playableInEmbed":true/.test(html);
    c.familySafe = !/"isFamilySafe":false/.test(html);
    const d = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    c.description = d ? JSON.parse(`"${d[1]}"`).slice(0, 600) : '';
    const s = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]*)"/);
    c.subscribers = s ? s[1] : '';
  } catch (e) { c.error = String(e); }
  return c;
}

(async () => {
  const all = JSON.parse(fs.readFileSync('candidates.json'));
  const pool = all.filter(c => CAM.test(c.title + ' ' + c.channel) && !NOT_CAM.test(c.title));
  console.log(`candidates ${all.length}, look like webcams ${pool.length}`);
  const out = [];
  const queue = [...pool];
  await Promise.all([0, 1, 2, 3].map(async () => {
    while (queue.length) { out.push(await check(queue.shift())); await sleep(500); }
  }));
  const good = out.filter(c => c.embeddable && c.liveNow && c.playableInEmbed && c.familySafe);
  fs.writeFileSync('verified.json', JSON.stringify(good, null, 1));
  console.log(`not embeddable ${out.filter(c => !c.embeddable).length}, not live ${out.filter(c => c.embeddable && !c.liveNow).length}, ok ${good.length}`);
})();
