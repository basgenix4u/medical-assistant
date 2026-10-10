// public/sw.js — MedAssist service worker (production-reviewed, Stage 4)
//
// Strategy:
// - Versioned cache names; old caches are purged on activate.
// - API routes are never cached (they carry auth cookies and user data).
// - Navigations: network-first, falling back to the cached page, then /offline.
// - Other GET requests: network-first with a cache fallback (stale-while-revalidate
//   is intentionally avoided for correctness; responses are cached after fetch).

const CACHE_NAME = 'medassist-v2';

const PRECACHE_ASSETS = ['/', '/offline', '/manifest.json'];

const OFFLINE_URL = '/offline';

// Install: precache the essentials.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches, take control of open clients.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Navigations: network-first → cache → offline fallback.
function handleNavigation(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return caches.match(OFFLINE_URL).then(
          (offline) =>
            offline ||
            new Response('You are offline.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
        );
      })
    );
}

// Other GET requests: network-first with cache fallback.
function handleAsset(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok && request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then(
        (cached) =>
          cached ||
          new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
      )
    );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.origin.includes(self.location.hostname) && !url.origin.startsWith('http')) return;
  if (isApiRequest(url)) return; // never cache API/auth traffic

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
