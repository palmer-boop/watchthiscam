// Merge YouTube cams (curated.json), other networks' live players (players.json) and raw image cams (raw-*.json)
// -> research/all-cams.json. Also keeps research/added.json (the day each cam first appeared on the site).
// node merge.js
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, 'research');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(R, f))); } catch { return []; } };

let BLOCK = { imageUrls: [] }; try { BLOCK = JSON.parse(fs.readFileSync(path.join(R, 'blocklist.json'))); } catch (e) {}
const blockedUrl = new Set([...(BLOCK.imageUrls || []), ...(BLOCK.embedUrls || [])]);
const yt = read('curated.json').map(c => ({ ...c, type: 'youtube' }));

// A cam keeps its id (and so its URL) for good: look up what it was called last time by its feed address.
const PREV = read('all-cams.json'), prevId = {};
for (const c of PREV) { const k = c.imageUrl || c.embedUrl; if (k) prevId[k] = c.id; }

// Prefer the re-verified file when present (dead URLs already dropped).
const pick = base => fs.existsSync(path.join(R, base + '.verified.json')) ? base + '.verified.json' : base + '.json';
const rawFiles = [pick('raw-gov'), pick('raw-tourism'), pick('more-raw'), pick('more-raw2'), pick('more-raw3'), pick('more-raw4'), pick('more-raw5'), pick('more-raw6'), pick('more-raw7'), pick('more-raw8'), pick('more-raw9'), pick('more-raw10'), pick('more-raw11'), pick('more-raw12'), pick('more-raw13')];
const slug = s => (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cam').slice(0, 40);
const used = {};
yt.forEach(c => used[c.id] = 1);
Object.values(prevId).forEach(id => used[id] = used[id] || 2);   // 2 = reserved for its previous owner
function uid(name, key) {
  const old = prevId[key];
  if (old && used[old] === 2) { used[old] = 1; return old; }
  let s = slug(name), n = s, i = 2; while (used[n]) n = s + '-' + i++; used[n] = 1; return n;
}

// Other networks' own live players (ipcamlive, angelcam, rtsp.me ...): live video that is not YouTube.
const players = [], seenEmbed = new Set();
for (const c of read(pick('players'))) {
  if (!c || !c.embedUrl || !/^https:\/\//i.test(c.embedUrl) || blockedUrl.has(c.embedUrl) || seenEmbed.has(c.embedUrl)) continue;
  seenEmbed.add(c.embedUrl);
  players.push({
    id: uid(c.name || 'cam', c.embedUrl),
    name: (c.name || 'Live cam').slice(0, 60),
    country: (c.country || 'XX').toUpperCase().slice(0, 2),
    ...(c.state ? { state: c.state } : {}),
    category: (c.category || 'other').toLowerCase(),
    type: 'player',
    embedUrl: c.embedUrl,
    ...(c.thumbUrl ? { thumbUrl: c.thumbUrl } : {}),
    channel: c.operator || c.network || 'operator',
    network: c.network || '',
    source: c.sourcePage || c.embedUrl,
    ...(c.lat != null && c.lon != null ? { lat: +c.lat, lon: +c.lon } : {}),
  });
}

const raw = [];
const seenUrl = new Set();
for (const f of rawFiles) {
  for (const c of read(f)) {
    if (!c || !c.imageUrl || !/^https?:\/\//i.test(c.imageUrl) || blockedUrl.has(c.imageUrl)) continue;
    if (seenUrl.has(c.imageUrl)) continue; seenUrl.add(c.imageUrl);   // de-dupe image cams by URL
    raw.push({
      id: uid(c.name || c.location || 'cam', c.imageUrl),
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

const all = [...yt, ...players, ...raw];
const ids = new Set(); for (const c of all) { if (ids.has(c.id)) throw new Error('duplicate id: ' + c.id); ids.add(c.id); }
const moved = PREV.filter(c => (c.imageUrl || c.embedUrl) && ids.has(c.id) === false).length;
fs.writeFileSync(path.join(R, 'all-cams.json'), JSON.stringify(all, null, 1));

// First-seen dates. Everything that was on the site before this file existed counts as "from the start".
const ADDED_FILE = path.join(R, 'added.json'), START = '2026-10-26', today = new Date().toISOString().slice(0, 10);
let added = null; try { added = JSON.parse(fs.readFileSync(ADDED_FILE)); } catch (e) {}
if (!added) { added = {}; for (const c of PREV) added[c.id] = START; }
let fresh = 0; for (const c of all) if (!added[c.id]) { added[c.id] = today; fresh++; }
for (const k of Object.keys(added)) if (!ids.has(k)) delete added[k];
fs.writeFileSync(ADDED_FILE, JSON.stringify(added));

console.log(`merged: ${yt.length} youtube + ${players.length} player + ${raw.length} raw image = ${all.length} total`);
console.log(`new today: ${fresh} | gone since last merge: ${PREV.length ? PREV.filter(c => !ids.has(c.id)).length : 0}`);
