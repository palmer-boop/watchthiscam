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
  SI: 'Slovenia', GT: 'Guatemala', NA: 'Namibia', NI: 'Nicaragua', CR: 'Costa Rica', BG: 'Bulgaria',
  LI: 'Liechtenstein', AZ: 'Azerbaijan', LU: 'Luxembourg', BA: 'Bosnia & Herzegovina', XX: '' };
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
  LI: { off: 1, lat: 47.15, lng: 9.55 }, AZ: { off: 4, lat: 40.3, lng: 47.7 }, LU: { off: 1, lat: 49.8, lng: 6.1 }, BA: { off: 1, lat: 44, lng: 18 },
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Three kinds of cam: 'youtube' (YouTube live embed), 'player' (another network's own live player in an iframe),
// 'image' (a still we refresh, an MJPEG stream, or windy.com's player).
const isYT = c => c.type === 'youtube';
const isPlayer = c => c.type === 'player';
const isPhoto = c => c.type === 'image' && !c.isMjpeg;
const thumb = c => c.type === 'image' ? c.imageUrl : isPlayer(c) ? (c.thumbUrl || '/live.svg') : `https://i.ytimg.com/vi/${c.videoId}/mqdefault.jpg`;
const bigThumb = c => isYT(c) ? `https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg` : thumb(c);
// Windy webcams expose an embeddable player (timelapse + near-live) keyed by the webcam id in the source URL.
const windyId = c => { const m = (c.source || '').match(/windy\.com\/webcams\/(\d+)/); return m ? m[1] : null; };
// Tide-times cross-link to tides.watch: match a coastal cam to the nearest tide spot (contextual, not sitewide).
const TIDES = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'tides-spots.json'))); } catch (e) { return []; } })();
const kmBetween = (a, b, c, d) => { const R = 6371, t = x => x * Math.PI / 180, dla = t(c - a), dlo = t(d - b); const h = Math.sin(dla / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dlo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const tideFor = c => { if (c.lat == null || c.lon == null || !['beach', 'surf', 'harbour', 'nature'].includes(c.category)) return null; let best = null, bd = 1e9; for (const s of TIDES) { const d = kmBetween(c.lat, c.lon, s.lat, s.lon); if (d < bd) { bd = d; best = s; } } return bd <= 25 ? best : null; };
const embed = c => `https://www.youtube-nocookie.com/embed/${c.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`;
// Player markup differs by source: YouTube iframe, MJPEG <img> stream, or a still image we refresh ourselves.
function playerInner(c) {
  if (isPlayer(c)) return `<span class="pill"><span class="dot"></span>LIVE</span>
<iframe id="netframe" src="${esc(c.embedUrl)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="${esc(c.name)}"></iframe>`;
  if (c.type !== 'image') return `<span class="pill"><span class="dot"></span>LIVE</span>
<iframe id="ytframe" src="${embed(c)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(c.name)}"></iframe>`;
  const wid = windyId(c);
  if (wid) return `<iframe class="windyplayer" src="https://webcams.windy.com/webcams/public/embed/player/${wid}/day" allow="autoplay; fullscreen" allowfullscreen title="${esc(c.name)}"></iframe>`;
  const live = c.isMjpeg;
  return `<span class="pill${live ? '' : ' snap'}"><span class="dot"></span><span id="campilltxt">${live ? 'LIVE' : 'PHOTO'}</span></span>
<img class="contain" id="camimg" onerror="this.onerror=null;this.src='/ph.svg'" src="${esc(c.imageUrl)}" alt="${esc(c.name)}"${live ? '' : ` data-refresh="${c.refreshSeconds || 10}"`}>
${live ? '' : `<script>(function(){var i=document.getElementById('camimg'),t=document.getElementById('campilltxt'),u=${JSON.stringify(c.imageUrl)},s=(+i.dataset.refresh||10)*1000;i.addEventListener('load',function(){if((''+i.src).indexOf('/ph.svg')<0&&t)t.textContent='PHOTO';});setInterval(function(){if(t)t.textContent='REFRESHING';i.src=u+(u.indexOf('?')<0?'?':'&')+'_t='+Date.now();},s);})();</script>`}`;
}

const REGION_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });
const regionName = cc => { try { const n = cc && cc !== 'XX' && cc !== 'CB' ? REGION_NAMES.of(cc) : ''; return n && n !== cc ? n.replace('Türkiye', 'Turkey').replace(' SAR China', '') : ''; } catch (e) { return ''; } };
const NEEDS_THE = new Set(['U.S. Virgin Islands', 'Cayman Islands', 'Turks & Caicos Islands', 'USA', 'UK', 'Netherlands', 'Caribbean', 'Philippines', 'UAE', 'Maldives', 'Bahamas', 'Czech Republic', 'Faroe Islands', 'Cook Islands', 'Falkland Islands', 'British Virgin Islands', 'Dominican Republic', 'United States', 'United Kingdom']);
function blurb(c) {
  const where = c.countryLabel ? ` in ${NEEDS_THE.has(c.countryLabel) ? 'the ' : ''}${c.countryLabel}` : '';
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
for (const c of cams) { c.catLabel = CATS[c.category] || 'Other'; c.countryLabel = COUNTRIES[c.country] || (c.countryName && !/^unknown$/i.test(c.countryName) ? c.countryName : '') || regionName(c.country); c.blurb = blurb(c); }

// ---- Location model: coordinates, real time zones, cities, US states, themes ----
const slugify = s => String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
// research/enrich-geo.js output: exact coords + IANA time zone (+ US state) for direct-feed cams.
const GEOX = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'geo.json'))); } catch (e) { return {}; } })();
for (const c of cams) { const g = c.imageUrl && GEOX[c.imageUrl]; if (g) { if (c.lat == null || c.lon == null) { c.lat = g.lat; c.lon = g.lon; } c.tz = g.tz; if (g.st) c.state = g.st; } }
// Curated city hubs — the biggest webcam-search queries. [display, country, match terms, lat, lon, time zone, US state]
const CITIES = [
  ['Tokyo','JP',['tokyo','shibuya','shinjuku','odaiba'],35.68,139.69,'Asia/Tokyo'],['Kyoto','JP',['kyoto'],35.01,135.77,'Asia/Tokyo'],['Osaka','JP',['osaka'],34.69,135.5,'Asia/Tokyo'],
  ['London','GB',['london'],51.51,-0.13,'Europe/London'],['New York','US',['new york','nyc','times square','brooklyn','manhattan','bryant park','sandy hook'],40.71,-74.01,'America/New_York','New York'],
  ['Las Vegas','US',['las vegas','vegas'],36.17,-115.14,'America/Los_Angeles','Nevada'],['Miami','US',['miami'],25.76,-80.19,'America/New_York','Florida'],['Key West','US',['key west'],24.56,-81.78,'America/New_York','Florida'],['New Orleans','US',['new orleans','bourbon'],29.95,-90.07,'America/Chicago','Louisiana'],
  ['Chicago','US',['chicago'],41.88,-87.63,'America/Chicago','Illinois'],['San Diego','US',['san diego'],32.72,-117.16,'America/Los_Angeles','California'],['Honolulu','US',['waikiki','honolulu','oahu'],21.31,-157.86,'Pacific/Honolulu','Hawaii'],['Fort Lauderdale','US',['fort lauderdale','dania beach'],26.12,-80.14,'America/New_York','Florida'],
  ['Paris','FR',['paris','eiffel','montmartre'],48.86,2.35,'Europe/Paris'],['Venice','IT',['venice','venezia','san marco','rialto'],45.44,12.32,'Europe/Rome'],['Rome','IT',['rome','roma','trevi','colosseum'],41.9,12.5,'Europe/Rome'],
  ['Florence','IT',['florence','firenze'],43.77,11.26,'Europe/Rome'],['Milan','IT',['milan','milano'],45.46,9.19,'Europe/Rome'],['Naples','IT',['naples','napoli'],40.85,14.27,'Europe/Rome'],['Cinque Terre','IT',['cinque terre','manarola','riomaggiore'],44.13,9.71,'Europe/Rome'],
  ['Barcelona','ES',['barcelona'],41.39,2.17,'Europe/Madrid'],['Madrid','ES',['madrid'],40.42,-3.7,'Europe/Madrid'],['Amsterdam','NL',['amsterdam'],52.37,4.9,'Europe/Amsterdam'],['Rotterdam','NL',['rotterdam'],51.92,4.48,'Europe/Amsterdam'],
  ['Dublin','IE',['dublin'],53.35,-6.26,'Europe/Dublin'],['Galway','IE',['galway'],53.27,-9.05,'Europe/Dublin'],['Sydney','AU',['sydney','bondi'],-33.87,151.21,'Australia/Sydney'],['Melbourne','AU',['melbourne'],-37.81,144.96,'Australia/Melbourne'],
  ['Lisbon','PT',['lisbon','lisboa'],38.72,-9.14,'Europe/Lisbon'],['Porto','PT',['porto'],41.15,-8.61,'Europe/Lisbon'],['Prague','CZ',['prague','praha'],50.08,14.44,'Europe/Prague'],['Vienna','AT',['vienna','wien'],48.21,16.37,'Europe/Vienna'],
  ['Berlin','DE',['berlin'],52.52,13.4,'Europe/Berlin'],['Munich','DE',['munich','munchen','münchen'],48.14,11.58,'Europe/Berlin'],['Zurich','CH',['zurich'],47.38,8.54,'Europe/Zurich'],['Geneva','CH',['geneva'],46.2,6.14,'Europe/Zurich'],
  ['Zermatt','CH',['zermatt','matterhorn'],46.02,7.75,'Europe/Zurich'],['Athens','GR',['athens'],37.98,23.73,'Europe/Athens'],['Istanbul','TR',['istanbul'],41.01,28.98,'Europe/Istanbul'],['Dubai','AE',['dubai'],25.2,55.27,'Asia/Dubai'],
  ['Singapore','SG',['singapore'],1.35,103.82,'Asia/Singapore'],['Hong Kong','HK',['hong kong'],22.32,114.17,'Asia/Hong_Kong'],['Bangkok','TH',['bangkok'],13.76,100.5,'Asia/Bangkok'],['Seoul','KR',['seoul'],37.57,126.98,'Asia/Seoul'],
  ['Taipei','TW',['taipei'],25.03,121.57,'Asia/Taipei'],['Reykjavik','IS',['reykjavik'],64.15,-21.94,'Atlantic/Reykjavik'],['Rio de Janeiro','BR',['rio de janeiro'],-22.91,-43.17,'America/Sao_Paulo'],['Cape Town','ZA',['cape town','table mountain','bloubergstrand'],-33.92,18.42,'Africa/Johannesburg'],
  ['Auckland','NZ',['auckland'],-36.85,174.76,'Pacific/Auckland'],['Queenstown','NZ',['queenstown'],-45.03,168.66,'Pacific/Auckland'],['Toronto','CA',['toronto'],43.65,-79.38,'America/Toronto'],['Vancouver','CA',['vancouver'],49.28,-123.12,'America/Vancouver'],
  ['Edinburgh','GB',['edinburgh'],55.95,-3.19,'Europe/London'],['Nazare','PT',['nazar'],39.6,-9.07,'Europe/Lisbon'],['Madeira','PT',['madeira','funchal','machico'],32.65,-16.91,'Atlantic/Madeira'],['Tenerife','ES',['tenerife'],28.29,-16.63,'Atlantic/Canary'],
  ['Corfu','GR',['corfu'],39.62,19.92,'Europe/Athens'],['Santorini','GR',['santorini'],36.39,25.46,'Europe/Athens'],['Jackson Hole','US',['jackson hole'],43.48,-110.76,'America/Denver','Wyoming'],['Niagara Falls','CA',['niagara'],43.09,-79.07,'America/Toronto'],
];
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cityDefs = CITIES.map(([name, cc, terms, lat, lon, tz, st]) => ({ name, cc, lat, lon, tz, st, slug: slugify(name), re: new RegExp('\\b(' + terms.map(reEsc).join('|') + ')\\b', 'i') }));
const cityOf = c => cityDefs.find(d => d.cc === c.country && d.re.test(c.name || '')) || null;
// Countries with a single time zone: lets a cam with no coordinates still show the right local time.
const COUNTRY_TZ = { IE: 'Europe/Dublin', PT: 'Europe/Lisbon', GB: 'Europe/London', JP: 'Asia/Tokyo', IT: 'Europe/Rome', NL: 'Europe/Amsterdam', ES: 'Europe/Madrid', CH: 'Europe/Zurich', TH: 'Asia/Bangkok', NZ: 'Pacific/Auckland', FI: 'Europe/Helsinki', NO: 'Europe/Oslo', SE: 'Europe/Stockholm', IS: 'Atlantic/Reykjavik', AT: 'Europe/Vienna', DE: 'Europe/Berlin', FR: 'Europe/Paris', KR: 'Asia/Seoul', HK: 'Asia/Hong_Kong', TW: 'Asia/Taipei', SG: 'Asia/Singapore', IN: 'Asia/Kolkata', AE: 'Asia/Dubai', VN: 'Asia/Ho_Chi_Minh', PH: 'Asia/Manila', MY: 'Asia/Kuala_Lumpur', GR: 'Europe/Athens', TR: 'Europe/Istanbul', CZ: 'Europe/Prague', HU: 'Europe/Budapest', PL: 'Europe/Warsaw', DK: 'Europe/Copenhagen', BE: 'Europe/Brussels', IL: 'Asia/Jerusalem', ZA: 'Africa/Johannesburg', KE: 'Africa/Nairobi', EG: 'Africa/Cairo', MA: 'Africa/Casablanca', SI: 'Europe/Ljubljana', GT: 'America/Guatemala', NA: 'Africa/Windhoek', NI: 'America/Managua', CR: 'America/Costa_Rica', BG: 'Europe/Sofia', LI: 'Europe/Vaduz', AZ: 'Asia/Baku', LU: 'Europe/Luxembourg', BA: 'Europe/Sarajevo', CN: 'Asia/Shanghai', CO: 'America/Bogota', PE: 'America/Lima', CL: 'America/Santiago',
  FO: 'Atlantic/Faroe', CV: 'Atlantic/Cape_Verde', BM: 'Atlantic/Bermuda', DO: 'America/Santo_Domingo', BW: 'Africa/Gaborone', HR: 'Europe/Zagreb', LV: 'Europe/Riga', CY: 'Asia/Nicosia', ME: 'Europe/Podgorica', EE: 'Europe/Tallinn', GE: 'Asia/Tbilisi', RS: 'Europe/Belgrade', LT: 'Europe/Vilnius', SK: 'Europe/Bratislava', RO: 'Europe/Bucharest', MT: 'Europe/Malta', HN: 'America/Tegucigalpa', PA: 'America/Panama', JO: 'Asia/Amman', NP: 'Asia/Kathmandu', SA: 'Asia/Riyadh', ZW: 'Africa/Harare', BS: 'America/Nassau', PF: 'Pacific/Tahiti', UA: 'Europe/Kyiv', AR: 'America/Argentina/Buenos_Aires', UY: 'America/Montevideo', MK: 'Europe/Skopje', AL: 'Europe/Tirane', MV: 'Indian/Maldives', TN: 'Africa/Tunis', GI: 'Europe/Gibraltar', MC: 'Europe/Monaco', AD: 'Europe/Andorra', VI: 'America/St_Thomas', SX: 'America/Lower_Princes', TZ: 'Africa/Dar_es_Salaam', UG: 'Africa/Kampala', QA: 'Asia/Qatar', LK: 'Asia/Colombo', KH: 'Asia/Phnom_Penh', EC: 'America/Guayaquil', CU: 'America/Havana', FJ: 'Pacific/Fiji', MU: 'Indian/Mauritius' };
