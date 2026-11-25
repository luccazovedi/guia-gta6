// Service worker do Leonida Log: abre offline e deixa o mapa rápido.
const VERSION = "ll-v1";
const SHELL = ["/", "/mapa", "/missoes", "/trofeus", "/100", "/icon.svg", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // Supabase, Spotify etc. sempre pela rede
  // páginas: rede primeiro, cache se offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then((r) => r || caches.match("/"))));
    return;
  }
  // arquivos estáticos e tiles do mapa: cache primeiro
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/tiles/") || url.pathname.startsWith("/icons/") || /\.(woff2?|png|svg|webp)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return r;
    })));
  }
});
