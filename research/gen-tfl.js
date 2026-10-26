// Pick a geographically-spread subset of TfL London JamCams -> more-raw4.json
// node gen-tfl.js   (reads net/tfl.json)
const fs = require('fs'), path = require('path');
const a = JSON.parse(fs.readFileSync(path.join(__dirname, 'net', 'tfl.json')));
const CAP = 42, BUCKET = 0.045; // ~4-5km grid so cams spread across London
const seen = new Set(), out = [];
for (const s of a) {
  const img = (s.additionalProperties || []).find(p => p.key === 'imageUrl');
  if (!img || !img.value || s.lat == null) continue;
  const key = Math.round(s.lat / BUCKET) + ',' + Math.round(s.lon / BUCKET);
  if (seen.has(key)) continue; seen.add(key);
  // Clean the TfL name: "A406 Billet Upass E" -> "A406 Billet, London"
  let name = String(s.commonName).replace(/\s+[NSEW]{1,2}$/,'').replace(/\s+(Upass|Flyover|J\d+)$/i, m => m).trim();
  out.push({
    name: name.length > 3 ? name : s.commonName, location: 'London, UK', country: 'GB', category: 'traffic',
    imageUrl: img.value, isMjpeg: false, https: true, refreshSeconds: 120,
    operator: 'Transport for London', sourcePage: 'https://tfl.gov.uk/traffic/status/',
    terms: 'Powered by TfL Open Data.', verified: '',
  });
  if (out.length >= CAP) break;
}
fs.writeFileSync(path.join(__dirname, 'more-raw4.json'), JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'spread London cams to more-raw4.json');
