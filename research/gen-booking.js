// Find real Booking.com landing pages for our cities, US states and countries -> booking-pages.json
//   { "city:tokyo": "city/jp/tokyo", "state:hawaii": "region/us/hawaii", "country:PT": "country/pt" }
// Only pages that load at their own address are kept (a made-up slug redirects to the country page or 404s).
// Booking's search-results links are NOT used: they have shown a blank page to real visitors before.
// node gen-booking.js   (resumable; safe to re-run, keeps what it already has)
const fs = require('fs'), path = require('path');
const R = __dirname, OUT = path.join(R, 'booking-pages.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let out = {}; try { out = JSON.parse(fs.readFileSync(OUT)); } catch (e) {}
let tried = {}; try { tried = JSON.parse(fs.readFileSync(path.join(R, 'net', 'booking-tried.json'))); } catch (e) {}

// [key, candidate paths in order]
const jobs = [];
const cities = [['Tokyo','jp'],['Kyoto','jp'],['Osaka','jp'],['London','gb'],['New York','us'],['Las Vegas','us'],['Miami','us'],['Key West','us'],['New Orleans','us'],['Chicago','us'],['San Diego','us'],['Honolulu','us'],['Fort Lauderdale','us'],
  ['Paris','fr'],['Venice','it'],['Rome','it'],['Florence','it'],['Milan','it'],['Naples','it'],['Barcelona','es'],['Madrid','es'],['Amsterdam','nl'],['Rotterdam','nl'],['Dublin','ie'],['Galway','ie'],['Sydney','au'],['Melbourne','au'],
  ['Lisbon','pt'],['Porto','pt'],['Prague','cz'],['Vienna','at'],['Berlin','de'],['Munich','de'],['Zurich','ch'],['Geneva','ch'],['Zermatt','ch'],['Athens','gr'],['Istanbul','tr'],['Dubai','ae'],['Singapore','sg'],['Hong Kong','hk'],
  ['Bangkok','th'],['Seoul','kr'],['Taipei','tw'],['Reykjavik','is'],['Rio de Janeiro','br'],['Cape Town','za'],['Auckland','nz'],['Queenstown','nz'],['Toronto','ca'],['Vancouver','ca'],['Edinburgh','gb'],['Nazare','pt'],['Funchal','pt'],
  ['Corfu','gr'],['Jackson Hole','us'],['Niagara Falls','ca']];
const ALT = { 'new-york': ['new-york'], 'hong-kong': ['hong-kong'], 'rio-de-janeiro': ['rio-de-janeiro'], 'cape-town': ['cape-town'], 'jackson-hole': ['jackson'], 'corfu': ['corfu-town'], 'madeira': ['funchal'], 'key-west': ['key-west'], 'niagara-falls': ['niagara-falls'], 'reykjavik': ['reykjavik'], 'zurich': ['zurich'], 'geneva': ['geneve', 'geneva'], 'munich': ['munich', 'munchen'], 'vienna': ['vienna', 'wien'], 'prague': ['prague'], 'lisbon': ['lisbon', 'lisboa'], 'florence': ['florence', 'firenze'], 'venice': ['venice', 'venezia'], 'rome': ['rome', 'roma'], 'milan': ['milan', 'milano'], 'naples': ['naples', 'napoli'], 'athens': ['athens'], 'nazare': ['nazare'] };
for (const [name, cc] of cities) { const s = slug(name); jobs.push(['city:' + (name === 'Funchal' ? 'madeira' : s), (ALT[s] || [s]).map(x => `city/${cc}/${x}`)]); }
const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
for (const st of states) jobs.push(['state:' + slug(st), [`region/us/${slug(st)}`]]);
const cams = JSON.parse(fs.readFileSync(path.join(R, 'all-cams.json')));
const countries = [...new Set(cams.map(c => c.country).filter(c => c && c !== 'XX' && c !== 'CB' && c !== 'AQ'))];
for (const co of countries) jobs.push(['country:' + co, [`country/${co.toLowerCase()}`]]);

async function ok(p) {
  try {
    const r = await fetch(`https://www.booking.com/${p}.html`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB,en;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    const end = new URL(r.url).pathname;
    // Kept only if we end up on the page we asked for (Booking adds a language suffix such as .en-gb.html).
    return r.status === 200 && end.replace(/\.[a-z-]+\.html$|\.html$/, '') === '/' + p ? 'yes' : 'no:' + r.status + ':' + end.slice(0, 40);
  } catch (e) { return 'err'; }
}
(async () => {
  let n = 0;
  for (const [key, cands] of jobs) {
    if (out[key]) continue;
    for (const p of cands) {
      if (tried[p] && tried[p] !== 'err') { if (tried[p] === 'yes') { out[key] = p; break; } continue; }
      const res = await ok(p); tried[p] = res; n++;
      if (res === 'yes') { out[key] = p; break; }
      await sleep(900);
    }
    if (n % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); try { fs.writeFileSync(path.join(R, 'net', 'booking-tried.json'), JSON.stringify(tried)); } catch (e) {} }
    await sleep(600);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); try { fs.writeFileSync(path.join(R, 'net', 'booking-tried.json'), JSON.stringify(tried)); } catch (e) {}
  const miss = jobs.filter(j => !out[j[0]]).map(j => j[0] + ' (' + j[1].map(p => tried[p]).join(',') + ')');
  console.log(`BOOKING DONE: ${Object.keys(out).length} of ${jobs.length} have a page. Missing: ${miss.join(' | ') || 'none'}`);
})();
