const PREFIX = 'mass-sales-ledger-';
const CACHE = PREFIX + 'v2.7.0';
const ASSETS = ['./manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {})))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== self.location.origin) return;   // never touch Google / other sites

  if (r.mode === 'navigate' || r.destination === 'document' || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(r, { cache: 'no-store' }).then(res => {
      if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)).catch(() => {}); }
      return res;
    }).catch(() => caches.match('./index.html').then(m => m || Response.error())));
    return;
  }
  e.respondWith(caches.match(r).then(c => c || fetch(r)));
});
