// Новая версия активируется только после полной загрузки обязательных файлов.
const CACHE = "shadowfox-v18";
importScripts("./art/companion-v2/manifest.js");
const FOX_ASSETS = ["./art/companion-v2/handle.png","./art/companion-v2/manifest.js",
  ...Object.entries(FOX_PACK.foxes).flatMap(([fox,f])=>[`./art/companion-v2/${fox}/poster.webp`,...(f.clips.sleep?[`./art/companion-v2/${fox}/poster-sleep.webp`]:[]),...Object.keys(f.clips).map(clip=>`./art/companion-v2/${fox}/${clip}.webm`)]),
  ...Object.entries(FOX_PACK.scene.periods).flatMap(([period,loops])=>[`./art/companion-v2/scene/${period}.webp`,...loops.map(l=>`./art/companion-v2/scene/${l.file}.webm`)]),
  ...Object.keys(FOX_PACK.scene.transitions).map(name=>`./art/companion-v2/scene/${name}.webm`)];
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
