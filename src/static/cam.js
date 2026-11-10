// Watch This Cam: everything a cam page does. The page sets window.CAM = { id, n, la, ln, loc, tz }.
(function(){
var CAM=window.CAM||{},cur=CAM.id,ids=(window.IDS||[cur]);
var REPORT_URL='https://wtc-report.dark-frog-60a0.workers.dev/report';
function $(i){return document.getElementById(i);}

// Retro TV-static flash when flipping channels (shuffle / auto surf).
var sc=$('tvstatic'),chEl=$('tvch');
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
function vidOnly(){try{return localStorage.getItem('wtc_vid')==='1'}catch(e){return false}}
function rnd(){var vids=(window.VIDS||[]),base=ids;
 // Lead with live video: the toggle forces it, otherwise ~60% of shuffles land on a video cam.
 if(vids.length>5&&(vidOnly()||Math.random()<0.6))base=vids;
 var pool=base;
 if(smart()){var day=base.filter(function(id){return id!==cur&&isDay(id);});if(day.length>5)pool=day;}
 var sn=seen(),fresh=pool.filter(function(id){return id!==cur&&sn.indexOf(id)<0;});
 if(fresh.length>3)pool=fresh;   // avoid cams already seen this session
 var id=cur,n=0;while(id===cur&&pool.length>1&&n++<40)id=pool[Math.floor(Math.random()*pool.length)];return '/cam/'+id+'.html';}
// Remember this cam: for avoid-repeat surfing (session) and the Recently-watched row (persistent)
try{var _sn=seen();if(_sn.indexOf(cur)<0){_sn.push(cur);if(_sn.length>60)_sn=_sn.slice(-60);sessionStorage.setItem('wtc_seen',JSON.stringify(_sn));}}catch(e){}
try{var _rc=JSON.parse(localStorage.getItem('wtc_recent')||'[]').filter(function(x){return x!==cur;});_rc.unshift(cur);if(_rc.length>12)_rc=_rc.slice(0,12);localStorage.setItem('wtc_recent',JSON.stringify(_rc));}catch(e){}
function goRnd(){var u=rnd();flash(function(){location.href=u;});}
var s=$('surprise');if(s)s.onclick=function(e){e.preventDefault();goRnd();};

// Auto surf: auto-flip to a random cam every DUR, surviving page loads via sessionStorage. Speed in localStorage.
var bar=$('surfbar'),fill=bar.firstChild,btn=$('surf'),sp=$('surfspeed');
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
var favBtn=$('fav'),fid=favBtn.dataset.id;
function paintFav(){var on=favs().indexOf(fid)>=0;favBtn.classList.toggle('on',on);favBtn.innerHTML=on?'♥ Saved':'♡ Save';}
favBtn.onclick=function(){var a=favs(),i=a.indexOf(fid);if(i<0)a.push(fid);else a.splice(i,1);try{localStorage.setItem('wtc_favs',JSON.stringify(a))}catch(e){}paintFav();};
paintFav();
var pl=$('player');
$('fs').onclick=function(){if(document.fullscreenElement)document.exitFullscreen();else if(pl.requestFullscreen)pl.requestFullscreen();};
var shBtn=$('share');
shBtn.onclick=function(){var u=location.href;if(navigator.share){navigator.share({title:CAM.n||document.title,url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){var t=shBtn.innerHTML;shBtn.innerHTML='✓ Copied';setTimeout(function(){shBtn.innerHTML=t;},1500);});}};

// Embed: show the copy-paste code
var eb=$('embedbtn'),ebox=$('embedbox');
if(eb&&ebox){eb.onclick=function(){ebox.hidden=!ebox.hidden;eb.classList.toggle('on',!ebox.hidden);eb.setAttribute('aria-expanded',String(!ebox.hidden));if(!ebox.hidden){var ta=$('embedcode');ta.focus();ta.select();}};
 var cp=$('copyembed');cp.onclick=function(){var ta=$('embedcode');ta.select();function ok(){cp.innerHTML='✓ Copied';setTimeout(function(){cp.innerHTML='Copy code';},1600);}
  if(navigator.clipboard){navigator.clipboard.writeText(ta.value).then(ok,function(){try{document.execCommand('copy');ok();}catch(e){}});}else{try{document.execCommand('copy');ok();}catch(e){}}};}

// Report a dead feed: one report per cam per browser.
var rp=$('report');
if(rp){var rk='wtc_rep_'+cur,sent=false;try{sent=localStorage.getItem(rk)==='1'}catch(e){}
 if(sent){rp.innerHTML='✓ Reported';rp.disabled=true;}
 rp.onclick=function(){if(rp.disabled)return;rp.disabled=true;rp.innerHTML='Sending…';
  fetch(REPORT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({id:cur})}).then(function(r){if(!r.ok)throw 0;
   try{localStorage.setItem(rk,'1')}catch(e){}rp.innerHTML='✓ Thanks, we will check it';}).catch(function(){rp.disabled=false;rp.innerHTML='⚑ Could not send, try again';});};}

// ---- Time, sun and weather at the camera ----
var tz=CAM.tz||'',la=CAM.la,ln=CAM.ln,located=(CAM.loc==='exact'||CAM.loc==='city');
function fmtTime(d){
 if(tz){try{return d.toLocaleTimeString('en-GB',{timeZone:tz,hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s?([ap])m/i,function(_,x){return x.toLowerCase()+'m';});}catch(e){}}
 var m=META[cur],off=m?m.off:0,t=new Date(d.getTime()+off*3600000),h=t.getUTCHours(),mn=t.getUTCMinutes();
 return ((h%12)||12)+':'+(mn<10?'0':'')+mn+(h<12?'am':'pm');}
function localYMD(d){
 if(tz){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(d),o={};p.forEach(function(x){o[x.type]=+x.value;});return [o.year,o.month,o.day];}catch(e){}}
 var t=new Date(d.getTime()+Math.round((ln||0)/15)*3600000);return [t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate()];}
function localHour(d){var m=META[cur],off=m?m.off:0;return ((d.getUTCHours()+d.getUTCMinutes()/60+off)%24+24)%24;}
// Sunrise/sunset for the camera's own calendar day (the standard sunrise equation; good to a minute or two).
function sunTimes(){
 if(la==null||ln==null)return null;
 var r=Math.PI/180,ymd=localYMD(new Date()),n=Date.UTC(ymd[0],ymd[1]-1,ymd[2])/86400000-10957;
 var J=n-ln/360,M=(357.5291+0.98560028*J)%360,Mr=M*r;
 var C=1.9148*Math.sin(Mr)+0.02*Math.sin(2*Mr)+0.0003*Math.sin(3*Mr);
 var lam=((M+C+180+102.9372)%360)*r;
 var Jt=2451545.0+J+0.0053*Math.sin(Mr)-0.0069*Math.sin(2*lam);
 var dec=Math.asin(Math.sin(lam)*Math.sin(23.44*r));
 var cw=(Math.sin(-0.833*r)-Math.sin(la*r)*Math.sin(dec))/(Math.cos(la*r)*Math.cos(dec));
 if(cw>1)return{polar:'night'};if(cw<-1)return{polar:'day'};
 var w=Math.acos(cw)/r/360;function D(j){return new Date((j-2440587.5)*86400000);}
 return{rise:D(Jt-w),set:D(Jt+w)};}
var sun=located?sunTimes():null;
function dayNow(){var d=new Date();
 if(sun){if(sun.polar)return sun.polar==='day';return d>=sun.rise&&d<sun.set;}
 var h=localHour(d);return h>=6&&h<20;}
var lt=$('localtime'),nt=$('nowtime');
if((lt||nt)&&(tz||META[cur])){(function p(){var d=new Date(),txt=(dayNow()?'☀️':'🌙')+' '+fmtTime(d);
 if(lt)lt.textContent=' · '+txt+' local';if(nt)nt.textContent=txt;setTimeout(p,20000);})();}
if(sun&&$('nowrise')){
 if(sun.polar){$('nowrise').textContent=sun.polar==='day'?'Sun up all day':'No sunrise today';$('nowset').textContent=sun.polar==='day'?'No sunset today':'Dark all day';}
 else{$('nowrise').textContent=fmtTime(sun.rise);$('nowset').textContent=fmtTime(sun.set);}}
// Weather right now from MET Norway (free, open data). Cached for an hour per spot.
var WX=[['thunder','Thunderstorm','⛈️'],['sleet','Sleet','🌨️'],['snow','Snow','🌨️'],['heavyrain','Heavy rain','🌧️'],['lightrain','Light rain','🌦️'],['rain','Rain','🌧️'],['fog','Fog','🌫️'],['partlycloudy','Partly cloudy','⛅'],['cloudy','Cloudy','☁️'],['fair','Mostly clear',''],['clearsky','Clear','']];
function paintWx(o){var a=$('nowwx'),b=$('nowwx2');if(!a||o==null||o.t==null)return;
 var label='',icon='',night=/_night$/.test(o.s||'');
 for(var i=0;i<WX.length;i++){if((o.s||'').indexOf(WX[i][0])>=0){label=WX[i][1];icon=WX[i][2]||(night?'🌙':(WX[i][0]==='fair'?'🌤️':'☀️'));break;}}
 a.textContent=(icon?icon+' ':'')+Math.round(o.t)+'°C / '+Math.round(o.t*9/5+32)+'°F';
 var bits=[];if(label)bits.push(label);if(o.w!=null)bits.push('wind '+Math.round(o.w*3.6)+' km/h');
 if(b)b.textContent=bits.join(', ');}
if(located&&$('nowwx')&&window.fetch){(function(){
 var key='wtc_wx_'+la.toFixed(2)+'_'+ln.toFixed(2),c=null;
 try{c=JSON.parse(sessionStorage.getItem(key)||'null')}catch(e){}
 if(c&&Date.now()-c.at<3600000){paintWx(c.d);return;}
 fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat='+la.toFixed(3)+'&lon='+ln.toFixed(3)).then(function(r){return r.ok?r.json():null;}).then(function(j){
  if(!j||!j.properties||!j.properties.timeseries||!j.properties.timeseries.length)throw 0;
  var d=j.properties.timeseries[0].data,det=d.instant.details,nx=d.next_1_hours||d.next_6_hours||{};
  var o={t:det.air_temperature,w:det.wind_speed,s:(nx.summary&&nx.summary.symbol_code)||''};
  try{sessionStorage.setItem(key,JSON.stringify({at:Date.now(),d:o}))}catch(e){}paintWx(o);
 }).catch(function(){var a=$('nowwx');if(a)a.textContent='Not available';});})();}

