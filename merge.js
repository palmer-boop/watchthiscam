// Merge YouTube cams (curated.json) with raw image cams (raw-*.json) -> research/all-cams.json
// node merge.js
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, 'research');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(R, f))); } catch { return []; } };

let BLOCK = { imageUrls: [] }; try { BLOCK = JSON.parse(fs.readFileSync(path.join(R, 'blocklist.json'))); } catch (e) {}
const blockedUrl = new Set(BLOCK.imageUrls || []);
const yt = read('curated.json').map(c => ({ ...c, type: 'youtube' }));

// Prefer the re-verified file when present (dead URLs already dropped).
const pick = base => fs.existsSync(path.join(R, base + '.verified.json')) ? base + '.verified.json' : base + '.json';
const rawFiles = [pick('raw-gov'), pick('raw-tourism'), pick('more-raw'), pick('more-raw2'), pick('more-raw3'), pick('more-raw4'), pick('more-raw5'), pick('more-raw6'), pick('more-raw7'), pick('more-raw8'), pick('more-raw9'), pick('more-raw10')];
const slug = s => (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cam').slice(0, 40);
const used = {};
yt.forEach(c => used[c.id] = 1);
function uid(name) { let s = slug(name); let n = s; let i = 2; while (used[n]) n = s + '-' + i++; used[n] = 1; return n; }

const raw = [];
for (const f of rawFiles) {
  for (const c of read(f)) {
    if (!c || !c.imageUrl || !/^https?:\/\//i.test(c.imageUrl) || blockedUrl.has(c.imageUrl)) continue;
    raw.push({
      id: uid(c.name || c.location || 'cam'),
      name: (c.name || c.location || 'Live cam').slice(0, 60),
      country: (c.country || 'XX').toUpperCase().slice(0, 2),
      category: (c.category || 'other').toLowerCase(),
      type: 'image',
      imageUrl: c.imageUrl,
      isMjpeg: !!c.isMjpeg,
      refreshSeconds: Number(c.refreshSeconds) || 10,
      channel: c.operator || 'operator',
      source: c.sourcePage || c.imageUrl,
      terms: c.terms || '',
      ...(c.lat != null && c.lon != null ? { lat: +c.lat, lon: +c.lon } : {}),
      ...(c.countryName ? { countryName: c.countryName } : {}),
    });
  }
}

// de-dupe image cams by URL
const seenUrl = new Set();
const rawDedup = raw.filter(c => { if (seenUrl.has(c.imageUrl)) return false; seenUrl.add(c.imageUrl); return true; });

const all = [...yt, ...rawDedup];
fs.writeFileSync(path.join(R, 'all-cams.json'), JSON.stringify(all, null, 1));
console.log(`merged: ${yt.length} youtube + ${rawDedup.length} raw image = ${all.length} total`);
const byType = {}; all.forEach(c => byType[c.type] = (byType[c.type] || 0) + 1);
console.log(byType);
