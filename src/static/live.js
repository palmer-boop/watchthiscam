// Watch This Cam: the "right now" pages (warmest / coldest cams, northern lights, earthquakes).
// The page says which one it is with <body data-live="warm|cold|aurora|quakes">.
(function(){
var mode=document.body.getAttribute('data-live');
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function row(rk,href,img,name,sub,val,small){
 return '<a class="rankrow" href="'+href+'"><span class="rk">'+rk+'</span><img loading="lazy" src="'+esc(img)+'" alt="" onerror="this.style.visibility=\'hidden\'"><span class="nm"><b>'+esc(name)+'</b><i>'+esc(sub)+'</i></span><span class="val">'+val+(small?'<small>'+small+'</small>':'')+'</span></a>';}
function clock(d){return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});}
function ago(ms){var m=Math.round((Date.now()-ms)/60000);if(m<60)return m+' min ago';var h=Math.round(m/60);if(h<48)return h+' hours ago';return Math.round(h/24)+' days ago';}
function km(a,b,c,d){var R=6371,t=Math.PI/180,x=(c-a)*t,y=(d-b)*t,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*t)*Math.cos(c*t)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h));}
// Height of the sun above the horizon, in degrees (negative = below).
function sunAlt(lat,lon,ms){var r=Math.PI/180,n=ms/86400000-10957.5,L=(280.46+0.9856474*n)%360,g=(357.528+0.9856003*n)*r,
 lam=(L+1.915*Math.sin(g)+0.02*Math.sin(2*g))*r,eps=23.439*r,dec=Math.asin(Math.sin(eps)*Math.sin(lam)),ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),
 gmst=(18.697374558+24.06570982441908*n)%24,ha=(gmst*15+lon)*r-ra;
 return Math.asin(Math.sin(lat*r)*Math.sin(dec)+Math.cos(lat*r)*Math.cos(dec)*Math.cos(ha))/r;}

// ---- Warmest / coldest cams right now ----
if(mode==='warm'||mode==='cold'){(function(){
 var P=window.NOWPTS||[],key='wtc_temps2',c=null;
 function paint(){
  var a=[];for(var i=0;i<P.length;i++)if(c.t[i]!=null)a.push({p:P[i],t:c.t[i]});
  if(!a.length){$('rank').innerHTML='<p class="note">The weather service did not answer just now. Try again in a minute.</p>';return;}
  a.sort(function(x,y){return mode==='warm'?y.t-x.t:x.t-y.t;});
  $('rank').innerHTML=a.slice(0,25).map(function(o,i){return row(i+1,'/cam/'+o.p[0]+'.html',o.p[3],o.p[1],o.p[2],Math.round(o.t)+'°C',Math.round(o.t*9/5+32)+'°F');}).join('');
  var b=a[0];$('big').textContent=Math.round(b.t)+'°C';
  $('bigtxt').innerHTML=(mode==='warm'?'The warmest':'The coldest')+' of the '+a.length+' cam locations we checked: <a href="/cam/'+b.p[0]+'.html">'+esc(b.p[1])+'</a>'+(b.p[2]&&b.p[1].indexOf(b.p[2])<0?', '+esc(b.p[2]):'')+'. That is '+Math.round(b.t*9/5+32)+'°F.';
  $('stamp').textContent='Checked at '+clock(new Date(c.at))+' your time. Reload for the latest.';
 }
 try{c=JSON.parse(sessionStorage.getItem(key)||'null')}catch(e){}
 if(c&&c.n===P.length&&Date.now()-c.at<900000){paint();return;}
 var t=new Array(P.length),jobs=[],sz=80;
 for(var s=0;s<P.length;s+=sz)(function(s){var part=P.slice(s,s+sz);
  jobs.push(fetch('https://api.open-meteo.com/v1/forecast?latitude='+part.map(function(p){return p[4];}).join(',')+'&longitude='+part.map(function(p){return p[5];}).join(',')+'&current=temperature_2m')
   .then(function(r){return r.json();}).then(function(j){var arr=Array.isArray(j)?j:[j];arr.forEach(function(o,i){if(o&&o.current&&o.current.temperature_2m!=null)t[s+i]=o.current.temperature_2m;});}).catch(function(){}));})(s);
 Promise.all(jobs).then(function(){c={at:Date.now(),n:P.length,t:t};
  if(t.some(function(x){return x!=null;})){try{sessionStorage.setItem(key,JSON.stringify(c))}catch(e){}}
  paint();});
})();}

