const CACHE='mass-sales-ledger-v2.2.0';
const ASSETS=['./manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith('mass-sales-ledger-') && k !== CACHE)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate' || req.destination === 'document' ||
      req.url.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, {cache:'no-store'})
        .then(response => {
          const copy=response.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
