// Curated scenic-California subset from Caltrans district feeds -> more-raw5.json
// node gen-caltrans.js   (reads net/ca{1,3,5,9}.json)
const fs = require('fs'), path = require('path');
const files = ['ca1.json', 'ca3.json', 'ca5.json', 'ca9.json'];
const BUCKET = 0.25, PER_DISTRICT = 10;
const out = [];
function cat(name, elev) {
  if (/beach|pier|bay|coast|harbor|ocean|pacific/i.test(name)) return 'beach';
  if (/lake|river|tahoe/i.test(name)) return 'nature';
  if (elev > 4000 || /summit|pass|mtn|mountain|peak|sierra|mammoth|donner/i.test(name)) return 'mountain';
  return 'traffic';
}
for (const f of files) {
  let data; try { data = JSON.parse(fs.readFileSync(path.join(__dirname, 'net', f))).data; } catch { continue; }
  const seen = new Set(); let n = 0;
  for (const row of data) {
    const c = row.cctv, loc = c.location, img = c.imageData && c.imageData.static && c.imageData.static.currentImageURL;
    if (!img || !loc || !loc.latitude) continue;
    const lat = +loc.latitude, lon = +loc.longitude, elev = +loc.elevation || 0;
    const key = Math.round(lat / BUCKET) + ',' + Math.round(lon / BUCKET);
    if (seen.has(key)) continue; seen.add(key);
    const nm = (loc.locationName || '').replace(/\s+/g, ' ').trim();
    const place = loc.nearbyPlace ? loc.nearbyPlace + ', California' : 'California, USA';
    out.push({
      name: nm.length > 3 ? nm : (loc.nearbyPlace || 'California road'), location: place, country: 'US', category: cat(nm, elev),
      imageUrl: img, isMjpeg: false, https: true, refreshSeconds: 60,
      operator: 'Caltrans', sourcePage: 'https://cwwp2.dot.ca.gov/vm/iframemap.htm',
      terms: 'Caltrans (California DOT), public domain.', verified: '',
    });
    if (++n >= PER_DISTRICT) break;
  }
}
fs.writeFileSync(path.join(__dirname, 'more-raw5.json'), JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'scenic California cams');
const byCat = {}; out.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1); console.log(byCat);