// US states that sit in a single time zone (states split across two zones are left out rather than guessed).
const STATE_TZ = (() => { const z = {}; const put = (tz, l) => l.split('|').forEach(s => z[s] = tz);
  put('America/New_York', 'Connecticut|Delaware|Georgia|Maine|Maryland|Massachusetts|New Hampshire|New Jersey|New York|North Carolina|Ohio|Pennsylvania|Rhode Island|South Carolina|Vermont|Virginia|West Virginia');
  put('America/Chicago', 'Alabama|Arkansas|Illinois|Iowa|Louisiana|Minnesota|Mississippi|Missouri|Oklahoma|Wisconsin');
  put('America/Denver', 'Colorado|Montana|New Mexico|Utah|Wyoming'); put('America/Phoenix', 'Arizona');
  put('America/Los_Angeles', 'California|Nevada|Washington'); put('Pacific/Honolulu', 'Hawaii'); put('America/Anchorage', 'Alaska'); return z; })();
const US_STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
// A US state named in the cam's own title (longest names first, so "West Virginia" wins over "Virginia").
const stateNames = Object.values(US_STATES).sort((a, b) => b.length - a.length);
function stateFromName(n) {
  for (const s of stateNames) {
    if (s === 'Washington') { if (/,\s*Washington\b(?!\s*,?\s*D\.?\s*C)|Washington State|\bWashington\s*,?\s*USA/i.test(n)) return s; continue; }
    const m = n.match(new RegExp('(lake\\s+)?\\b' + s + '\\b(\\s+(river|city))?', 'i'));
    if (m && !m[1] && !m[2]) return s;
  }
  const a = n.match(/,\s*([A-Z]{2})\b/) || n.match(/\s([A-Z]{2})\.?\s*$/);
  if (a && a[1] !== 'LA' && US_STATES[a[1]]) return US_STATES[a[1]];
  return null;
}
for (const c of cams) {
  const d = c.city = cityOf(c);
  if (c.lat != null && c.lon != null) c.exact = true;                       // real camera coordinates
  else if (d) { const h = hash(c.id); c.lat = +(d.lat + ((h % 100) / 100 - 0.5) * 0.05).toFixed(4); c.lon = +(d.lon + ((Math.floor(h / 100) % 100) / 100 - 0.5) * 0.05).toFixed(4); }   // city-level only
  if (c.country === 'US' && !c.state) c.state = (d && d.st) || stateFromName(c.name || '') || (/caltrans/i.test(c.channel || '') ? 'California' : '');
  if (!c.tz) c.tz = (d && d.tz) || (c.country === 'US' ? STATE_TZ[c.state] : COUNTRY_TZ[c.country]) || '';
  // Map position + how sure we are of it: 'exact' (the camera), 'city' (somewhere in its city), 'country' (centroid, nudged apart).
  const g = GEO[c.country], h = hash(c.id);
  if (c.lat != null && c.lon != null) { c.mla = +(+c.lat).toFixed(3); c.mln = +(+c.lon).toFixed(3); c.loc = c.exact ? 'exact' : 'city'; }
  else if (g) { c.mla = +(g.lat + ((h % 1000) / 1000 - 0.5) * 9).toFixed(3); c.mln = +(g.lng + ((Math.floor(h / 1000) % 1000) / 1000 - 0.5) * 14).toFixed(3); c.loc = 'country'; }
  // Plain-words place, most specific first: "Tokyo, Japan" / "California, USA" / "Portugal".
  c.place = [...new Set([d && d.name, c.state, c.countryLabel].filter(Boolean))].join(', ');
}
// Themes cut across the main category: a cam can be a harbour AND a lighthouse AND in a national park.
const THEMES = [
  ['airports', 'Airports', '✈️', /airport|runway|plane ?spott|\bLAX\b|\bJFK\b|heathrow|aeropuerto|aeroporto|flughafen/i],
  ['lighthouses', 'Lighthouses', '🗼', /lighthouse|leuchtturm|\bfaro\b|phare\b/i],
  ['ports-and-ships', 'Ports & ships', '🚢', /cruise|\bport\b|\bporto? d[eoi]\b|harbou?r|\bferry|\bships?\b|\bmarina\b|\bdocks?\b|wharf|\bcanal\b|bridge cam$/i],
  ['railways', 'Railways', '🚂', /rail|\btrains?\b|train station|centraal station|bahnhof|\btram\b|\bsubway\b|\bmetro station/i],
  ['lakes-and-rivers', 'Lakes & rivers', '🏞️', /\blake\b|\blago\b|\bam see\b|[a-zäöü]{4,}see\b|\briver\b|\bloch\b|fjord|reservoir/i],
  ['zoos-and-aquariums', 'Zoos & aquariums', '🐼', /\bzoo\b|aquarium|sanctuary|wildlife park/i],
  ['birds', 'Bird cams', '🦅', /\beagles?\b(?! beach)|\bospreys?\b|\bowls?\b|\bfalcons?\b|\bbirds?\b|\bnest\b|feeder|\bstorks?\b|puffin|hummingbird|\bherons?\b|kestrel|\bcondor|albatross/i],
  ['underwater', 'Underwater', '🐠', /underwater|\breef\b|aquarium|shark|manatee|octopus|kelp|jellyfish|open sea|deep ocean/i],
  ['northern-lights', 'Northern lights', '🌌', /aurora|northern lights|polarlicht|nordlys/i],
  ['bridges', 'Bridges', '🌉', /bridge(?! cam)|brücke|\bponte\b|viaduct/i],
  ['waterfalls', 'Waterfalls', '💦', /\bfalls\b|waterfall|wasserfall|\bcascata\b/i],
  ['national-parks', 'National parks', '🏕️', /national park|yellowstone|yosemite|grand canyon|glacier np|denali|mount rainier|grand teton|great smoky|katmai|acadia|zion\b|crater lake/i],
  ['universities', 'Universities', '🎓', /universit|\bcampus\b|college\b/i],
  ['glaciers', 'Glaciers', '🧊', /glacier|gletscher|ghiacciaio/i],
  ['squares-and-markets', 'Squares & markets', '⛲', /\bmarket\b|\bsquare\b|\bplaza\b|piazza|\bplatz\b|\bplace d[eu]\b|\bpra[cç]a\b|rynek/i],
  ['piers-and-boardwalks', 'Piers & boardwalks', '🎡', /\bpier\b|boardwalk|promenade|seafront/i],
  ['castles', 'Castles', '🏰', /\bcastle\b|\bschloss\b|\bburg\b|ch[aâ]teau|\bcastello\b|\bcastillo\b/i],
].map(([slug, name, icon, re]) => ({ slug, name, icon, re }));
// A lake or castle named in a road camera's title does not make it a lake cam.
const NOT_FOR_ROADS = new Set(['lakes-and-rivers', 'waterfalls', 'castles', 'squares-and-markets', 'national-parks', 'glaciers', 'lighthouses']);
for (const c of cams) c.themes = THEMES.filter(t => (t.re.test(c.name || '') && !(c.category === 'traffic' && NOT_FOR_ROADS.has(t.slug))) || (t.slug === 'national-parks' && /nps\.gov/.test(c.imageUrl || ''))).map(t => t.slug);
const fmtName = c => c.name;