// ---- Northern lights tonight ----
if(mode==='aurora'){(function(){
 var KP=[[0,'Quiet','The aurora is faint and stays in the far north.'],[3,'Unsettled','A decent night in the far north if the sky is clear.'],[4,'Active','Good odds across the aurora zone tonight.'],
  [5,'Storm, G1','A geomagnetic storm. The lights can reach further south than usual.'],[6,'Storm, G2','A moderate storm. The lights can reach well beyond the Arctic.'],
  [7,'Storm, G3','A strong storm. The aurora can be seen far from the poles.'],[8,'Storm, G4','A severe storm. A rare, widespread display is possible.'],[9,'Storm, G5','An extreme storm, the top of the scale.']];
 function word(k){var w=KP[0];for(var i=0;i<KP.length;i++)if(k>=KP[i][0])w=KP[i];return w;}
 fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json').then(function(r){return r.json();}).then(function(j){
  var rows=j.filter(function(x){return x&&x.time_tag&&x.Kp!=null;});if(!rows.length)throw 0;
  var last=rows[rows.length-1],k=parseFloat(last.Kp),w=word(k);
  $('big').textContent='Kp '+(Math.round(k*10)/10);
  $('bigtxt').textContent=w[1]+'. '+w[2]+' Measured by NOAA for the three hours from '+clock(new Date(last.time_tag+'Z'))+' your time.';
 }).catch(function(){$('bigtxt').textContent='NOAA did not answer just now. Try again in a minute.';});
 fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json').then(function(r){return r.json();}).then(function(j){
  var days={},order=[];
  j.forEach(function(x){if(!x||!x.time_tag||x.kp==null||x.observed==='observed')return;var d=new Date(x.time_tag+'Z');if(d.getTime()<Date.now()-10800000)return;
   var key=d.toLocaleDateString([], {weekday:'long'});if(!(key in days)){days[key]=0;order.push(key);}days[key]=Math.max(days[key],parseFloat(x.kp));});
  if(!order.length)return;
  $('kpdays').innerHTML=order.slice(0,4).map(function(d,i){var k=days[d];return '<div><span>'+(i===0?'Rest of today':esc(d))+'</span><b>Kp '+(Math.round(k*10)/10)+'</b><br><i class="note">'+word(k)[1]+'</i></div>';}).join('');
  $('kpwrap').hidden=false;
 }).catch(function(){});
 // Which aurora-zone cams are in the dark right now.
 var list=$('rank');if(list){var rows=[].slice.call(list.querySelectorAll('.rankrow')),now=Date.now();
  rows.forEach(function(el){var a=sunAlt(+el.dataset.la,+el.dataset.ln,now),v=el.querySelector('.val');el._a=a;
   v.innerHTML=a<-9?'Dark now':a<0?'Twilight':'Daylight';v.style.color=a<-9?'':'var(--muted)';});
  rows.sort(function(x,y){return x._a-y._a;}).forEach(function(el,i){el.querySelector('.rk').textContent=i+1;list.appendChild(el);});}
})();}

// ---- Earthquakes this week, and the nearest cam to each ----
if(mode==='quakes'){(function(){
 var cams=(window.CAMMETA||[]).filter(function(m){return m.x;});
 function nearest(la,ln){var b=null,bd=1e9;for(var i=0;i<cams.length;i++){var d=km(la,ln,cams[i].la,cams[i].ln);if(d<bd){bd=d;b=cams[i];}}return bd<=400?{c:b,km:bd}:null;}
 var map=null;try{map=L.map('bigmap',{worldCopyJump:true,preferCanvas:true}).setView([20,10],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',subdomains:'abc',maxZoom:9,minZoom:1}).addTo(map);}catch(e){}
 fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson').then(function(r){return r.json();}).then(function(j){
  var f=(j.features||[]).filter(function(x){return x&&x.properties&&x.geometry&&x.properties.mag!=null;});
  f.sort(function(a,b){return b.properties.time-a.properties.time;});
  if(!f.length){$('bigtxt').textContent='No earthquakes of magnitude 4.5 or more in the past week.';return;}
  var big=f.slice().sort(function(a,b){return b.properties.mag-a.properties.mag;})[0];
  $('big').textContent='M '+big.properties.mag.toFixed(1);
  $('bigtxt').textContent='The strongest of '+f.length+' earthquakes of magnitude 4.5 or more in the past 7 days: '+big.properties.place+', '+ago(big.properties.time)+'. Data from the US Geological Survey.';
  f.forEach(function(q){var c=q.geometry.coordinates,p=q.properties,n=nearest(c[1],c[0]);q._n=n;
   if(map){var mk=L.circleMarker([c[1],c[0]],{radius:3+(p.mag-4.5)*4,weight:1,color:'#ff3b4e',fillColor:'#ff3b4e',fillOpacity:.35});
    mk.bindPopup('<b style="font:700 14px system-ui">M '+p.mag.toFixed(1)+'</b><br><span style="font:13px system-ui">'+esc(p.place)+'<br>'+ago(p.time)+(n?'<br>Nearest cam: <a href="/cam/'+n.c.i+'.html">'+esc(n.c.n)+'</a> ('+Math.round(n.km)+' km)':'')+'</span>');mk.addTo(map);}});
  $('rank').innerHTML=f.slice(0,40).map(function(q){var p=q.properties,c=q.geometry.coordinates,n=q._n;
   return '<div class="rankrow nolink"><span class="rk"></span><span class="nm"><b>'+esc(p.place)+'</b><i>'+ago(p.time)+', '+Math.round(c[2])+' km deep'+(n?'. Nearest cam: <a href="/cam/'+n.c.i+'.html">'+esc(n.c.n)+'</a>, '+Math.round(n.km)+' km away':'')+'</i></span><span class="val">'+p.mag.toFixed(1)+'</span></div>';}).join('');
 }).catch(function(){$('bigtxt').textContent='The US Geological Survey feed did not answer just now. Try again in a minute.';});
})();}
})();
