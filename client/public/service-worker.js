/* Basic GP PWA Service Worker */
const STATIC_CACHE = 'gp-static-v1';
const RUNTIME_CACHE = 'gp-runtime-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // API runtime cache (GET only)
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, network.clone());
        return network;
      } catch (e) {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        throw e;
      }
    })());
    return;
  }
  // Static shell first
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(res => res || fetch(request))
    );
    return;
  }
  // Cache-first for same-origin static
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
