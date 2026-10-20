/* SomaliTube shared code. Needs firebase app/auth/firestore compat scripts loaded BEFORE this file. */
firebase.initializeApp({apiKey:"AIzaSyDxOI-TwU5Sd7yYm1sfceb1HXGYMAQX3kw",authDomain:"somalitube98.firebaseapp.com",projectId:"somalitube98",storageBucket:"somalitube98.firebasestorage.app",messagingSenderId:"301195499282",appId:"1:301195499282:web:b89255bba0f5ed1eba05cb"});
var auth=firebase.auth(),db=firebase.firestore();

/* ====== SUPABASE STORAGE: PUT YOUR OWN VALUES HERE ====== */
var SUPA_URL='https://sxbpxbcnkyevqdsvxkfh.supabase.co', BUCKET='media';
var SUPA_KEY='sb_publishable_ROnce5mBf89rXOpJzbDEBQ_wPdObJWC';
/* UID of the SomaliTube owner account (see setup steps) */
var OWNER_UID='NLDaphnFmogPO94dKBIHZQX9yLt2';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
/* Random-looking but permanent vibrant colour per user: full hue range, 90% saturation, 52% lightness => never black/white/dull */
function stColor(uid){var h=0,s=String(uid||'x');for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;h=(h*2654435761>>>0)%360;return 'hsl('+h+',90%,52%)'}
function stAv(name,uid,size,href){var t=href?'a':'div';return '<'+t+(href?' href="'+href+'"':'')+' class="av" data-pfp="'+esc(uid)+'" style="width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.45)+'px;background:'+stColor(uid)+'">'+esc((name||'?')[0].toUpperCase())+'</'+t+'>'}
function stDate(iso){return iso?new Date(iso).toLocaleDateString():''}

function stNav(user){
  var a=document.getElementById('auth-area'),u=document.getElementById('upload-btn-wrap');
  if(!user||!a)return;
  a.innerHTML='<a href="profile.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:#f1f1f1">'+stAv(user.displayName,user.uid,38)+'<span style="font-size:13px;font-weight:900">'+esc(user.displayName||'Profile')+'</span></a>';
  if(u)u.innerHTML='<a href="upload.html" class="topbar-btn">Make de video!</a> <a href="dashboard.html" class="topbar-btn outline">My vids</a>'+(user.uid===OWNER_UID?' <a href="admin.html" class="topbar-btn" style="background:#ff4444;border-color:#ff4444">ADMIN</a>':'');
}
var ST_UP='<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21H3V9h4v12zm14-11c0-1.1-.9-2-2-2h-5.3l.9-4.3v-.3c0-.4-.2-.8-.4-1.1L13.1 1 7.6 6.6C7.2 7 7 7.5 7 8v11c0 1.1.9 2 2 2h8c.8 0 1.5-.5 1.8-1.2l3-7c.1-.2.2-.5.2-.8v-2z" fill="#2fd16f"></path></svg>';
var ST_DN='<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path transform="rotate(180 12 12)" d="M7 21H3V9h4v12zm14-11c0-1.1-.9-2-2-2h-5.3l.9-4.3v-.3c0-.4-.2-.8-.4-1.1L13.1 1 7.6 6.6C7.2 7 7 7.5 7 8v11c0 1.1.9 2 2 2h8c.8 0 1.5-.5 1.8-1.2l3-7c.1-.2.2-.5.2-.8v-2z" fill="#ff5a5a"></path></svg>';
function stCard(v,id,lk){lk=(lk&&typeof lk==='object')?lk:{l:0,d:0};var t=lk.l+lk.d,pct=t?Math.round(lk.l/t*100):50;
  return '<div class="video-card"><a href="watch.html?v='+id+'"><div class="thumb-wrap"><img src="'+esc(v.thumbURL)+'" alt="tembnail"><div class="play-overlay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div></a><div class="v-info"><a href="watch.html?v='+id+'" class="v-title">'+esc(v.title)+'</a><div class="v-channel"><a href="user.html?uid='+esc(v.uid)+'">'+esc(v.username)+'</a>'+stSlot(v.uid)+'</div><div class="v-meta">Keeg &middot; '+stDate(v.createdAt)+'</div><div class="lbar">'+ST_UP+'<b class="lg">'+lk.l+'</b><div class="lt"><div class="lf" style="width:'+pct+'%"></div></div><b class="lr">'+lk.d+'</b>'+ST_DN+'</div></div></div>'}
function stLikes(ids){var out={};return Promise.all(ids.map(function(id){return db.collection('videoLikes').doc(id).collection('likes').get().then(function(q){var l=0,d=0;q.forEach(function(x){x.data().vote==='like'?l++:d++});out[id]={l:l,d:d}}).catch(function(){out[id]={l:0,d:0}})})).then(function(){return out})}
/* profile picture picker: profilepicture1.png ... profilepicture20.png in the site root */
var PFP_COUNT=20;
function stPfpGrid(el,sel,onPick){var h='';for(var i=1;i<=PFP_COUNT;i++){var f='profilepicture'+i+'.png';h+='<button type="button" class="pfp-opt'+(f===sel?' on':'')+'" data-f="'+f+'" style="background-image:url('+f+')" aria-label="Picture '+i+'"></button>'}
  el.classList.add('pfp-grid');el.innerHTML=h;el.onclick=function(e){var b=e.target.closest('.pfp-opt');if(!b)return;[].forEach.call(el.querySelectorAll('.pfp-opt'),function(x){x.classList.remove('on')});b.classList.add('on');onPick(b.dataset.f)}}
/* shared styles for cards, like bars, comments, avatars, picture picker */
(function(){var c=document.createElement('style');c.textContent=
'.video-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}'+
'.video-card{background:#1e1e1e;border:2px solid #2a2a2a;display:flex;flex-direction:column;min-width:0}.video-card:hover{border-color:#ff6a00}.video-card>a{text-decoration:none;display:block}'+
'.thumb-wrap{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#2a2a2a}.thumb-wrap img{width:100%;height:100%;object-fit:cover;display:block}'+
'.duration{position:absolute;bottom:6px;right:6px;background:#ff6a00;color:#fff;font-size:11px;font-weight:900;padding:2px 7px}'+
'.play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;background:rgba(0,0,0,.4)}.video-card:hover .play-overlay{opacity:1}.play-overlay svg{width:52px;height:52px;fill:#ff6a00}'+
'.v-info{padding:10px 12px 12px;display:flex;flex-direction:column;gap:5px}'+
'.v-title{font-size:14px;font-weight:900;color:#f1f1f1;text-decoration:none;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}.v-title:hover{color:#ff6a00}'+
'.v-channel{display:flex;align-items:center;min-width:0}.v-channel a{font-size:12px;color:#ff6a00;text-decoration:none;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.v-meta{font-size:11px;color:#666}'+
'.lbar{display:flex;align-items:center;gap:6px;margin-top:3px}.lbar b{font:900 11px Nunito,sans-serif}.lg{color:#2fd16f}.lr{color:#ff5a5a}.lt{flex:1;height:5px;background:#ff5a5a}.lf{height:100%;background:#2fd16f}'+
'.av{display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-family:Bangers,Impact,fantasy;flex-shrink:0;text-decoration:none;text-shadow:1px 1px 0 rgba(0,0,0,.35)}'+
'.comment{background:#1e1e1e;border:2px solid #2a2a2a;padding:12px 14px;margin-bottom:10px}.comment:hover{border-color:#ff6a00}.comment.reply{margin-left:36px;background:#191919}'+
'.c-head{display:flex;align-items:center;gap:10px;margin-bottom:6px}.c-head .av{width:34px;height:34px;font-size:14px}'+
'.c-user{font-size:13px;font-weight:900;color:#ff6a00;text-decoration:none}.c-time{font-size:11px;color:#666;margin-left:auto}'+
'.c-text{font-size:13px;color:#ccc;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}.c-text.clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}'+
'.lk{background:none;border:none;color:#ff6a00;font:900 12px Nunito,sans-serif;cursor:pointer;padding:0;margin:6px 12px 0 0}.lk:hover{text-decoration:underline}.lk.d{color:#ff4444}'+
'.slot textarea{width:100%;min-height:60px;margin-top:8px;resize:vertical;background:#2a2a2a;border:2px solid #333;color:#f1f1f1;font:13px Nunito,sans-serif;padding:10px 12px;outline:none}.slot textarea:focus{border-color:#ff6a00}'+
'.slot .btn{height:30px;margin:6px 6px 0 0;padding:0 14px;font:900 12px Nunito,sans-serif;cursor:pointer;border:2px solid #ff6a00;background:#ff6a00;color:#fff}.slot .btn.outline{background:transparent;color:#ff6a00}'+
'.cbar{display:flex;align-items:center;gap:8px;margin-top:6px}.cbar .btn{margin:0 !important}.slot .btn.cam{background:transparent;font-size:16px;padding:0 10px}.cpick{margin-top:8px}.cprev{display:flex;align-items:center;gap:6px}.cprev img{width:56px;height:56px;object-fit:cover;border:2px solid #ff6a00}'+
'.cimg{display:block;width:140px;height:140px;object-fit:cover;border:2px solid #2a2a2a;margin-top:8px}'+
'.st-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px}.st-box{background:#1e1e1e;border:3px solid #ff6a00;max-width:420px;width:100%;max-height:80vh;display:flex;flex-direction:column}'+
'.st-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:2px solid #2a2a2a;font-family:Bangers,Impact,fantasy;font-size:22px;letter-spacing:2px;color:#ff6a00}.st-x{background:none;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1}'+
'.st-body{overflow:auto;padding:4px 16px 16px}.st-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #2a2a2a;color:#f1f1f1;text-decoration:none;font-weight:900;font-size:14px}.st-row:hover{color:#ff6a00}'+
'.pfp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px}'+
'.pfp-opt{aspect-ratio:1;padding:0;border:3px solid #2a2a2a;background-color:#2a2a2a;background-size:cover;background-position:center;cursor:pointer}.pfp-opt:hover{border-color:#888}.pfp-opt.on{border-color:#ff6a00;outline:2px solid #ff6a00}';
document.head.appendChild(c)})();

/* ---------- Badges: verified + top 3 by subscribers ---------- */
function stHash(x){var h=0;for(var i=0;i<x.length;i++)h=(h*31+x.charCodeAt(i))>>>0;return h}
var _bp=null;
function stBadges(fresh){
  if(_bp&&!fresh)return _bp;
  _bp=new Promise(function(res){
    if(!fresh){try{var c=JSON.parse(sessionStorage.getItem('stb2'));if(c&&Date.now()-c.t<300000)return res(c.m)}catch(e){}}
    db.collection('users').get().then(function(s){
      var list=s.docs.map(function(d){var x=d.data();return {id:d.id,name:x.username||'Unknown',v:!!x.verified,pfp:x.pfpURL||'',subs:0}});
      return Promise.all(list.map(function(u){return db.collection('users').doc(u.id).collection('subscribers').get().then(function(q){u.subs=q.size}).catch(function(){})})).then(function(){
        var day=new Date().toISOString().slice(0,10);list.forEach(function(u){u.t=stHash(u.id+day)});
        var m={};list.forEach(function(u){m[u.id]={name:u.name,v:u.v,pfp:u.pfp,subs:u.subs,t:u.t,rank:0}});
        /* ties are broken randomly (changes daily); each of #1/#2/#3 goes to exactly one channel; needs at least 1 sub */
        list.filter(function(u){return u.subs>0}).sort(function(a,b){return b.subs-a.subs||a.t-b.t}).slice(0,3).forEach(function(u,i){m[u.id].rank=i+1});
        try{sessionStorage.setItem('stb2',JSON.stringify({t:Date.now(),m:m}))}catch(e){}
        res(m)})}).catch(function(){res({})})});
  return _bp}
function stSlot(uid){return '<span class="bdg-slot" data-uid="'+esc(uid)+'"></span>'}
function stFill(){
  var el=document.querySelectorAll('.bdg-slot:not([data-done])'),pf=document.querySelectorAll('[data-pfp]:not([data-pfd])');
  if(!el.length&&!pf.length)return;
  stBadges().then(function(m){
    el.forEach(function(e){e.dataset.done=1;var b=m[e.dataset.uid];if(!b)return;var src=b.rank?'number'+b.rank+'.png':b.v?'verifiedsomalian.png':'';if(!src)return;
      e.innerHTML='<img src="'+src+'" title="'+(b.rank?'#'+b.rank+' most populer somaliturber':'Verified Somalian')+'" style="height:1.2em;width:auto;vertical-align:-0.25em;margin-left:5px">'});
    pf.forEach(function(e){e.dataset.pfd=1;var b=m[e.dataset.pfp];if(!b||!b.pfp)return;
      e.style.backgroundImage='url('+b.pfp+')';e.style.backgroundSize='cover';e.style.backgroundPosition='center';e.style.color='transparent';e.style.textShadow='none'})})}
/* call after someone changes their picture / gets verified, so everything repaints */
function stRefreshBadges(){_bp=null;try{sessionStorage.removeItem('stb2')}catch(e){}
  document.querySelectorAll('[data-pfd]').forEach(function(e){e.removeAttribute('data-pfd');e.style.backgroundImage='';e.style.color=''});
  document.querySelectorAll('.bdg-slot').forEach(function(e){e.removeAttribute('data-done');e.innerHTML=''});stFill()}
if(document.body)new MutationObserver(function(){clearTimeout(window._bt);window._bt=setTimeout(stFill,60)}).observe(document.body,{childList:true,subtree:true});

/* ---------- lists: who subscribed / who they follow ---------- */
function stModal(title){var o=document.createElement('div');o.className='st-modal';
  o.innerHTML='<div class="st-box"><div class="st-head"><span class="st-t">'+esc(title)+'</span><button type="button" class="st-x" aria-label="Close">&times;</button></div><div class="st-body"><div class="v-meta" style="padding:12px 0">Loading...</div></div></div>';
  o.addEventListener('click',function(e){if(e.target===o||e.target.classList.contains('st-x'))o.remove()});document.body.appendChild(o);return o}
function stFillModal(o,title,ids,m,empty){o.querySelector('.st-t').textContent=title+' ('+ids.length+')';
  o.querySelector('.st-body').innerHTML=ids.length?ids.map(function(id){var c=m[id];return '<a class="st-row" href="user.html?uid='+id+'">'+stAv(c.name,id,40)+'<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.name)+'</span>'+stSlot(id)+'</a>'}).join(''):'<div class="v-meta" style="padding:12px 0">'+empty+'</div>'}
function stShowSubscribers(uid){var o=stModal('Subscribers');
  Promise.all([db.collection('users').doc(uid).collection('subscribers').get(),stBadges()]).then(function(r){var m=r[1],ids=r[0].docs.map(function(d){return d.id}).filter(function(id){return m[id]});stFillModal(o,'Subscribers',ids,m,'No subscribers yet.')}).catch(function(e){o.querySelector('.st-body').textContent='Error: '+e.message})}
function stShowFollowing(uid){var o=stModal('Following');
  stBadges().then(function(m){var ids=Object.keys(m).filter(function(id){return id!==uid});
    return Promise.all(ids.map(function(id){return db.collection('users').doc(id).collection('subscribers').doc(uid).get().then(function(d){return d.exists?id:null})})).then(function(l){stFillModal(o,'Following',l.filter(Boolean),m,'Not following anyone yet.')})}).catch(function(e){o.querySelector('.st-body').textContent='Error: '+e.message})}

/* ---------- Ban screen ---------- */
function stBanScreen(b){
  if(document.getElementById('banscreen'))return;
  var d=document.createElement('div');d.id='banscreen';
  d.style.cssText='position:fixed;inset:0;z-index:999999;background:#0b0b0b;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto';
  d.innerHTML='<div style="background:#1e1e1e;border:3px solid #ff4444;box-shadow:8px 8px 0 #000;max-width:480px;width:100%;padding:36px 28px;text-align:center"><div style="font-size:64px">&#128683;</div><div style="font-family:Bangers,Impact,fantasy;font-size:46px;letter-spacing:3px;color:#fff;text-shadow:3px 3px 0 #ff4444;line-height:1.1">YOU GOT BANNED</div><p style="margin-top:16px;font-size:14px;color:#ccc;font-weight:700">Your chanal was banned from SomaliTube.</p><p style="margin-top:14px;font-size:13px;color:#ff8888;font-weight:900;overflow-wrap:anywhere">Reason: '+esc((b&&b.reason)||'No reason given')+'</p><button id="ban-out" style="margin-top:26px;height:46px;width:100%;background:#ff4444;border:none;color:#fff;font:20px Bangers,Impact,fantasy;letter-spacing:2px;cursor:pointer">LOG OUT</button></div>';
  document.body.appendChild(d);document.body.style.overflow='hidden';
  document.getElementById('ban-out').onclick=function(){auth.signOut().then(function(){location.href='index.html'})};
}
auth.onAuthStateChanged(function(u){if(!u)return;db.collection('bans').doc(u.uid).get().then(function(d){if(d.exists)stBanScreen(d.data())}).catch(function(){})});

/* ---------- Supabase upload/delete ---------- */
function stUpload(file,path,onProg){return new Promise(function(res,rej){
  var x=new XMLHttpRequest();x.open('POST',SUPA_URL+'/storage/v1/object/'+BUCKET+'/'+path);
  x.setRequestHeader('apikey',SUPA_KEY);if(SUPA_KEY.indexOf('eyJ')===0)x.setRequestHeader('Authorization','Bearer '+SUPA_KEY);x.setRequestHeader('Content-Type',file.type||'application/octet-stream');
  x.upload.onprogress=function(e){if(e.lengthComputable&&onProg)onProg(e.loaded/e.total)};
  x.onload=function(){x.status<300?res(SUPA_URL+'/storage/v1/object/public/'+BUCKET+'/'+path):rej(new Error('Upload failed: '+x.responseText))};
  x.onerror=function(){rej(new Error('Network error during upload'))};x.send(file)})}
function stRemoveFile(path){return fetch(SUPA_URL+'/storage/v1/object/'+BUCKET+'/'+path,{method:'DELETE',headers:SUPA_KEY.indexOf('eyJ')===0?{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY}:{apikey:SUPA_KEY}}).catch(function(){})}

/* ---------- Compression ---------- */
var MAX_VID=10*1024*1024, MAX_THUMB=2*1024*1024, MAX_SECONDS=3600;
function stCompressThumb(file){return new Promise(function(res,rej){
  if(file.size<=MAX_THUMB&&/^image\/(jpeg|png|webp)$/.test(file.type))return res(file);
  var img=new Image();img.onerror=function(){rej(new Error('Thumbnail is not a valid image'))};
  img.onload=function(){var sc=Math.min(1,1280/img.width),w=Math.round(img.width*sc),h=Math.round(img.height*sc),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
    var q=.9;(function t(){c.toBlob(function(b){if(b.size>MAX_THUMB*.95&&q>.3){q-=.1;t()}else res(new File([b],'thumb.jpg',{type:'image/jpeg'}))},'image/jpeg',q)})()};
  img.src=URL.createObjectURL(file)})}
/* SLOW fallback: Re-encodes in the browser (plays the video once in real time). Skips if already <=10MB. */
function stCompressSlow(file,onProg){return new Promise(function(res,rej){
  if(file.size<=MAX_VID)return res(file);
  var v=document.createElement('video');v.src=URL.createObjectURL(file);v.playsInline=true;v.preload='auto';
  v.onerror=function(){rej(new Error("Can't read this video. Try an MP4."))};
  v.onloadedmetadata=function(){
    var d=v.duration;if(!isFinite(d)||d>MAX_SECONDS)return rej(new Error('Video too long (max 1 hour)'));
    var total=Math.floor(MAX_VID*(d>600?.75:.85)*8/d),ab=total>200000?64000:total>90000?32000:16000,vb=Math.max(total-ab,8000);
    var H=vb>900000?720:vb>450000?480:vb>200000?360:vb>90000?240:144,fps=30;
    var sc=Math.min(1,H/v.videoHeight),w=Math.max(2,Math.round(v.videoWidth*sc/2)*2),h=Math.max(2,Math.round(v.videoHeight*sc/2)*2);
    var cv=document.createElement('canvas');cv.width=w;cv.height=h;var cx=cv.getContext('2d');
    var ac=new (window.AudioContext||window.webkitAudioContext)(),dest=ac.createMediaStreamDestination();ac.createMediaElementSource(v).connect(dest);
    var st=cv.captureStream(fps);dest.stream.getAudioTracks().forEach(function(t){st.addTrack(t)});
    var mt=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(function(m){return window.MediaRecorder&&MediaRecorder.isTypeSupported(m)});
    if(!mt)return rej(new Error('Your browser cant compress video. Use Chrome, or upload a file under 10MB.'));
    var rec=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:vb,audioBitsPerSecond:ab}),parts=[];
    rec.ondataavailable=function(e){if(e.data.size)parts.push(e.data)};
    rec.onstop=function(){ac.close();var ext=mt.indexOf('mp4')>-1?'mp4':'webm',b=new Blob(parts,{type:mt.split(';')[0]});
      b.size>MAX_VID?rej(new Error('Still over 10MB after compressing. Try a shorter video.')):res(new File([b],'video.'+ext,{type:b.type}))};
    var tm=null;
    function draw(){cx.drawImage(v,0,0,w,h);if(onProg)onProg(Math.min(1,v.currentTime/d))}
    v.onended=function(){clearInterval(tm);setTimeout(function(){rec.stop()},300)};
    rec.start(1000);ac.resume();
    v.play().then(function(){tm=setInterval(draw,Math.round(1000/fps))}).catch(function(){rej(new Error('Browser blocked video playback. Click the page and try again.'))})}})}

/* ---------- FAST compression (WebCodecs via mediabunny). Falls back to slow real-time mode if unsupported ---------- */
function stFatal(m){var e=new Error(m);e.fatal=true;return e}
async function stCompressFast(file,onProg){
  var M=await import('https://cdn.jsdelivr.net/npm/mediabunny@1.50.8/+esm');
  var input=new M.Input({source:new M.BlobSource(file),formats:M.ALL_FORMATS});
  var d=await input.computeDuration();
  if(!isFinite(d)||d<=0)throw new Error('no duration');
  if(d>MAX_SECONDS)throw stFatal('Video too long (max 1 hour)');
  var vt=await input.getPrimaryVideoTrack();if(!vt)throw new Error('no video track');
  var dw=vt.displayWidth,dh=vt.displayHeight;
  var factors=[d>600?.75:.85,.6,.4];
  for(var i=0;i<factors.length;i++){
    var total=Math.floor(MAX_VID*factors[i]*8/d),ab=total>200000?64000:total>90000?32000:16000,vb=Math.max(total-ab,8000);
    /* quality drops first: resolution shrinks with bitrate, frame rate is left alone */
    var H=vb>900000?720:vb>450000?480:vb>200000?360:vb>90000?240:144,sc=Math.min(1,H/Math.min(dw,dh));
    var w=Math.max(16,Math.round(dw*sc/2)*2),h=Math.max(16,Math.round(dh*sc/2)*2);
    var output=new M.Output({format:new M.Mp4OutputFormat(),target:new M.BufferTarget()});
    var conv=await M.Conversion.init({input:input,output:output,video:{width:w,height:h,bitrate:vb},audio:{bitrate:ab,numberOfChannels:1}});
    if(!conv.isValid||conv.discardedTracks.some(function(t){return t.track&&t.track.type==='video'}))throw new Error('cant encode video here');
    conv.onProgress=function(p){if(onProg)onProg(p)};
    await conv.execute();
    var buf=output.target.buffer;
    if(buf.byteLength<=MAX_VID)return new File([buf],'video.mp4',{type:'video/mp4'});
  }
  throw stFatal('Still over 10MB after compressing. Try a shorter video.');
}
async function stCompressVideo(file,onProg,onNote){
  if(file.size<=MAX_VID)return file;
  try{return await stCompressFast(file,onProg)}
  catch(e){if(e.fatal)throw e;console.warn('Fast compress failed, using slow mode:',e);if(onNote)onNote();return stCompressSlow(file,onProg)}
}

/* ---------- Comments: replies, edit, delete, read more ---------- */
var STC={
  init:function(vid,root){STC.root=root;STC.col=db.collection('videoComments').doc(vid).collection('comments');root.addEventListener('click',STC.click);auth.onAuthStateChanged(STC.load)},
  load:function(){STC.col.orderBy('createdAt','desc').get().then(function(s){STC.all=[];s.forEach(function(d){var c=d.data();c.id=d.id;STC.all.push(c)});STC.render()}).catch(function(e){STC.all=[];STC.render();STC.root.insertAdjacentHTML('beforeend','<div class="hint" style="color:#ff4444;margin-top:10px">Could not load comments: '+esc(e.message)+'</div>')})},
  item:function(c,me){var long=c.text.length>250||(c.text.match(/\n/g)||[]).length>3,own=me&&me.uid===c.uid,canDel=me&&(own||me.uid===OWNER_UID),rp=!!c.parentId;
    return '<div class="comment'+(rp?' reply':'')+'" data-id="'+c.id+'" data-top="'+(c.parentId||c.id)+'" data-name="'+esc(c.username)+'"><div class="c-head">'+stAv(c.username,c.uid,34,'user.html?uid='+esc(c.uid))+'<a class="c-user" href="user.html?uid='+esc(c.uid)+'">'+esc(c.username||'Unknown')+'</a>'+stSlot(c.uid)+'<span class="c-time">'+stDate(c.createdAt)+(c.edited?' (edited)':'')+'</span></div><div class="c-text'+(long?' clamp':'')+'">'+esc(c.text)+'</div>'+STC.img(c)+
      (long?'<button class="lk" data-act="more">Read more</button>':'')+(me?'<button class="lk" data-act="reply">Reply</button>':'')+(own?'<button class="lk" data-act="edit">Edit</button>':'')+(canDel?'<button class="lk d" data-act="del">Delete</button>':'')+'<div class="slot"></div></div>'},
  img:function(c){return (c.img&&/^profilepicture\d+\.png$/.test(c.img))?'<img class="cimg" src="'+c.img+'" alt="picture">':''},
  render:function(){var me=auth.currentUser,tops=STC.all.filter(function(c){return!c.parentId}),reps=STC.all.filter(function(c){return c.parentId}).reverse(),h='<div class="section-label">💬 Comments</div>';
    h+=me?'<div class="slot" id="stc-new-slot"><textarea id="stc-new" maxlength="1000" placeholder="Write a comment... (max 1000 chars)"></textarea><div class="cbar"><button class="btn" data-act="post">Post</button><button type="button" class="btn cam" data-act="cam" title="Add a picture">📷</button><span class="cprev"></span></div><div class="cpick" style="display:none"></div></div><br>':'<p class="hint" style="margin-bottom:16px"><a href="login.html" style="color:#ff6a00">Log in</a> to comment.</p>';
    if(!tops.length)h+='<div class="hint">No comments yet. Be the first! 👀</div>';
    tops.forEach(function(c){h+=STC.item(c,me);reps.filter(function(r){return r.parentId===c.id}).forEach(function(r){h+=STC.item(r,me)})});STC.root.innerHTML=h},
  add:function(text,parentId,btn,img){var me=auth.currentUser;text=text.trim();if(!me||(!text&&!img))return;
    if(Date.now()-(STC.last||0)<5000)return alert('Slow down a bit!');STC.last=Date.now();btn.disabled=true;
    STC.col.add({uid:me.uid,username:me.displayName||'Unknown',text:text.slice(0,1000),createdAt:new Date().toISOString(),parentId:parentId||null,img:(img&&/^profilepicture\d+\.png$/.test(img))?img:null}).then(STC.load).catch(function(e){btn.disabled=false;alert(e.message)})},
  click:function(e){var b=e.target.closest('[data-act]');if(!b)return;var act=b.dataset.act,box=b.closest('.comment'),slot=box&&box.querySelector('.slot'),id=box&&box.dataset.id;
    if(act==='cam'){var sl=b.closest('.slot'),pk=sl.querySelector('.cpick');if(pk.style.display==='none'){pk.style.display='block';if(!pk.firstChild)stPfpGrid(pk,sl.dataset.img||'',function(f){sl.dataset.img=f;sl.querySelector('.cprev').innerHTML='<img src="'+f+'" alt=""><button type="button" class="lk" data-act="uncam">remove</button>';pk.style.display='none'})}else pk.style.display='none';return}
    if(act==='uncam'){var s2=b.closest('.slot');delete s2.dataset.img;s2.querySelector('.cprev').innerHTML='';s2.querySelector('.cpick').innerHTML='';return}
    if(act==='post')return STC.add(document.getElementById('stc-new').value,null,b,b.closest('.slot').dataset.img);
    if(act==='more'){var t=box.querySelector('.c-text');t.classList.toggle('clamp');b.textContent=t.classList.contains('clamp')?'Read more':'Show less';return}
    if(act==='cancel'){slot.innerHTML='';return}
    if(act==='reply'||act==='edit'){var c=STC.all.filter(function(x){return x.id===id})[0];slot.innerHTML='<textarea maxlength="1000"></textarea><div class="cbar"><button class="btn" data-act="'+(act==='reply'?'sendreply':'saveedit')+'">'+(act==='reply'?'Reply':'Save')+'</button>'+(act==='reply'?'<button type="button" class="btn cam" data-act="cam" title="Add a picture">📷</button>':'')+'<button class="btn outline" data-act="cancel">Cancel</button><span class="cprev"></span></div><div class="cpick" style="display:none"></div>';
      slot.firstChild.value=act==='edit'?c.text:'@'+box.dataset.name+' ';slot.firstChild.focus();return}
    if(act==='sendreply')return STC.add(slot.firstChild.value,box.dataset.top,b,slot.dataset.img);
    if(act==='saveedit'){var tx=slot.firstChild.value.trim();if(!tx)return;b.disabled=true;return STC.col.doc(id).update({text:tx,edited:true}).then(STC.load)}
    if(act==='del'){var isR=box.classList.contains('reply'),others=(isR||auth.currentUser.uid===OWNER_UID)?[]:STC.all.filter(function(x){return x.parentId===id&&x.uid!==auth.currentUser.uid});
      if(!confirm('Delete this comment'+(isR?'?':' and your replies under it?')))return;
      if(others.length)return STC.col.doc(id).update({text:'[deleted]'}).then(STC.load);
      var bt=db.batch();bt.delete(STC.col.doc(id));if(!isR)STC.all.forEach(function(x){if(x.parentId===id)bt.delete(STC.col.doc(x.id))});bt.commit().then(STC.load)}}
};
