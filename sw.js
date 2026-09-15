/* Bruno Electric Estimating — app shell offline cache */
const CACHE = 'bruno-electric-v24';
const SHELL = [
  './',
  './index.html',
  './electrical-tools.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './sw-register.js',
  './electric-workspace.js',
  './electric-reference-data.js',
  './electric-calculators.js',
  './electric-catalog-v1.js',
  './electric-bom.js',
  './electrical-tools-ui.js',
  './electrical-bom-ui.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok && (req.mode === 'navigate' || SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')) || url.pathname.endsWith(p.replace('./', ''))))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      if (req.mode === 'navigate') {
        return net.then((r) => r || cached || caches.match('./index.html'));
      }
      return cached || net;
    })
  );
});