const SITE_URL = 'https://watchthiscam.com';
const absUrl = u => (u && u[0] === '/' ? SITE_URL + u : u);
const ogYt = cams.find(isYT);
const DEFAULT_OG = ogYt ? `https://i.ytimg.com/vi/${ogYt.videoId}/hqdefault.jpg` : '/icon.svg';
// Cloudflare Pages 308-redirects /x.html to /x, so canonicals and the sitemap use the clean form.
const cleanPath = p => (p || '/').replace(/\.html$/, '');
// Structured data (JSON-LD). VideoObject only for real embedded video (YouTube);
// photo cams are refreshing stills, so ImageObject — claiming VideoObject there
// with no <video> would be structured-data spam Google can penalise.
const BUILD_DATE = new Date().toISOString().slice(0, 10) + 'T00:00:00+00:00';
function camJsonLd(c) {
  const url = `${SITE_URL}/cam/${c.id}`;
  const main = isPlayer(c)
    ? (c.thumbUrl ? {
        '@context': 'https://schema.org', '@type': 'VideoObject',
        name: `${c.name} — live cam`, description: c.blurb,
        thumbnailUrl: [absUrl(c.thumbUrl)], uploadDate: BUILD_DATE, embedUrl: c.embedUrl, url,
        publication: { '@type': 'BroadcastEvent', isLiveBroadcast: true, startDate: BUILD_DATE },
      } : null)
    : c.type !== 'image'
    ? {
        '@context': 'https://schema.org', '@type': 'VideoObject',
        name: `${c.name} — live cam`, description: c.blurb,
        thumbnailUrl: [`https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg`],
        uploadDate: BUILD_DATE,
        embedUrl: `https://www.youtube-nocookie.com/embed/${c.videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${c.videoId}`, url,
        publication: { '@type': 'BroadcastEvent', isLiveBroadcast: true, startDate: BUILD_DATE },
      }
    : {
        '@context': 'https://schema.org', '@type': 'ImageObject',
        name: `${c.name} — live cam`, description: c.blurb,
        contentUrl: c.imageUrl, thumbnailUrl: c.imageUrl, url,
      };
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Browse', item: SITE_URL + '/browse' },
      { '@type': 'ListItem', position: 3, name: c.name },
    ],
  };
  return main ? [main, crumbs] : [crumbs];
}
const SITE_JSONLD = [
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' },
  { '@context': 'https://schema.org', '@type': 'Organization', name: 'Watch This Cam', url: SITE_URL + '/', logo: SITE_URL + '/icon-512.png' },
];
const head = (title, desc, image, pagePath, jsonld) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${SITE_URL}${cleanPath(pagePath)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Watch This Cam">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(absUrl(image || DEFAULT_OG))}">${pagePath ? `
<meta property="og:url" content="${SITE_URL}${cleanPath(pagePath)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(absUrl(image || DEFAULT_OG))}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#0b0f17">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">${jsonld ? `
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}</script>` : ''}</head><body>`;
const header = `<header class="top"><div class="wrap">
<a class="logo" href="/">Watch<span class="bubble">This</span>Cam</a>
<nav class="nav">
<a href="/wall.html">📺 Wall</a>
<a href="/thrills.html">⚡ Thrills</a>
<a class="hide-sm" href="/browse.html">Browse</a>
<a class="hide-sm" href="/guide/">Guides</a>
<a href="/favourites.html">Favourites</a>
<a class="hide-sm" href="/map.html">Map</a>
<a class="hide-sm" href="/live/">Right now</a>
<a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a>
</nav></div></header>`;
const footer = `<footer><div class="wrap">
<span>Watch This Cam — a window onto the world. Cameras belong to their operators and link back to the source; some provided via windy.com and YouTube.</span>
<span><a href="/about.html">About</a> &nbsp; <a href="/live/">Right now</a> &nbsp; <a href="/new.html">Newest cams</a> &nbsp; <a href="/widget.html">Embed a cam</a> &nbsp; <a href="/random.html">Random cam</a></span>
</div></footer>
<script>
if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
(function(){var p;addEventListener('beforeinstallprompt',function(e){e.preventDefault();p=e;var b=document.getElementById('installbtn');if(b){b.hidden=false;b.onclick=function(){b.hidden=true;p.prompt();};}});})();
</script>
</body></html>`;

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'cam'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src', 'styles.css'), path.join(DIST, 'styles.css'));
// Favicons as real files (Google ignores data: URIs and wants 48px multiples); rendered from the SVGs and committed in src/static.
fs.cpSync(path.join(ROOT, 'src', 'static'), DIST, { recursive: true });
// Card picture for a live-video cam we have no thumbnail of.
fs.writeFileSync(path.join(DIST, 'live.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#121826"/><circle cx="320" cy="165" r="44" fill="none" stroke="#34446a" stroke-width="5"/><path d="M306 142v46l40-23z" fill="#5aa2ff"/><text x="320" y="250" font-family="Arial" font-size="20" fill="#8d9ab3" text-anchor="middle">Live video</text></svg>`);
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
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
    { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 1));
fs.writeFileSync(path.join(DIST, 'sw.js'), `// Watch This Cam service worker: network-first for the app, so rebuilds show at once; cache is the offline fallback.
var V='wtc-v4';
var SHELL=['/','/styles.css','/browse.html','/thrills.html','/map.html','/wall.html','/favourites.html','/about.html','/cams.js','/meta.js','/ids.js','/wall.js','/cam.js','/icon.svg'];
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
fs.writeFileSync(path.join(DIST, 'ids.js'), 'window.IDS=' + JSON.stringify(cams.map(c => c.id)) + ';'
  + 'window.VIDS=' + JSON.stringify(cams.filter(c => !(c.type === 'image' && !c.isMjpeg)).map(c => c.id)) + ';');
// Geo + time metadata for Smart surf (day/night) and the world map. Deterministic jitter spreads same-country pins.
// Position: the camera's own coordinates, else its city, else the country centroid nudged apart (c.loc says which).
// Time: an IANA zone where known (TZS table + index, resolved to a DST-correct offset in the browser), else a rough offset.
const TZS = [...new Set(cams.map(c => c.tz).filter(Boolean))], tzIdx = {}; TZS.forEach((z, i) => tzIdx[z] = i);
fs.writeFileSync(path.join(DIST, 'meta.js'), 'window.CAMMETA=' + JSON.stringify(
  cams.filter(c => c.mla != null).map(c => {
    const g = GEO[c.country];
    const o = { i: c.id, n: c.name, co: c.countryLabel, cat: c.category, catL: c.catLabel, t: thumb(c), snap: isPhoto(c) ? 1 : 0,
      off: g ? g.off : Math.round((c.mln || 0) / 15), la: c.mla, ln: c.mln };
    if (c.tz) o.z = tzIdx[c.tz];
    if (c.loc === 'exact') o.x = 1; else if (c.loc === 'city') o.x = 2;
    return o;
  })) + ';window.TZS=' + JSON.stringify(TZS) + `;
(function(){var k={},now=new Date();
function off(z){if(z in k)return k[z];var r=null;try{var p=new Intl.DateTimeFormat('en-US',{timeZone:z,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(now),o={};p.forEach(function(x){o[x.type]=+x.value;});r=Math.round((Date.UTC(o.year,o.month-1,o.day,o.hour%24,o.minute)-now.getTime())/60000)/60;}catch(e){}return k[z]=r;}
CAMMETA.forEach(function(m){if(m.z!=null){m.tz=TZS[m.z];var o=off(m.tz);if(o!=null)m.off=o;}});})();`);
// The Wall: enough per-cam info to embed many at once.
fs.writeFileSync(path.join(DIST, 'wall.js'), 'window.WALL=' + JSON.stringify(cams.map(c => ({
  id: c.id, n: c.name, co: c.countryLabel, type: c.type,
  src: c.type === 'image' ? c.imageUrl : isPlayer(c) ? c.embedUrl : `https://www.youtube-nocookie.com/embed/${c.videoId}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`,
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
// ---- Hub (landing page) helpers: one page per country and per category (SEO) ----
const nByCountry = {}, nByCat = {};
cams.forEach(c => { nByCountry[c.country] = (nByCountry[c.country] || 0) + 1; nByCat[c.category] = (nByCat[c.category] || 0) + 1; });
const countryName = {};
cams.forEach(c => { if (c.country && c.country !== 'XX' && c.countryLabel) countryName[c.country] = c.countryLabel; });
const hubCountries = Object.keys(countryName).sort((a, b) => countryName[a].localeCompare(countryName[b]));
const countrySlug = {}; hubCountries.forEach(co => countrySlug[co] = slugify(countryName[co]));
const hubCats = Object.keys(CATS).filter(k => cams.some(c => c.category === k));
const topCountries = hubCountries.slice().sort((a, b) => nByCountry[b] - nByCountry[a]).slice(0, 18);
const placeTiles = topCountries.map(co => `<a class="tile" href="/place/${countrySlug[co]}.html"><b>${esc(countryName[co])}</b><span>${nByCountry[co]}</span></a>`).join('');
const cityCams = {}; cams.forEach(c => { const d = c.city; if (d) (cityCams[d.slug] = cityCams[d.slug] || []).push(c); });
const hubCities = cityDefs.filter(d => (cityCams[d.slug] || []).length >= 2);
const topCities = hubCities.slice().sort((a, b) => cityCams[b.slug].length - cityCams[a.slug].length).slice(0, 18);
const cityTiles = topCities.map(d => `<a class="tile" href="/city/${d.slug}.html"><b>${esc(d.name)}</b><span>${cityCams[d.slug].length}</span></a>`).join('');
const hubCitySet = new Set(hubCities);
// US state hubs + theme hubs (a page only exists once there is enough on it).
const stateCams = {}; cams.forEach(c => { if (c.state) (stateCams[c.state] = stateCams[c.state] || []).push(c); });
const hubStates = Object.keys(stateCams).filter(s => stateCams[s].length >= 2).sort();
const hubStateSet = new Set(hubStates);
const themeCams = {}; THEMES.forEach(t => themeCams[t.slug] = cams.filter(c => c.themes.includes(t.slug)));
const hubThemes = THEMES.filter(t => themeCams[t.slug].length >= 4);
const hubThemeSet = new Set(hubThemes.map(t => t.slug));
const themeBySlug = {}; THEMES.forEach(t => themeBySlug[t.slug] = t);
const themeTiles = hubThemes.map(t => `<a class="tile" href="/theme/${t.slug}.html"><b>${t.icon} ${esc(t.name)}</b><span>${themeCams[t.slug].length}</span></a>`).join('');
// "Plan a trip" links. Booking landing pages are checked ones only (research/booking-pages.json); GetYourGuide search links never go stale.
const AFF = { on: true, booking: '2321831', gyg: 'KWHAG0B' };
const BOOKING_PAGES = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'booking-pages.json'))); } catch (e) { return {}; } })();
const TRIP_CATS = new Set(['city', 'beach', 'surf', 'harbour', 'landmark', 'ski', 'mountain', 'nature', 'bar', 'volcano']);
function tripLinks(name, keys) {
  if (!AFF.on || !name) return '';
  const bp = keys.map(k => BOOKING_PAGES[k]).find(Boolean), rel = 'rel="sponsored nofollow noopener" target="_blank"';
  return `${bp ? `<a class="triplink" ${rel} href="https://www.booking.com/${bp}.html?aid=${AFF.booking}&label=watchthiscam">Places to stay in ${esc(name)} <span>Booking.com →</span></a>` : ''}
<a class="triplink" ${rel} href="https://www.getyourguide.com/s/?q=${encodeURIComponent(name)}&partner_id=${AFF.gyg}&cmp=watchthiscam">Things to do in ${esc(name)} <span>GetYourGuide →</span></a>
<p class="credit">If you book through these links we may earn a small commission. It costs you nothing extra.</p>`;
}
const tripKeys = c => [c.city && 'city:' + c.city.slug, c.state && 'state:' + slugify(c.state), c.country && 'country:' + c.country].filter(Boolean);
const tripName = c => (c.city && c.city.name) || c.state || c.countryLabel || '';
// Thrills: the dramatic ones.
const THRILL = /volcano|nazar|aurora|fuji|matterhorn|jungfrau|times square|vegas|bourbon|nightlife|night|safari|africa|lion|storm|hurricane|falls|piccadilly|rocket|shibuya|big ?wave|pipeline|banzai/i;
const thrills = cams.filter(c => ['volcano', 'surf', 'bar'].includes(c.category) || THRILL.test(c.name + ' ' + c.catLabel));
// Live viewer counts (YouTube only) for "Busiest right now".
const watchers = c => { const m = (c.watching || '').match(/([\d,]+)\s*watching/i); return m ? parseInt(m[1].replace(/,/g, ''), 10) || 0 : 0; };
const busiest = cams.filter(c => watchers(c) > 0).sort((a, b) => watchers(b) - watchers(a)).slice(0, 8);
fs.writeFileSync(path.join(DIST, 'index.html'), head('Watch This Cam — live cameras from around the world',
  'Hit the button and get a random live camera from somewhere in the world. Beaches, cities, harbours, wildlife and the downright odd.', null, '/', SITE_JSONLD) + header + `
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
<div class="section-head"><h2>Browse by place</h2><a href="/place/${countrySlug[topCountries[0]]}.html">See all →</a></div>
<div class="tiles">${placeTiles}</div>
<div class="section-head"><h2>Popular cities</h2><a href="/city/${topCities[0].slug}.html">See all →</a></div>
<div class="tiles">${cityTiles}</div>
${themeTiles ? `<div class="section-head"><h2>Browse by theme</h2></div>
<div class="tiles">${themeTiles}</div>` : ''}
${hubStates.length >= 4 ? `<div class="section-head"><h2>USA by state</h2></div>
<div class="tiles">${hubStates.slice().sort((a, b) => stateCams[b].length - stateCams[a].length).slice(0, 18).map(st => `<a class="tile" href="/state/${slugify(st)}.html"><b>${esc(st)}</b><span>${stateCams[st].length}</span></a>`).join('')}</div>` : ''}
<div class="section-head"><h2>Right now</h2><a href="/live/">See all →</a></div>
<div class="guidegrid">
<a class="guidecard" href="/live/warmest.html"><b>The warmest cams in the world right now</b><span>Ranked by live temperature</span></a>
<a class="guidecard" href="/live/coldest.html"><b>The coldest cams in the world right now</b><span>Ranked by live temperature</span></a>
<a class="guidecard" href="/live/northern-lights.html"><b>Northern lights tonight</b><span>Live aurora forecast + cams in the dark</span></a>
<a class="guidecard" href="/live/earthquakes.html"><b>Earthquakes this week</b><span>Live map + the nearest cams</span></a>
<a class="guidecard" href="/new.html"><b>Newest cams</b><span>Just added</span></a>
</div>
<div class="section-head"><h2>Guides</h2><a href="/guide/">See all →</a></div>
<div class="guidegrid">
<!--HOME_GUIDES-->
</div>
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
fs.writeFileSync(path.join(DIST, 'browse.html'), head('Browse all cams — Watch This Cam', 'Browse every live camera by place and type.', null, '/browse.html') + header + `
<main class="wrap">
<div class="section-head"><h2>All cameras</h2>
<div style="display:flex;gap:8px;flex-wrap:wrap">
<select class="search" id="country" style="max-width:180px;flex:0 1 auto"><option value="">All countries</option>${countryOpts}</select>
<select class="search" id="type" style="max-width:150px;flex:0 1 auto"><option value="">Video + photo</option><option value="v">📹 Live video</option><option value="p">📷 Photo</option></select>
<input class="search" id="q" type="search" placeholder="Search a place or type…"></div></div>
<div class="chips" id="chips">${chips}</div>
<div class="grid" id="grid" style="margin-top:16px"></div>
<p class="empty" id="empty" hidden>No cams match that. <a href="/random.html">Try a random one →</a></p>
</main>
<script src="/cams.js"></script>
<script>
const grid=document.getElementById('grid'),q=document.getElementById('q'),empty=document.getElementById('empty'),country=document.getElementById('country'),type=document.getElementById('type');
let cat='all';
const card=c=>\`<a class="card" href="/cam/\${c.id}.html"><div class="thumb"><span class="pill\${c.snap?' snap':''}"><span class="dot"></span>\${c.snap?'PHOTO':'LIVE'}</span><img loading="lazy" onerror="var k=this.closest('.card');if(k)k.style.display='none'" src="\${c.t}" alt=""></div><div class="meta"><b>\${c.fl?c.fl+' ':''}\${c.n}</b><span>\${[c.co,c.catL].filter(Boolean).join(' · ')}</span></div></a>\`;
function render(){const term=q.value.trim().toLowerCase(),co=country.value,ty=type.value;const list=CAMS.filter(c=>(cat==='all'||c.cat===cat)&&(!co||c.co===co)&&(!ty||(ty==='v'?!c.snap:c.snap))&&(!term||(c.n+' '+c.co+' '+c.catL).toLowerCase().includes(term)));grid.innerHTML=list.map(card).join('');empty.hidden=list.length>0;}
document.getElementById('chips').onclick=e=>{if(!e.target.dataset.cat)return;cat=e.target.dataset.cat;[...chips.children].forEach(b=>b.classList.toggle('on',b.dataset.cat===cat));render();};
q.oninput=render;country.onchange=render;type.onchange=render;
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
var vids=${JSON.stringify(cams.filter(c => !(c.type === 'image' && !c.isMjpeg)).map(c => c.id))};
function smart(){try{return localStorage.getItem('wtc_smart')!=='0'}catch(e){return true}}
function vidOnly(){try{return localStorage.getItem('wtc_vid')==='1'}catch(e){return false}}
var META={};(window.CAMMETA||[]).forEach(function(m){META[m.i]=m;});
function isDay(id){var m=META[id];if(!m)return true;var h=(new Date().getUTCHours()+m.off+24)%24;return h>=6&&h<20;}
function seen(){try{return JSON.parse(sessionStorage.getItem('wtc_seen')||'[]')}catch(e){return[]}}
var base=ids;if(vids.length>5&&(vidOnly()||Math.random()<0.6))base=vids;
var pool=base;if(smart()){var d=base.filter(isDay);if(d.length>5)pool=d;}
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
const camTitle = c => /web ?cam|\bcams?\b|\blive\b|camera/i.test(c.name) ? `${c.name} | Watch This Cam` : `${c.name} live webcam | Watch This Cam`;
const feedKind = c => isYT(c) || isPlayer(c) || c.isMjpeg ? 'video' : windyId(c) ? 'windy' : 'photo';
const camDesc = c => {
  const k = feedKind(c), kind = k === 'video' ? 'live video' : k === 'windy' ? 'a near-live view with a timelapse of the day' : `a live photo that refreshes every ${c.refreshSeconds || 10} seconds`;
  return `${c.name}${c.place ? ', ' + c.place : ''}: ${kind}, free to watch.${c.loc === 'exact' || c.loc === 'city' ? ' See the local time, the weather there right now, and sunrise and sunset.' : ''}`;
};
const fmtCoord = (la, lo) => `${Math.abs(la).toFixed(2)}°${la >= 0 ? 'N' : 'S'}, ${Math.abs(lo).toFixed(2)}°${lo >= 0 ? 'E' : 'W'}`;
// Short answers built only from what we actually know about the cam. Shown on the page and mirrored in FAQPage markup.
function camFaq(c) {
  const qa = [], op = c.channel || 'its operator', k = feedKind(c);
  qa.push({ q: `Is ${c.name} live right now?`, a:
    isYT(c) ? `Yes. It is a live video stream that ${op} broadcasts on YouTube, and it plays here as it happens. If the player shows an error, the operator has taken the stream offline for now.`
    : isPlayer(c) ? `Yes. It is a live video stream. The camera's operator publishes it through ${c.network || op}, and it plays here in that network's own player. If the player stays blank, the stream is offline for now.`
    : k === 'windy' ? `It is a near-live view. The picture comes from the windy.com webcam player, which shows the camera's latest image and a timelapse of the day.`
    : c.isMjpeg ? `Yes. It is a live motion stream straight from the camera, published by ${op}.`
    : `It is a live photo cam, not moving video. ${op} publishes a fresh still from the camera and this page reloads it every ${c.refreshSeconds || 10} seconds.` });
  if (c.place) qa.push({ q: 'Where is this camera?', a: `It is in ${NEEDS_THE.has(c.place) ? 'the ' : ''}${c.place.replace(/, (USA|UK|Netherlands|Philippines|UAE|Maldives|Bahamas|Faroe Islands|Dominican Republic)$/, ', the $1')}.${c.loc === 'exact' ? ` The camera sits at about ${fmtCoord(c.lat, c.lon)}, and the map on this page shows the spot.` : ''}` });
  if (c.tz) qa.push({ q: 'What time is it there?', a: `The camera is in the ${c.tz.replace(/_/g, ' ')} time zone. The local time is shown under the player${c.loc === 'exact' || c.loc === 'city' ? ', along with the weather, sunrise and sunset' : ''}.` });
  qa.push({ q: 'Who runs this camera?', a: isPlayer(c)
    ? `The camera's own operator streams it through ${c.network || op}, a camera hosting service. Watch This Cam shows that network's player and links back to it.`
    : k === 'windy'
    ? `It is listed in the public webcam directory on windy.com, which credits the original operator. Watch This Cam shows windy.com's own player and links back to it.`
    : `${op} runs it and publishes it for anyone to watch. Watch This Cam does not host the feed. It shows the public stream and links back to the source.` });
  qa.push({ q: 'Is it free to watch?', a: 'Yes. Every camera on Watch This Cam is free to watch and you do not need an account.' });
  qa.push({ q: 'Can I put this cam on my own website?', a: 'Yes. Press Embed under the player and copy the code. It is free to use.' });
  return qa;
}
// Same operator, same spot: the "other angles" of a place.
const byChannel = {}; cams.forEach(c => { if (c.channel) (byChannel[c.channel] = byChannel[c.channel] || []).push(c); });
const STOPW = /^(live|cam|cams|camera|webcam|the|view|hd|4k|stream|streaming|of|in|at|from|a|24|7)$/;
for (const c of cams) c.nkey = String(c.name).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w && !STOPW.test(w)).slice(0, 2).join(' ');
function anglesOf(c) {
  const sib = byChannel[c.channel] || [];
  if (sib.length < 2) return [];
  return sib.filter(o => o !== c && (c.loc === 'exact' && o.loc === 'exact'
    ? kmBetween(c.lat, c.lon, o.lat, o.lon) <= 2
    : (c.nkey.includes(' ') && c.nkey === o.nkey && c.country === o.country))).slice(0, 6);
}
// Nearest other cameras by real distance (only between cams whose own position we know), else others in the same city.
const exactCams = cams.filter(c => c.loc === 'exact');
function nearbyOf(c, exclude) {
  if (c.loc === 'exact') {
    const out = [];
    for (const o of exactCams) { if (o === c || exclude.has(o)) continue; const d = kmBetween(c.lat, c.lon, o.lat, o.lon); if (d <= 150) out.push({ c: o, km: d }); }
    return out.sort((a, b) => a.km - b.km).slice(0, 5);
  }
  if (c.city && cityCams[c.city.slug]) return cityCams[c.city.slug].filter(o => o !== c && !exclude.has(o)).sort((a, b) => (isPhoto(a) ? 1 : 0) - (isPhoto(b) ? 1 : 0)).slice(0, 5).map(o => ({ c: o }));
  return [];
}
// "More like this": same kind, same country first, rotated per cam so every cam gets linked to (not just the first four).
const byCat = {}; cams.forEach(c => (byCat[c.category] = byCat[c.category] || []).push(c));
const rot = (a, k) => a.length ? a.slice(k % a.length).concat(a.slice(0, k % a.length)) : a;
function relatedOf(c, exclude) {
  const pool = byCat[c.category].filter(r => r !== c && !exclude.has(r)), h = hash(c.id);
  return rot(pool.filter(r => r.country === c.country), h).slice(0, 2).concat(rot(pool.filter(r => r.country !== c.country), h)).slice(0, 4);
}
const kmLabel = km => km < 1 ? 'under 1 km' : km < 10 ? km.toFixed(1) + ' km' : Math.round(km) + ' km';
const inlineJson = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
// Embeddable version of a cam for other people's sites: /embed/<id> (noindex; the credit link in the snippet points at the cam page).
function embedInner(c) {
  const t = esc(c.name);
  if (isYT(c)) return `<iframe src="${embed(c)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${t}"></iframe>`;
  if (isPlayer(c)) return `<iframe src="${esc(c.embedUrl)}" allow="autoplay; fullscreen" allowfullscreen title="${t}"></iframe>`;
  const wid = windyId(c);
  if (wid) return `<iframe src="https://webcams.windy.com/webcams/public/embed/player/${wid}/day" allow="autoplay; fullscreen" allowfullscreen title="${t}"></iframe>`;
  return `<img id="i" src="${esc(c.imageUrl)}" alt="${t}">${c.isMjpeg ? '' : `<script>(function(){var i=document.getElementById('i'),u=${inlineJson(c.imageUrl)};setInterval(function(){i.src=u+(u.indexOf('?')<0?'?':'&')+'_t='+Date.now();},${(c.refreshSeconds || 10) * 1000});})();</script>`}`;
}
const embedCode = c => `<iframe src="${SITE_URL}/embed/${c.id}" style="width:100%;aspect-ratio:16/9.7;border:0" loading="lazy" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="${esc(c.name)}"></iframe>
<p style="font-size:13px"><a href="${SITE_URL}/cam/${c.id}">${esc(c.name)}</a> on <a href="${SITE_URL}/">Watch This Cam</a></p>`;
fs.mkdirSync(path.join(DIST, 'embed'), { recursive: true });

