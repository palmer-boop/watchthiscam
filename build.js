// Build the new Watch This Cam site into dist\ : node build.js
const fs = require('fs'), path = require('path');
const ROOT = __dirname, DIST = path.join(ROOT, 'dist');
const dataFile = fs.existsSync(path.join(ROOT, 'research', 'all-cams.json')) ? 'all-cams.json' : 'curated.json';
const cams = JSON.parse(fs.readFileSync(path.join(ROOT, 'research', dataFile)));

const CATS = {
  city: 'City streets', beach: 'Beaches', surf: 'Surf', harbour: 'Harbours & ports',
  transport: 'Planes & trains', traffic: 'Roads & traffic', wildlife: 'Animals', nature: 'Nature',
  mountain: 'Mountains', ski: 'Mountains & snow', volcano: 'Volcanoes', weather: 'Weather & sky',
  landmark: 'Landmarks', bar: 'Bars & nightlife', space: 'Space', other: 'Other',
};
const COUNTRIES = { IE: 'Ireland', AU: 'Australia', PT: 'Portugal', US: 'USA', GB: 'UK', JP: 'Japan',
  IT: 'Italy', NL: 'Netherlands', ES: 'Spain', CH: 'Switzerland', TH: 'Thailand', CB: 'Caribbean',
  NZ: 'New Zealand', CA: 'Canada', FI: 'Finland', NO: 'Norway', SE: 'Sweden', IS: 'Iceland',
  AT: 'Austria', DE: 'Germany', FR: 'France', AQ: 'Antarctica',
  KR: 'South Korea', CN: 'China', HK: 'Hong Kong', TW: 'Taiwan', SG: 'Singapore', IN: 'India', AE: 'UAE',
  VN: 'Vietnam', ID: 'Indonesia', PH: 'Philippines', MY: 'Malaysia', GR: 'Greece', TR: 'Turkey', RU: 'Russia',
  CZ: 'Czechia', HU: 'Hungary', PL: 'Poland', DK: 'Denmark', BE: 'Belgium', IL: 'Israel', MX: 'Mexico',
  BR: 'Brazil', AR: 'Argentina', PE: 'Peru', CO: 'Colombia', ZA: 'South Africa', KE: 'Kenya', EG: 'Egypt', MA: 'Morocco',
  SI: 'Slovenia', GT: 'Guatemala', NA: 'Namibia', NI: 'Nicaragua', CR: 'Costa Rica', BG: 'Bulgaria', XX: '' };
const FLAGS = { IE: '🇮🇪', AU: '🇦🇺', PT: '🇵🇹', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', IT: '🇮🇹', NL: '🇳🇱',
  ES: '🇪🇸', CH: '🇨🇭', TH: '🇹🇭', CB: '🏝️', NZ: '🇳🇿', CA: '🇨🇦', FI: '🇫🇮', NO: '🇳🇴', SE: '🇸🇪',
  IS: '🇮🇸', AT: '🇦🇹', DE: '🇩🇪', FR: '🇫🇷', AQ: '🇦🇶', XX: '🌐' };
