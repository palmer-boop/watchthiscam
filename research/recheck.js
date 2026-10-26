// Re-check candidates that verify.js marked as not live, slowly, flagging throttled responses: node recheck.js
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CAM = /(web\s?cam|live\s?cam|\bcam\b|camera|kamera|webkamera|cámara|câmara|telecamera|surf\s?cam|nest|feeder|earthcam|explore\.org|live view|livestream)/i;
const NOT_CAM = /(relax|sleep|music|lofi|lo-fi|radio|news|walking tour|walk\b|walk |driving|drive |tour\b|replay|highlights|asmr|ambience|ambient|meditation|study|chill|gameplay|game|podcast|talk|sermon|church service|mass\b|prayer|scanner|atc audio|simulat|flight ?sim|fortnite|minecraft|gta|stream ?highlights|dashcam|bodycam|irl|wwe|football|soccer|nfl|nba|vs\.?\b|election|war\b|protest|rally|police|trump|biden|crypto|bitcoin|stock|tarot|horoscope|church live)/i;
(async () => {
  const all = JSON.parse(fs.readFileSync('candidates.json'));
  const ok = JSON.parse(fs.readFileSync('verified.json'));
  const have = new Set(ok.map(c => c.videoId));
  const todo = all.filter(c => CAM.test(c.title + ' ' + c.channel) && !NOT_CAM.test(c.title) && !have.has(c.videoId));
  let blocked = 0, added = 0;
  for (const c of todo) {
    const html = await (await fetch(`https://www.youtube.com/watch?v=${c.videoId}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })).text().catch(() => '');
    if (!html.includes('ytInitialPlayerResponse')) { blocked++; await sleep(15000); continue; }
    if (/"isLiveNow":true/.test(html) && /"playableInEmbed":true/.test(html) && !/"isFamilySafe":false/.test(html)) {
      const o = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + c.videoId)}&format=json`);
      if (o.status === 200) {
        const d = html.match(/"shortDescription":"((?:[^"\]|\.)*)"/);
        c.description = d ? JSON.parse(`"${d[1]}"`).slice(0, 600) : '';
        const s = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]*)"/);
        c.subscribers = s ? s[1] : '';
        ok.push(c); added++;
      }
    }
    await sleep(1500);
  }
  fs.writeFileSync('verified.json', JSON.stringify(ok, null, 1));
  console.log(`rechecked ${todo.length}, added ${added}, throttled ${blocked}, total ${ok.length}`);
})();