cams.forEach((c, i) => {
  const angles = anglesOf(c), excl = new Set(angles);
  const near = nearbyOf(c, excl); near.forEach(x => excl.add(x.c));
  const related = relatedOf(c, excl);
  const next = cams[(i + 1) % cams.length].id, prev = cams[(i - 1 + cams.length) % cams.length].id;
  const faq = camFaq(c);
  const ld = camJsonLd(c).concat([{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }]);
  const hasNow = c.loc === 'exact' || c.loc === 'city';
  const D = { id: c.id, n: c.name }; if (c.mla != null) { D.la = c.mla; D.ln = c.mln; D.loc = c.loc; } if (c.tz) D.tz = c.tz;
  const cityLink = c.city && hubCitySet.has(c.city) ? `<a href="/city/${c.city.slug}.html">${esc(c.city.name)}</a>` : '';
  const stateLink = c.state && hubStateSet.has(c.state) && !(c.city && c.city.name === c.state) ? `<a href="/state/${slugify(c.state)}.html">${esc(c.state)}</a>` : '';
  const countryLink = (c.country && c.country !== 'XX' && countrySlug[c.country]) ? `<a href="/place/${countrySlug[c.country]}.html">${esc(c.countryLabel)}</a>` : (c.countryLabel ? esc(c.countryLabel) : '');
  const themeLinks = c.themes.filter(t => hubThemeSet.has(t)).map(t => `<a href="/theme/${t}.html">${esc(themeBySlug[t].name)}</a>`);
  const trip = TRIP_CATS.has(c.category) && c.country && c.country !== 'XX' ? tripLinks(tripName(c), tripKeys(c)) : '';
  fs.writeFileSync(path.join(DIST, 'embed', c.id + '.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.name)} | Watch This Cam</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="${SITE_URL}/cam/${c.id}">
<style>html,body{margin:0;height:100%;background:#000;font:13px/1.2 system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
.p{position:absolute;inset:0 0 28px 0}.p iframe,.p img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:contain;background:#000}
.b{position:absolute;left:0;right:0;bottom:0;height:28px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 10px;background:#0b0f17;color:#8d9ab3;white-space:nowrap;overflow:hidden}
.b a{color:#e8edf6;text-decoration:none}.b a:hover{text-decoration:underline}.b .n{overflow:hidden;text-overflow:ellipsis}.b span{flex:none}</style></head><body>
<div class="p">${embedInner(c)}</div>
<div class="b"><a class="n" href="${SITE_URL}/cam/${c.id}" target="_blank" rel="noopener">${esc(c.name)}</a><span>${c.channel ? esc(c.channel) + ' · ' : ''}via <a href="${SITE_URL}/" target="_blank" rel="noopener">Watch This Cam</a></span></div>
</body></html>`);
  fs.writeFileSync(path.join(DIST, 'cam', c.id + '.html'), head(camTitle(c), camDesc(c), bigThumb(c), `/cam/${c.id}.html`, ld) + header + `
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
<button class="iconbtn sm" id="vidonly" title="Shuffle only to live video cams (skip photo cams)">📹 Video only</button>
<span class="kbd-hint">Tip: <kbd>Space</kbd> shuffle · <kbd>←</kbd> <kbd>→</kbd> flick · <kbd>Esc</kbd> stop</span>
</div>
<div class="player" id="player">
${playerInner(c)}
</div>
<div class="cam-actions">
<button class="iconbtn" id="fav" data-id="${c.id}">♡ Save</button>
${isYT(c) ? `<button class="iconbtn" id="sound" data-mute="${embed(c)}" data-unmute="${embed(c).replace('mute=1', 'mute=0')}">🔇 Sound</button>` : ''}
<button class="iconbtn" id="fs">⛶ Fullscreen</button>
<button class="iconbtn" id="share">🔗 Share</button>
<button class="iconbtn" id="embedbtn" aria-expanded="false" aria-controls="embedbox">&lt;/&gt; Embed</button>
<button class="iconbtn" id="report" title="Tell us this camera is offline or broken">⚑ Not working?</button>
</div>
${angles.length ? `<p class="angles"><span>${c.loc === 'exact' ? 'Other cameras right here' : 'More from this spot'}</span>${angles.map(a => `<a href="/cam/${a.id}.html">${esc(a.name)}</a>`).join('')}</p>` : ''}
<div class="embedbox" id="embedbox" hidden>
<h2>Put this cam on your site</h2>
<p>Copy this code into any web page. It is free to use and it stays live.</p>
<textarea id="embedcode" readonly rows="4" spellcheck="false">${esc(embedCode(c))}</textarea>
<button class="iconbtn" id="copyembed">Copy code</button>
</div>
<h1>${esc(c.name)}</h1>
<p class="where">${[cityLink, stateLink, countryLink, c.catLabel ? `<a href="/kind/${c.category}.html">${esc(c.catLabel)}</a>` : ''].filter(Boolean).join(' · ')}${hasNow ? '' : '<span id="localtime" class="localtime"></span>'}</p>
<p class="about">${esc(c.blurb)}</p>
${hasNow ? `<div class="nowstrip" id="now">
<div><span>Local time</span><b id="nowtime">&nbsp;</b></div>
<div><span>Weather ${c.loc === 'exact' ? 'at the camera' : 'in ' + esc(c.city.name)}</span><b id="nowwx">&nbsp;</b><i id="nowwx2"></i></div>
<div><span>Sunrise</span><b id="nowrise">&nbsp;</b></div>
<div><span>Sunset</span><b id="nowset">&nbsp;</b></div>
</div>
<p class="nowcredit">Weather from <a href="https://www.met.no/en" target="_blank" rel="noopener">MET Norway</a>. Sun times are worked out for ${c.loc === 'exact' ? 'the camera’s position' : esc(c.city.name)}.</p>` : ''}
<section class="faq"><h2>Questions about this cam</h2>
${faq.map(x => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('\n')}
</section>
</div>
<aside class="side">
<div class="box"><h3>About this cam</h3>
<dl class="facts">
<dt>Type</dt><dd><a href="/kind/${c.category}.html">${esc(c.catLabel)}</a></dd>
${[cityLink, stateLink, countryLink].some(Boolean) ? `<dt>Where</dt><dd>${[cityLink, stateLink, countryLink].filter(Boolean).join(', ')}</dd>` : ''}
${c.loc === 'exact' ? `<dt>Position</dt><dd>${fmtCoord(c.lat, c.lon)}</dd>` : ''}
${c.tz ? `<dt>Time zone</dt><dd>${esc(c.tz.replace(/_/g, ' '))}</dd>` : ''}
${themeLinks.length ? `<dt>Also in</dt><dd>${themeLinks.join(', ')}</dd>` : ''}
${isYT(c) && watchers(c) > 0 ? `<dt>Watching</dt><dd>👁 ${watchers(c) >= 1000 ? (watchers(c) / 1000).toFixed(1) + 'k' : watchers(c)} on YouTube</dd>` : ''}
${(() => { const t = tideFor(c); return t ? `<dt>Tides</dt><dd><a href="https://tides.watch/spots/${t.slug}" rel="noopener">Tide times →</a></dd>` : ''; })()}
<dt>Source</dt><dd><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.channel || (isYT(c) ? 'YouTube' : 'Operator'))}</a></dd>
</dl>
<p class="credit">${windyId(c)
  ? `A near-live view via windy.com's own webcam player (press play for the day's timelapse). Watch This Cam embeds it and links back to the source.`
  : c.type === 'image'
  ? `Published by ${esc(c.channel || 'its operator')}. Watch This Cam shows it refreshing and links back to the source.`
  : isPlayer(c)
  ? `Streamed live by its operator through ${esc(c.network || c.channel || 'a camera network')}. Watch This Cam embeds that player and links back to it.`
  : `Streamed live by ${esc(c.channel || 'its operator')} on YouTube. Watch This Cam just points you at it.`}</p>
</div>
${c.mla != null ? `<div class="box"><h3>Where in the world</h3><div id="minimap"></div>${c.loc === 'exact' ? '' : `<p class="credit" style="margin:8px 0 0">Roughly: the pin is placed in its ${c.loc === 'city' ? 'city' : 'country'}, not on the camera.</p>`}</div>` : ''}
${near.length ? `<div class="box"><h3>${c.loc === 'exact' ? 'Nearby cams' : 'More in ' + esc(c.city.name)}</h3>${near.map(x => `<a class="mini" href="/cam/${x.c.id}.html"><img loading="lazy" ${HIDEMINI} src="${thumb(x.c)}" alt=""><span>${esc(x.c.name)}${x.km != null ? `<em>${kmLabel(x.km)} away</em>` : ''}</span></a>`).join('')}</div>` : ''}
${trip ? `<div class="box tripbox"><h3>Plan a trip</h3>${trip}</div>` : ''}
${related.length ? `<div class="box"><h3>More like this</h3>${related.map(r => `<a class="mini" href="/cam/${r.id}.html"><img loading="lazy" ${HIDEMINI} src="${thumb(r)}" alt=""><span>${esc(r.name)}</span></a>`).join('')}</div>` : ''}
</aside>
</div>
</main>
<canvas id="tvstatic"></canvas><div id="tvch"></div>
${c.mla != null ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>` : ''}
<script>window.CAM=${inlineJson(D)};</script>
<script src="/ids.js"></script>
<script src="/meta.js"></script>
<script src="/cam.js"></script>` + footer);
});

// ---- About ----
fs.writeFileSync(path.join(DIST, 'about.html'), head('About — Watch This Cam', 'What Watch This Cam is.', null, '/about.html') + header + `
<main class="wrap"><div class="page">
<h1>About Watch This Cam</h1>
<p>Watch This Cam started back in 2011 as a bit of fun: hit a button and get dropped onto a random live webcam from somewhere in the world. You never knew what you'd get.</p>
<p>This is the 2026 revival. Every camera here is a public, live stream that its own operator — a town, a surf club, a harbour, a university, a wildlife charity — chose to put online. We don't host any video; we just point you at it and link back to the source.</p>
<p>So go on. <a href="/random.html">Hit the button</a> and see where you end up.</p>
<p class="credit">Not affiliated with any of the camera operators. If you run one of these cams and would like it removed, get in touch.</p>
</div></main>` + footer);

// ---- 404 (its presence also stops Cloudflare Pages serving the homepage as a 200 for unknown URLs) ----
fs.writeFileSync(path.join(DIST, '404.html'), head('Page not found — Watch This Cam', 'That page does not exist.') + header + `
<main class="wrap"><div class="page">
<h1>That cam has gone dark</h1>
<p>We couldn't find that page. It may have moved, or the camera was taken offline.</p>
<p><a href="/random.html">Hit the button for a random cam →</a> or <a href="/browse.html">browse them all</a>.</p>
</div></main>` + footer);

// ---- Favourites (client-side, from localStorage) ----
fs.writeFileSync(path.join(DIST, 'favourites.html'), head('Favourites — Watch This Cam', 'The cams you saved.', null, '/favourites.html') + header + `
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
fs.writeFileSync(path.join(DIST, 'thrills.html'), head('Thrills — Watch This Cam', 'The most dramatic live cams: volcanoes, big surf, nightlife, safari and more.', null, '/thrills.html') + header + `
<main class="wrap">
<div class="section-head"><h2>⚡ Thrills</h2><a href="/browse.html">Browse all →</a></div>
<p style="color:var(--muted);margin:-6px 0 16px">Volcanoes, big surf, buzzing nightlife, safari waterholes — the cams with a bit of drama. ${thrills.length} of them.</p>
<div class="grid">${thrills.map(card).join('\n')}</div>
</main>` + footer);

// ---- World map (Leaflet) ----
fs.writeFileSync(path.join(DIST, 'map.html'), head('Map — Watch This Cam', 'Every cam on a world map.', null, '/map.html') + header + `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<main class="wrap">
<div class="section-head"><h2>Cams around the world</h2><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a></div>
<div id="map"></div>
<p style="color:var(--muted);font-size:13px;margin-top:10px">🌙 The shaded area is where it's night right now. Bright pins sit on the camera itself. Faded pins are only placed in the right city or country.</p>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script src="/meta.js"></script>
<script>
var map=L.map('map',{worldCopyJump:true,scrollWheelZoom:true,preferCanvas:true}).setView([25,5],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',subdomains:'abc',maxZoom:13,minZoom:1}).addTo(map);
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
 var ex=m.x===1;var mk=L.circleMarker([m.la,m.ln],{radius:ex?6:5,weight:ex?2:1,color:'#2f80ed',opacity:ex?1:.55,fillColor:m.snap?'#f5b301':'#5aa2ff',fillOpacity:ex?.9:.4});
 mk.bindPopup('<a href="/cam/'+m.i+'.html" style="font:600 14px/1.3 system-ui;color:#0b6bcb;text-decoration:none">'+m.n+'</a><br><span style="color:#888;font:13px system-ui">'+m.co+' · '+m.catL+'</span>');
 mk.on('mouseover',function(){this.openPopup();});
 mk.addTo(map);
});
</script>` + footer);

// ---- The Wall ----
fs.writeFileSync(path.join(DIST, 'wall.html'), head('The Wall — Watch This Cam', 'A grid of live cams, all playing at once.', null, '/wall.html') + header + `
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

// ---- Location & category landing pages (SEO hubs) ----
fs.mkdirSync(path.join(DIST, 'place'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'kind'), { recursive: true });
const CAT_PAGE = {
  city: 'City Street Cams', beach: 'Beach Cams', surf: 'Surf Cams', harbour: 'Harbour & Port Cams',
  transport: 'Airport & Train Cams', traffic: 'Road & Traffic Cams', wildlife: 'Animal & Wildlife Cams',
  nature: 'Nature Cams', mountain: 'Mountain Cams', ski: 'Mountain & Snow Cams', volcano: 'Volcano Cams',
  weather: 'Weather & Sky Cams', landmark: 'Landmark Cams', bar: 'Bar & Nightlife Cams', space: 'Space Cams', other: 'Webcams',
};
// Every hub links to every other hub: the internal-link backbone that helps Google crawl + rank.
const placesNav = hubCountries.map(co => `<a href="/place/${countrySlug[co]}.html">${esc(countryName[co])}<span class="n">${nByCountry[co]}</span></a>`).join('');
const kindsNav = hubCats.map(k => `<a href="/kind/${k}.html">${esc(CATS[k])}<span class="n">${nByCat[k]}</span></a>`).join('');
const citiesNav = hubCities.map(d => `<a href="/city/${d.slug}.html">${esc(d.name)}<span class="n">${cityCams[d.slug].length}</span></a>`).join('');
const statesNav = hubStates.map(st => `<a href="/state/${slugify(st)}.html">${esc(st)}<span class="n">${stateCams[st].length}</span></a>`).join('');
const themesNav = hubThemes.map(t => `<a href="/theme/${t.slug}.html">${esc(t.name)}<span class="n">${themeCams[t.slug].length}</span></a>`).join('');
const hubFooter = `<section class="hubnav">
<div class="section-head"><h2>Live cams by city</h2></div><nav class="linkrow">${citiesNav}</nav>
<div class="section-head"><h2>Live cams by place</h2></div><nav class="linkrow">${placesNav}</nav>
<div class="section-head"><h2>Live cams by kind</h2></div><nav class="linkrow">${kindsNav}</nav>
${themesNav ? `<div class="section-head"><h2>Live cams by theme</h2></div><nav class="linkrow">${themesNav}</nav>` : ''}
${statesNav ? `<div class="section-head"><h2>Live cams by US state</h2></div><nav class="linkrow">${statesNav}</nav>` : ''}
</section>`;
const hubUrls = [];
const livecount = l => l.filter(c => !(c.type === 'image' && !c.isMjpeg)).length;

// Country pages
for (const co of hubCountries) {
  const list = cams.filter(c => c.country === co), name = countryName[co], p = `/place/${countrySlug[co]}.html`;
  hubUrls.push(p);
  const byCat = {}; list.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1);
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => CATS[k].toLowerCase());
  const live = livecount(list);
  const title = `${name} Live Webcams — watch ${list.length} cameras now`;
  const desc = `Watch ${list.length} live webcams in ${name} right now${topCats.length ? ` — ${topCats.slice(0, 3).join(', ')} and more` : ''}. Free, streaming 24/7 on Watch This Cam.`;
  const intro = `${list.length} live ${list.length === 1 ? 'camera' : 'cameras'} streaming from ${name} right now${topCats.length ? ` — ${topCats.join(', ')}` : ''}.${live ? ` ${live} of them are live video.` : ''} Pick one to watch, or hit Surprise me to shuffle through them.`;
  const shown = list.slice(0, 160);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Live webcams in ${name}`, description: desc, url: SITE_URL + cleanPath(p), isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Browse', item: SITE_URL + '/browse' },
      { '@type': 'ListItem', position: 3, name }] },
  ];
  fs.writeFileSync(path.join(DIST, 'place', countrySlug[co] + '.html'), head(title, desc, thumb(list[0]), p, ld) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › <a href="/browse.html">Browse</a> › ${esc(name)}</nav>
<div class="hubhead"><h1>Live webcams in ${esc(name)}</h1><p>${esc(intro)}</p>
<div class="actions"><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a><a class="btn ghost" href="/map.html">See on the map</a></div></div>
<div class="grid">${shown.map(card).join('')}</div>
${list.length > shown.length ? `<p class="muted-h" style="margin:16px 0"><a href="/browse.html">See all ${list.length} cams →</a></p>` : ''}
${hubFooter}
</main>` + footer);
}

// Category pages
for (const k of hubCats) {
  const list = cams.filter(c => c.category === k), label = CAT_PAGE[k] || CATS[k], p = `/kind/${k}.html`;
  hubUrls.push(p);
  const countries = [...new Set(list.map(c => c.countryLabel).filter(Boolean))];
  const live = livecount(list), lc = label.toLowerCase();
  const title = `Live ${label} — watch ${list.length} now | Watch This Cam`;
  const desc = `Watch ${list.length} live ${lc} from ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}, streaming free right now on Watch This Cam.`;
  const intro = `${list.length} live ${lc} from ${countries.length} ${countries.length === 1 ? 'country' : 'countries'} around the world${live ? `, ${live} of them live video` : ''}. Watching is free — pick one, or hit Surprise me to shuffle.`;
  const shown = list.slice(0, 160);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Live ${lc}`, description: desc, url: SITE_URL + cleanPath(p), isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Browse', item: SITE_URL + '/browse' },
      { '@type': 'ListItem', position: 3, name: label }] },
  ];
  fs.writeFileSync(path.join(DIST, 'kind', k + '.html'), head(title, desc, thumb(list[0]), p, ld) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › <a href="/browse.html">Browse</a> › ${esc(label)}</nav>
<div class="hubhead"><h1>Live ${esc(lc)}</h1><p>${esc(intro)}</p>
<div class="actions"><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a><a class="btn ghost" href="/browse.html#${k}">Filter in Browse</a></div></div>
<div class="grid">${shown.map(card).join('')}</div>
${list.length > shown.length ? `<p class="muted-h" style="margin:16px 0"><a href="/browse.html#${k}">See all ${list.length} →</a></p>` : ''}
${hubFooter}
</main>` + footer);
}

