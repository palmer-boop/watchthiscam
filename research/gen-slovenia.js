// Build a thinned, varied Slovenia (ARSO) cam set: node gen-slovenia.js -> more-raw.json
const fs = require('fs');
const base = a => `https://meteo.arso.gov.si/uploads/probase/www/observ/webcam/${a}_dir/siwc_${a}`;
// [alias, [dirs to keep], name, location, category]  -- 1-2 best angles per station for variety
const S = [
  ['CELJE_MEDLOG', ['n'], 'Celje Medlog', 'Celje, Slovenia', 'weather'],
  ['CERKN-JEZ', ['e', 's'], 'Lake Cerknica', 'Lake Cerknica, Slovenia', 'nature'],
  ['KREDA-ICA', ['e', 'se'], 'Kredarica (Mt Triglav)', 'Kredarica, Slovenia', 'mountain'],
  ['KRN', ['n'], 'Mount Krn', 'Krn, Slovenia', 'mountain'],
  ['LJUBL-ANA_BEZIGRAD', ['nw'], 'Ljubljana — Bežigrad', 'Ljubljana, Slovenia', 'city'],
  ['LJUBL-ANA_BRNIK', ['n'], 'Ljubljana Airport', 'Brnik, Slovenia', 'transport'],
  ['MARIBOR_SLIVNICA', ['nw'], 'Maribor Airport', 'Slivnica pri Mariboru, Slovenia', 'transport'],
  ['NOVA-GOR_BILJE', ['e'], 'Bilje, Nova Gorica', 'Bilje, Slovenia', 'weather'],
  ['NOVO-MES', ['n'], 'Novo mesto', 'Novo mesto, Slovenia', 'city'],
  ['PORTOROZ_SECOVLJE', ['nw'], 'Portorož Airport', 'Sečovlje, Slovenia', 'transport'],
  ['POSTOJNA', ['n'], 'Postojna', 'Postojna, Slovenia', 'city'],
  ['SLOVE-GRA', ['n'], 'Slovenj Gradec', 'Slovenj Gradec, Slovenia', 'weather'],
  ['TOLMIN_VOLCE', ['ne'], 'Tolmin — Volče valley', 'Volče, Slovenia', 'mountain'],
];
const out = [];
for (const [a, dirs, name, location, category] of S) {
  dirs.forEach((d, i) => out.push({
    name: dirs.length > 1 ? `${name} (${d.toUpperCase()})` : name,
    location, country: 'SI', category,
    imageUrl: `${base(a)}_${d}_latest.jpg`, isMjpeg: false, https: true, refreshSeconds: 600,
    operator: 'Slovenian Environment Agency (ARSO)',
    sourcePage: 'https://meteo.arso.gov.si/met/sl/app/webmet/',
    terms: 'Reuse permitted with attribution: Vir: ARSO.', verified: '',
  }));
}
fs.writeFileSync('more-raw.json', JSON.stringify(out, null, 1));
console.log('wrote', out.length, 'Slovenia cams to more-raw.json');
