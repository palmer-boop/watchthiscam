// Live cams that run in another network's own player (not YouTube): ipcamlive, Angelcam, rtsp.me, Brownrice,
// WetMet, Ivideon, livespotting, Panomax, Vision-Environnement. These players are made to be embedded.
// Also cruise-ship bridge cams that the cruise lines publish as plain images (-> more-raw13.json).
// Names, countries and kinds below are written by hand; the player address for each comes from a scan file.
//   node gen-players.js <player-cands.json>   -> players-raw.json + more-raw13.json
// Left out on purpose: Nest home cameras, indoor cameras (shops, baths, churches), sports clubs, border posts.
// players-reject.json = struck out after looking at a snapshot of each one: hotel pools, black or stuck players,
// Ivideon (needs a click, so it could not be checked), Panomax (full-page viewer with the operator's sales banners).
const fs = require('fs'), path = require('path');
const cands = JSON.parse(fs.readFileSync(process.argv[2]));
const bySlug = {}; for (const c of cands) bySlug[c.slug] = c;
const US = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', CA: 'California', CO: 'Colorado', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', ID: 'Idaho', KS: 'Kansas', KY: 'Kentucky', MI: 'Michigan', MT: 'Montana', NH: 'New Hampshire', NM: 'New Mexico', NY: 'New York', OH: 'Ohio', OK: 'Oklahoma', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', WA: 'Washington', WI: 'Wisconsin' };
// slug | name | country | US state | kind ('other' when the slug does not say what the camera looks at)
const T = `
paddington-live-webcam-london-uk|Paddington, London|GB||city
nashville-live-webcam-tennessee|Nashville, Tennessee|US|TN|city
crested-butte-live-webcam|Crested Butte, Colorado|US|CO|mountain
gregory-buttes-webcam|Gregory Butte, Lake Powell|US||nature
deadwood-webcam|Deadwood, South Dakota|US|SD|city
norfolk-broads-webcam|Norfolk Broads|GB||nature
akumal-webcam|Akumal|MX||beach
timmins-webcam-ontario-canada|Timmins, Ontario|CA||city
hamilton-harbour-bermuda-webcam|Hamilton Harbour, Bermuda|BM||harbour
loch-ness-webcam-inverness-scotland|Loch Ness, Scotland|GB||nature
cesis-live-webcam-latvia|Cēsis|LV||city
glenwood-springs-webcam-colorado|Glenwood Springs, Colorado|US|CO|city
saint-john-webcam-new-brunswick-canada|Saint John, New Brunswick|CA||city
el-gouna-webcam-hurghada-egypt|El Gouna, Hurghada|EG||beach
mawgan-porth-cornwall-live-cam-uk|Mawgan Porth, Cornwall|GB||beach
tenby-harbor-wales-live-webcam-uk|Tenby Harbour, Wales|GB||harbour
tralee-bay-park-webcam-benderloch-scotland|Tralee Bay, Benderloch, Scotland|GB||beach
bryher-isles-of-scilly-uk-live-webcam|Bryher, Isles of Scilly|GB||nature
vagur-webcam|Vágur, Faroe Islands|FO||harbour
new-delhi-webcam-india|New Delhi|IN||city
ponta-preta-live-cam-cape-verde|Ponta Preta, Sal, Cape Verde|CV||beach
tsada-cyprus-live-webcam|Tsada, Cyprus|CY||other
cabarete-dominican-republic-live-webcam|Cabarete, Dominican Republic|DO||beach
topeka-webcam|Topeka, Kansas|US|KS|city
taupo-webcam|Taupō|NZ||nature
mykines-webcam|Mykines, Faroe Islands|FO||nature
torshavn-webcam|Tórshavn, Faroe Islands|FO||harbour
clarksville-webcam|Clarksville|US||city
wichita-webcam|Wichita, Kansas|US|KS|city
skalavik-webcam|Skálavík, Faroe Islands|FO||harbour
narragansett-webcam|Narragansett, Rhode Island|US|RI|beach
chobe-national-park-webcam-botswana|Chobe National Park, Botswana|BW||wildlife
leirvik-live-cam-faroe-islands|Leirvík, Faroe Islands|FO||harbour
klaksvik-webcam|Klaksvík, Faroe Islands|FO||harbour
zabljak-montenegro-live-webcam|Žabljak, Montenegro|ME||mountain
lake-cumberland-kentucky-webcam|Lake Cumberland, Kentucky|US|KY|nature
austurvollur-webcam-reykjavik-iceland|Austurvöllur square, Reykjavik|IS||city
mountain-village-colorado-live-webcam|Mountain Village, Colorado|US|CO|mountain
island-park-webcam|Island Park, Idaho|US|ID|nature
graeagle-webcam|Graeagle, California|US|CA|other
bondi-beach-webcam|Bondi Beach, Sydney|AU||beach
dubrovnik-webcam|Dubrovnik|HR||city
kolasin-webcam|Kolašin, Montenegro|ME||mountain
barcelona-live-today|Barcelona|ES||city
surf-center-eilat-israel-live-webcam|Surf Center, Eilat|IL||beach
ashkelon-live-webcam-israel|Ashkelon|IL||beach
kiryat-haim-webcam-israel|Kiryat Haim beach, Haifa|IL||beach
santa-maria-sal-island-cape-verde-live-cam|Santa Maria, Sal, Cape Verde|CV||other
aremiti-6-ferry-webcam-french-polynesia|Aremiti 6 ferry, French Polynesia|PF||harbour
arenzano-webcam-italy|Arenzano|IT||harbour
zolder-circuit-webcam-heusden-zolder-belgium|Circuit Zolder|BE||other
north-conway-country-club-webcam-new-hampshire|North Conway Country Club, New Hampshire|US|NH|mountain
apex-mountain-resort-webcam-british-columbia-canada|Apex Mountain Resort, British Columbia|CA||ski
galway-ireland-live-webcam|Galway|IE||city
calpe-live-webcam-alicante-spain|Calpe, Alicante|ES||beach
tinajo-webcam-canary-islands-spain|Tinajo, Lanzarote|ES||other
el-oasis-webcam-las-palmas-spain|El Oasis, Las Palmas|ES||beach
eisenerz-live-webcam-austria|Eisenerz|AT||mountain
pompano-beach-webcam-florida|Pompano Beach, Florida|US|FL|beach
horseheads-webcam|Horseheads, New York|US|NY|city
mansfield-pa-webcam|Mansfield, Pennsylvania|US|PA|city
corning-webcam|Corning, New York|US|NY|city
corner-brook-webcam|Corner Brook, Newfoundland|CA||city
bass-lake-webcam|Bass Lake, California|US|CA|nature
south-lake-tahoe-webcam|South Lake Tahoe, California|US|CA|nature
stevens-pass-webcam|Stevens Pass, Washington|US|WA|ski
kollen-park-webcam-holland-michigan|Kollen Park, Holland, Michigan|US|MI|nature
sanibel-island-webcam|Sanibel Island, Florida|US|FL|beach
blue-ridge-webcam|Blue Ridge, Georgia|US|GA|other
blue-mountain-pa-webcam|Blue Mountain, Pennsylvania|US|PA|ski
downtown-grand-rapids-webcam|Downtown Grand Rapids, Michigan|US|MI|city
jasper-alabama-webcam|Jasper, Alabama|US|AL|city
crystal-river-webcam|Crystal River, Florida|US|FL|harbour
oklahoma-city-webcam|Oklahoma City|US|OK|city
atlanta-webcam|Atlanta, Georgia|US|GA|city
blanchard-webcam|Blanchard|US||other
flagstaff-webcam|Flagstaff, Arizona|US|AZ|city
governors-harbour-webcam-eleuthera-the-bahamas|Governor's Harbour, Eleuthera, Bahamas|BS||harbour
pagosa-springs-webcam|Pagosa Springs, Colorado|US|CO|city
lake-leelanau-webcam|Lake Leelanau, Michigan|US|MI|other
painesville-township-park-webcam|Painesville Township Park, Ohio|US|OH|beach
skagen-harbour-webcam|Skagen Harbour|DK||harbour
fort-myers-beach-webcam|Fort Myers Beach, Florida|US|FL|beach
custer-webcam|Custer, South Dakota|US|SD|city
beaver-island-webcam|Beaver Island, Michigan|US|MI|harbour
porth-beach-webcam-newquay-uk|Porth Beach, Newquay|GB||beach
big-texan-steak-ranch-webcam|The Big Texan Steak Ranch, Amarillo|US|TX|other
frederikshavn-live-webcam-denmark|Frederikshavn|DK||harbour
denizkizi-beach-webcam|Denizkızı Beach|TR||beach
bethany-beach-webcam|Bethany Beach, Delaware|US|DE|beach
sturgeon-bay-wisconsin-live-cam|Sturgeon Bay, Wisconsin|US|WI|harbour
watch-elephants-live-at-aberdare-national-park-in-kenya|Aberdare National Park, Kenya|KE||wildlife
red-river-webcam-new-mexico|Red River, New Mexico|US|NM|mountain
red-lodge-webcam-montana|Red Lodge, Montana|US|MT|city
mt-laguna-webcam-california|Mount Laguna, California|US|CA|mountain
las-condes-webcam-chile|Las Condes, Santiago|CL||city
juneau-live-webcam-alaska|Juneau, Alaska|US|AK|harbour
charleston-webcam-south-carolina|Charleston, South Carolina|US|SC|city
oludeniz-webcam-turkey|Ölüdeniz|TR||beach
peneco-beach-webcam-albufeira-portugal|Praia do Peneco, Albufeira|PT||beach
kuressaare-webcam-estonia|Kuressaare|EE||harbour
kopaonik-live-webcam-serbia|Kopaonik|RS||ski
yakutsk-webcam|Yakutsk|RU||city
grunnfarnes-live-cam-senja-norway|Grunnfarnes, Senja|NO||nature
batumi-webcam-georgia|Batumi|GE||city
murmansk-russia-live-webcam|Murmansk|RU||city
phuket-live-webcam-thailand|Phuket|TH||beach
kislovodsk-webcam-russia|Kislovodsk|RU||city
rif-harbor-webcam|Rif Harbour, Iceland|IS||harbour
arnarstapi-webcam|Arnarstapi, Iceland|IS||nature
borgie-lodge-webcam|Borgie Lodge, Scotland|GB||nature
st-andrews-airport-webcam|St. Andrews Airport, Manitoba|CA||transport
steinbach-south-airport-webcam|Steinbach South Airport, Manitoba|CA||transport
asenovgrad-webcam|Asenovgrad|BG||city
belfast-lough-webcam|Belfast Lough|GB||harbour
caseville-webcam-live-look-at-a-lake-huron-beach-town|Caseville, Lake Huron, Michigan|US|MI|beach
nissi-beach-webcam-live-view-of-ayia-napa-cyprus|Nissi Beach, Ayia Napa|CY||beach
lymm-webcam-cheshire-united-kingdom|Lymm, Cheshire|GB||other
innerleithen-webcam-scotland-uk|Innerleithen, Scotland|GB||other
stummerberg-tirol-live-webcam-austria|Stummerberg, Tyrol|AT||mountain
whitby-live-webcam-uk|Whitby|GB||harbour
tufan-mountain-webcam|Tufandag mountain resort|AZ||ski
paarl-golf-club-webcam-paarl-south-africa|Paarl Golf Club|ZA||other
limone-sul-garda-live-webcam-italy|Limone sul Garda, Lake Garda|IT||nature
bad-bruckenau-webcam|Bad Brückenau|DE||city
white-stork-nest-webcam-pfreimd-germany|White stork nest, Pfreimd|DE||wildlife
hamburg-harbor-webcam|Hamburg Harbour|DE||harbour
stade-live-cam-germany|Stade|DE||city
westerland-webcam-sylt-germany|Westerland, Sylt|DE||beach
garmisch-partenkirchen-webcam|Garmisch-Partenkirchen|DE||mountain
tiefenbach-glacier-webcam|Tiefenbach Glacier, Sölden|AT||ski
lodalen-loen-live-webcam-norway|Lodalen, Loen|NO||nature
mount-shahdag-live-cam-azerbaijan|Shahdag Mountain Resort|AZ||ski
crystal-serenity-webcam|Crystal Serenity cruise ship|XX||harbour
ms-europa-webcam|MS Europa cruise ship|XX||harbour
ms-europa-2-webcam|MS Europa 2 cruise ship|XX||harbour
hanseatic-nature-webcam|Hanseatic nature expedition ship|XX||harbour
hanseatic-inspiration-webcam|Hanseatic inspiration expedition ship|XX||harbour
hanseatic-spirit-webcam|Hanseatic spirit expedition ship|XX||harbour
mv-viking-sea-webcam|Viking Sea cruise ship|XX||harbour
viking-jupiter-webcam|Viking Jupiter cruise ship|XX||harbour
viking-mars-webcam|Viking Mars cruise ship|XX||harbour
viking-octantis-webcam|Viking Octantis expedition ship|XX||harbour
`.trim().split('\n').map(l => l.split('|'));
const NET = { ipcamlive: 'ipcamlive', angelcam: 'Angelcam', rtspme: 'rtsp.me', brownrice: 'Brownrice', wetmet: 'WetMet', ivideon: 'Ivideon', livespotting: 'livespotting', panomax: 'Panomax', visionenv: 'Vision-Environnement' };
// Tidy each network's player address: autoplay muted where the player supports it, no tracking leftovers.
function cleanUrl(net, u) {
  const x = new URL(u);
  if (net === 'ipcamlive') return `https://ipcamlive.com/player/player.php?alias=${encodeURIComponent(x.searchParams.get('alias'))}&autoplay=1`;
  if (net === 'angelcam') return `https://v.angelcam.com/iframe?v=${encodeURIComponent(x.searchParams.get('v'))}&autoplay=1`;
  if (net === 'rtspme') return `https://rtsp.me/embed/${x.pathname.split('/').filter(Boolean).pop()}/`;
  if (net === 'brownrice') return `https://player.brownrice.com/embed/${x.pathname.split('/').pop().split('&')[0]}`;
  if (net === 'wetmet') return `https://api.wetmet.net/widgets/stream/frame.php?uid=${encodeURIComponent(x.searchParams.get('uid'))}`;
  if (net === 'ivideon') return `https://open.ivideon.com/embed/v2/?server=${encodeURIComponent(x.searchParams.get('server'))}&camera=${encodeURIComponent(x.searchParams.get('camera'))}&width=&height=&lang=en`;
  if (net === 'livespotting') return `https://player.livespotting.com/?alias=${encodeURIComponent(x.searchParams.get('alias'))}&ch=${encodeURIComponent(x.searchParams.get('ch'))}`;
  return x.origin + x.pathname;   // panomax, vision-environnement
}
const out = [], miss = [];
for (const [slug, name, cc, st, cat] of T) {
  const c = bySlug[slug]; if (!c || !NET[c.net]) { miss.push(slug); continue; }
  out.push({ name, country: cc, ...(st ? { state: US[st] } : {}), category: cat, network: NET[c.net], embedUrl: cleanUrl(c.net, c.e), sourcePage: cleanUrl(c.net, c.e) });
}
fs.writeFileSync(path.join(__dirname, 'players-raw.json'), JSON.stringify(out, null, 1));
// Cruise ships: the lines' own bridge-cam images (Princess, Norwegian). The ship's name is in the image address.
const ships = [];
const cap = s => s.replace(/\b[a-z]/g, m => m.toUpperCase());
for (const c of cands.filter(c => c.net === 'shipimg')) {
  const line = /princess\.com/.test(c.e) ? 'Princess Cruises' : /ncl\.com/.test(c.e) ? 'Norwegian Cruise Line' : null;
  if (!line) continue;   // AIDA blocks embedding
  const ship = cap(c.slug.replace(/-webcam$/, '').replace(/-/g, ' '));
  ships.push({ name: `${ship} bridge cam`, country: 'XX', category: 'harbour', imageUrl: c.e, isMjpeg: false, refreshSeconds: 60, operator: line,
    sourcePage: line === 'Princess Cruises' ? 'https://www.princess.com/learn/cruise-ships/bridge-cams/' : 'https://www.ncl.com/', terms: `Bridge camera image published by ${line} on its own website` });
}
fs.writeFileSync(path.join(__dirname, 'more-raw13.json'), JSON.stringify(ships, null, 1));
console.log('players:', out.length, '| ships:', ships.length, '| table rows with no scan match:', miss.join(', ') || 'none');