// City pages (the biggest webcam-search queries)
fs.mkdirSync(path.join(DIST, 'city'), { recursive: true });
for (const d of hubCities) {
  const list = cityCams[d.slug], name = d.name, p = `/city/${d.slug}.html`;
  hubUrls.push(p);
  const byCat = {}; list.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1);
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => CATS[k].toLowerCase());
  const live = livecount(list), country = countryName[d.cc] || '';
  const title = `${name} Live Webcams — watch ${list.length} cameras now`;
  const desc = `Watch ${list.length} live webcams in ${name}${country ? ', ' + country : ''} right now${topCats.length ? ` — ${topCats.join(', ')}` : ''}. Free, 24/7, on Watch This Cam.`;
  const intro = `${list.length} live ${list.length === 1 ? 'camera' : 'cameras'} streaming from ${name}${country ? ', ' + country : ''} right now${topCats.length ? ` — ${topCats.join(', ')}` : ''}.${live ? ` ${live} of them are live video.` : ''} Pick one, or hit Surprise me to shuffle.`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Live webcams in ${name}`, description: desc, url: SITE_URL + cleanPath(p), isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: country || 'Browse', item: (country && countrySlug[d.cc]) ? SITE_URL + '/place/' + countrySlug[d.cc] : SITE_URL + '/browse' },
      { '@type': 'ListItem', position: 3, name }] },
  ];
  fs.writeFileSync(path.join(DIST, 'city', d.slug + '.html'), head(title, desc, thumb(list[0]), p, ld) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › ${(country && countrySlug[d.cc]) ? `<a href="/place/${countrySlug[d.cc]}.html">${esc(country)}</a>` : `<a href="/browse.html">Browse</a>`} › ${esc(name)}</nav>
<div class="hubhead"><h1>Live webcams in ${esc(name)}</h1><p>${esc(intro)}</p>
<div class="actions"><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a><a class="btn ghost" href="/map.html">See on the map</a></div></div>
<div class="grid">${list.map(card).join('')}</div>
${hubFooter}
</main>` + footer);
}

// ---- US state pages + theme pages ----
const videoFirst = l => l.slice().sort((a, b) => (isPhoto(a) ? 1 : 0) - (isPhoto(b) ? 1 : 0));
function writeHub({ dir, slug, title, desc, h1, intro, list, crumbsHtml, crumbLd, after }) {
  const p = `/${dir}/${slug}.html`; hubUrls.push(p);
  const shown = list.slice(0, 160);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, description: desc, url: SITE_URL + cleanPath(p), isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbLd.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], ...(x[1] ? { item: SITE_URL + x[1] } : {}) })) },
  ];
  fs.writeFileSync(path.join(DIST, dir, slug + '.html'), head(title, desc, bigThumb(list.find(c => isYT(c)) || list[0]), p, ld) + header + `
<main class="wrap">
<nav class="crumbs">${crumbsHtml}</nav>
<div class="hubhead"><h1>${esc(h1)}</h1><p>${esc(intro)}</p>
<div class="actions"><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a><a class="btn ghost" href="/map.html">See on the map</a></div></div>
<div class="grid">${shown.map(card).join('')}</div>
${list.length > shown.length ? `<p class="muted-h" style="margin:16px 0"><a href="/browse.html">See all ${list.length} cams →</a></p>` : ''}
${after || ''}
${hubFooter}
</main>` + footer);
}
fs.mkdirSync(path.join(DIST, 'state'), { recursive: true });
for (const st of hubStates) {
  const list = videoFirst(stateCams[st]), live = livecount(list);
  const byCat = {}; list.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1);
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => CATS[k].toLowerCase());
  const trip = tripLinks(st, ['state:' + slugify(st)]);
  writeHub({ dir: 'state', slug: slugify(st), list,
    title: `${st} Live Webcams — watch ${list.length} cameras now`,
    desc: `Watch ${list.length} live webcams in ${st}, USA right now${topCats.length ? ` — ${topCats.join(', ')}` : ''}. Free, 24/7, on Watch This Cam.`,
    h1: `Live webcams in ${st}`,
    intro: `${list.length} live ${list.length === 1 ? 'camera' : 'cameras'} streaming from ${st} right now${topCats.length ? ` — ${topCats.join(', ')}` : ''}.${live ? ` ${live} of them are live video.` : ''} Pick one, or hit Surprise me to shuffle.`,
    crumbsHtml: `<a href="/">Home</a> › ${countrySlug.US ? `<a href="/place/${countrySlug.US}.html">USA</a>` : 'USA'} › ${esc(st)}`,
    crumbLd: [['Home', '/'], ['USA', countrySlug.US ? '/place/' + countrySlug.US : '/browse'], [st]],
    after: trip ? `<div class="section-head"><h2>Plan a trip to ${esc(st)}</h2></div><div class="triprow">${trip}</div>` : '' });
}
const THEME_COPY = {
  'airports': ['Live Airport Webcams', 'Runways, aprons and aircraft on approach'],
  'lighthouses': ['Live Lighthouse Webcams', 'Lighthouses and the coast around them'],
  'ports-and-ships': ['Live Port & Ship Webcams', 'Harbours, ferries, marinas and cruise ports'],
  'railways': ['Live Railway Webcams', 'Stations, junctions and trains passing through'],
  'lakes-and-rivers': ['Live Lake & River Webcams', 'Lakes, rivers, lochs and fjords'],
  'zoos-and-aquariums': ['Live Zoo & Aquarium Webcams', 'Zoos, aquariums and sanctuaries'],
  'birds': ['Live Bird Cams', 'Nests, feeders and birds of prey'],
  'underwater': ['Live Underwater Webcams', 'Reefs, springs and tanks, seen from below the surface'],
  'northern-lights': ['Northern Lights Webcams', 'Cameras pointed at the aurora'],
  'bridges': ['Live Bridge Webcams', 'Famous bridges and the traffic over them'],
  'waterfalls': ['Live Waterfall Webcams', 'Waterfalls, big and small'],
  'national-parks': ['Live National Park Webcams', 'Views from inside national parks'],
  'universities': ['Live University Webcams', 'Campus views'],
  'glaciers': ['Live Glacier Webcams', 'Glaciers and the mountains around them'],
  'squares-and-markets': ['Live Town Square Webcams', 'Town squares, plazas and markets'],
  'piers-and-boardwalks': ['Live Pier & Boardwalk Webcams', 'Piers, promenades and boardwalks'],
  'castles': ['Live Castle Webcams', 'Castles and the towns below them'],
};
fs.mkdirSync(path.join(DIST, 'theme'), { recursive: true });
for (const t of hubThemes) {
  const list = videoFirst(themeCams[t.slug]), live = livecount(list), [pageName, what] = THEME_COPY[t.slug] || [`Live ${t.name} Webcams`, t.name];
  const countries = [...new Set(list.map(c => c.countryLabel).filter(Boolean))];
  writeHub({ dir: 'theme', slug: t.slug, list,
    title: `${pageName} — watch ${list.length} now | Watch This Cam`,
    desc: `${what}: ${list.length} live cameras from ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}, free to watch right now on Watch This Cam.`,
    h1: pageName,
    intro: `${what}. ${list.length} live cameras from ${countries.length} ${countries.length === 1 ? 'country' : 'countries'}${live ? `, ${live} of them live video` : ''}. Pick one, or hit Surprise me to shuffle.`,
    crumbsHtml: `<a href="/">Home</a> › <a href="/browse.html">Browse</a> › ${esc(t.name)}`,
    crumbLd: [['Home', '/'], ['Browse', '/browse'], [t.name]] });
}

// ---- "Right now" pages: live data laid over the cams ----
fs.mkdirSync(path.join(DIST, 'live'), { recursive: true });
// One checked spot per patch of the world (about 1 degree square, wider if that is too many), best cam first.
const nowPts = (() => {
  const rank = c => (isPhoto(c) ? 1 : 0) + (c.category === 'traffic' ? 2 : 0);
  const src = cams.filter(c => c.loc === 'exact' || c.loc === 'city').sort((a, b) => rank(a) - rank(b));
  for (const grid of [1, 2, 3, 5]) {
    const seen = new Set(), out = [];
    for (const c of src) { const k = Math.round(c.mla / grid) + ':' + Math.round(c.mln / grid); if (seen.has(k)) continue; seen.add(k); out.push([c.id, c.name, c.place, thumb(c), c.mla, c.mln]); }
    if (out.length <= 240 || grid === 5) return out.slice(0, 240);
  }
})();
fs.writeFileSync(path.join(DIST, 'nowpts.js'), 'window.NOWPTS=' + JSON.stringify(nowPts) + ';');
const LIVE_PAGES = [
  { slug: 'warmest', mode: 'warm', nav: 'Warmest cams right now', sub: 'Who has the sunshine', title: 'The warmest live cams in the world right now', metaTitle: 'Warmest places right now — live webcams | Watch This Cam',
    desc: 'The warmest live webcam locations in the world right now, ranked by the current temperature. Click through and see the heat for yourself.',
    intro: 'Where is it hot right now? We check the temperature at our camera locations around the world and rank them, warmest first. Click any one to watch it live.' },
  { slug: 'coldest', mode: 'cold', nav: 'Coldest cams right now', sub: 'Who is freezing', title: 'The coldest live cams in the world right now', metaTitle: 'Coldest places right now — live webcams | Watch This Cam',
    desc: 'The coldest live webcam locations in the world right now, ranked by the current temperature. Click through and watch the snow and ice live.',
    intro: 'Where is it properly cold right now? We check the temperature at our camera locations around the world and rank them, coldest first. Click any one to watch it live.' },
];
const liveNav = cur => `<nav class="linkrow" style="margin:0 0 18px">${[...LIVE_PAGES.map(l => [l.slug, l.nav]), ['northern-lights', 'Northern lights tonight'], ['earthquakes', 'Earthquakes this week']].filter(x => x[0] !== cur).map(x => `<a href="/live/${x[0]}.html">${x[1]}</a>`).join('')}<a href="/new.html">Newest cams</a></nav>`;
const liveLd = (title, desc, p) => [
  { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description: desc, url: SITE_URL + cleanPath(p), isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }, { '@type': 'ListItem', position: 2, name: 'Right now', item: SITE_URL + '/live/' }, { '@type': 'ListItem', position: 3, name: title }] }];
