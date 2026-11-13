// Turn verified.json into a clean, varied cam list: node curate.js
const fs = require('fs');
const INPUT = process.argv[2] || 'verified.json';
const v = JSON.parse(fs.readFileSync(INPUT));
let BLOCK = { videoIds: [] }; try { BLOCK = JSON.parse(fs.readFileSync('blocklist.json')); } catch (e) {}
const blockedVid = new Set(BLOCK.videoIds || []);

const stripEmoji = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '');
function cleanName(t, c) {
  t = String(t).normalize('NFKC');
  // A Japanese / Chinese / Korean title: keep its English part (in brackets, in quotes, or trailing).
  if (/[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af]/.test(t)) {
    const m = t.match(/[(（]\s*([A-Za-z][^)）]{6,})/) || t.match(/["“]([A-Za-z][^"”]{5,})["”]\s*,?\s*([A-Za-z][A-Za-z ,]{0,30})?/) || t.match(/[\u3040-\u30ff\u4e00-\u9fff】]\s*[／\/]?\s*([A-Z][A-Za-z][A-Za-z ,.'&-]{8,})/);
    if (m) t = (m[1] + (m[2] ? ', ' + m[2] : '')).trim();
  }
  t = t.replace(/[\u0400-\u04FF]+[.,]?/g, ' ');                                              // Cyrillic runs (the Latin part stays)
  t = t.replace(/^\s*(?:www\.)?[\w-]+\.(?:com|net|org|ai|tv)\b\s*[-–:!·|]*\s*!?\s*/i, '');   // a site name in front
  t = t.replace(/\s*[-–|]?\s*(?:https?:\/\/|www\.)\S+/gi, ' ');                            // any other web address
  t = t.replace(/\bis back!?/i, ' ');
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
  s = s.replace(/^[^A-Za-z0-9À-ɏ]+/, '').replace(/[\s#!*«»"“”…·•◆@,-]+$/, '').trim();
  if (s && /[a-z]/.test(s[0])) s = s[0].toUpperCase() + s.slice(1);
  if (s.replace(/[^a-z]/gi, '').length < 3) s = (c && (c.location || c.channel)) || stripEmoji(t).split(/[|｜]/)[0].trim() || 'Live cam';
  return s.slice(0, 60);
}

// Category from title/queries
const RULES = [
  ['volcano', /volcano|volcan|volcán|erupt|erupc|kilauea|etna|stromboli|fuego|mayon|merapi|semeru/i],
  ['transport', /airport|runway|plane ?spott|aeropuerto|flughafen|\brail|\btrains?\b|bahnhof|\btram\b/i],
  ['wildlife', /hawk|albatross|\bstork|storch|kestrel|\bowls?\b|(?<!red )\bdeer\b|bison|gorilla|elephant|sheep|alligator|\bwol(f|ves)\b|moose|\bcondor|heron|\bgoats?\b|\bhorses?\b|kitten|pasture|eagle|bear|panda|otter|puffin|osprey|bird|feeder|zoo|giraffe|safari|africam|reef|aquarium|coral|falcon|nest|wildlife|animal|cat ?cafe|puppy|dog|manatee|underwater|octopus|shark|jellyfish|penguin|seal\b|whale|dolphin|crab|stingray|open sea|deep ocean|lodge|waterhole/i],
  ['space', /nasa|iss |space|earth from|orbit|rocket/i],
  ['ski', /\bski\b|\bskiing|ski resort|slope|piste|\balps\b|alpine|\bsnow|zermatt|matterhorn|jungfrau|dolomiten/i],
  ['surf', /surf/i],
  ['beach', /\bcosta (da|de|del|do)\b|beach|playa|praia|strand|bay|lagoon|seaside|ocean|coast|pipeline/i],
  ['harbour', /harbour|harbor|\bports?\b|\bporto? d[eoi]\b|marina|\bpier\b|wharf|\bdocks?\b|ferry|\bcanal\b|\bships?\b|cruise/i],
  ['transport', /airport|runway|plane|train|railway|rail|station|metro|underground|tram/i],
  ['nature', /falls|lake|river|aurora|northern lights|forest|desert|park|nature|waterfall|fjord|mountain|panorama|glacier|canyon/i],
  ['bar', /bar\b|pub|saloon|cafe|café|kitchen|tavern/i],
  ['city', /street|downtown|\bcity\b|\btown\b|square|plaza|piazza|platz|avenue|\bave\b|boulevard|skyline|market|main st|village|centre|center|crossing|strasse|straße|rynek|centrum|old town|promenade|rooftop|intersection|\brd\b|\bst\b\.?$/i],
  ['other', /.*/],
];
const catOf = c => /railfan|railcam|rail ?cams|steel highway/i.test(c.channel || '') ? 'transport' : RULES.find(([, re]) => re.test(c.title + ' ' + c.queries.join(' ')))[0];

const plain = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
// Country from the stream's own title first; if that says nothing, from the name of the channel that runs it.
function countryOf(c) {
  if (/\bao vivo\b/i.test(c.title) && !/portugal|madeira|a[cç]ores|lisboa|\bporto\b|algarve/i.test(c.title)) return 'BR';
  if (/\bspiaggia\b|lungomare|\bdall[' ’]|\bdella\b|\bdegli\b|\bsul mare\b/i.test(c.title)) return 'IT';
  const a = countryFrom(plain(c.title) + ' ' + plain(c.location), c.title);
  if (a !== 'XX') return a;
  if (/[぀-ヿ]/.test(c.title)) return 'JP';        // Japanese kana in the title
  if (/[가-힯]/.test(c.title)) return 'KR';        // Korean hangul
  if (/即時影像/.test(c.title)) return 'TW';                 // the Taiwanese term for "live image"
  const b = countryFrom(plain(c.channel), c.channel || '');
  if (b !== 'XX') return b;
  // Then the opening lines of the stream's own YouTube description (research/describe.js fetches them).
  const d = (DESC[c.videoId] || '').slice(0, 300);
  if (d) { if (usStateIn(d)) return 'US'; const e = strictCountry(plain(d)); if (e) return e; }
  if (/[぀-ヿ]/.test((c.channel || '') + d)) return 'JP';
  // Last resort: the country the channel itself gives on YouTube, for small local operators only
  // (a worldwide channel's home country says nothing about where one of its cameras is).
  const home = CHCOUNTRY[c.videoId];
  if (home && NAME2CODE[home] && (CH_COUNT[c.channel] || 0) <= 4 && !WORLDWIDE.test(c.channel || '')) return NAME2CODE[home];
  return 'XX';
}
// Whole-word country names only: safe to run over a paragraph of prose.
const STRICT_SKIP = new Set(['Georgia', 'Jersey', 'Guinea', 'Niger', 'Dominica', 'Jordan', 'Turkey', 'Chad', 'Mali', 'Oman', 'Togo', 'Niue', 'Guam', 'Iran', 'Iraq', 'Laos', 'Cuba', 'Fiji', 'Peru', 'Reunion', 'World']);
function strictCountry(s) {
  if (/(?:,|\bin)\s+(?:northern ireland|scotland|england|wales|the united kingdom|the uk|great britain)\b/i.test(s)) return 'GB';
  for (const [name, code] of Object.entries(NAME2CODE)) { if (name.length < 5 || STRICT_SKIP.has(name) || code.length !== 2) continue; if (new RegExp('(?:,|\\bin|\\bfrom)\\s+(?:the\\s+)?' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(s)) return code; }
  return '';
}
let DESC = {}; try { DESC = JSON.parse(fs.readFileSync('yt-desc.json')); } catch (e) {}
let CHCOUNTRY = {}; try { CHCOUNTRY = JSON.parse(fs.readFileSync('yt-chcountry.json')); } catch (e) {}
const CH_COUNT = {}; v.forEach(c => CH_COUNT[c.channel] = (CH_COUNT[c.channel] || 0) + 1);
const WORLDWIDE = /webcam|cams?\b|netcam|viewer|stream|camera|\btv\b|media|hosting|cloud|digital|news|explore|afar|webcamtaxi|skyline|earthtv|earthcam|surfline|world|global|planet|railfan|railcam|\b[48]k\b|relax|nasa|flightradar|airline/i;
const NAME2CODE = (() => { const dn = new Intl.DisplayNames(['en'], { type: 'region' }), m = {}, A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const OLD = new Set(['DD', 'CS', 'FX', 'YU', 'SU', 'TP', 'ZR', 'BU', 'AN', 'UK', 'YD', 'NT', 'EU', 'UN', 'EZ', 'QO']);
  for (const a of A) for (const b of A) { if (OLD.has(a + b)) continue; try { const n = dn.of(a + b); if (n && n !== a + b && !(n in m)) m[n] = a + b; } catch (e) {} }
  m['Türkiye'] = 'TR'; m['Turkey'] = 'TR'; m['Czechia'] = 'CZ'; m['Czech Republic'] = 'CZ'; m['United States'] = 'US'; m['United Kingdom'] = 'GB'; m['South Korea'] = 'KR'; m['Russia'] = 'RU'; return m; })();
// US state, for the state pages: a state named outright, a ", ST" postal code, or a place that can only be in one state.
const US_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const STATE_LIST = Object.values(US_NAMES).sort((a, b) => b.length - a.length);
const PLACE_STATE = { 'outer banks': 'North Carolina', 'obx': 'North Carolina', 'nags head': 'North Carolina', 'holden beach': 'North Carolina', 'ocean isle': 'North Carolina', 'myrtle beach': 'South Carolina', 'hilton head': 'South Carolina', 'cape cod': 'Massachusetts', 'nantucket': 'Massachusetts', "martha's vineyard": 'Massachusetts', 'boston': 'Massachusetts', 'key largo': 'Florida', 'islamorada': 'Florida', 'clearwater': 'Florida', 'daytona': 'Florida', 'cocoa beach': 'Florida', 'panama city beach': 'Florida', 'destin': 'Florida', 'pensacola': 'Florida', 'miami': 'Florida', 'key west': 'Florida', 'fort lauderdale': 'Florida', 'orlando': 'Florida', 'tampa': 'Florida', 'st. augustine': 'Florida', 'siesta key': 'Florida', 'homosassa': 'Florida', 'gulf shores': 'Alabama', 'virginia beach': 'Virginia', 'atlanta': 'Georgia', 'san antonio': 'Texas', 'houston': 'Texas', 'dallas': 'Texas', 'austin': 'Texas', 'galveston': 'Texas', 'south padre': 'Texas', 'phoenix': 'Arizona', 'sedona': 'Arizona', 'grand canyon': 'Arizona', 'tucson': 'Arizona', 'philadelphia': 'Pennsylvania', 'pittsburgh': 'Pennsylvania', 'gettysburg': 'Pennsylvania', 'detroit': 'Michigan', 'mackinac': 'Michigan', 'cleveland': 'Ohio', 'cincinnati': 'Ohio', 'minneapolis': 'Minnesota', 'duluth': 'Minnesota', 'milwaukee': 'Wisconsin', 'indianapolis': 'Indiana', 'salt lake': 'Utah', 'park city': 'Utah', 'yellowstone': 'Wyoming', 'jackson hole': 'Wyoming', 'yosemite': 'California', 'santa monica': 'California', 'malibu': 'California', 'venice beach': 'California', 'huntington beach': 'California', 'laguna beach': 'California', 'monterey': 'California', 'san diego': 'California', 'los angeles': 'California', 'venice beach': 'California', 'san francisco': 'California', 'big bear': 'California', 'mammoth lakes': 'California', 'mammoth mountain': 'California', 'lake george': 'New York', 'times square': 'New York', 'manhattan': 'New York', 'brooklyn': 'New York', 'nyc': 'New York', 'vail': 'Colorado', 'breckenridge': 'Colorado', 'steamboat': 'Colorado', 'telluride': 'Colorado', 'denver': 'Colorado', 'anchorage': 'Alaska', 'juneau': 'Alaska', 'ketchikan': 'Alaska', 'fairbanks': 'Alaska', 'katmai': 'Alaska', 'maui': 'Hawaii', 'kona': 'Hawaii', 'hilo': 'Hawaii', 'oahu': 'Hawaii', 'waikiki': 'Hawaii', 'kauai': 'Hawaii', 'honolulu': 'Hawaii', 'las vegas': 'Nevada', 'reno': 'Nevada', 'new orleans': 'Louisiana', 'chicago': 'Illinois', 'seattle': 'Washington', 'leavenworth': 'Washington', 'nashville': 'Tennessee', 'gatlinburg': 'Tennessee', 'des moines': 'Iowa', 'decorah': 'Iowa', 'atlantic city': 'New Jersey', 'cape may': 'New Jersey', 'sea isle': 'New Jersey' };
const PLACE_RE = new RegExp('\\b(' + Object.keys(PLACE_STATE).map(k => k.replace(/[.']/g, m => '\\' + m)).join('|') + ')\\b', 'i');
function usStateIn(text) {
  if (!text) return '';
  const s = plain(text);
  for (const n of STATE_LIST) {
    if (n === 'Washington') { if (/washington state|,\s*washington\b(?!\s*,?\s*d\.?\s*c)/i.test(s)) return n; continue; }
    if (n === 'Georgia') { if (/,\s*georgia\b|georgia,?\s*(usa|us\b)/i.test(s)) return n; continue; }
    const m = s.match(new RegExp('((lake|sierra|rio)\\s+)?\\b' + n + '\\b(\\s+(river|city))?', 'i'));
    if (m && !m[1] && !m[3]) return n;
  }
  const p = s.match(PLACE_RE); if (p) return PLACE_STATE[p[1].toLowerCase()];
  const ab = (text.match(/,\s*([A-Z]{2})\b/) || text.match(/\s([A-Z]{2})\.?\s*(?:[-|(]|$)/) || [])[1];
  return ab && US_NAMES[ab] && ab !== 'LA' ? US_NAMES[ab] : '';
}
const stateOf = c => usStateIn(c.title) || usStateIn(c.channel) || usStateIn((DESC[c.videoId] || '').slice(0, 300));
function countryFrom(s, rawTitle) {
  const c = { title: rawTitle || '' };
  const map = { IE: /dublin|ireland|galway|cork|kerry|donegal|belfast|carlow|larne|portrush|bennekerry|graiguecullen|bagenalstown/i,
    AU: /sydney|bondi|melbourne|gold coast|byron|newcastle|townsville|adelaide|australia|wyndham|yarra|perisher|thredbo|brisbane|perth/i,
    PT: /portugal|lisbon|lisboa|porto|algarve|nazar|madeira|funchal|azores|caparica|portim|albufeira|pico|machico|moniz/i,
    US: /venice beach|new york|nyc|times square|vegas|nashville|key west|miami|hawaii|oahu|maui|kauai|waikiki|florida|\bfl\b|california|texas|jackson hole|galveston|chicago|san diego|bourbon|new orleans|oakland|brooklyn|manhattan|bryant park|los angeles|skid row|sturgis|seattle|washington|boston|austin|denver|san francisco|\busa\b|kentucky|illinois|alaska|alabama|wyoming|tennessee|vermont|\bmaine\b|iowa|pennsylvania|gettysburg|gatlinburg|telluride|fort lauderdale|miramar beach|dania beach|winter garden|newburyport|sag harbor|sandy hook|lake champlain|big bear|leavenworth|nevada|tahoe|colorado|duluth|mammoth|cripple creek|minnesota|arizona|utah/i,
    GB: /london|oxford|yorkshire|somerset|isle of wight|isle of man|southampton|scotland|fort william|wales|saundersfoot|weymouth|dartmouth|port isaac|notting hill|edinburgh|piccadilly/i,
    JP: /tokyo|shibuya|shinjuku|japan|osaka|kyoto|odaiba|fuji|hamamatsu|kabukicho/i,
    IT: /venice(?! beach| v hotel| vive)|rome|roma|italy|assisi|dolomiten|san marco|rialto|milan|florence|firenze/i,
    NL: /amsterdam|netherlands|groningen|nijmegen|zaanse|ijmuiden|rotterdam/i,
    ES: /spain|barcelona|mallorca|lanzarote|tenerife|canary|gran canaria|tossa|las palmas|madrid|seville/i,
    CH: /schweiz|swiss|switzerland|zermatt|matterhorn|luzern|geneva|jungfrau/i,
    KR: /seoul|korea|busan/i, CN: /beijing|shanghai|china\b|guangzhou|shenzhen/i, HK: /hong kong/i, TW: /taiwan|taipei/i,
    SG: /singapore/i, IN: /mumbai|delhi|india\b|bangalore|chennai|kolkata/i, AE: /dubai|abu dhabi|uae|emirates/i,
    TH: /thailand|samui|chaweng|lamai|bangkok|phuket/i, VN: /vietnam|hanoi|saigon|ho chi minh/i, ID: /indonesia|jakarta|bali/i,
    PH: /philippines|manila|davao|cebu/i, MY: /malaysia|kuala lumpur/i,
    DE: /germany|berlin|munich|münchen|hamburg|cologne|frankfurt|deutschland/i, AT: /austria|vienna|wien|kitzb|hotham|tyrol|salzburg|österreich|osterreich/i,
    FR: /france|paris|nice|marseille|lyon|montmartre|sacr/i, GR: /greece|athens|santorini|corfu|crete/i,
    TR: /turkey|istanbul|turkiye/i, RU: /russia|moscow|ufa/i, CZ: /czech|prague|praha/i, HU: /hungary|budapest|bekescsaba|békéscsaba/i,
    PL: /poland|warsaw|krakow|webcamera\.pl/i, DK: /denmark|copenhagen/i, SE: /sweden|stockholm|vilhelmina|overtornea/i,
    NO: /norway|oslo|bergen|geiranger/i, BE: /belgium|brussels|bruges/i, IL: /israel|tel aviv|jerusalem|western wall/i,
    MX: /mexico|cancun|mexico city/i, AR: /argentina|buenos aires|bariloche|patagonia|catedral/i,
    BR: /brazil|rio de janeiro|sao paulo|manaus|amzlive|camboriu|florian[oó]polis|jericoacoara|angra dos reis|balne[aá]rio|lagoinha/i,
    CL: /\bchile\b|santiago de chile|la silla|\beso\b|valparaiso|atacama/i, PE: /\bperu\b|\blima\b/i, CO: /colombia|bogota/i, ZA: /south africa|cape town|johannesburg|knysna/i,
    GT: /guatemala|fuego/i, NA: /namibia|namib/i,
    KE: /kenya|nairobi/i, EG: /egypt|cairo/i, MA: /morocco|marrakech/i, CA: /canada|toronto|vancouver|montreal|calgary|canmore|alberta|kootenay|kearney|red deer|niagara/i,
    FI: /finland|helsinki|modeemi|lasipalatsi/i, IS: /iceland|reykjavik/i, NZ: /new zealand|\bnz\b|auckland|wellington|queenstown|arthur/i };
  for (const [k, re] of Object.entries(map)) if (re.test(s)) return k;
  if (/caribbean|curacao|st mart|maho|jost van|bvi|bahamas|aruba|usvi|mambo beach|st\.? thomas|st\.? john|st\.? croix|virgin islands|cayman|jamaica|barbados|bonaire|turks|antigua|st\.? lucia|grenada|dominican|puerto rico|sint maarten|saint martin|anguilla|st\.? barth/i.test(s)) return 'CB';
  // US: a state named in the title, or a trailing ", ST" postal code (", FL", ", NC ...").
  if (US_STATE_RE.test(s)) return 'US';
  const ab = (c.title.match(/,\s*([A-Z]{2})\b/) || c.title.match(/\s([A-Z]{2})\.?\s*(?:[-|(]|$)/) || [])[1];
  if (ab && US_ABBR.has(ab)) return 'US';
  for (const [k, re] of Object.entries(MORE_COUNTRIES)) if (re.test(s)) return k;
  return 'XX';
}
const US_ABBR = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
const US_STATE_RE = /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|wisconsin|wyoming|outer banks|myrtle beach|cape cod|key largo|islamorada|clearwater|daytona|cocoa beach|panama city beach|destin|pensacola|gulf shores|ocean city|virginia beach|nags head|hilton head|charleston|san antonio|houston|dallas|atlanta|phoenix|philadelphia|pittsburgh|detroit|cleveland|st\.? louis|kansas city|minneapolis|milwaukee|indianapolis|cincinnati|salt lake|yellowstone|yosemite|grand canyon|santa monica|malibu|venice beach|huntington beach|laguna beach|monterey|lake george|aspen|vail|breckenridge|steamboat|park city|sedona|anchorage|juneau|ketchikan|homer spit|maui|kona|hilo)\b/i;
const MORE_COUNTRIES = { HR: /croatia|dubrovnik|\bsplit\b|zadar|hvar|rovinj|pula\b/i, MT: /malta|valletta|gozo/i, CY: /cyprus|limassol|paphos|ayia napa|larnaca/i,
  RO: /romania|bucharest|brasov/i, BG: /bulgaria|sofia|varna|burgas/i, SK: /slovakia|bratislava|tatry/i, SI: /slovenia|ljubljana|bled/i,
  EE: /estonia|tallinn/i, LV: /latvia|riga/i, LT: /lithuania|vilnius|klaipeda|palanga/i, UA: /ukraine|kyiv|kiev|odesa|odessa|lviv/i,
  RS: /serbia|belgrade/i, ME: /montenegro|kotor|budva/i, AL: /albania|tirana|sarand/i, MK: /macedonia|skopje|ohrid/i, BA: /bosnia|sarajevo|mostar/i,
  LU: /luxembourg/i, MC: /monaco|monte carlo/i, AD: /andorra/i, GI: /gibraltar/i, FO: /faroe/i, GL: /greenland/i,
  CR: /costa rica/i, PA: /panama(?! city beach)/i, EC: /ecuador|galapagos|quito/i, UY: /uruguay|montevideo|punta del este/i, BO: /bolivia/i, CU: /cuba|havana/i,
  NP: /nepal|everest|kathmandu/i, LK: /sri lanka/i, MV: /maldives/i, KH: /cambodia/i, QA: /qatar|doha/i, SA: /saudi|mecca|makkah|medina/i,
  JO: /jordan\b|petra\b/i, TZ: /tanzania|serengeti|zanzibar/i, BW: /botswana/i, ZW: /zimbabwe|victoria falls/i, UG: /uganda/i, MU: /mauritius/i, SC: /seychelles/i,
  FJ: /\bfiji\b/i, PF: /tahiti|bora bora|french polynesia|moorea/i, CK: /cook islands|rarotonga/i, AQ: /antarctic/i, BM: /bermuda/i,
  // second-line clues: well-known places, and operators that only film one country
  US: /\breno\b|cornell|fairbanks|mendenhall|catalina island|white house|starbase|spacex|cape canaveral|kennedy space|\bdayton\b|martha'?s vineyard|nantucket|steel highway|virtual railfan|southwest railcams|decorah|monterey|\bnps\b|national park service|smoky mountain|gulf coast|jersey shore|long island|chesapeake|lake michigan|lake superior|lake erie|mississippi river/i,
  GB: /\buk\b|england|united kingdom|cornwall|devon\b|brighton|liverpool|manchester|blackpool|railcam|whitby|scarborough|norfolk broads|lake district/i,
  ZA: /africam|tembe|kruger|sabi sands|djuma/i, HN: /honduras|utila|roatan|utopia village/i, ID: /merapi|semeru|bromo|\bjava\b|lombok/i,
  FI: /santa claus village|rovaniemi|lapland/i, JP: /kamikochi|hokkaido|fukuoka|hakata|hiroshima|chitose|kawaguchiko|nagoya|yokohama|sapporo|okinawa|\bnara\b|kobe\b|nagasaki|sakurajima/i,
  TW: /daxi|cihu|taoyuan|kaohsiung|taichung|tainan|hualien|kenting|alishan|sun moon lake/i, SA: /madina|madinah|makkah/i,
  MX: /zocalo|ciudad de mexico|chihuahua|puerto vallarta|cabo san lucas|playa del carmen|tulum|cozumel|popocatepetl|guadalajara/i,
  DE: /\bstadt\b|wettercam|ostsee|nordsee|schwarzwald|bayern|sylt\b/i, IT: /paesaggi digitali|sicilia|sardegna|napoli|amalfi|lago di|trentino|toscana|liguria|puglia/i,
  ES: /directo natura|ibiza|menorca|fuerteventura|costa brava|costa del sol|malaga|valencia|bilbao|san sebastian|benidorm|\ben vivo\b.*(playa|puerto)/i,
  NO: /lofoten|svalbard|tromso|nordkapp|stavanger|trondheim/i, CA: /british columbia|ontario|quebec|nova scotia|whistler|banff|yukon|churchill/i,
  AU: /queensland|tasmania|great barrier reef|noosa|cairns/i, NZ: /\bnz\b|rotorua|taupo|christchurch|dunedin/i, IN: /ganga|varanasi|kedarnath|shirdi|tirupati/i,
  PH: /taal|boracay/i, GR: /mykonos|rhodes|zakynthos|thessaloniki/i, FR: /chamonix|mont blanc|bretagne|normandie|cote d'azur|biarritz|bordeaux|strasbourg/i,
  CH: /st\.? moritz|davos|grindelwald|interlaken|lugano|zurich|verbier|engadin/i, AT: /innsbruck|tirol|karnten|zell am see|ischgl|solden/i };

const GENERIC_NAME = /^(live ?camera|camera|cam|webcam|webkamera|live ?cam|maincam|main cam|quad|campus|summit|golf|midway|base|safari|penguin|jelly|shark|beach|harbou?r|marina|downtown|tower|view|panorama|live|stream|channel|range|online camera.*)$/i;
const cleanChannel = ch => stripEmoji(String(ch).normalize('NFKC')).replace(/[\(\[].*?[\)\]]/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 40);
// A title that is only the camera's model number ("Live Camera Axis M1135") says nothing: use the operator's name instead.
const GENERIC = /^\s*(live\s+)?(camera|cam|webcam)\s*(axis\b.*|\d*)\s*$|^\s*live\s+camera\s+axis\b/i;
let OVERRIDES = {}; try { OVERRIDES = JSON.parse(fs.readFileSync('overrides.json')); } catch (e) {}
let PREV_IDS = new Set(), PREV_NAME = {}, PREV_CAT = {}; try { for (const c of JSON.parse(fs.readFileSync('curated.json'))) { PREV_IDS.add(c.videoId); PREV_NAME[c.videoId] = c.name; PREV_CAT[c.videoId] = c.category; } } catch (e) {}
const ASIAN = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\uff00-\uffef]+/g;
const seen = v.map(c => {
  const generic = GENERIC.test(c.title) && c.channel;
  const o = { ...c, name: generic ? cleanName(c.channel, c) : cleanName(c.title, c), category: catOf(c), country: countryOf(c) };
  if (o.category === 'other' && PREV_CAT[c.videoId]) o.category = PREV_CAT[c.videoId];
  if (PREV_NAME[c.videoId]) o.name = PREV_NAME[c.videoId];
  else {
    o.name = o.name.replace(ASIAN, ' ').replace(/\s{2,}/g, ' ').replace(/^[^A-Za-z0-9À-ɏ]+|[\s,·-]+$/g, '').trim();        // new names: Latin script only
    if (GENERIC_NAME.test(o.name) && c.channel) o.name = (o.name + ', ' + cleanChannel(c.channel).replace(ASIAN, ' ').trim()).replace(/[\s,]+$/, '').slice(0, 60);
  }
  if (o.country === 'XX' && stateOf(c)) o.country = 'US';
  if (o.country === 'US') o.state = stateOf(c);
  const fix = OVERRIDES[c.videoId];
  if (fix) { for (const k of ['country', 'state', 'category']) if (fix[k]) o[k] = fix[k]; if (fix.name && !PREV_NAME[c.videoId]) o.name = fix.name; }
  return o;
});

// Drop obvious junk names and tiny unknown channels pretending to be cams
const bad = /live frequencies|electronic vibes|bgm|haze|psi|smog|universal studios|virtual webcam|woodlands cam|scores|internet eye|first person|underground first/i;
// Not cameras at all: looped "4K aquarium" films, documentaries, news and TV channels, vlogs.
const notCam = /documentary|4k tv|8k ultra|mesmerizing|relaxation|not[ií]cias|vatican media|\btv live\b|is live!|ultravisionconsult|full episode|compilation|\bnews\b.*24\/7|radio|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+20\d\d\b|ニュース$/i;
// Places we will not point a camera at: schools, pools, changing areas, indoor water parks, hospitals wards, private homes.
const notOk = /(primary|elementary|middle|high|secondary|grammar|pre)[ -]?school|school (gate|yard)|cổng trường|kindergarten|nursery|daycare|playground|classroom|bazén|swimming pool|piscina|piscine|schwimmbad|waterpark|water park|\bpool cam|landfill|convenience center|transfer station|recycling|\bjail\b|prison/i;
const noChannel = /^use-ip|cctv|security camera/i;
const blockedChannel = /earthcam/i;  // EarthCam reports embeddable but blocks playback via referrer
let pool = seen.filter(c => c.title && !bad.test(c.title) && !notCam.test(c.title + ' ' + c.channel) && !notOk.test(c.title) && !noChannel.test(c.channel || '') && !blockedChannel.test(c.channel) && !blockedVid.has(c.videoId) && c.name.length >= 4 && !/surveillance/i.test(c.channel || '') &&
  (PREV_IDS.has(c.videoId) || (!/^earth now$/i.test(c.channel || '') && (c.name.match(/[A-Za-z]/g) || []).length >= 5 && !GENERIC_NAME.test(c.name) && !/^(live ?camera|camera|livecamera)\b[, ]*\w{0,8}$/i.test(c.name) && !(c.name.toLowerCase() === String(c.channel).toLowerCase() && !/\s/.test(c.name)))));
{ const seenName = new Set(); pool = pool.filter(c => { const k = c.name.toLowerCase() + '|' + c.channel; if (seenName.has(k) && !PREV_IDS.has(c.videoId)) return false; seenName.add(k); return true; }); }

// (cams already on the site are never dropped as duplicates)
// Variety: cap per channel and per (country+category) bucket
pool.sort((a, b) => (parseSub(b.subscribers) - parseSub(a.subscribers)));
function parseSub(s='') { const m = s.match(/([\d.]+)\s*(thousand|million)?/i); if (!m) return 0; let n = parseFloat(m[1]||0); if (/million/i.test(s)) n*=1e6; else if (/thousand/i.test(s)) n*=1e3; return n; }
// Channels whose cams are genuinely distinct world locations get a higher cap.
const CHANNEL_CAP = { 'afarTV': 8, 'Virtual Railfan': 12, 'explore.org': 12, 'Explore Live Nature Cams': 12, 'SHOWME Caribbean': 8, 'Webcamtaxi': 8, 'feratel – your window to the world': 8 };
const CAP_CH = +process.env.CAP_CH || 8, CAP_BK = +process.env.CAP_BK || 150;
// Cams already on the site keep their place and their URL: they are picked first (whatever the caps say) and keep their id.
let PREV = []; try { PREV = JSON.parse(fs.readFileSync('curated.json')); } catch (e) {}
const prevId = {}; PREV.forEach(c => prevId[c.videoId] = c.id);
const perChannel = {}, perBucket = {}, picked = [];
const take = c => { const ch = c.channel || '?', bk = c.country + ':' + c.category; perChannel[ch] = (perChannel[ch]||0)+1; perBucket[bk] = (perBucket[bk]||0)+1; picked.push(c); };
for (const c of pool) if (prevId[c.videoId]) take(c);
for (const c of pool) {
  if (prevId[c.videoId]) continue;
  const ch = c.channel || '?', bk = c.country + ':' + c.category;
  if ((perChannel[ch]||0) >= (CHANNEL_CAP[ch] || CAP_CH)) continue;   // variety: not too many from one channel...
  if ((perBucket[bk]||0) >= CAP_BK) continue;                         // ...or of one kind in one country
  take(c);
}

const slug = c => (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cam').slice(0, 40);
// A new id must not collide with any page the site already has (YouTube or not).
let ALLPREV = []; try { ALLPREV = JSON.parse(fs.readFileSync('all-cams.json')); } catch (e) {}
const taken = new Set([...Object.values(prevId), ...ALLPREV.map(c => c.id)]);
const out = picked.map(c => {
  let s = prevId[c.videoId];
  if (!s) { const base = slug(c); s = base; for (let n = 2; taken.has(s); n++) s = base + '-' + n; taken.add(s); }
  return { id: s, name: c.name, country: c.country, ...(c.state ? { state: c.state } : {}), category: c.category, type: 'youtube',
    videoId: c.videoId, channel: c.channel, watching: c.watching,
    source: `https://www.youtube.com/watch?v=${c.videoId}` };
});
if (process.env.DRY) {
  // Streams we still cannot place (no country, or USA with no state): describe.js reads their YouTube descriptions.
  fs.writeFileSync('need-desc.json', JSON.stringify(pool.filter(c => c.country === 'XX' || (c.country === 'US' && !c.state)).map(c => c.videoId)));
  fs.writeFileSync('need-country.json', JSON.stringify(pool.filter(c => c.country === 'XX').map(c => c.videoId)));
  if (process.env.DRY === 'dump') fs.writeFileSync('dry-picked.json', JSON.stringify(picked.map(c => ({ n: c.name, t: c.title, ch: c.channel, cat: c.category, co: c.country, st: c.state, w: c.watching }))));
  console.log('US with a state:', picked.filter(c => c.state).length, 'of', picked.filter(c => c.country === 'US').length);
  const chAll = {}; pool.forEach(c => chAll[c.channel] = (chAll[c.channel] || 0) + 1);
  console.log('DRY RUN. pool', pool.length, '| kept from before', picked.filter(c => prevId[c.videoId]).length, 'of', PREV.length, '| new', picked.filter(c => !prevId[c.videoId]).length);
  console.log('biggest channels in pool:', Object.entries(chAll).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, n]) => k + ' ' + n).join(' | '));
  console.log('unknown country (new):', picked.filter(c => !prevId[c.videoId] && c.country === 'XX').length); if (process.env.DRY === 'xx') console.log(picked.filter(c => !prevId[c.videoId] && c.country === 'XX').map(c => c.title.slice(0, 58) + ' [' + (c.channel||'').slice(0,22) + ']').join('\n'));
} else fs.writeFileSync('curated.json', JSON.stringify(out, null, 1));
const byCat = {}, byCountry = {};
for (const c of out) { byCat[c.category]=(byCat[c.category]||0)+1; byCountry[c.country]=(byCountry[c.country]||0)+1; }
console.log('picked', out.length);
console.log('by category', byCat);
console.log('by country', byCountry);
