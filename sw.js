// Сеть в приоритете, кэш — запасной вариант для офлайна.
const CACHE = "shadowfox-v4";
const FILES = ["./", "./index.html", "./words-a.js", "./words-b.js", "./ex-ru.js", "./scenes.js", "./tts.js", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./art/logo.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(()=>{}))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{}); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
