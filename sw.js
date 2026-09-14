// Новая версия активируется только после полной загрузки обязательных файлов.
const CACHE = "shadowfox-v12";
const FILES = ["./", "./index.html", "./learning-core.js", "./word-forms.js", "./progress-storage.js", "./journey.js", "./companion.css", "./words-a.js", "./words-b.js", "./ex-ru.js", "./scenes.js", "./tts.js", "./ach.js", "./daily.js", "./about.js", "./native.js", "./manifest.json", "./privacy.html", "./icons/icon-192.png", "./icons/icon-512.png", "./art/logo.png", "./art/shadowfox.png", "./art/companion/idle.png", "./art/companion/curious.png", "./art/companion/pet.png", "./art/companion/feed.png", "./art/companion/happy.png", "./art/companion/sad-1.png", "./art/companion/sad-2.png", "./art/companion/sleep.png", "./art/companion-anim/idle.png", "./art/companion-anim/listen.png", "./art/companion-anim/quiet.png", "./art/companion-anim/sad.png", "./art/companion-anim/withdrawn.png", "./art/companion-anim/pet.png", "./art/companion-anim/feed.png", "./art/companion-anim/happy.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("shadowfox-") && k !== CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const cached=await c.match(e.request,{ignoreSearch:true});
      if(cached)return cached;
      try{const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone()).catch(()=>{});return r;}
      catch(error){if(e.request.mode==="navigate")return (await c.match("./index.html")) || Response.error();return Response.error();}
    })
  );
});
