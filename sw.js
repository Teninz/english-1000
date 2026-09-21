// Новая версия активируется только после полной загрузки обязательных файлов.
const CACHE = "shadowfox-v24";
const FILES = ["./", "./index.html", "./learning-core.js", "./word-forms.js", "./progress-storage.js", "./journey.js", "./motivation.css", "./thematic.css", "./thematic.js", "./words-a.js", "./words-b.js", "./ex-ru.js", "./thematic-data.js", "./word-levels.js", "./oxford-a1.js", "./oxford-a2.js", "./oxford-b1.js", "./oxford-b2.js", "./words-extra.js", "./program.js", "./scenes.js", "./tts.js", "./ach.js", "./daily.js", "./about.js", "./native.js", "./manifest.json", "./privacy.html", "./icons/icon-192.png", "./icons/icon-512.png", "./art/logo.png"];
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
