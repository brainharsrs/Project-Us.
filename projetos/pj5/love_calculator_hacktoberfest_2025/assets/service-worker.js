// Very small service worker: cache shell and serve offline (educational)
const CACHE = 'love-calc-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
