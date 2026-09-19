const CACHE='mass-sales-ledger-v2.0.0';
const ASSETS=['./manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k.startsWith('mass-sales-ledger-') && k !== CACHE)
              .map(k => caches.delete(k))
        )
      )
    ])
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Always try the network first for HTML so updates are not blocked
  // by a stale cached index.html.
  if (req.mode === 'navigate' ||
      req.destination === 'document' ||
      req.url.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, {cache:'no-store'})
        .then(response => {
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
