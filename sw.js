'use strict';
/* =====================================================================
   SERVICE WORKER ― オフラインで遊べるようにする
   自分のファイル：ネットワーク優先。つながらないときだけ保存した分を使う（版の上げ忘れで古いままになる事故を防ぐ）
   Google Fonts：一度読んだ分を保存して、以後はそれを使う
   ===================================================================== */
const CACHE='hikari-v2';
const FONT_CACHE='hikari-fonts-v1';
// 初回の訪問でオフラインに備える分。index.html の読み込みを変えたらここも合わせる（漏れても、一度読めば保存される）
const FILES=['./','index.html','styles.css','manifest.webmanifest',
  'src/data.js','src/state.js','src/economy.js','src/story.js','src/sound.js','src/render/scene.js','src/render/sky.js',
  'src/ui/common.js','src/ui/hud.js','src/ui/panel.js','src/ui/universe.js','src/ui/stats.js','src/ui/skills.js','src/ui/settings.js','src/climax.js','src/light.js','src/shower.js','src/main.js',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==FONT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // cache:'no-cache' でブラウザの HTTP キャッシュ（GitHub Pages は10分）を通さず毎回確かめる。公開した直後でも新しい版が届く
    e.respondWith(fetch(req,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('index.html'):Response.error()))));
  }else if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONT_CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok||res.type==='opaque')c.put(req,res.clone());return res;}))));
  }
});