// Windows + Chrome don't render country-flag emoji (they show "US"/"IE" letters), so we don't display them.
const flag = co => '';
// Rough per-country UTC offset + map position (centroid). For day/night in Smart surf and pins on the map.
const GEO = {
  JP: { off: 9, lat: 36, lng: 138 }, US: { off: -6, lat: 39, lng: -98 }, IT: { off: 1, lat: 42, lng: 12 },
  TH: { off: 7, lat: 15, lng: 101 }, ES: { off: 1, lat: 40, lng: -3 }, GB: { off: 0, lat: 54, lng: -2 },
  CB: { off: -4, lat: 15, lng: -69 }, NL: { off: 1, lat: 52, lng: 5 }, PT: { off: 0, lat: 39, lng: -8 },
  AU: { off: 11, lat: -27, lng: 134 }, IE: { off: 0, lat: 53, lng: -8 }, NZ: { off: 13, lat: -42, lng: 173 },
  CA: { off: -6, lat: 56, lng: -106 }, FI: { off: 2, lat: 62, lng: 26 }, DE: { off: 1, lat: 51, lng: 10 },
  AT: { off: 1, lat: 47, lng: 14 }, CH: { off: 1, lat: 47, lng: 8 }, IS: { off: 0, lat: 65, lng: -18 },
  CL: { off: -3, lat: -30, lng: -71 },
  KR: { off: 9, lat: 36, lng: 128 }, CN: { off: 8, lat: 35, lng: 105 }, HK: { off: 8, lat: 22.3, lng: 114.2 },
  TW: { off: 8, lat: 23.7, lng: 121 }, SG: { off: 8, lat: 1.35, lng: 103.8 }, IN: { off: 5.5, lat: 22, lng: 79 },
  AE: { off: 4, lat: 24, lng: 54 }, VN: { off: 7, lat: 16, lng: 106 }, ID: { off: 7, lat: -2, lng: 118 },
  PH: { off: 8, lat: 13, lng: 122 }, MY: { off: 8, lat: 4, lng: 102 }, FR: { off: 1, lat: 47, lng: 2 },
  GR: { off: 2, lat: 39, lng: 22 }, TR: { off: 3, lat: 39, lng: 35 }, RU: { off: 3, lat: 56, lng: 38 },
  CZ: { off: 1, lat: 50, lng: 15 }, HU: { off: 1, lat: 47, lng: 19 }, PL: { off: 1, lat: 52, lng: 19 },
  DK: { off: 1, lat: 56, lng: 10 }, SE: { off: 1, lat: 62, lng: 15 }, NO: { off: 1, lat: 62, lng: 10 },
  BE: { off: 1, lat: 50.6, lng: 4.5 }, IL: { off: 2, lat: 31.5, lng: 35 }, MX: { off: -6, lat: 23, lng: -102 },
  BR: { off: -3, lat: -10, lng: -52 }, AR: { off: -3, lat: -34, lng: -64 }, PE: { off: -5, lat: -10, lng: -76 },
  CO: { off: -5, lat: 4, lng: -73 }, ZA: { off: 2, lat: -29, lng: 24 }, KE: { off: 3, lat: 0, lng: 38 },
  EG: { off: 2, lat: 27, lng: 30 }, MA: { off: 1, lat: 32, lng: -6 }, DE: { off: 1, lat: 51, lng: 10 },
  SI: { off: 1, lat: 46, lng: 14.8 }, GT: { off: -6, lat: 15.5, lng: -90 }, NA: { off: 2, lat: -22, lng: 17 },
  NI: { off: -6, lat: 12.9, lng: -85 }, CR: { off: -6, lat: 10, lng: -84 }, BG: { off: 2, lat: 42.7, lng: 25.5 },
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const thumb = c => c.type === 'image' ? c.imageUrl : `https://i.ytimg.com/vi/${c.videoId}/mqdefault.jpg`;
const embed = c => `https://www.youtube-nocookie.com/embed/${c.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`;
// Player markup differs by source: YouTube iframe, MJPEG <img> stream, or a still image we refresh ourselves.
function playerInner(c) {
  if (c.type !== 'image') return `<span class="pill"><span class="dot"></span>LIVE</span>
<iframe id="ytframe" src="${embed(c)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(c.name)}"></iframe>`;
  const live = c.isMjpeg;
  return `<span class="pill${live ? '' : ' snap'}"><span class="dot"></span>${live ? 'LIVE' : 'REFRESHING'}</span>
<img class="contain" id="camimg" onerror="this.onerror=null;this.src='/ph.svg'" src="${esc(c.imageUrl)}" alt="${esc(c.name)}"${live ? '' : ` data-refresh="${c.refreshSeconds || 10}"`}>
${live ? '' : `<script>(function(){var i=document.getElementById('camimg'),u=${JSON.stringify(c.imageUrl)},s=(+i.dataset.refresh||10)*1000;setInterval(function(){i.src=u+(u.indexOf('?')<0?'?':'&')+'_t='+Date.now();},s);})();</script>`}`;
}

function blurb(c) {
  const where = COUNTRIES[c.country] ? ` in ${COUNTRIES[c.country]}` : '';
  const t = {
    city: `A live look at the streets${where}. Who knows what's walking past right now.`,
    beach: `A live beach cam${where}. Check the waves, the weather and who's out today.`,
    surf: `A live surf cam${where}. See what the swell is doing this very minute.`,
    harbour: `Boats, ships and comings-and-goings, live from the water${where}.`,
    transport: `Planes and trains on the move, streaming live${where}.`,
    wildlife: `A live animal cam${where}. You never know who'll wander into shot.`,
    nature: `A live view over nature${where}, changing with the light and the weather.`,
    ski: `A live mountain cam${where}. Snow, cloud or blue sky, see it as it is now.`,
    mountain: `A live mountain view${where}. Watch the weather roll across the peaks.`,
    volcano: `A live volcano cam${where}. Yes, really — the real thing, right now.`,
    weather: `A live look at the sky${where}. Sun, cloud, storm — whatever's overhead now.`,
    traffic: `A live road cam${where}. The traffic, the weather, the time of day.`,
    landmark: `A live view of a famous landmark${where}, exactly as it looks right now.`,
    bar: `A live cam from a bar${where}. Pull up a stool and watch the night unfold.`,
    space: `A live view from space. Earth, quietly turning.`,
  }[c.category] || `A live camera${where}, streaming right now.`;
  return t;
}
for (const c of cams) { c.blurb = blurb(c); c.catLabel = CATS[c.category] || 'Other'; c.countryLabel = COUNTRIES[c.country] || c.countryName || ''; }

const SITE_URL = 'https://watchthiscam.com';
const ogYt = cams.find(c => c.type !== 'image');
const DEFAULT_OG = ogYt ? `https://i.ytimg.com/vi/${ogYt.videoId}/hqdefault.jpg` : '/icon.svg';
const head = (title, desc, image, pagePath) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${SITE_URL}${pagePath || '/'}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Watch This Cam">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image || DEFAULT_OG)}">${pagePath ? `
<meta property="og:url" content="${SITE_URL}${pagePath}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image || DEFAULT_OG)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232f80ed'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='white' stroke-width='3'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='white'/%3E%3C/svg%3E">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#0b0f17">
<link rel="apple-touch-icon" href="/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css"></head><body>`;
const header = `<header class="top"><div class="wrap">
<a class="logo" href="/">Watch<span class="bubble">This</span>Cam</a>
<nav class="nav">
<a href="/wall.html">📺 Wall</a>
<a href="/thrills.html">⚡ Thrills</a>
<a class="hide-sm" href="/browse.html">Browse</a>
<a href="/favourites.html">Favourites</a>
<a class="hide-sm" href="/map.html">Map</a>
<a class="hide-sm" href="/about.html">About</a>
<a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a>
</nav></div></header>`;
const footer = `<footer><div class="wrap">
<span>Watch This Cam — a window onto the world. Cameras belong to their operators and link back to the source; some provided via windy.com and YouTube.</span>
<span><a href="/about.html">About</a> &nbsp; <a href="/random.html">Random cam</a></span>
</div></footer>
<script>
if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
(function(){var p;addEventListener('beforeinstallprompt',function(e){e.preventDefault();p=e;var b=document.getElementById('installbtn');if(b){b.hidden=false;b.onclick=function(){b.hidden=true;p.prompt();};}});})();
</script>
</body></html>`;

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'cam'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src', 'styles.css'), path.join(DIST, 'styles.css'));
// Shown when an external feed is down (these are 180+ live cams; some drop out).
fs.writeFileSync(path.join(DIST, 'ph.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#121826"/><circle cx="320" cy="150" r="30" fill="none" stroke="#3a4straight66" stroke-width="5"/><circle cx="320" cy="150" r="10" fill="#34446a"/><text x="320" y="225" font-family="Arial" font-size="20" fill="#8d9ab3" text-anchor="middle">Feed offline right now</text></svg>`.replace('3a4straight66','3a4466'));
const ONERR = `onerror="this.onerror=null;this.src='/ph.svg'"`;

// PWA: installable app (manifest + icon + service worker)
fs.writeFileSync(path.join(DIST, 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#0b0f17"/><rect x="56" y="56" width="400" height="400" rx="92" fill="#2f80ed"/><circle cx="256" cy="256" r="118" fill="none" stroke="#fff" stroke-width="34"/><circle cx="256" cy="256" r="40" fill="#fff"/><circle cx="256" cy="256" r="150" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="6 26" opacity=".6"/></svg>`);
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify({
  name: 'Watch This Cam', short_name: 'WatchThisCam',
  description: 'Hit the button and get a random live camera from somewhere in the world.',
  start_url: '/', scope: '/', display: 'standalone', orientation: 'any',
  background_color: '#0b0f17', theme_color: '#0b0f17',
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
}, null, 1));
fs.writeFileSync(path.join(DIST, 'sw.js'), `// Watch This Cam service worker: network-first for the app, so rebuilds show at once; cache is the offline fallback.
var V='wtc-v3';
var SHELL=['/','/styles.css','/browse.html','/thrills.html','/map.html','/wall.html','/favourites.html','/about.html','/cams.js','/meta.js','/ids.js','/wall.js','/icon.svg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL).catch(function(){});}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;if(new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(function(res){var c=res.clone();caches.open(V).then(function(cache){cache.put(r,c);});return res;}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('/');});}));});`);
// In listings, a dead feed should vanish rather than show a placeholder.
const HIDECARD = `onerror="var c=this.closest('.card');if(c)c.style.display='none'"`;
const HIDEMINI = `onerror="var m=this.closest('.mini');if(m)m.style.display='none'"`;

// Client data for browse/search/random
fs.writeFileSync(path.join(DIST, 'cams.js'), 'window.CAMS=' + JSON.stringify(cams.map(c => ({
  id: c.id, n: c.name, cat: c.category, catL: c.catLabel, co: c.countryLabel, fl: flag(c.country),
  t: thumb(c), snap: c.type === 'image' && !c.isMjpeg ? 1 : 0,
}))) + ';');
fs.writeFileSync(path.join(DIST, 'ids.js'), 'window.IDS=' + JSON.stringify(cams.map(c => c.id)) + ';');
// Geo + time metadata for Smart surf (day/night) and the world map. Deterministic jitter spreads same-country pins.
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
fs.writeFileSync(path.join(DIST, 'meta.js'), 'window.CAMMETA=' + JSON.stringify(
  cams.filter(c => GEO[c.country] || c.lat != null).map(c => {
    const g = GEO[c.country], h = hash(c.id), hasCoord = c.lat != null && c.lon != null;
    // Real coords when we have them (windy); else the country centroid with a little jitter.
    const la = hasCoord ? +c.lat.toFixed(3) : +(g.lat + ((h % 1000) / 1000 - 0.5) * 9).toFixed(3);
    const ln = hasCoord ? +c.lon.toFixed(3) : +(g.lng + ((Math.floor(h / 1000) % 1000) / 1000 - 0.5) * 14).toFixed(3);
    const off = g ? g.off : Math.round((c.lon || 0) / 15);   // day/night: country offset, else from longitude
    return { i: c.id, n: c.name, co: c.countryLabel, cat: c.category, catL: c.catLabel, t: thumb(c), snap: c.type === 'image' && !c.isMjpeg ? 1 : 0, off, la, ln };
  })) + ';');
// The Wall: enough per-cam info to embed many at once.
fs.writeFileSync(path.join(DIST, 'wall.js'), 'window.WALL=' + JSON.stringify(cams.map(c => ({
  id: c.id, n: c.name, co: c.countryLabel, type: c.type,
  src: c.type === 'image' ? c.imageUrl : `https://www.youtube-nocookie.com/embed/${c.videoId}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`,
}))) + ';');

const livePill = c => c.type === 'image' && !c.isMjpeg
  ? `<span class="pill snap"><span class="dot"></span>PHOTO</span>`
  : `<span class="pill"><span class="dot"></span>LIVE</span>`;
const card = c => `<a class="card" href="/cam/${c.id}.html">
<div class="thumb">${livePill(c)}<img loading="lazy" ${HIDECARD} src="${thumb(c)}" alt="${esc(c.name)}"></div>
<div class="meta"><b>${flag(c.country) ? flag(c.country) + ' ' : ''}${esc(c.name)}</b><span>${esc([c.countryLabel, c.catLabel].filter(Boolean).join(' · '))}</span></div></a>`;

// ---- Homepage ----
// A varied featured reel for the rotating hero: one strong cam per category, spread around the world.
const featuredSet = [];
const seenCat = new Set(), seenCo = new Set();
for (const c of cams) {
  if (seenCat.has(c.category)) continue;
  featuredSet.push(c); seenCat.add(c.category); seenCo.add(c.country);
  if (featuredSet.length >= 14) break;
}
while (featuredSet.length < 14 && featuredSet.length < cams.length) {
  const c = cams[Math.floor(Math.random() * cams.length)];
  if (!featuredSet.includes(c)) featuredSet.push(c);
}
const featured = featuredSet[0];
const strip = cams.slice(0, 10).map(card).join('\n');
const CAT_ICON = { city: '🏙️', beach: '🏖️', surf: '🌊', harbour: '⚓', transport: '✈️', traffic: '🚦',
  wildlife: '🦉', nature: '🌲', mountain: '⛰️', ski: '🏔️', volcano: '🌋', weather: '🌤️', landmark: '🗼', bar: '🍸', space: '🛰️', other: '📷' };
const catTiles = Object.keys(CATS).filter(k => cams.some(c => c.category === k))
  .map(k => `<a class="tile" href="/browse.html#${k}"><b>${CAT_ICON[k] || ''} ${CATS[k]}</b><span>${cams.filter(c => c.category === k).length}</span></a>`).join('');
// Thrills: the dramatic ones.
const THRILL = /volcano|nazar|aurora|fuji|matterhorn|jungfrau|times square|vegas|bourbon|nightlife|night|safari|africa|lion|storm|hurricane|falls|piccadilly|rocket|shibuya|big ?wave|pipeline|banzai/i;
const thrills = cams.filter(c => ['volcano', 'surf', 'bar'].includes(c.category) || THRILL.test(c.name + ' ' + c.catLabel));
// Live viewer counts (YouTube only) for "Busiest right now".
const watchers = c => { const m = (c.watching || '').match(/([\d,]+)\s*watching/i); return m ? parseInt(m[1].replace(/,/g, ''), 10) || 0 : 0; };
const busiest = cams.filter(c => watchers(c) > 0).sort((a, b) => watchers(b) - watchers(a)).slice(0, 8);
fs.writeFileSync(path.join(DIST, 'index.html'), head('Watch This Cam — live cameras from around the world',
  'Hit the button and get a random live camera from somewhere in the world. Beaches, cities, harbours, wildlife and the downright odd.') + header + `
<main class="wrap">
<section class="hero">
<div>
<h1>Could someone be <em>watching</em> right now?</h1>
<p>One button. A random live camera from somewhere in the world. A beach in Portugal, a train platform in Tokyo, an eagle's nest, a bar in Key West — you never know what you'll get.</p>
<div class="actions">
<a class="btn big" href="/random.html"><span class="dice">🎲</span> Surprise me</a>
<button class="btn big ghost" id="surfstart">▶ Auto surf</button>
<a class="btn big ghost" href="/browse.html">Browse ${cams.length} cams</a>
<button class="btn big ghost" id="installbtn" hidden>⬇ Install app</button>
</div>
<div class="stats"><div><b>${cams.length}</b> live cams</div><div><b>${new Set(cams.map(c=>c.countryLabel).filter(Boolean)).size}</b> countries</div><div><b>${Object.keys(CATS).filter(k=>cams.some(c=>c.category===k)).length}</b> kinds</div></div>
</div>
<a class="player hero-player" href="/cam/${featured.id}.html" id="heroLink" title="${esc(featured.name)}">
<span class="pill"><span class="dot"></span>LIVE</span>
<img id="heroImg" ${ONERR} src="${thumb(featured)}" alt="${esc(featured.name)}">
<span class="hero-cap" id="heroCap">${flag(featured.country) ? flag(featured.country) + ' ' : ''}${esc(featured.name)}</span>
</a>
</section>
<a class="cotd" id="cotd" hidden href="#"></a>
<div class="section-head" id="goldenhead" hidden><h2>🌅 Golden hour <span class="muted-h">sunrise &amp; sunset, live right now</span></h2></div>
<div class="grid" id="goldengrid"></div>
<div class="section-head" id="nighthead" hidden><h2>🌃 Night owl <span class="muted-h">glowing in the dark right now</span></h2></div>
<div class="grid" id="nightgrid"></div>
<div class="section-head" id="recenthead" hidden><h2>🕘 Recently watched</h2></div>
<div class="grid" id="recentgrid"></div>
<div class="section-head"><h2>⚡ Thrills <span class="muted-h">the dramatic ones</span></h2><a href="/thrills.html">See all →</a></div>
<div class="grid">${thrills.slice(0, 8).map(card).join('')}</div>
${busiest.length >= 4 ? `<div class="section-head"><h2>🔥 Busiest right now <span class="muted-h">most people watching</span></h2></div>
<div class="grid">${busiest.map(card).join('')}</div>` : ''}
<div class="section-head"><h2>Browse by kind</h2></div>
<div class="tiles">${catTiles}</div>
<div class="section-head"><h2>A few to start you off</h2><a href="/browse.html">See all →</a></div>
<div class="grid">${strip}</div>
</main>
<script src="/meta.js"></script>
<script src="/cams.js"></script>
<script>
(function(){
var ss=document.getElementById('surfstart');
function metaCard(c){return '<a class="card" href="/cam/'+c.i+'.html"><div class="thumb"><span class="pill'+(c.snap?' snap':'')+'"><span class="dot"></span>'+(c.snap?'PHOTO':'LIVE')+'</span><img loading="lazy" onerror="var k=this.closest(\\'.card\\');if(k)k.style.display=\\'none\\'" src="'+c.t+'"></div><div class="meta"><b>'+c.n+'</b><span>'+[c.co,c.catL].filter(Boolean).join(' · ')+'</span></div></a>';}
// Recently watched (from localStorage)
(function(){var rc=[];try{rc=JSON.parse(localStorage.getItem('wtc_recent')||'[]')}catch(e){}
 if(!rc.length||!window.CAMS)return;var byId={};CAMS.forEach(function(c){byId[c.id]=c;});
 var list=rc.map(function(id){return byId[id];}).filter(Boolean).slice(0,8);if(!list.length)return;
 document.getElementById('recenthead').hidden=false;
 document.getElementById('recentgrid').innerHTML=list.map(function(c){return '<a class="card" href="/cam/'+c.id+'.html"><div class="thumb"><span class="pill'+(c.snap?' snap':'')+'"><span class="dot"></span>'+(c.snap?'PHOTO':'LIVE')+'</span><img loading="lazy" onerror="var k=this.closest(\\'.card\\');if(k)k.style.display=\\'none\\'" src="'+c.t+'"></div><div class="meta"><b>'+c.n+'</b><span>'+[c.co,c.catL].filter(Boolean).join(' · ')+'</span></div></a>';}).join('');})();if(ss)ss.onclick=function(){try{sessionStorage.setItem('wtc_surf','1')}catch(e){}location.href='/random.html';};
// Cam of the day: same pick for everyone each day, changes daily (seeded by the date)
(function(){var meta=window.CAMMETA||[],good={volcano:1,beach:1,surf:1,mountain:1,nature:1,landmark:1,city:1,harbour:1,wildlife:1,ski:1};
 var pool=meta.filter(function(m){return good[m.cat];});if(!pool.length)return;
 pool.sort(function(a,b){return a.i<b.i?-1:1;});
 var m=pool[Math.floor(Date.now()/86400000)%pool.length],el=document.getElementById('cotd');
 el.href='/cam/'+m.i+'.html';
 el.innerHTML='<img src="'+m.t+'" onerror="this.onerror=null;this.src=\\'/ph.svg\\'"><div class="cotd-text"><span class="cotd-badge">🌟 Cam of the day</span><b>'+m.n+'</b><span>'+[m.co,m.catL].filter(Boolean).join(' · ')+'</span></div>';
 el.hidden=false;})();
// Golden hour: cams where it's sunrise/sunset there right now (computed live on load)
(function(){var meta=window.CAMMETA||[],now=new Date(),utc=now.getUTCHours()+now.getUTCMinutes()/60;
 var scenic={beach:1,surf:1,city:1,landmark:1,nature:1,mountain:1,harbour:1,ski:1};
 var g=meta.filter(function(m){var h=((utc+m.off)%24+24)%24;return (h>=5&&h<8)||(h>=17.3&&h<20.3);}).filter(function(m){return scenic[m.cat];});
 for(var k=g.length-1;k>0;k--){var j=Math.random()*(k+1)|0,t=g[k];g[k]=g[j];g[j]=t;}
 g=g.slice(0,8);if(!g.length)return;
 document.getElementById('goldenhead').hidden=false;
 document.getElementById('goldengrid').innerHTML=g.map(metaCard).join('');
})();
// Night owl: cams where it's deep night there right now (cities glowing)
(function(){var meta=window.CAMMETA||[],now=new Date(),utc=now.getUTCHours()+now.getUTCMinutes()/60;
 var nc={city:1,landmark:1,bar:1,harbour:1,beach:1,surf:1,volcano:1};
 var g=meta.filter(function(m){var h=((utc+m.off)%24+24)%24;return h>=20.5||h<5;}).filter(function(m){return nc[m.cat];});
 for(var k=g.length-1;k>0;k--){var j=Math.random()*(k+1)|0,t=g[k];g[k]=g[j];g[j]=t;}g=g.slice(0,8);if(!g.length)return;
 document.getElementById('nighthead').hidden=false;
 document.getElementById('nightgrid').innerHTML=g.map(metaCard).join('');
})();
var reel=${JSON.stringify(featuredSet.map(c => ({ id: c.id, t: thumb(c), cap: (flag(c.country) ? flag(c.country) + ' ' : '') + c.name })))};
var img=document.getElementById('heroImg'),cap=document.getElementById('heroCap'),link=document.getElementById('heroLink');
reel.forEach(function(r){var p=new Image();p.src=r.t;});
function show(r){img.src=r.t;cap.textContent=r.cap;link.href='/cam/'+r.id+'.html';}
var i=Math.floor(Math.random()*reel.length);show(reel[i]);   // start on a random cam each page load
setInterval(function(){i=(i+1)%reel.length;img.style.opacity=.25;setTimeout(function(){show(reel[i]);img.style.opacity=1;},180);},4000);
})();
</script>` + footer);

// ---- Browse (search + filter, client side) ----
const chips = ['all', ...Object.keys(CATS).filter(k => cams.some(c => c.category === k))]
  .map(k => `<button class="chip${k==='all'?' on':''}" data-cat="${k}">${k==='all'?'All':CATS[k]}</button>`).join('');
const countryOpts = [...new Set(cams.map(c => c.countryLabel).filter(Boolean))].sort()
  .map(co => `<option value="${esc(co)}">${esc(co)}</option>`).join('');
fs.writeFileSync(path.join(DIST, 'browse.html'), head('Browse all cams — Watch This Cam', 'Browse every live camera by place and type.') + header + `
<main class="wrap">
<div class="section-head"><h2>All cameras</h2>
<div style="display:flex;gap:8px;flex-wrap:wrap">
<select class="search" id="country" style="max-width:180px;flex:0 1 auto"><option value="">All countries</option>${countryOpts}</select>
<input class="search" id="q" type="search" placeholder="Search a place or type…"></div></div>
<div class="chips" id="chips">${chips}</div>
<div class="grid" id="grid" style="margin-top:16px"></div>
<p class="empty" id="empty" hidden>No cams match that. <a href="/random.html">Try a random one →</a></p>
</main>
<script src="/cams.js"></script>
<script>
const grid=document.getElementById('grid'),q=document.getElementById('q'),empty=document.getElementById('empty'),country=document.getElementById('country');
let cat='all';
const card=c=>\`<a class="card" href="/cam/\${c.id}.html"><div class="thumb"><span class="pill\${c.snap?' snap':''}"><span class="dot"></span>\${c.snap?'PHOTO':'LIVE'}</span><img loading="lazy" onerror="var k=this.closest('.card');if(k)k.style.display='none'" src="\${c.t}" alt=""></div><div class="meta"><b>\${c.fl?c.fl+' ':''}\${c.n}</b><span>\${[c.co,c.catL].filter(Boolean).join(' · ')}</span></div></a>\`;
function render(){const term=q.value.trim().toLowerCase(),co=country.value;const list=CAMS.filter(c=>(cat==='all'||c.cat===cat)&&(!co||c.co===co)&&(!term||(c.n+' '+c.co+' '+c.catL).toLowerCase().includes(term)));grid.innerHTML=list.map(card).join('');empty.hidden=list.length>0;}
document.getElementById('chips').onclick=e=>{if(!e.target.dataset.cat)return;cat=e.target.dataset.cat;[...chips.children].forEach(b=>b.classList.toggle('on',b.dataset.cat===cat));render();};
q.oninput=render;country.onchange=render;
function applyHash(){var h=decodeURIComponent(location.hash.slice(1));if(h&&[...chips.children].some(b=>b.dataset.cat===h)){cat=h;[...chips.children].forEach(b=>b.classList.toggle('on',b.dataset.cat===cat));render();}}
window.addEventListener('hashchange',applyHash);
applyHash();render();
</script>` + footer);

// ---- Random ----
fs.writeFileSync(path.join(DIST, 'random.html'), head('Random cam — Watch This Cam', 'A random live camera.') + `
<canvas id="s" style="position:fixed;inset:0;width:100%;height:100%;background:#000;image-rendering:pixelated"></canvas>
<div style="position:fixed;right:22px;top:18px;font:800 22px/1 'Courier New',monospace;color:#9bff9b;text-shadow:0 0 8px rgba(100,255,120,.7);letter-spacing:3px" id="ch"></div>
<script src="/meta.js"></script>
<script>
var ids=${JSON.stringify(cams.map(c => c.id))};
function smart(){try{return localStorage.getItem('wtc_smart')!=='0'}catch(e){return true}}
var META={};(window.CAMMETA||[]).forEach(function(m){META[m.i]=m;});
function isDay(id){var m=META[id];if(!m)return true;var h=(new Date().getUTCHours()+m.off+24)%24;return h>=6&&h<20;}
function seen(){try{return JSON.parse(sessionStorage.getItem('wtc_seen')||'[]')}catch(e){return[]}}
var pool=ids;if(smart()){var d=ids.filter(isDay);if(d.length>5)pool=d;}
var sn=seen(),fresh=pool.filter(function(id){return sn.indexOf(id)<0;});if(fresh.length>3)pool=fresh;
var target='/cam/'+pool[Math.floor(Math.random()*pool.length)]+'.html';
document.getElementById('ch').textContent='CH '+(Math.floor(Math.random()*98)+2);
var sc=document.getElementById('s'),done=false;function go(){if(done)return;done=true;location.replace(target);}
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){go();}
else{try{var ctx=sc.getContext('2d'),w=sc.width=Math.min(innerWidth,520),h=sc.height=Math.min(innerHeight,300),f=0;
 (function d2(){var im=ctx.createImageData(w,h),dd=im.data;for(var i=0;i<dd.length;i+=4){var v=Math.random()*255|0;dd[i]=dd[i+1]=dd[i+2]=v;dd[i+3]=255;}ctx.putImageData(im,0,0);if(++f<13)requestAnimationFrame(d2);else go();})();
 setTimeout(go,650);}catch(e){go();}}
</script>
<noscript><meta http-equiv="refresh" content="0;url=/cam/${cams[0].id}.html"></noscript></body></html>`);

// ---- Cam pages ----
cams.forEach((c, i) => {
  const related = cams.filter(r => r.category === c.category && r.id !== c.id).slice(0, 4);
  const next = cams[(i + 1) % cams.length].id, prev = cams[(i - 1 + cams.length) % cams.length].id;
  fs.writeFileSync(path.join(DIST, 'cam', c.id + '.html'), head(`${c.name} — live cam — Watch This Cam`, c.blurb, c.type === 'image' ? c.imageUrl : `https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg`, `/cam/${c.id}.html`) + header + `
<main class="wrap">
<div class="cam">
<div>
<div id="surfbar"><span></span></div>
<div class="controls controls-top">
<a class="btn" href="/random.html" id="surprise"><span class="dice">🎲</span> Surprise me</a>
<button class="btn ghost" id="surf">▶ Auto surf</button>
<a class="btn ghost" href="/cam/${prev}.html" id="prev">‹ Prev</a>
<a class="btn ghost" href="/cam/${next}.html" id="next">Next ›</a>
<span class="surf-speed" id="surfspeed" hidden><em>every</em>
<button data-ms="5000">5s</button><button data-ms="10000">10s</button><button data-ms="20000">20s</button><button data-ms="30000">30s</button><button data-ms="60000">60s</button></span>
<button class="iconbtn sm" id="skipnight" title="Skip cams where it's the middle of the night">☀ skip night</button>
<span class="kbd-hint">Tip: <kbd>Space</kbd> shuffle · <kbd>←</kbd> <kbd>→</kbd> flick · <kbd>Esc</kbd> stop</span>
</div>
<div class="player" id="player">
${playerInner(c)}
</div>
<div class="cam-actions">
<button class="iconbtn" id="fav" data-id="${c.id}">♡ Save</button>
${c.type !== 'image' ? `<button class="iconbtn" id="sound" data-mute="${embed(c)}" data-unmute="${embed(c).replace('mute=1', 'mute=0')}">🔇 Sound</button>` : ''}
<button class="iconbtn" id="fs">⛶ Fullscreen</button>
<button class="iconbtn" id="share">🔗 Share</button>
</div>
<h1>${flag(c.country) ? flag(c.country) + ' ' : ''}${esc(c.name)}</h1>
<p class="where">${esc([c.countryLabel, c.catLabel].filter(Boolean).join(' · '))}<span id="localtime" class="localtime"></span></p>
<p class="about">${esc(c.blurb)}</p>
</div>
<aside class="side">
<div class="box"><h3>About this cam</h3>
<dl class="facts">
<dt>Type</dt><dd>${esc(c.catLabel)}</dd>
${c.countryLabel ? `<dt>Where</dt><dd>${esc(c.countryLabel)}</dd>` : ''}
${c.type !== 'image' && watchers(c) > 0 ? `<dt>Watching</dt><dd>👁 ${watchers(c) >= 1000 ? (watchers(c) / 1000).toFixed(1) + 'k' : watchers(c)} on YouTube</dd>` : ''}
<dt>Source</dt><dd><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.channel || 'YouTube')}</a></dd>
</dl>
<p class="credit">${c.type === 'image'
  ? `Published by ${esc(c.channel || 'its operator')}. Watch This Cam shows it refreshing and links back to the source.`
  : `Streamed live by ${esc(c.channel || 'its operator')} on YouTube. Watch This Cam just points you at it.`}</p>
</div>
${GEO[c.country] ? `<div class="box"><h3>Where in the world</h3><div id="minimap"></div></div>` : ''}
${related.length ? `<div class="box"><h3>More like this</h3>${related.map(r => `<a class="mini" href="/cam/${r.id}.html"><img loading="lazy" ${HIDEMINI} src="${thumb(r)}" alt=""><span>${flag(r.country) ? flag(r.country) + ' ' : ''}${esc(r.name)}</span></a>`).join('')}</div>` : ''}
</aside>
</div>
</main>
<canvas id="tvstatic"></canvas><div id="tvch"></div>
${GEO[c.country] ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>` : ''}
<script src="/ids.js"></script>
<script src="/meta.js"></script>
<script>
(function(){var cur=${JSON.stringify(c.id)},ids=(window.IDS||[cur]);
// Retro TV-static flash when flipping channels (shuffle / auto surf).
var sc=document.getElementById('tvstatic'),chEl=document.getElementById('tvch');
function flash(go){
 if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){go();return;}
 var ctx;try{ctx=sc.getContext('2d');}catch(e){go();return;}
 if(!ctx){go();return;}
 var w=sc.width=Math.min(innerWidth,520),h=sc.height=Math.min(innerHeight,300);
 sc.style.display='block';chEl.textContent='CH '+(Math.floor(Math.random()*98)+2);chEl.style.display='block';
 var done=false,f=0;function fin(){if(done)return;done=true;go();}
 (function draw(){var im=ctx.createImageData(w,h),d=im.data;for(var i=0;i<d.length;i+=4){var v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}ctx.putImageData(im,0,0);if(++f<13)requestAnimationFrame(draw);else fin();})();
 setTimeout(fin,650);
}
var META={};(window.CAMMETA||[]).forEach(function(m){META[m.i]=m;});
function isDay(id){var m=META[id];if(!m)return true;var h=(new Date().getUTCHours()+m.off+24)%24;return h>=6&&h<20;}
function smart(){try{return localStorage.getItem('wtc_smart')!=='0'}catch(e){return true}}
function seen(){try{return JSON.parse(sessionStorage.getItem('wtc_seen')||'[]')}catch(e){return[]}}
function rnd(){var pool=ids;
 if(smart()){var day=ids.filter(function(id){return id!==cur&&isDay(id);});if(day.length>5)pool=day;}
 var sn=seen(),fresh=pool.filter(function(id){return id!==cur&&sn.indexOf(id)<0;});
 if(fresh.length>3)pool=fresh;   // avoid cams already seen this session
 var id=cur,n=0;while(id===cur&&pool.length>1&&n++<40)id=pool[Math.floor(Math.random()*pool.length)];return '/cam/'+id+'.html';}
// Remember this cam: for avoid-repeat surfing (session) and the Recently-watched row (persistent)
try{var _sn=seen();if(_sn.indexOf(cur)<0){_sn.push(cur);if(_sn.length>60)_sn=_sn.slice(-60);sessionStorage.setItem('wtc_seen',JSON.stringify(_sn));}}catch(e){}
try{var _rc=JSON.parse(localStorage.getItem('wtc_recent')||'[]').filter(function(x){return x!==cur;});_rc.unshift(cur);if(_rc.length>12)_rc=_rc.slice(0,12);localStorage.setItem('wtc_recent',JSON.stringify(_rc));}catch(e){}
function goRnd(){var u=rnd();flash(function(){location.href=u;});}
var s=document.getElementById('surprise');if(s)s.onclick=function(e){e.preventDefault();goRnd();};

// Auto surf: auto-flip to a random cam every DUR, surviving page loads via sessionStorage. Speed in localStorage.
var bar=document.getElementById('surfbar'),fill=bar.firstChild,btn=document.getElementById('surf'),sp=document.getElementById('surfspeed');
var timer,surfing=false;
function get(){try{return sessionStorage.getItem('wtc_surf')==='1'}catch(e){return false}}
function set(v){try{sessionStorage.setItem('wtc_surf',v?'1':'0')}catch(e){}}
function speed(){var v=0;try{v=+localStorage.getItem('wtc_surf_ms')}catch(e){}return v||20000;}
function markSpeed(){[].forEach.call(sp.querySelectorAll('button'),function(b){b.classList.toggle('on',+b.dataset.ms===speed());});}
function stop(){surfing=false;clearTimeout(timer);fill.style.transition='none';fill.style.width='0%';bar.classList.remove('on');btn.classList.remove('on');btn.innerHTML='▶ Auto surf';sp.hidden=true;}
function start(){surfing=true;set(true);bar.classList.add('on');btn.classList.add('on');btn.innerHTML='⏸ Stop surfing';sp.hidden=false;markSpeed();
 var DUR=speed();clearTimeout(timer);
 fill.style.transition='none';fill.style.width='0%';
 requestAnimationFrame(function(){fill.style.transition='width '+(DUR/1000)+'s linear';fill.style.width='100%';});
 timer=setTimeout(function(){goRnd();},DUR);}
sp.onclick=function(e){var b=e.target.closest('button');if(!b)return;try{localStorage.setItem('wtc_surf_ms',b.dataset.ms)}catch(err){}markSpeed();if(surfing)start();};
btn.onclick=function(){if(surfing){set(false);stop();}else start();};
if(get())start();

// Favourites (localStorage), fullscreen, share
function favs(){try{return JSON.parse(localStorage.getItem('wtc_favs')||'[]')}catch(e){return[]}}
var favBtn=document.getElementById('fav'),fid=favBtn.dataset.id;
function paintFav(){var on=favs().indexOf(fid)>=0;favBtn.classList.toggle('on',on);favBtn.innerHTML=on?'♥ Saved':'♡ Save';}
favBtn.onclick=function(){var a=favs(),i=a.indexOf(fid);if(i<0)a.push(fid);else a.splice(i,1);try{localStorage.setItem('wtc_favs',JSON.stringify(a))}catch(e){}paintFav();};
paintFav();
var pl=document.getElementById('player');
document.getElementById('fs').onclick=function(){if(document.fullscreenElement)document.exitFullscreen();else if(pl.requestFullscreen)pl.requestFullscreen();};
var shBtn=document.getElementById('share');
shBtn.onclick=function(){var u=location.href;if(navigator.share){navigator.share({title:document.title.replace(/ — .*/,''),url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){var t=shBtn.innerHTML;shBtn.innerHTML='✓ Copied';setTimeout(function(){shBtn.innerHTML=t;},1500);});}};

// Local time + day/night badge for this cam
var lt=document.getElementById('localtime'),mm=META[cur];
if(lt&&mm){(function p(){var d=new Date(),h=(d.getUTCHours()+mm.off+24)%24,mn=d.getUTCMinutes(),day=h>=6&&h<20,hh=(h%12)||12;
 lt.textContent=' · '+(day?'☀️':'🌙')+' '+hh+':'+(mn<10?'0':'')+mn+(h<12?'am':'pm')+' local';setTimeout(p,30000);})();}

// Smart surf: skip cams where it's night there
var sn=document.getElementById('skipnight');
function paintSmart(){sn.classList.toggle('on',smart());sn.innerHTML=(smart()?'☀ ':'🌙 ')+'skip night';}
if(sn){sn.onclick=function(){try{localStorage.setItem('wtc_smart',smart()?'0':'1')}catch(e){}paintSmart();};paintSmart();}
// Sound toggle (YouTube cams start muted so they can autoplay)
var snd=document.getElementById('sound');
if(snd){var yf=document.getElementById('ytframe'),son=false;
 snd.onclick=function(){son=!son;yf.src=son?snd.dataset.unmute:snd.dataset.mute;snd.classList.toggle('on',son);snd.innerHTML=son?'🔊 Sound on':'🔇 Sound';};}

document.addEventListener('keydown',function(e){
 if(/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.code==='Space'||e.key==='r'){e.preventDefault();goRnd();}
 else if(e.key==='ArrowRight'){e.preventDefault();location.href=document.getElementById('next').href;}
 else if(e.key==='ArrowLeft'){e.preventDefault();location.href=document.getElementById('prev').href;}
 else if(e.key==='Escape'&&surfing){set(false);stop();}
});
})();
</script>
${GEO[c.country] ? `<script>
(function(){if(!window.L)return;var m=(window.CAMMETA||[]).filter(function(x){return x.i===${JSON.stringify(c.id)};})[0];if(!m)return;
try{var mm=L.map('minimap',{zoomControl:false,attributionControl:false,scrollWheelZoom:false}).setView([m.la,m.ln],4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:7,minZoom:2}).addTo(mm);
L.circleMarker([m.la,m.ln],{radius:7,weight:2,color:'#2f80ed',fillColor:'#5aa2ff',fillOpacity:.95}).addTo(mm);}catch(e){}})();
</script>` : ''}` + footer);
});

// ---- About ----
fs.writeFileSync(path.join(DIST, 'about.html'), head('About — Watch This Cam', 'What Watch This Cam is.') + header + `
<main class="wrap"><div class="page">
<h1>About Watch This Cam</h1>
<p>Watch This Cam started back in 2011 as a bit of fun: hit a button and get dropped onto a random live webcam from somewhere in the world. You never knew what you'd get.</p>
<p>This is the 2026 revival. Every camera here is a public, live stream that its own operator — a town, a surf club, a harbour, a university, a wildlife charity — chose to put online. We don't host any video; we just point you at it and link back to the source.</p>
<p>So go on. <a href="/random.html">Hit the button</a> and see where you end up.</p>
<p class="credit">Not affiliated with any of the camera operators. If you run one of these cams and would like it removed, get in touch.</p>
</div></main>` + footer);

// ---- Favourites (client-side, from localStorage) ----
fs.writeFileSync(path.join(DIST, 'favourites.html'), head('Favourites — Watch This Cam', 'The cams you saved.') + header + `
<main class="wrap">
<div class="section-head"><h2>Your favourites</h2><a href="/browse.html">Browse all →</a></div>
<div class="grid" id="grid"></div>
<p class="empty" id="empty" hidden>No favourites yet. Open any cam and hit <b>♡ Save</b>, or <a href="/random.html">surf for a while →</a></p>
</main>
<script src="/cams.js"></script>
<script>
var favs=[];try{favs=JSON.parse(localStorage.getItem('wtc_favs')||'[]')}catch(e){}
var byId={};CAMS.forEach(function(c){byId[c.id]=c;});
var list=favs.map(function(id){return byId[id];}).filter(Boolean);
var card=c=>\`<a class="card" href="/cam/\${c.id}.html"><div class="thumb"><span class="pill\${c.snap?' snap':''}"><span class="dot"></span>\${c.snap?'PHOTO':'LIVE'}</span><img loading="lazy" onerror="var k=this.closest('.card');if(k)k.style.display='none'" src="\${c.t}" alt=""></div><div class="meta"><b>\${c.n}</b><span>\${[c.co,c.catL].filter(Boolean).join(' · ')}</span></div></a>\`;
document.getElementById('grid').innerHTML=list.map(card).join('');
document.getElementById('empty').hidden=list.length>0;
</script>` + footer);

// ---- Thrills ----
fs.writeFileSync(path.join(DIST, 'thrills.html'), head('Thrills — Watch This Cam', 'The most dramatic live cams: volcanoes, big surf, nightlife, safari and more.') + header + `
<main class="wrap">
<div class="section-head"><h2>⚡ Thrills</h2><a href="/browse.html">Browse all →</a></div>
<p style="color:var(--muted);margin:-6px 0 16px">Volcanoes, big surf, buzzing nightlife, safari waterholes — the cams with a bit of drama. ${thrills.length} of them.</p>
<div class="grid">${thrills.map(card).join('\n')}</div>
</main>` + footer);

// ---- World map (Leaflet) ----
fs.writeFileSync(path.join(DIST, 'map.html'), head('Map — Watch This Cam', 'Every cam on a world map.') + header + `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<main class="wrap">
<div class="section-head"><h2>Cams around the world</h2><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a></div>
<div id="map"></div>
<p style="color:var(--muted);font-size:13px;margin-top:10px">🌙 The shaded area is where it's night right now. Pins are grouped by country and nudged apart — not exact locations.</p>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script src="/meta.js"></script>
<script>
var map=L.map('map',{worldCopyJump:true,scrollWheelZoom:true}).setView([25,5],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',subdomains:'abc',maxZoom:8,minZoom:1}).addTo(map);
// Night shading: the solar terminator, so you see where it's dark right now.
function drawNight(){var d2r=Math.PI/180,now=new Date();
 var n=now/86400000+2440587.5-2451545.0;
 var g=(357.528+0.9856003*n)*d2r,L2=280.460+0.9856474*n;
 var lambda=(L2+1.915*Math.sin(g)+0.020*Math.sin(2*g))*d2r,eps=23.439*d2r;
 var decl=Math.asin(Math.sin(eps)*Math.sin(lambda))/d2r;
 var utc=now.getUTCHours()+now.getUTCMinutes()/60,sunLng=-(utc-12)*15;
 var pts=[];for(var lng=-180;lng<=180;lng+=2){pts.push([Math.atan(-Math.cos((lng-sunLng)*d2r)/Math.tan(decl*d2r))/d2r,lng]);}
 var pole=decl>0?-90:90;pts.push([pole,180]);pts.push([pole,-180]);
 if(window._night)map.removeLayer(window._night);
 window._night=L.polygon(pts,{stroke:true,color:'#7aa0ff',weight:2,opacity:.65,fillColor:'#0a1733',fillOpacity:.5,interactive:false}).addTo(map);}
drawNight();setInterval(drawNight,120000);
(window.CAMMETA||[]).forEach(function(m){
 var mk=L.circleMarker([m.la,m.ln],{radius:6,weight:2,color:'#2f80ed',fillColor:m.snap?'#f5b301':'#5aa2ff',fillOpacity:.9});
 mk.bindPopup('<a href="/cam/'+m.i+'.html" style="font:600 14px/1.3 system-ui;color:#0b6bcb;text-decoration:none">'+m.n+'</a><br><span style="color:#888;font:13px system-ui">'+m.co+' · '+m.catL+'</span>');
 mk.on('mouseover',function(){this.openPopup();});
 mk.addTo(map);
});
</script>` + footer);

// ---- The Wall ----
fs.writeFileSync(path.join(DIST, 'wall.html'), head('The Wall — Watch This Cam', 'A grid of live cams, all playing at once.') + header + `
<main class="wrap">
<div class="section-head"><h2>📺 The Wall <span class="muted-h">the planet, live, all at once</span></h2>
<div class="chips">
<button class="chip" data-n="6">6</button><button class="chip on" data-n="9">9</button><button class="chip" data-n="12">12</button><button class="chip" data-n="16">16</button><button class="chip" data-n="24">24</button>
<button class="btn" id="shuffle"><span class="dice">🎲</span> Shuffle wall</button>
<button class="btn ghost" id="ambient">📺 Ambient</button></div></div>
<div class="wall" id="wall"></div>
<p style="color:var(--muted);font-size:13px;margin-top:12px">Every tile is live. Click any one to open it full. Photo cams refresh every few seconds.</p>
</main>
<script src="/wall.js"></script>
<script>
var N=9,wall=document.getElementById('wall');
function pick(n){var a=WALL.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a.slice(0,n);}
function esc(s){return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function tile(c){var lbl=esc(c.n)+' · '+esc(c.co);
 if(c.type==='image')return '<a class="wtile" href="/cam/'+c.id+'.html"><img data-img="1" src="'+esc(c.src)+'" onerror="this.onerror=null;this.src=\\'/ph.svg\\'"><span class="wlabel">'+lbl+'</span></a>';
 return '<div class="wtile"><iframe src="'+esc(c.src)+'" allow="autoplay; encrypted-media" frameborder="0"></iframe><a class="wcover" href="/cam/'+c.id+'.html" title="'+lbl+'" aria-label="Open '+lbl+'"></a><span class="wlabel">'+lbl+'</span></div>';}
function render(){wall.innerHTML=pick(N).map(tile).join('');}
[].forEach.call(document.querySelectorAll('.chip[data-n]'),function(b){b.onclick=function(){N=+b.dataset.n;[].forEach.call(document.querySelectorAll('.chip[data-n]'),function(x){x.classList.toggle('on',x===b);});render();};});
document.getElementById('shuffle').onclick=render;
render();
setInterval(function(){[].forEach.call(wall.querySelectorAll('img[data-img]'),function(im){var s=im.src.split('?')[0];im.src=s+'?_t='+Date.now();});},12000);
// Ambient mode: fullscreen living wall that reshuffles itself
var ambTimer;
document.getElementById('ambient').onclick=function(){
 if(document.fullscreenElement){document.exitFullscreen();}
 else if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(function(){});}
};
document.addEventListener('fullscreenchange',function(){
 if(document.fullscreenElement){document.body.classList.add('ambient');render();ambTimer=setInterval(render,45000);}
 else{document.body.classList.remove('ambient');clearInterval(ambTimer);}
});
</script>` + footer);

// ---- robots.txt + sitemap.xml (for launch / SEO) ----
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const sitemapUrls = ['/', '/browse.html', '/thrills.html', '/map.html', '/wall.html', '/favourites.html', '/about.html',
  ...cams.map(c => `/cam/${c.id}.html`)];
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapUrls.map(u => `<url><loc>${SITE_URL}${u}</loc></url>`).join('\n') + `\n</urlset>\n`);

console.log('built', cams.length, 'cam pages + home, browse, random, about, favourites, thrills, map, wall, sitemap');