const bodyLive = (html, mode) => html.replace('<body>', `<body data-live="${mode}">`);
const liveUrls = [];
for (const l of LIVE_PAGES) {
  const p = `/live/${l.slug}.html`; liveUrls.push(p);
  fs.writeFileSync(path.join(DIST, 'live', l.slug + '.html'), bodyLive(head(l.metaTitle, l.desc, null, p, liveLd(l.title, l.desc, p)), l.mode) + header + `
<main class="wrap article">
<nav class="crumbs"><a href="/">Home</a> › <a href="/live/">Right now</a> › ${esc(l.nav)}</nav>
<div class="hubhead"><h1>${esc(l.title)}</h1><p class="lede">${esc(l.intro)}</p></div>
<div class="bignum"><b id="big">…</b><span id="bigtxt">Checking the temperature at ${nowPts.length} camera locations…</span></div>
<div class="rank" id="rank"></div>
<p class="note"><span id="stamp"></span> We check one camera location in each part of the world we cover (${nowPts.length} in all), so this is the ${l.mode === 'warm' ? 'warmest' : 'coldest'} of our cams, not of every place on earth. <a href="https://open-meteo.com/" target="_blank" rel="noopener">Weather data by Open-Meteo.com</a>.</p>
${liveNav(l.slug)}
</main>
<script src="/nowpts.js"></script><script src="/live.js"></script>` + footer);
}
// Northern lights: NOAA's Kp index + the cams far enough north to see them.
{
  const p = '/live/northern-lights.html'; liveUrls.push(p);
  const zone = cams.filter(c => ((c.loc === 'exact' || c.loc === 'city') && c.mla >= 62) || c.themes.includes('northern-lights'))
    .filter(c => c.category !== 'traffic' && c.mla != null).sort((a, b) => (isPhoto(a) ? 1 : 0) - (isPhoto(b) ? 1 : 0)).slice(0, 60);
  const title = 'Northern lights tonight: the aurora forecast and live cams', desc = 'Will the northern lights show tonight? The live Kp index and three-day aurora forecast from NOAA, plus live cams from inside the aurora zone and which of them are in the dark right now.';
  fs.writeFileSync(path.join(DIST, 'live', 'northern-lights.html'), bodyLive(head('Northern lights tonight — live aurora forecast and cams | Watch This Cam', desc, null, p, liveLd(title, desc, p)), 'aurora') + header + `
<main class="wrap article">
<nav class="crumbs"><a href="/">Home</a> › <a href="/live/">Right now</a> › Northern lights tonight</nav>
<div class="hubhead"><h1>Northern lights tonight</h1><p class="lede">Two things decide whether you see the aurora: how active the sun is, and whether it is dark and clear where the camera is. This page shows the first, live from NOAA, and tells you which of our northern cams are in the dark right now.</p></div>
<div class="bignum"><b id="big">…</b><span id="bigtxt">Asking NOAA for the latest reading…</span></div>
<div id="kpwrap" hidden><h2 class="subhead">The next few days</h2><div class="kpdays" id="kpdays"></div>
<p class="note">The highest Kp that NOAA predicts for each day. Kp runs from 0 to 9. From Kp 5 it counts as a geomagnetic storm.</p></div>
<h2 class="subhead">Live cams in the aurora zone</h2>
<div class="rank" id="rank">${zone.map((c, i) => `<a class="rankrow" href="/cam/${c.id}.html" data-la="${c.loc === 'country' ? GEO[c.country].lat : c.mla}" data-ln="${c.loc === 'country' ? GEO[c.country].lng : c.mln}"><span class="rk">${i + 1}</span><img loading="lazy" src="${esc(thumb(c))}" alt="" onerror="this.style.visibility='hidden'"><span class="nm"><b>${esc(c.name)}</b><i>${esc(c.place)}</i></span><span class="val"></span></a>`).join('')}</div>
<p class="note">${zone.length} cams at 62° north or higher, or pointed at the aurora on purpose. The ones in the dark right now are listed first. A dark sky still needs to be a clear one.</p>
<h2 class="subhead">Where the aurora is right now</h2>
<img class="auroraimg" loading="lazy" src="https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg" alt="NOAA map of where the northern lights are forecast in the next half hour">
<p class="note">NOAA's 30-minute aurora forecast for the northern half of the world. Kp index, forecast and map: <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener">NOAA Space Weather Prediction Center</a>. See also our guide to <a href="/guide/northern-lights-live-cams.html">watching the northern lights live</a>.</p>
${liveNav('northern-lights')}
</main>
<script src="/live.js"></script>` + footer);
}
// Earthquakes: USGS feed on a map, each with its nearest cam.
{
  const p = '/live/earthquakes.html'; liveUrls.push(p);
  const title = 'Live earthquake map: this week’s quakes and the nearest cams', desc = 'Every earthquake of magnitude 4.5 or more in the past 7 days on a live map, from the US Geological Survey, with the nearest live webcam to each one.';
  fs.writeFileSync(path.join(DIST, 'live', 'earthquakes.html'), bodyLive(head('Live earthquake map — recent quakes and the nearest webcams | Watch This Cam', desc, null, p, liveLd(title, desc, p)), 'quakes') + header + `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
<main class="wrap article">
<nav class="crumbs"><a href="/">Home</a> › <a href="/live/">Right now</a> › Earthquakes this week</nav>
<div class="hubhead"><h1>Earthquakes this week, live</h1><p class="lede">Every earthquake of magnitude 4.5 or more in the past seven days, straight from the US Geological Survey. Where one of our cameras is within 400 km, we link it, so you can look at the place itself.</p></div>
<div class="bignum"><b id="big">…</b><span id="bigtxt">Loading the latest from the US Geological Survey…</span></div>
<div id="bigmap"></div>
<div class="rank" id="rank"></div>
<p class="note">Earthquake data: <a href="https://earthquake.usgs.gov/earthquakes/map/" target="_blank" rel="noopener">US Geological Survey</a>, updated every few minutes. The number on the right is the magnitude. A nearby cam is not a promise that it shows any damage, or that it is still online.</p>
${liveNav('earthquakes')}
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script src="/meta.js"></script><script src="/live.js"></script>` + footer);
}
// Newest cams: by the day each first appeared on the site (research/added.json, kept by merge.js).
const ADDED = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'research', 'added.json'))); } catch (e) { return {}; } })();
const ADDED_START = '2026-10-26';
const newest = cams.filter(c => ADDED[c.id] && ADDED[c.id] > ADDED_START).sort((a, b) => ADDED[b.id].localeCompare(ADDED[a.id]) || (isPhoto(a) ? 1 : 0) - (isPhoto(b) ? 1 : 0));
{
  const byDay = {}; newest.slice(0, 240).forEach(c => (byDay[ADDED[c.id]] = byDay[ADDED[c.id]] || []).push(c));
  const fmtDay = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const desc = newest.length ? `The newest live webcams on Watch This Cam: ${newest.length} cameras added since launch, latest first.` : 'The newest live webcams added to Watch This Cam.';
  fs.writeFileSync(path.join(DIST, 'new.html'), head('Newest live cams — just added | Watch This Cam', desc, newest[0] ? bigThumb(newest.find(c => isYT(c)) || newest[0]) : null, '/new.html', liveLd('Newest live cams', desc, '/new.html')) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › Newest cams</nav>
<div class="hubhead"><h1>Newest live cams</h1><p>${newest.length ? `${newest.length} cameras added since we relaunched, latest first.` : 'Nothing new since launch yet. Check back soon.'}</p></div>
${Object.keys(byDay).sort().reverse().map(d => `<div class="section-head"><h2>Added ${fmtDay(d)} <span class="muted-h">${byDay[d].length}${newest.filter(c => ADDED[c.id] === d).length > byDay[d].length ? ' of ' + newest.filter(c => ADDED[c.id] === d).length : ''} cams</span></h2></div>
<div class="grid">${byDay[d].map(card).join('')}</div>`).join('\n')}
${hubFooter}
</main>` + footer);
}
// "Right now" index
fs.writeFileSync(path.join(DIST, 'live', 'index.html'), head('Right now — live weather, aurora and earthquakes over the cams | Watch This Cam', 'What is happening right now where the cameras are: the warmest and coldest cams, tonight’s northern lights forecast and this week’s earthquakes.', null, '/live/', liveLd('Right now', 'Live data laid over the cams.', '/live/')) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › Right now</nav>
<div class="hubhead"><h1>Right now</h1><p>What is happening this minute where the cameras are.</p></div>
<div class="guidegrid">
${LIVE_PAGES.map(l => `<a class="guidecard" href="/live/${l.slug}.html"><b>${esc(l.nav)}</b><span>${esc(l.sub)}</span></a>`).join('\n')}
<a class="guidecard" href="/live/northern-lights.html"><b>Northern lights tonight</b><span>NOAA forecast + cams in the dark</span></a>
<a class="guidecard" href="/live/earthquakes.html"><b>Earthquakes this week</b><span>Live map + the nearest cams</span></a>
<a class="guidecard" href="/new.html"><b>Newest cams</b><span>${newest.length ? newest.length + ' added since launch' : 'Just added'}</span></a>
</div>
</main>` + footer);

// ---- Free embed widget: pick a cam, copy the code ----
fs.writeFileSync(path.join(DIST, 'widget.html'), head('Free live webcam for your website — embed any cam | Watch This Cam', `Add a live webcam to your website or blog for free. Pick any of ${cams.length} cams, copy one line of code, done. No account needed.`, null, '/widget.html', liveLd('Free live webcam widget', 'Embed any Watch This Cam camera on your own site.', '/widget.html')) + header + `
<main class="wrap"><div class="page" style="max-width:820px">
<h1>A free live webcam for your website</h1>
<p>Running a hotel, a surf school, a town website or a blog? You can put any camera from Watch This Cam on your own page. It is free, there is no account, and it keeps working as long as the camera does.</p>
<p><b>1. Find the cam.</b> Type a place or a kind of camera.</p>
<input class="search" id="wq" type="search" placeholder="Search ${cams.length} cams…" style="max-width:100%;width:100%">
<div id="wres" class="rank" style="margin-top:10px"></div>
<div id="wout" hidden>
<p><b>2. Copy the code</b> and paste it into your page.</p>
<textarea class="codebox" id="wcode" readonly rows="4" spellcheck="false"></textarea>
<button class="btn" id="wcopy">Copy code</button>
<p style="margin-top:22px"><b>Preview</b></p>
<div id="wprev"></div>
</div>
<p class="credit" style="margin-top:26px">The code includes a small credit link back to the camera's page here. Please leave it in. The cameras belong to their operators, and every embed names the operator.</p>
</div></main>
<script src="/cams.js"></script>
<script>
(function(){var q=document.getElementById('wq'),res=document.getElementById('wres'),out=document.getElementById('wout'),code=document.getElementById('wcode'),prev=document.getElementById('wprev'),cp=document.getElementById('wcopy');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function pick(c){var src='${SITE_URL}/embed/'+c.id;
 code.value='<iframe src="'+src+'" style="width:100%;aspect-ratio:16/9.7;border:0" loading="lazy" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="'+esc(c.n)+'"></iframe>\\n<p style="font-size:13px"><a href="${SITE_URL}/cam/'+c.id+'">'+esc(c.n)+'</a> on <a href="${SITE_URL}/">Watch This Cam</a></p>';
 prev.innerHTML='<iframe src="/embed/'+c.id+'.html" style="width:100%;aspect-ratio:16/9.7;border:0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
 out.hidden=false;res.innerHTML='';q.value=c.n;}
function search(){var t=q.value.trim().toLowerCase();if(t.length<2){res.innerHTML='';return;}
 var l=CAMS.filter(function(c){return (c.n+' '+c.co+' '+c.catL).toLowerCase().indexOf(t)>=0;}).slice(0,8);
 res.innerHTML=l.map(function(c,i){return '<a class="rankrow" href="#" data-i="'+c.id+'"><span class="rk">'+(i+1)+'</span><img loading="lazy" src="'+esc(c.t)+'" alt="" onerror="this.style.visibility=\\'hidden\\'"><span class="nm"><b>'+esc(c.n)+'</b><i>'+esc([c.co,c.catL].filter(Boolean).join(' · '))+'</i></span><span class="val" style="font-size:14px;font-weight:600">Use this</span></a>';}).join('')||'<p class="note">No cams match that.</p>';}
q.oninput=search;
res.onclick=function(e){var a=e.target.closest('a[data-i]');if(!a)return;e.preventDefault();var c=CAMS.filter(function(x){return x.id===a.dataset.i;})[0];if(c)pick(c);};
cp.onclick=function(){code.select();function ok(){cp.textContent='✓ Copied';setTimeout(function(){cp.textContent='Copy code';},1600);}
 if(navigator.clipboard)navigator.clipboard.writeText(code.value).then(ok,function(){document.execCommand('copy');ok();});else{document.execCommand('copy');ok();}};
var h=decodeURIComponent(location.hash.slice(1));if(h){var c=CAMS.filter(function(x){return x.id===h;})[0];if(c)pick(c);}
})();
</script>` + footer);

// ---- Guides / articles (editorial, every pick grounded in a real cam) ----
fs.mkdirSync(path.join(DIST, 'guide'), { recursive: true });
const pickCam = (m, cat, country) => { const ok = c => m.test(c.name || '') && (!cat || c.category === cat) && (!country || c.country === country); return cams.find(c => ok(c) && !isPhoto(c)) || cams.find(ok); };
const ARTICLES = [
  {
    slug: 'ireland-live-cams', title: 'Watch Ireland live — a little bit of home',
    metaTitle: 'Live cams of Ireland — watch home right now | Watch This Cam',
    desc: 'Live webcams from all over Ireland — the Forty Foot, Howth Harbour, Cobh, Lahinch and the Wild Atlantic Way. A window home, wherever you are in the world.',
    lede: 'If home feels a long way off tonight, here’s the next best thing — cameras pointed at Ireland right now. The Forty Foot at first light, boats in Howth Harbour, a Dublin street in the rain. No ads, no edit, just home, live. Put the kettle on.',
    picks: [
      { m: /sandycove|forty foot/i, country: 'IE', why: 'The Forty Foot at Sandycove — the famous sea-swimming spot on Dublin Bay. Watch the brave ones take the plunge, Christmas morning or any morning.' },
      { m: /howth harbour|howth/i, country: 'IE', cat: 'harbour', why: 'Howth Harbour, boats rocking on the edge of Dublin Bay. You can nearly smell the chipper from here.' },
      { m: /cobh/i, country: 'IE', why: 'Cobh in Cork Harbour — the Titanic’s last port of call, and the port so many emigrants sailed from. A poignant one if you left from here yourself.' },
      { m: /rathmines/i, country: 'IE', why: 'Live over the Rathmines rooftops — the great green dome of the church against that unmistakable grey Dublin sky. As home as it gets.' },
      { m: /collins avenue|cabra/i, country: 'IE', why: 'A Dublin street getting on with its day — buses, brollies and all. Nothing much happening, and somehow you still can’t look away. Pure home.' },
      { m: /lahinch/i, country: 'IE', why: 'Lahinch in County Clare — Atlantic rollers and surfers in the cold. The Wild Atlantic Way doing its thing, live.' },
      { m: /strandhill/i, country: 'IE', why: 'Strandhill in Sligo — big western skies and bigger waves, the Atlantic right in your face.' },
      { m: /derrynane|caherdaniel|kenmare/i, country: 'IE', why: 'Kerry, out on the Wild Atlantic Way near Derrynane. The kind of view that quietly has you checking flights.' },
      { m: /dun laoghaire east pier|east pier/i, country: 'IE', why: 'The East Pier at Dún Laoghaire — the great Sunday-walk pier. Ninety-nine optional.' },
      { m: /portrush/i, country: 'IE', why: 'Portrush up on the Causeway Coast in Antrim — surf and sea air on the north coast.' },
      { m: /\bgpo\b/i, country: 'IE', why: 'O’Connell Street by the GPO — the beating heart of Dublin, and of 1916. The city rolling past the pillars.' },
    ],
  },
  {
    slug: 'wildest-live-cams', title: 'Live cams you won’t believe exist',
    metaTitle: 'The wildest live cams on the internet | Watch This Cam',
    desc: 'The most unbelievable live cameras online — an erupting volcano, an underwater reef, an octopus tank, manatees, a Kenyan safari waterhole and the northern lights. All real, all live.',
    lede: 'Some of these you have to see to believe. Every one is a real, public, live camera — nothing hacked, nothing dodgy — just the weird and wonderful corners of the world that almost nobody knows are being streamed right now.',
    picks: [
      { m: /mayon/i, why: 'An actively erupting volcano in the Philippines. Not a loop, not old footage — the real thing, and it glows after dark.' },
      { m: /ol donyo/i, why: 'A waterhole at a lodge in Kenya. Elephants, giraffes and whoever else wanders down to drink — and it comes alive after dark.' },
      { m: /utopia village|deep ocean|open sea/i, why: 'A camera bolted to a reef wall in the Caribbean, streaming the fish traffic out in the blue. You’ll lose ten minutes easy.' },
      { m: /octopus/i, why: 'A live octopus in a tank at an Oregon science centre. Watch it hunt, sulk, or quietly rearrange its furniture.' },
      { m: /manatee/i, why: 'Underwater with the manatees at a Florida spring — gentle giants drifting right past the lens.' },
      { m: /toba.*otter|sea otter/i, cat: 'wildlife', why: 'Sea otters, paws and all. Exactly as good as that sounds.' },
      { m: /riffles|katmai|brooks falls/i, why: 'Brown-bear country in Alaska. In salmon season they line up at the falls to catch fish mid-leap.' },
      { m: /lyngen|tromso|aurora|northern light/i, why: 'Aimed at the Arctic sky in northern Norway. When the aurora is out, there is no better seat in the house.' },
      { m: /penguin/i, why: 'A whole colony of penguins — waddling, swimming and squabbling — live.' },
      { m: /\bshark\b/i, cat: 'wildlife', why: 'A tank full of sharks gliding past on a slow loop. Somehow more relaxing than it has any right to be.' },
      { m: /fruit feeder/i, why: 'A fruit feeder deep in a Panama cloud forest — toucans, tanagers and hummingbirds dropping in all day.' },
      { m: /cura.?ao/i, cat: 'wildlife', why: 'A Caribbean sea aquarium off Curaçao, reef fish drifting past the glass.' },
    ],
  },
  {
    slug: 'best-live-cams', title: 'The best live cams in the world right now',
    metaTitle: 'The best live cams in the world right now | Watch This Cam',
    desc: 'A hand-picked tour of the most watchable live cameras on the planet — an erupting volcano, the world’s busiest crossing, the northern lights and more. All free.',
    lede: 'Thousands of cameras stream the world live, around the clock. These are the ones worth dropping everything for — a mix of the jaw-dropping, the beautiful and the quietly hypnotic. Every one is free and live right now.',
    picks: [
      { m: /shibuya/i, cat: 'city', why: 'The busiest pedestrian crossing on earth. Hundreds surge across at every light change, neon reflecting off the wet tarmac. It never stops being mesmerising.' },
      { m: /etna/i, cat: 'volcano', why: 'Europe’s most active volcano, live from Sicily. On a quiet day you’ll catch it steaming; on a louder one, glowing.' },
      { m: /mt\.?\s*fuji|mount fuji/i, cat: 'city', why: 'Japan’s snow-capped cone above the rooftops. Worth catching at dawn, when the peak turns pink before the city wakes.' },
      { m: /maho beach/i, why: 'Jets on the Caribbean’s shortest approach come in just metres over the sunbathers’ heads. You’ll flinch every single time.' },
      { m: /rolling venice|venice/i, cat: 'city', country: 'IT', why: 'Gondolas and water-taxis drifting along the canal, no crowds to shoulder through. The next best thing to standing on the bridge.' },
      { m: /tromso|troms|lyngen/i, why: 'Deep in the Norwegian aurora zone. When the sky is clear and the lights are out, this is a front-row seat to the northern lights.' },
      { m: /kilauea/i, why: 'A live USGS feed into the caldera of an active Hawaiian volcano. Quiet for now tends not to stay that way.' },
      { m: /bald eagle/i, cat: 'wildlife', why: 'A bald-eagle pair on the nest in California. Slow TV at its finest — and once the chicks arrive, you won’t look away.' },
      { m: /duval street|key west/i, cat: 'city', why: 'The end-of-the-road party street in the Florida Keys, where it always seems to be happy hour. Pure people-watching.' },
      { m: /coral city/i, why: 'A living coral reef streaming its fish traffic all day. Oddly calming — and you never know what will swim past next.' },
    ],
  },
  {
    slug: 'live-volcano-cams', title: 'Live volcano cams: watch an eruption right now',
    metaTitle: 'Live volcano cams — watch an eruption right now | Watch This Cam',
    desc: 'Watch active and erupting volcanoes live, from Etna and Kilauea to Mayon, Semeru and Fuego. Free 24/7 volcano webcams.',
    lede: 'Some of these are rumbling; a few are genuinely erupting as you read this. Live volcano cameras are the internet at its most humbling — nature doing its thing, no filter, no edit.',
    picks: [
      { m: /etna/i, cat: 'volcano', why: 'Mount Etna, Sicily — Europe’s most active volcano, almost always doing something. Steam, glow, and now and then a proper show.' },
      { m: /kilauea/i, why: 'Kilauea in Hawai’i, straight from the US Geological Survey. One of the most closely watched volcanoes on the planet.' },
      { m: /mayon/i, why: 'Mayon in the Philippines, famous for its near-perfect cone — and, when it stirs, for glowing lava at night.' },
      { m: /semeru/i, why: 'Semeru on Java, Indonesia — one of the country’s most restless peaks, often puffing ash high into the sky.' },
      { m: /fuego/i, why: 'Volcán de Fuego in Guatemala. “Fuego” means fire, and it earns the name with regular bursts.' },
    ],
  },
  {
    slug: 'northern-lights-live-cams', title: 'Watch the northern lights live',
    metaTitle: 'Watch the northern lights live — aurora webcams | Watch This Cam',
    desc: 'Live aurora cams from inside the northern-lights zone — Tromsø, Lyngen, the Arctic Circle and Swedish Lapland. Best after dark on a clear night.',
    lede: 'You can’t summon the aurora, but you can leave a camera pointed north and wait. These all sit inside the aurora zone — check back after dark, local time, when the sky is clear and the forecast is active.',
    picks: [
      { m: /tromso|troms/i, why: 'Tromsø, northern Norway — one of the best-placed cities on earth for catching the lights. Dark, clear winter nights are the ones.' },
      { m: /lyngen/i, why: 'The Lyngen area of Arctic Norway, away from town lights. When the aurora is out, the whole sky can ripple green.' },
      { m: /rovaniemi|arctic circle/i, why: 'Rovaniemi, right on the Arctic Circle in Finnish Lapland. Reindeer country — and prime aurora territory.' },
      { m: /porjus|kiruna/i, why: 'Swedish Lapland, deep in the north. Long polar nights mean plenty of chances when the forecast lines up.' },
    ],
  },
  {
    slug: 'best-beach-cams', title: 'The best beach cams for a hit of sunshine',
    metaTitle: 'The best live beach cams | Watch This Cam',
    desc: 'Live beach webcams from the Caribbean, Florida, California, Thailand and more — check the waves, the weather and the crowd before you go.',
    lede: 'Grey day where you are? Borrow some sunshine. These live beach cameras are good for checking the surf, the weather and the vibe — or just for a few minutes of waves and nothing else.',
    picks: [
      { m: /maho beach/i, why: 'Maho Beach, St Martin — the one where the planes land right over your head. Sunbathing with a jet-engine soundtrack.' },
      { m: /venice beach/i, why: 'Venice Beach, Los Angeles — skaters, street performers and the Pacific. California people-watching at its best.' },
      { m: /crystal bay|chaweng|lamai|samui/i, country: 'TH', why: 'A Thai island beach — palm trees, warm water and that unhurried pace. Instant armchair holiday.' },
      { m: /galveston seawall|galveston/i, why: 'The Galveston seawall in Texas — a proper slice of the Gulf Coast, waves rolling in all day.' },
      { m: /deerfield|manhattan beach|jacksonville beach/i, cat: 'surf', why: 'A Florida surf break — handy for a wave check, and easy watching when the sets roll through.' },
    ],
  },
  {
    slug: 'live-ski-resort-cams', title: 'Live ski-resort cams: who’s got snow right now',
    metaTitle: 'Live ski-resort webcams — check the snow | Watch This Cam',
    desc: 'Live mountain and ski-resort webcams — check the snow, the cloud and the conditions before you book or drive up. Alps, Rockies and more.',
    lede: 'The season’s turning. Before you book a trip or drive up the hill, these mountain cameras show you exactly what’s falling — fresh powder, low cloud or bluebird sky.',
    picks: [
      { m: /breckenridge/i, why: 'Breckenridge, Colorado — high in the Rockies, usually one of the first to open and the last to close.' },
      { m: /tahoe/i, why: 'Lake Tahoe on the California–Nevada line — big terrain and a famously deep snowpack when the storms line up.' },
      { m: /dolomit/i, why: 'The Italian Dolomites — pink-tinged limestone peaks and some of the most beautiful pistes in the Alps.' },
      { m: /österreich|osterreich|austria|tyrol|kitzb/i, cat: 'ski', why: 'The Austrian Alps — classic ski country, villages tucked under the peaks and reliable winter snow.' },
      { m: /zermatt|matterhorn/i, why: 'Zermatt, under the Matterhorn — one of the most recognisable mountains on earth, and skiing most of the year.' },
    ],
  },
  {
    slug: 'live-airport-cams', title: 'Live airport cams: watch planes land right now',
    metaTitle: 'Live airport webcams — watch planes land right now | Watch This Cam',
    desc: 'Live airport and plane-spotting webcams: Maho Beach, Los Angeles, LaGuardia, Las Vegas, Madeira, Prague and more. Watch take-offs and landings as they happen.',
    lede: 'Plane spotting without the cold fingers. These cameras look at runways and final approaches around the world, so there is nearly always something landing somewhere.',
    picks: [
      { m: /maho beach/i, why: 'Maho Beach on St Martin. The runway starts right behind the sand, so jets pass low over the beach on their way in.' },
      { m: /LAX Airport|runways 25L/i, why: 'Los Angeles International, pointed at the two southern runways, 25L and 25R.' },
      { m: /LaGuardia/i, why: 'LaGuardia in New York City, from Flightradar24’s airport cameras.' },
      { m: /LAS Vegas Airport/i, why: 'Harry Reid International in Las Vegas, with a view of runways 26R and 26L.' },
      { m: /Madeira Island Airport/i, why: 'Madeira’s airport, where part of the runway is built out over the sea on pillars. Pilots need special training to land here.' },
      { m: /Miami International Airport/i, why: 'Miami International Airport in Florida.' },
      { m: /Planespotting at Prague|Vaclav Havel/i, why: 'Václav Havel Airport in Prague, set up for plane spotters.' },
      { m: /New Chitose/i, why: 'New Chitose Airport on Hokkaido, in the north of Japan. Worth a look in winter, when the snow arrives.' },
      { m: /Montreal Trudeau/i, why: 'Montréal–Trudeau in Canada, looking at runway 24R.' },
      { m: /^Runway 23/i, country: 'AU', why: 'Adelaide Airport in South Australia, looking along runway 23.' },
      { m: /LANZAROTE AIRPORT/i, why: 'Lanzarote in the Canary Islands, where the holiday flights come in over the sea.' },
      { m: /Barbados Airport/i, why: 'Grantley Adams International in Barbados.' },
      { m: /Midway Airport/i, why: 'Midway Airport in Chicago.' },
    ],
  },
  {
    slug: 'live-train-cams', title: 'Live train cams: railcams worth leaving on',
    metaTitle: 'Live train cams — railcams from the USA, UK and beyond | Watch This Cam',
    desc: 'Live railcams from busy junctions and heritage lines: La Grange, Rochelle, Strasburg, Banbury, the West Somerset Railway, Amsterdam and Tokyo.',
    lede: 'A railcam is slow television at its best. Nothing happens, then a mile of freight rolls through. These are trained on busy junctions, big yards and a few lines that still run steam.',
    picks: [
      { m: /La Grange, Kentucky/i, why: 'La Grange, Kentucky, where freight trains run straight down the middle of Main Street.' },
      { m: /Rochelle, Illinois/i, why: 'Rochelle, Illinois. Union Pacific and BNSF main lines cross here on the level, and the town built a park just for watching it.' },
      { m: /Strasburg, Pennsylvania/i, why: 'Strasburg, Pennsylvania, home of the Strasburg Rail Road, a heritage line that runs steam trains through Amish farmland.' },
      { m: /Kearney, Nebraska/i, why: 'Kearney, Nebraska, on Union Pacific’s main line across the Great Plains.' },
      { m: /Belen, New Mexico/i, why: 'The BNSF yard at Belen, New Mexico, on the main line across the Southwest.' },
      { m: /Cheyenne, Wyoming/i, why: 'Cheyenne, Wyoming, a Union Pacific railway town.' },
      { m: /Banbury/i, why: 'Banbury station in Oxfordshire, England.' },
      { m: /Blue Anchor/i, why: 'Blue Anchor station on the West Somerset Railway in England, a heritage line that still runs steam.' },
      { m: /Vijf Bruggen/i, why: 'The bridges on the approach to Amsterdam Centraal, filmed by ProRail, which runs the Dutch rail network.' },
      { m: /Hamamatsu-cho/i, why: 'Railway tracks at Hamamatsuchō in central Tokyo.' },
      { m: /Alishan Forest Railway/i, why: 'The Alishan Forest Railway in Taiwan, a narrow-gauge line that climbs into the mountains.' },
      { m: /Galesburg, Illinois/i, why: 'Galesburg, Illinois, a busy BNSF junction.' },
    ],
  },
  {
    slug: 'national-park-live-cams', title: 'National parks, live: the best park cams',
    metaTitle: 'Live national park webcams — Grand Canyon, Glacier, Katmai and more | Watch This Cam',
    desc: 'Live webcams from national parks: Katmai’s bear falls, the Grand Canyon, Crater Lake, Glacier, the Great Smoky Mountains, Denali and Etosha in Namibia.',
    lede: 'The US National Park Service keeps cameras running in many of its parks, mostly to show the weather and the air quality. They also happen to be some of the best views on the internet. A few parks further afield are here too.',
    picks: [
      { m: /Brooks Falls/i, why: 'Brooks Falls in Katmai National Park, Alaska. In summer brown bears stand in the falls and catch salmon as they jump. It is quiet in winter.' },
      { m: /Grand Canyon — Yavapai/i, why: 'The Grand Canyon from Yavapai Point on the South Rim.' },
      { m: /Crater Lake — Wizard Island/i, why: 'Crater Lake in Oregon and Wizard Island, the cinder cone that rises out of the water.' },
      { m: /Lake McDonald, Glacier/i, why: 'Lake McDonald in Glacier National Park, Montana.' },
      { m: /Great Smoky Mountains — Look Rock/i, why: 'The Great Smoky Mountains from Look Rock, on the Tennessee side.' },
      { m: /Mount Washburn/i, why: 'The view from Mount Washburn in Yellowstone.' },
      { m: /Denali National Park/i, why: 'Denali National Park in Alaska.' },
      { m: /Bryce Canyon/i, why: 'Bryce Canyon in Utah.' },
      { m: /Halemaumau|Uekahuna/i, why: 'Halemaʻumaʻu crater at Kīlauea, in Hawaiʻi Volcanoes National Park.' },
      { m: /Okaukuejo waterhole/i, why: 'The Okaukuejo waterhole in Etosha National Park, Namibia. It is floodlit after dark, when the animals come in to drink.' },
      { m: /Cradle Mountain/i, why: 'Cradle Mountain–Lake St Clair National Park in Tasmania.' },
      { m: /Two Medicine Lake/i, why: 'Two Medicine Lake and Sinopah Mountain in Glacier National Park.' },
    ],
  },
  {
    slug: 'live-nest-cams', title: 'Live nest cams: eagles, ospreys, falcons and owls',
    metaTitle: 'Live nest cams — eagles, ospreys, falcons and owls | Watch This Cam',
    desc: 'Live bird nest cameras: the Big Bear and Decorah bald eagles, Cornell’s red-tailed hawks, a royal albatross in New Zealand, ospreys in England and Australia, and peregrine falcons.',
    lede: 'A nest cam is a slow story told over months: eggs, chicks, first flights. Seasons differ. Eagles in the north start in late winter, ospreys come back in spring, and the southern hemisphere runs the other way round. Out of season you will be looking at an empty nest.',
    picks: [
      { m: /Big Bear Bald Eagle Nest/i, why: 'The bald eagle nest above Big Bear Lake in California, home of the pair known as Jackie and Shadow.' },
      { m: /Decorah Eagles/i, why: 'The bald eagle nest at Decorah, Iowa.' },
      { m: /Cornell Red-tailed Hawks/i, why: 'Red-tailed hawks that nest on a light tower at Cornell University in Ithaca, New York.' },
      { m: /Northern Royal Albatross/i, why: 'A northern royal albatross nest in New Zealand, run with the country’s Department of Conservation.' },
      { m: /Manton Bay Ospreys/i, why: 'The Manton Bay ospreys at Rutland Water in England.' },
      { m: /Port Lincoln Osprey/i, why: 'The osprey nest at Port Lincoln in South Australia.' },
      { m: /FalconCam Project/i, why: 'Peregrine falcons in a nest box in Orange, Australia, part of a long-running university research project.' },
      { m: /UMass Amherst Libraries Falcon/i, why: 'Peregrine falcons on the library tower at the University of Massachusetts Amherst.' },
      { m: /West End Bald Eagle Nest/i, why: 'The West End bald eagle nest on Catalina Island, off the coast of California.' },
      { m: /Audubon Boat House Osprey/i, why: 'An osprey nest on the coast of Maine.' },
      { m: /Storchennest Kirchzarten/i, why: 'A white stork nest at Kirchzarten, on the edge of the Black Forest in Germany.' },
      { m: /White stork nest, Pfreimd/i, why: 'A white stork nest on a rooftop in Pfreimd, Bavaria.' },
      { m: /American Barn Owl/i, why: 'A barn owl nest box in Florida.' },
    ],
  },
  {
    slug: 'underwater-live-cams', title: 'Underwater live cams: reefs, sharks, otters and jellyfish',
    metaTitle: 'Underwater live cams — reefs, sharks, otters and jellyfish | Watch This Cam',
    desc: 'Live underwater webcams: the Monterey Bay Aquarium kelp forest and jellies, a reef off Honduras, manatees in a Florida spring, sea otters and an urban reef at PortMiami.',
    lede: 'Some of these are in the sea and some are behind glass. Either way, it is the calmest corner of the site. Put one on and let the fish get on with it.',
    picks: [
      { m: /^Kelp Forest/i, why: 'The kelp forest tank at Monterey Bay Aquarium in California.' },
      { m: /Coral City Camera/i, why: 'An underwater camera on an urban reef at PortMiami in Florida. It is in the open sea, so whatever swims past is wild.' },
      { m: /Utopia Village.*Reef/i, why: 'A camera fixed to the reef at Utila, an island off Honduras.' },
      { m: /Manatee.*Homosassa|Homosassa.*Manatee/i, why: 'Homosassa Springs in Florida. Manatees gather in the warm spring water in the cooler months.' },
      { m: /^Open Sea/i, why: 'The Open Sea tank at Monterey Bay Aquarium.' },
      { m: /^Moon Jelly|^Jelly/i, why: 'Jellyfish drifting in the dark at Monterey Bay Aquarium.' },
      { m: /^Sea Otter/i, why: 'Sea otters, on a live aquarium camera.' },
      { m: /^Coral Reef/i, why: 'The coral reef tank at the California Academy of Sciences in San Francisco.' },
      { m: /TOBA.*OTTER/i, why: 'The sea otter pool at Toba Aquarium in Japan.' },
      { m: /Moody Gardens Penguin/i, why: 'The penguin habitat at Moody Gardens in Galveston, Texas.' },
      { m: /^Shark/i, why: 'A shark tank, on a slow loop of fins.' },
      { m: /Wahoo Bay Underwater/i, why: 'An underwater camera at Wahoo Bay in Florida.' },
    ],
  },
  {
    slug: 'hawaii-live-cams', title: 'Hawaii, live: beaches, surf and a volcano',
    metaTitle: 'Live Hawaii webcams — Waikiki, Pipeline, Maui and Kīlauea | Watch This Cam',
    desc: 'Live webcams from Hawaii: Banzai Pipeline on the North Shore, Waikiki, Maui’s whale sanctuary, Kauai’s beaches, Mauna Kea and the Kīlauea volcano.',
    lede: 'Hawaii is ten or eleven hours behind Europe, so by the time the evening drags over here, the sun is well up over there. A good one to open on a dark winter night.',
    picks: [
      { m: /Banzai Pipeline/i, why: 'Pipeline on Oahu’s North Shore, one of the best-known surf breaks in the world. Winter is the big-wave season.' },
      { m: /Waikiki/i, why: 'Waikiki in Honolulu.' },
      { m: /Humpback Whale Marine Sanctuary/i, why: 'The humpback whale sanctuary off Maui. The whales winter in these waters, roughly December to April.' },
      { m: /Napili Kai/i, why: 'Napili Bay on Maui, from a beach resort.' },
      { m: /Kauai Beach/i, why: 'A beach on Kauai, the Garden Isle.' },
      { m: /Kalapaki Beach/i, why: 'Kalapaki Beach on Kauai, with the lighthouse at Kukiʻi Point.' },
      { m: /Halemaumau|Uekahuna|Kīlauea volcano/i, why: 'Kīlauea on the Big Island, one of the most active volcanoes on earth, watched by the US Geological Survey.' },
      { m: /Mauna Kea|MaunaKea/i, why: 'Mauna Kea, the mountain on the Big Island where the big telescopes are.' },
      { m: /Ala Moana/i, why: 'Ala Moana Beach Park in Honolulu.' },
      { m: /South Shore Surf/i, why: 'The south shore of Oahu, from the Waikiki Aquarium.' },
    ],
  },
  {
    slug: 'new-york-live-cams', title: 'New York City, live',
    metaTitle: 'Live New York City webcams — skyline, harbour and Bryant Park | Watch This Cam',
    desc: 'Live webcams from New York City: the Brooklyn Bridge and Lower Manhattan, New York Harbor, Bryant Park and its winter ice rink, and LaGuardia Airport.',
    lede: 'The skyline at dusk, ferries crossing the harbour, skaters going round in Bryant Park. New York is a good city to watch from a distance.',
    picks: [
      { m: /Brooklyn Bridge, Lower Manhattan/i, why: 'The Brooklyn Bridge, Lower Manhattan and the harbour in one shot.' },
      { m: /New York Harbor, Brooklyn & Manhattan Skylin/i, why: 'New York Harbor with the Manhattan skyline behind it, from the Brooklyn waterfront.' },
      { m: /Winter Village SkateCam|Bryant Park NYC Ice/i, why: 'The ice rink at Bryant Park’s Winter Village in Midtown.' },
      { m: /^Bryant Park$/i, why: 'Bryant Park, the green square behind the New York Public Library.' },
      { m: /Times Square/i, why: 'Times Square.' },
      { m: /Upper East Side/i, why: 'Manhattan’s Upper East Side.' },
      { m: /New York City Harbor, Brooklyn/i, why: 'The harbour from Brooklyn.' },
      { m: /LaGuardia/i, why: 'LaGuardia Airport, for the planes.' },
    ],
  },
  {
    slug: 'cruise-ship-live-cams', keepOrder: true, title: 'Cruise ship cams: the view from the bridge',
    metaTitle: 'Live cruise ship webcams — bridge cams from Princess and Norwegian | Watch This Cam',
    desc: 'Live bridge cams from Princess and Norwegian cruise ships, plus the ports they sail from. See where a ship is and what the weather is doing right now.',
    lede: 'Cruise lines put a camera on the bridge of each ship and publish the picture. It is a simple way to see where a ship is right now and what the sea is like. These are still photos that refresh about once a minute, not video.',
    picks: [
      { m: /^Pride Of America bridge cam/i, why: 'Norwegian’s Pride of America, which sails around the Hawaiian islands.' },
      { m: /^Sun Princess bridge cam/i, why: 'The view ahead from the bridge of Sun Princess.' },
      { m: /^Norwegian Prima bridge cam/i, why: 'The view from Norwegian Prima.' },
      { m: /^Caribbean Princess bridge cam/i, why: 'The view ahead from the bridge of Caribbean Princess.' },
      { m: /^Norwegian Encore bridge cam/i, why: 'The view from Norwegian Encore.' },
      { m: /^Diamond Princess bridge cam/i, why: 'The view ahead from the bridge of Diamond Princess.' },
      { m: /^Norwegian Viva bridge cam/i, why: 'The view from Norwegian Viva.' },
      { m: /^Discovery Princess bridge cam/i, why: 'The view ahead from the bridge of Discovery Princess.' },
      { m: /Hamburg Harbour/i, why: 'Hamburg harbour in Germany, live video.' },
      { m: /Stornoway Harbour/i, why: 'Stornoway harbour in the Outer Hebrides, a ferry and cruise port.' },
      { m: /Port Everglades/i, why: 'Port Everglades in Fort Lauderdale, one of the big Florida cruise ports.' },
      { m: /Hamilton Harbour, Bermuda/i, why: 'Hamilton Harbour in Bermuda, live video.' },
    ],
  },
];
const articleUrls = [];
for (const a of ARTICLES) {
  const resolved = [], seen = new Set();
  for (const pk of a.picks) { const c = pickCam(pk.m, pk.cat, pk.country); if (c && !seen.has(c.id)) { seen.add(c.id); resolved.push({ c, why: pk.why }); } }
  if (resolved.length < 3) continue;
  if (!a.keepOrder) resolved.sort((x, y) => (x.c.type === 'image' ? 1 : 0) - (y.c.type === 'image' ? 1 : 0)); // live video first (list order otherwise kept)
  const p = `/guide/${a.slug}.html`;
  articleUrls.push({ p, slug: a.slug, title: a.title, desc: a.desc, n: resolved.length });
  // Share/OG image: prefer a YouTube thumbnail (stable, daytime) over a live image-cam snapshot (can be dark/flaky).
  const ogPick = resolved.find(r => isYT(r.c)) || resolved[0];
  const img = absUrl(bigThumb(ogPick.c));
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, url: SITE_URL + cleanPath(p), image: [img], datePublished: BUILD_DATE, dateModified: BUILD_DATE, author: { '@type': 'Organization', name: 'Watch This Cam' }, publisher: { '@type': 'Organization', name: 'Watch This Cam', logo: { '@type': 'ImageObject', url: SITE_URL + '/icon-512.png' } } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: SITE_URL + '/guide/' },
      { '@type': 'ListItem', position: 3, name: a.title }] },
  ];
  const picksHtml = resolved.map(({ c, why }) => `<article class="pick">
<a class="pthumb" href="/cam/${c.id}.html">${livePill(c)}<img loading="lazy" ${ONERR} src="${thumb(c)}" alt="${esc(c.name)}"></a>
<div class="pbody"><h3><a href="/cam/${c.id}.html">${esc(c.name)}</a></h3>
<p class="pwhere">${esc([c.countryLabel, c.catLabel].filter(Boolean).join(' · '))}</p>
<p>${esc(why)}</p><a class="plink" href="/cam/${c.id}.html">Watch live →</a></div></article>`).join('');
  fs.writeFileSync(path.join(DIST, 'guide', a.slug + '.html'), head(a.metaTitle || a.title, a.desc, img, p, ld) + header + `
<main class="wrap article">
<nav class="crumbs"><a href="/">Home</a> › <a href="/guide/">Guides</a> › ${esc(a.title)}</nav>
<div class="hubhead"><h1>${esc(a.title)}</h1><p class="lede">${esc(a.lede)}</p></div>
<div class="picklist">${picksHtml}</div>
<div style="margin:8px 0 40px"><a class="btn" href="/random.html"><span class="dice">🎲</span> Surprise me</a> <a class="btn ghost" href="/guide/">More guides</a></div>
</main>` + footer);
}
// Guides index
const guideCards = articleUrls.map(a => `<a class="guidecard" href="${cleanPath(a.p)}"><b>${esc(a.title)}</b><span>${a.n} cams</span></a>`).join('');
fs.writeFileSync(path.join(DIST, 'guide', 'index.html'), head('Guides to the world’s best live cams | Watch This Cam', 'Hand-picked guides to the best live cameras in the world — volcanoes, the northern lights, beaches, ski resorts and more.', null, '/guide/', [
  { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Watch This Cam guides', url: SITE_URL + '/guide/', isPartOf: { '@type': 'WebSite', name: 'Watch This Cam', url: SITE_URL + '/' } },
]) + header + `
<main class="wrap">
<nav class="crumbs"><a href="/">Home</a> › Guides</nav>
<div class="hubhead"><h1>Guides</h1><p>Hand-picked tours of the best live cameras in the world — the dramatic, the beautiful and the strangely watchable.</p></div>
<div class="guidegrid">${guideCards}</div>
</main>` + footer);

// Homepage guide cards (see the marker in the homepage template).
const GUIDE_TAGS = {"ireland-live-cams":"☘️ For the Irish abroad","wildest-live-cams":"The wild &amp; weird","best-live-cams":"Our pick of the lot","live-volcano-cams":"Active &amp; erupting","northern-lights-live-cams":"Aurora webcams","best-beach-cams":"Borrow some sun","live-ski-resort-cams":"Check the snow"};
{ const f = path.join(DIST, 'index.html');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('<!--HOME_GUIDES-->', articleUrls.slice(0, 12).map(a => `<a class="guidecard" href="${a.p}"><b>${esc(a.title)}</b><span>${GUIDE_TAGS[a.slug] || a.n + ' cams'}</span></a>`).join('\n'))); }