// Smart surf: skip cams where it's night there
var sn=$('skipnight');
function paintSmart(){sn.classList.toggle('on',smart());sn.innerHTML=(smart()?'☀ ':'🌙 ')+'skip night';}
if(sn){sn.onclick=function(){try{localStorage.setItem('wtc_smart',smart()?'0':'1')}catch(e){}paintSmart();};paintSmart();}
// Video-only toggle: shuffle only to live video cams
var vo=$('vidonly');
function paintVid(){vo.classList.toggle('on',vidOnly());}
if(vo){vo.onclick=function(){try{localStorage.setItem('wtc_vid',vidOnly()?'0':'1')}catch(e){}paintVid();};paintVid();}
// Sound toggle (YouTube cams start muted so they can autoplay)
var snd=$('sound');
if(snd){var yf=$('ytframe'),son=false;
 snd.onclick=function(){son=!son;yf.src=son?snd.dataset.unmute:snd.dataset.mute;snd.classList.toggle('on',son);snd.innerHTML=son?'🔊 Sound on':'🔇 Sound';};}

document.addEventListener('keydown',function(e){
 if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
 if(e.code==='Space'||e.key==='r'){e.preventDefault();goRnd();}
 else if(e.key==='ArrowRight'){e.preventDefault();location.href=$('next').href;}
 else if(e.key==='ArrowLeft'){e.preventDefault();location.href=$('prev').href;}
 else if(e.key==='Escape'&&surfing){set(false);stop();}
});

// Mini map: zoomed right in when we know the camera's own position, wider when we only know the city or country.
if(window.L&&$('minimap')&&la!=null){try{
 var z=CAM.loc==='exact'?10:CAM.loc==='city'?8:4;
 var mm=L.map('minimap',{zoomControl:false,attributionControl:false,scrollWheelZoom:false}).setView([la,ln],z);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:13,minZoom:2}).addTo(mm);
 L.circleMarker([la,ln],{radius:7,weight:2,color:'#2f80ed',fillColor:'#5aa2ff',fillOpacity:.95}).addTo(mm);}catch(e){}}
})();
