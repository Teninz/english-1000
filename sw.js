// Новая версия активируется только после полной загрузки обязательных файлов.
const CACHE = "shadowfox-v17";
const FOX_ASSETS = ["./art/companion-v2/handle.png","./art/companion-v2/scene/forest.webm","./art/companion-v2/scene/forest.webp",...["03-girl-gentle","04-boy-bold"].flatMap(fox=>["idle","look","notice","blink"].map(state=>`./art/companion-v2/${fox}/${state}.webm`).concat(`./art/companion-v2/${fox}/poster.webp`)),...["01-boy-calm","02-girl-warm"].flatMap(fox=>[`./art/companion-v2/${fox}/idle.webm`,`./art/companion-v2/${fox}/poster.webp`])];
const FILES = ["./", "./index.html", "./learning-core.js", "./word-forms.js", "./progress-storage.js", "./fox-motion.js", "./journey.js", "./companion.css", "./thematic.css", "./thematic.js", "./words-a.js", "./words-b.js", "./ex-ru.js", "./thematic-data.js", "./scenes.js", "./tts.js", "./ach.js", "./daily.js", "./about.js", "./native.js", "./manifest.json", "./privacy.html", "./icons/icon-192.png", "./icons/icon-512.png", "./art/logo.png", "./art/shadowfox.png", ...FOX_ASSETS];
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
