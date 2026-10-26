// Curated spread subset of NZTA (New Zealand) highway cams -> more-raw6.json
// node gen-nzta.js   (reads net/nzta2.xml)
const fs = require('fs'), path = require('path');
const xml = fs.readFileSync(path.join(__dirname, 'net', 'nzta2.xml'), 'utf8');
const blocks = xml.match(/<camera>[\s\S]*?<\/camera>/g) || [];
const pick = (b, tag) => { const m = b.match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>')); return m ? m[1].trim() : ''; };
const BUCKET = 0.3, CAP = 36;
function cat(d) {
  if (/beach|bay|coast|harbour|estuary|sea\b/i.test(d)) return 'beach';
  if (/lake|river|gorge|falls|wetland/i.test(d)) return 'nature';
  if (/pass|summit|hill|alps|saddle|range|mt |mount|desert road|crown range|lindis|arthur|haast|remarkable/i.test(d)) return 'mountain';
  return 'traffic';
}
const seen = new Set(), out = [];
for (const b of blocks) {
  const desc = pick(b, 'description'), img = pick(b, 'imageUrl');
  const lat = +pick(b, 'startLatitude'), lon = +pick(b, 'startLongitude');
  if (!img || !desc || !lat) continue;
  const key = Math.round(lat / BUCKET) + ',' + Math.round(lon / BUCKET);
  if (seen.has(key)) continue; seen.add(key);
  out.push({
    name: desc.slice(0, 60), location: 'New Zealand', country: 'NZ', category: cat(desc),
    imageUrl: 'https://trafficnz.info' + img, isMjpeg: false, https: true, refreshSeconds: 120,
    operator: 'Waka Kotahi NZ Transport Agency', sourcePage: 'https://www.journeys.nzta.govt.nz/traffic-cameras',
    terms: 'Waka Kotahi NZTA open data (CC BY 4.0).', verified: '',
  });
  if (out.length >= CAP) break;
}
fs.writeFileSync(path.join(__dirname, 'more-raw6.json'), JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'of', blocks.length, 'NZ cams');
const byCat = {}; out.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1); console.log(byCat);
