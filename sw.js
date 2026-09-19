const CACHE='mass-sales-ledger-v2.3.0';
const ASSETS=['./manifest.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('mass-sales-ledger-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const r=e.request;if(r.mode==='navigate'||r.destination==='document'||r.url.endsWith('/index.html')){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res;}).catch(()=>caches.match('./index.html')));return;}e.respondWith(caches.match(r).then(c=>c||fetch(r)));});
