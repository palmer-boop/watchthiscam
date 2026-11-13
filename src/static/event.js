// Watch This Cam: "happening now" pages. The page sets window.EVT = { alerts: { areas:[..], match:"regex" } }.
// 1) official warnings in force right now (US National Weather Service)  2) live conditions under each camera
(function(){
var EVT=window.EVT||{};
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function when(iso){try{return new Date(iso).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'});}catch(e){return '';}}
// A page built while the event was live stops saying "Happening now" once its end date has gone by.
var st8=$('evstate');if(st8&&st8.dataset.until&&new Date().toISOString().slice(0,10)>st8.dataset.until)st8.textContent='This event has passed · ';

// ---- Warnings in force ----
var box=$('alerts');
if(box&&EVT.alerts&&window.fetch){(function(){
 var re=new RegExp(EVT.alerts.match,'i'),SEV={Extreme:0,Severe:1,Moderate:2,Minor:3,Unknown:4},all=[],left=EVT.alerts.areas.length,failed=0;
 function done(){
  if(--left>0)return;
  if(failed===EVT.alerts.areas.length){box.innerHTML='<p class="note">The National Weather Service did not answer just now. Reload to try again.</p>';return;}
  var seen={},rows=[];
  all.sort(function(a,b){return (SEV[a.severity]-SEV[b.severity])||(a.event<b.event?-1:1);});
  all.forEach(function(p){var k=p.event+'|'+p.senderName+'|'+p.areaDesc;if(seen[k])return;seen[k]=1;rows.push(p);});
  var now=Date.now();rows=rows.filter(function(p){var e=Date.parse(p.ends||p.expires||'');return !e||e>now;});
  if(!rows.length){box.innerHTML='<p class="note">No warnings of this kind are in force right now. The storm may have passed, or not have reached the area yet.</p>';}
  else box.innerHTML=rows.slice(0,30).map(function(p){var area=String(p.areaDesc||'').split(';').slice(0,4).join(';')+(String(p.areaDesc||'').split(';').length>4?' and more':'');
   return '<div class="rankrow nolink"><span class="rk"></span><span class="nm"><b>'+esc(p.event)+'</b><i>'+esc(area)+'. Until '+esc(when(p.ends||p.expires))+' your time.</i></span><span class="val" style="font-size:13px;font-weight:600">'+esc(String(p.senderName||'').replace(/^NWS /,''))+'</span></div>';}).join('');
  var st=$('alertstamp');if(st)st.textContent='Checked at '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+' your time'+(rows.length?', '+rows.length+' in force':'')+'.';
 }
 EVT.alerts.areas.forEach(function(a){
  fetch('https://api.weather.gov/alerts/active?area='+a,{headers:{Accept:'application/geo+json'}}).then(function(r){return r.ok?r.json():Promise.reject();}).then(function(j){
   (j.features||[]).forEach(function(f){var p=f.properties||{};if(re.test(p.event||''))all.push(p);});done();
  }).catch(function(){failed++;done();});});
})();}

// ---- Conditions at each camera (temperature, snow or rain, gusts) ----
var cards=[].slice.call(document.querySelectorAll('.card[data-la]'));
if(cards.length&&window.fetch){(function(){
 var pts=cards.map(function(c){return [(+c.dataset.la).toFixed(2),(+c.dataset.ln).toFixed(2)];});
 function word(code){if(code>=95)return 'thunderstorm';if((code>=71&&code<=77)||code===85||code===86)return 'snowing';if((code>=51&&code<=67)||(code>=80&&code<=82))return 'raining';if(code===45||code===48)return 'fog';return '';}
 function fill(list,offset){list.forEach(function(o,i){var el=cards[offset+i]&&cards[offset+i].querySelector('.cond');if(!el||!o||!o.current)return;var c=o.current,bits=[];
   if(c.temperature_2m!=null)bits.push(Math.round(c.temperature_2m)+'°C / '+Math.round(c.temperature_2m*9/5+32)+'°F');
   var w=word(c.weather_code);if(w)bits.push(w);
   if(c.wind_gusts_10m!=null&&c.wind_gusts_10m>=30)bits.push('gusts '+Math.round(c.wind_gusts_10m)+' km/h ('+Math.round(c.wind_gusts_10m/1.609)+' mph)');
   el.textContent=bits.join(' · ');});}
 for(var s=0;s<pts.length;s+=80)(function(s){var part=pts.slice(s,s+80);
  fetch('https://api.open-meteo.com/v1/forecast?latitude='+part.map(function(p){return p[0];}).join(',')+'&longitude='+part.map(function(p){return p[1];}).join(',')+'&current=temperature_2m,weather_code,wind_gusts_10m')
   .then(function(r){return r.json();}).then(function(j){fill(Array.isArray(j)?j:[j],s);}).catch(function(){});})(s);
})();}

// ---- Map of the cameras on this page ----
if(window.L&&$('bigmap')&&cards.length){try{
 var map=L.map('bigmap',{scrollWheelZoom:false,preferCanvas:true}),b=[];
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',subdomains:'abc',maxZoom:12,minZoom:2}).addTo(map);
 cards.forEach(function(c){var la=+c.dataset.la,ln=+c.dataset.ln,nm=(c.querySelector('.meta b')||{}).textContent||'';b.push([la,ln]);
  L.circleMarker([la,ln],{radius:6,weight:2,color:'#2f80ed',fillColor:c.querySelector('.pill.snap')?'#f5b301':'#5aa2ff',fillOpacity:.9}).bindPopup('<a href="'+c.getAttribute('href')+'" style="font:600 14px system-ui;color:#0b6bcb;text-decoration:none">'+esc(nm)+'</a>').addTo(map);});
 map.fitBounds(b,{padding:[24,24],maxZoom:9});}catch(e){}}
})();
