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
function stAv(name,uid,size,href){var t=href?'a':'div';return '<'+t+(href?' href="'+href+'"':'')+' class="av" style="width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.45)+'px;background:'+stColor(uid)+'">'+esc((name||'?')[0].toUpperCase())+'</'+t+'>'}
function stDate(iso){return iso?new Date(iso).toLocaleDateString():''}

function stNav(user){
  var a=document.getElementById('auth-area'),u=document.getElementById('upload-btn-wrap');
  if(!user||!a)return;
  a.innerHTML='<a href="profile.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:#f1f1f1">'+stAv(user.displayName,user.uid,38)+'<span style="font-size:13px;font-weight:900">'+esc(user.displayName||'Profile')+'</span></a>';
  if(u)u.innerHTML='<a href="upload.html" class="topbar-btn">Make de video!</a> <a href="dashboard.html" class="topbar-btn outline">My vids</a>'+(user.uid===OWNER_UID?' <a href="admin.html" class="topbar-btn" style="background:#ff4444;border-color:#ff4444">ADMIN</a>':'');
}
function stCard(v,id,extra){return '<div class="video-card"><a href="watch.html?v='+id+'"><div class="thumb-wrap"><img src="'+esc(v.thumbURL)+'" alt="tembnail"><div class="play-overlay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div></a><div class="v-info"><a href="watch.html?v='+id+'" class="v-title">'+esc(v.title)+'</a><div class="v-channel"><a href="user.html?uid='+esc(v.uid)+'">'+esc(v.username)+'</a>'+stSlot(v.uid)+'</div><div class="v-meta">'+(extra||'Keeg')+' &middot; '+stDate(v.createdAt)+'</div></div></div>'}

/* ---------- Badges: verified + top 3 by subscribers ---------- */
function stHash(x){var h=0;for(var i=0;i<x.length;i++)h=(h*31+x.charCodeAt(i))>>>0;return h}
var _bp=null;
function stBadges(fresh){
  if(_bp&&!fresh)return _bp;
  _bp=new Promise(function(res){
    if(!fresh){try{var c=JSON.parse(sessionStorage.getItem('stb'));if(c&&Date.now()-c.t<300000)return res(c.m)}catch(e){}}
    db.collection('users').get().then(function(s){
      var list=s.docs.map(function(d){var x=d.data();return {id:d.id,name:x.username||'Unknown',v:!!x.verified,subs:0}});
      return Promise.all(list.map(function(u){return db.collection('users').doc(u.id).collection('subscribers').get().then(function(q){u.subs=q.size}).catch(function(){})})).then(function(){
        var day=new Date().toISOString().slice(0,10);list.forEach(function(u){u.t=stHash(u.id+day)});
        var m={};list.forEach(function(u){m[u.id]={name:u.name,v:u.v,subs:u.subs,t:u.t,rank:0}});
        /* ties are broken randomly (changes daily); each of #1/#2/#3 goes to exactly one channel; needs at least 1 sub */
        list.filter(function(u){return u.subs>0}).sort(function(a,b){return b.subs-a.subs||a.t-b.t}).slice(0,3).forEach(function(u,i){m[u.id].rank=i+1});
        try{sessionStorage.setItem('stb',JSON.stringify({t:Date.now(),m:m}))}catch(e){}
        res(m)})}).catch(function(){res({})})});
  return _bp}
function stSlot(uid){return '<span class="bdg-slot" data-uid="'+esc(uid)+'"></span>'}
function stFill(){var el=document.querySelectorAll('.bdg-slot:not([data-done])');if(!el.length)return;
  stBadges().then(function(m){el.forEach(function(e){e.dataset.done=1;var b=m[e.dataset.uid];if(!b)return;var src=b.rank?'number'+b.rank+'.png':b.v?'verifiedsomalian.png':'';if(!src)return;
    e.innerHTML='<img src="'+src+'" title="'+(b.rank?'#'+b.rank+' most populer somaliturber':'Verified Somalian')+'" style="height:1.2em;width:auto;vertical-align:-0.25em;margin-left:5px">'})})}
if(document.body)new MutationObserver(function(){clearTimeout(window._bt);window._bt=setTimeout(stFill,60)}).observe(document.body,{childList:true,subtree:true});

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
  load:function(){STC.col.orderBy('createdAt','desc').get().then(function(s){STC.all=[];s.forEach(function(d){var c=d.data();c.id=d.id;STC.all.push(c)});STC.render()})},
  item:function(c,me){var long=c.text.length>250||(c.text.match(/\n/g)||[]).length>3,own=me&&me.uid===c.uid,canDel=me&&(own||me.uid===OWNER_UID),rp=!!c.parentId;
    return '<div class="comment'+(rp?' reply':'')+'" data-id="'+c.id+'" data-top="'+(c.parentId||c.id)+'" data-name="'+esc(c.username)+'"><div class="c-head">'+stAv(c.username,c.uid,34,'user.html?uid='+esc(c.uid))+'<a class="c-user" href="user.html?uid='+esc(c.uid)+'">'+esc(c.username||'Unknown')+'</a>'+stSlot(c.uid)+'<span class="c-time">'+stDate(c.createdAt)+(c.edited?' (edited)':'')+'</span></div><div class="c-text'+(long?' clamp':'')+'">'+esc(c.text)+'</div>'+
      (long?'<button class="lk" data-act="more">Read more</button>':'')+(me?'<button class="lk" data-act="reply">Reply</button>':'')+(own?'<button class="lk" data-act="edit">Edit</button>':'')+(canDel?'<button class="lk d" data-act="del">Delete</button>':'')+'<div class="slot"></div></div>'},
  render:function(){var me=auth.currentUser,tops=STC.all.filter(function(c){return!c.parentId}),reps=STC.all.filter(function(c){return c.parentId}).reverse(),h='<div class="section-label">💬 Comments</div>';
    h+=me?'<div class="slot" id="stc-new-slot"><textarea id="stc-new" maxlength="1000" placeholder="Write a comment... (max 1000 chars)"></textarea><button class="btn" data-act="post" style="margin-top:6px">Post</button></div><br>':'<p class="hint" style="margin-bottom:16px"><a href="login.html" style="color:#ff6a00">Log in</a> to comment.</p>';
    if(!tops.length)h+='<div class="hint">No comments yet. Be the first! 👀</div>';
    tops.forEach(function(c){h+=STC.item(c,me);reps.filter(function(r){return r.parentId===c.id}).forEach(function(r){h+=STC.item(r,me)})});STC.root.innerHTML=h},
  add:function(text,parentId,btn,name){var me=auth.currentUser;text=text.trim();if(!me||!text)return;
    if(Date.now()-(STC.last||0)<5000)return alert('Slow down a bit!');STC.last=Date.now();btn.disabled=true;
    STC.col.add({uid:me.uid,username:me.displayName||'Unknown',text:text.slice(0,1000),createdAt:new Date().toISOString(),parentId:parentId||null}).then(STC.load).catch(function(e){btn.disabled=false;alert(e.message)})},
  click:function(e){var b=e.target.closest('[data-act]');if(!b)return;var act=b.dataset.act,box=b.closest('.comment'),slot=box&&box.querySelector('.slot'),id=box&&box.dataset.id;
    if(act==='post')return STC.add(document.getElementById('stc-new').value,null,b);
    if(act==='more'){var t=box.querySelector('.c-text');t.classList.toggle('clamp');b.textContent=t.classList.contains('clamp')?'Read more':'Show less';return}
    if(act==='cancel'){slot.innerHTML='';return}
    if(act==='reply'||act==='edit'){var c=STC.all.filter(function(x){return x.id===id})[0];slot.innerHTML='<textarea maxlength="1000"></textarea><button class="btn" data-act="'+(act==='reply'?'sendreply':'saveedit')+'">'+(act==='reply'?'Reply':'Save')+'</button><button class="btn outline" data-act="cancel">Cancel</button>';
      slot.firstChild.value=act==='edit'?c.text:'@'+box.dataset.name+' ';slot.firstChild.focus();return}
    if(act==='sendreply')return STC.add(slot.firstChild.value,box.dataset.top,b);
    if(act==='saveedit'){var tx=slot.firstChild.value.trim();if(!tx)return;b.disabled=true;return STC.col.doc(id).update({text:tx,edited:true}).then(STC.load)}
    if(act==='del'){var isR=box.classList.contains('reply'),others=(isR||auth.currentUser.uid===OWNER_UID)?[]:STC.all.filter(function(x){return x.parentId===id&&x.uid!==auth.currentUser.uid});
      if(!confirm('Delete this comment'+(isR?'?':' and your replies under it?')))return;
      if(others.length)return STC.col.doc(id).update({text:'[deleted]'}).then(STC.load);
      var bt=db.batch();bt.delete(STC.col.doc(id));if(!isR)STC.all.forEach(function(x){if(x.parentId===id)bt.delete(STC.col.doc(x.id))});bt.commit().then(STC.load)}}
};
