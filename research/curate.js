// Turn verified.json into a clean, varied cam list: node curate.js
const fs = require('fs');
const INPUT = process.argv[2] || 'verified.json';
const v = JSON.parse(fs.readFileSync(INPUT));
let BLOCK = { videoIds: [] }; try { BLOCK = JSON.parse(fs.readFileSync('blocklist.json')); } catch (e) {}
const blockedVid = new Set(BLOCK.videoIds || []);

const stripEmoji = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '');
function cleanName(t, c) {
  let s = stripEmoji(t);
  s = s.split(/[|｜]/)[0];                               // drop channel/suffix after a pipe
  s = s.replace(/\b(4K|UHD|HD|HDR|2160p|1080p|PTZ|24\/?7|LIVE CAM|LIVECAM|LIVE WEBCAM|LIVE STREAM|LIVESTREAM|LIVE|WEBCAM|WEB CAM|CAM|STREAM|NOW|IN 4K)\b/gi, ' ');
  s = s.replace(/[\(\[].*?[\)\]]/g, ' ');                // drop bracketed notes
  s = s.replace(/[-–—:•·,]+\s*$/,'').replace(/^\s*[-–—:•·,]+/, '');
  s = s.replace(/[　-鿿＀-￯]/g, ' ');  // drop CJK runs (keep the latin part)
  s = s.replace(/\bANN|テレ朝\b/g, ' ');
  s = s.replace(/\bpowered by [\w.\s]+/gi, ' ');         // "powered by EXPLORE.org"
  s = s.replace(/\ben direct\b|#\w+/gi, ' ');            // french label, hashtags
  s = s.replace(/\s[-–—·|]\s*(see\w+\.com|ptztv\.?|seejh\.\w+|[\w]+\.(com|org|ai|tv|nl))\b.*$/i, ' '); // trailing site credit
  s = s.replace(/\b(from|by)\s+[A-Z]\w+\.(com|org|ai|tv)\.?$/i, ' ');
  s = s.replace(/^\s*[\/|·]+\s*|\s*[\/|·]+\s*$/g, '');   // strip only leading/trailing slashes (keep 9/11)
  s = s.replace(/^[A-Za-z][\w'& ]{1,18}(live)?\s*:\s*/i, ''); // channel prefix "EarthCam Live:", "Watch:"
  s = s.replace(/\s{2,}/g, ' ').trim();
  s = s.replace(/^(live\s+cam|live|cam|webcam|view|watch)\s+/i, '');   // leftover lead-ins
  s = s.replace(/^(in|from|at|on|of|the)\s+/i, m => /^the\s/i.test(m) ? 'The ' : '');
  s = s.replace(/\s+[-–—:,]\s*$/, '').replace(/^[-–—:,]\s*/, '').trim();
  if (s && /[a-z]/.test(s[0])) s = s[0].toUpperCase() + s.slice(1);
  if (s.replace(/[^a-z]/gi, '').length < 3) s = (c && (c.location || c.channel)) || stripEmoji(t).split(/[|｜]/)[0].trim() || 'Live cam';
  return s.slice(0, 60);
}

// Category from title/queries
const RULES = [
  ['volcano', /volcano|volcan|volcán|erupt|erupc|kilauea|etna|stromboli|fuego|mayon|merapi|semeru/i],
  ['wildlife', /eagle|bear|panda|otter|puffin|osprey|bird|feeder|zoo|giraffe|safari|africam|reef|aquarium|coral|falcon|nest|wildlife|animal|cat ?cafe|puppy|dog/i],
  ['space', /nasa|iss |space|earth from|orbit|rocket/i],
  ['ski', /ski|slope|piste|alps|alpine|snow|mountain|zermatt|matterhorn|jungfrau|dolomiten|panorama/i],
  ['surf', /surf/i],
  ['beach', /beach|playa|praia|strand|bay|lagoon|seaside|ocean|coast|pipeline/i],
  ['harbour', /harbour|harbor|port|marina|pier|wharf|dock|ferry|canal|ships?/i],
  ['transport', /airport|runway|plane|train|railway|rail|station|metro|underground|tram/i],
  ['nature', /falls|lake|river|aurora|northern lights|forest|desert|park|nature|waterfall|fjord/i],
  ['bar', /bar\b|pub|saloon|cafe|café|kitchen|tavern/i],
  ['city', /.*/],
];
const catOf = c => RULES.find(([, re]) => re.test(c.title + ' ' + c.queries.join(' ')))[0];

function countryOf(c) {
  const s = c.title + ' ' + c.location;
  const map = { IE: /dublin|ireland|galway|cork|kerry|donegal|belfast|carlow|larne|portrush|bennekerry|graiguecullen|bagenalstown/i,
    AU: /sydney|bondi|melbourne|gold coast|byron|newcastle|townsville|adelaide|australia|wyndham|yarra|perisher|thredbo|brisbane|perth/i,
    PT: /portugal|lisbon|lisboa|porto|algarve|nazar|madeira|funchal|azores|caparica|portim|albufeira|pico|machico|moniz/i,
    US: /new york|nyc|times square|vegas|nashville|key west|miami|hawaii|oahu|maui|kauai|florida|california|texas|jackson hole|galveston|chicago|san diego|bourbon|new orleans|oakland|brooklyn|manhattan|sturgis|seattle|boston|austin|denver|san francisco/i,
    GB: /london|oxford|yorkshire|somerset|isle of wight|southampton|scotland|fort william|wales|saundersfoot|weymouth|dartmouth|port isaac|notting hill|edinburgh|piccadilly/i,
    JP: /tokyo|shibuya|shinjuku|japan|osaka|kyoto|odaiba|fuji|hamamatsu|kabukicho/i,
    IT: /venice|rome|roma|italy|assisi|dolomiten|san marco|rialto|milan|florence|firenze/i,
    NL: /amsterdam|netherlands|groningen|nijmegen|zaanse|ijmuiden|rotterdam/i,
    ES: /spain|barcelona|mallorca|lanzarote|tenerife|canary|gran canaria|tossa|las palmas|madrid|seville/i,
    CH: /schweiz|swiss|switzerland|zermatt|matterhorn|luzern|geneva|jungfrau/i,
    KR: /seoul|korea|busan/i, CN: /beijing|shanghai|china\b|guangzhou|shenzhen/i, HK: /hong kong/i, TW: /taiwan|taipei/i,
    SG: /singapore/i, IN: /mumbai|delhi|india\b|bangalore|chennai|kolkata/i, AE: /dubai|abu dhabi|uae|emirates/i,
    TH: /thailand|samui|chaweng|lamai|bangkok|phuket/i, VN: /vietnam|hanoi|saigon|ho chi minh/i, ID: /indonesia|jakarta|bali/i,
    PH: /philippines|manila|davao|cebu/i, MY: /malaysia|kuala lumpur/i,
    DE: /germany|berlin|munich|münchen|hamburg|cologne|frankfurt|deutschland/i, AT: /austria|vienna|wien|kitzb|hotham|tyrol|salzburg/i,
    FR: /france|paris|nice|marseille|lyon|montmartre|sacr/i, GR: /greece|athens|santorini|corfu|crete/i,
    TR: /turkey|istanbul|turkiye/i, RU: /russia|moscow|ufa/i, CZ: /czech|prague|praha/i, HU: /hungary|budapest|bekescsaba|békéscsaba/i,
    PL: /poland|warsaw|krakow|webcamera\.pl/i, DK: /denmark|copenhagen/i, SE: /sweden|stockholm|vilhelmina|overtornea/i,
    NO: /norway|oslo|bergen|geiranger/i, BE: /belgium|brussels|bruges/i, IL: /israel|tel aviv|jerusalem|western wall/i,
    MX: /mexico|cancun|mexico city/i, AR: /argentina|buenos aires|bariloche|patagonia|catedral/i,
    BR: /brazil|rio de janeiro|sao paulo|manaus|amzlive|camboriu|florian[oó]polis|jericoacoara|angra dos reis|balne[aá]rio|lagoinha/i,
    CL: /chile|santiago|la silla|eso/i, PE: /peru|lima/i, CO: /colombia|bogota/i, ZA: /south africa|cape town|johannesburg|knysna/i,
    GT: /guatemala|fuego/i, NA: /namibia|namib/i,
    KE: /kenya|nairobi/i, EG: /egypt|cairo/i, MA: /morocco|marrakech/i, CA: /canada|toronto|vancouver|montreal|calgary|canmore|alberta|kootenay|kearney/i,
    FI: /finland|helsinki|modeemi|lasipalatsi/i, IS: /iceland|reykjavik/i, NZ: /new zealand|auckland|wellington|queenstown|arthur/i };
  for (const [k, re] of Object.entries(map)) if (re.test(s)) return k;
  if (/caribbean|curacao|st mart|maho|jost van|bvi|bahamas|aruba/i.test(s)) return 'CB';
  return 'XX';
}

const seen = v.map(c => ({ ...c, name: cleanName(c.title, c), category: catOf(c), country: countryOf(c) }));

// Drop obvious junk names and tiny unknown channels pretending to be cams
const bad = /live frequencies|electronic vibes|bgm|haze|psi|smog|universal studios|virtual webcam|woodlands cam|scores|internet eye|first person|underground first/i;
const blockedChannel = /earthcam/i;  // EarthCam reports embeddable but blocks playback via referrer
let pool = seen.filter(c => !bad.test(c.title) && !blockedChannel.test(c.channel) && !blockedVid.has(c.videoId) && c.name.length >= 4);

// Variety: cap per channel and per (country+category) bucket
pool.sort((a, b) => (parseSub(b.subscribers) - parseSub(a.subscribers)));
function parseSub(s='') { const m = s.match(/([\d.]+)\s*(thousand|million)?/i); if (!m) return 0; let n = parseFloat(m[1]||0); if (/million/i.test(s)) n*=1e6; else if (/thousand/i.test(s)) n*=1e3; return n; }
// Channels whose cams are genuinely distinct world locations get a higher cap.
const CHANNEL_CAP = { 'afarTV': 8, 'Virtual Railfan': 6, 'explore.org': 6, 'Explore Live Nature Cams': 6, 'SHOWME Caribbean': 6, 'Webcamtaxi': 6, 'feratel – your window to the world': 6 };
const perChannel = {}, perBucket = {}, picked = [];
for (const c of pool) {
  const ch = c.channel || '?', bk = c.country + ':' + c.category;
  if ((perChannel[ch]||0) >= (CHANNEL_CAP[ch] || 3)) continue;   // max 3/channel (more for multi-location channels)
  if ((perBucket[bk]||0) >= 16) continue;
  perChannel[ch] = (perChannel[ch]||0)+1; perBucket[bk] = (perBucket[bk]||0)+1;
  picked.push(c);
}

const slug = c => (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cam').slice(0, 40);
const used = {};
const out = picked.map(c => {
  let s = slug(c); if (used[s]) s = s + '-' + (used[s]+1); used[slug(c)] = (used[slug(c)]||0)+1;
  return { id: s, name: c.name, country: c.country, category: c.category, type: 'youtube',
    videoId: c.videoId, channel: c.channel, watching: c.watching,
    source: `https://www.youtube.com/watch?v=${c.videoId}` };
});
fs.writeFileSync('curated.json', JSON.stringify(out, null, 1));
const byCat = {}, byCountry = {};
for (const c of out) { byCat[c.category]=(byCat[c.category]||0)+1; byCountry[c.country]=(byCountry[c.country]||0)+1; }
console.log('picked', out.length);
console.log('by category', byCat);
console.log('by country', byCountry);
