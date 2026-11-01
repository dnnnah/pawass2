const SHELL_CACHE = 'pawpass-shell-v1';
const STATIC_CACHE = 'pawpass-static-v1';
const OFFLINE_PAGE = '/offline.html';
const PUBLIC_ASSETS = new Set([
  '/paw-mark.svg',
  '/pawpass-pwa-icon-192.png',
  '/pawpass-pwa-icon-512.png',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_PAGE]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('pawpass-') && key !== SHELL_CACHE && key !== STATIC_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }

  const isNextStatic = url.pathname.startsWith('/_next/static/');
  if (!isNextStatic && !PUBLIC_ASSETS.has(url.pathname)) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && !response.redirected && !contentType.includes('text/html')) {
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