// ---- robots.txt + sitemap.xml (for launch / SEO) ----
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const sitemapUrls = ['/', '/browse.html', '/thrills.html', '/map.html', '/wall.html', '/favourites.html', '/about.html',
  '/guide/', ...articleUrls.map(a => a.p), '/live/', ...liveUrls, '/new.html', '/widget.html',
  ...hubUrls,
  ...cams.map(c => `/cam/${c.id}.html`)];
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapUrls.map(u => `<url><loc>${SITE_URL}${cleanPath(u)}</loc></url>`).join('\n') + `\n</urlset>\n`);

console.log('built', cams.length, 'cam pages +', hubUrls.length, 'hub pages (', hubStates.length, 'states,', hubThemes.length, 'themes ) +', articleUrls.length, 'guides +', liveUrls.length, 'live pages; sitemap', sitemapUrls.length, 'urls');

// Diagnostics for a human: WTC_STATS=1 node build.js
if (process.env.WTC_STATS) {
  const loc = {}; cams.forEach(c => loc[c.loc || 'none'] = (loc[c.loc || 'none'] || 0) + 1);
  console.log('location level:', loc, '| with tz:', cams.filter(c => c.tz).length, '| time zones:', TZS.length);
  console.log('states:', hubStates.map(s => s + ' ' + stateCams[s].length).join(', '));
  for (const t of THEMES) console.log(`theme ${t.slug} (${themeCams[t.slug].length}${hubThemeSet.has(t.slug) ? '' : ', no page'}):`, themeCams[t.slug].slice(0, 400).map(c => c.name).filter((n, i) => i % Math.max(1, Math.floor(themeCams[t.slug].length / 9)) === 0).slice(0, 9).join(' | '));
  const ang = cams.filter(c => anglesOf(c).length); console.log('cams with other angles:', ang.length, '| e.g.', ang.filter(c => c.type === 'youtube').slice(0, 4).map(c => c.name + ' => ' + anglesOf(c).map(a => a.name).join(' / ')).join(' || '));
  console.log('trip boxes:', cams.filter(c => TRIP_CATS.has(c.category) && c.country && c.country !== 'XX').length, '| booking pages known:', Object.keys(BOOKING_PAGES).length);
}
