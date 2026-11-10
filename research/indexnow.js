// Tell Bing / Yandex (IndexNow) about every URL in the live sitemap, or only the ones not in a previous sitemap.
//   node indexnow.js                 submit everything in https://watchthiscam.com/sitemap.xml
//   node indexnow.js old-sitemap.xml submit only URLs that are not in that older copy
const fs = require('fs');
const HOST = 'watchthiscam.com', KEY = 'f8abc081b4c199219daf3bae5f931fac';
(async () => {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (process.argv[2]) { const old = new Set([...fs.readFileSync(process.argv[2], 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])); urls = urls.filter(u => !old.has(u)); }
  console.log('urls to submit:', urls.length);
  for (let i = 0; i < urls.length; i += 5000) {
    const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(i, i + 5000) }) });
    console.log('batch', i / 5000 + 1, '->', r.status, r.statusText);
  }
})();
