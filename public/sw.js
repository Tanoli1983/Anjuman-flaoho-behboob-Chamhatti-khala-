// Service Worker for Anjuman Falah-o-Bahbood Chamhatti Khalabut Karachi
// Safe caching for static resources only (scripts, styles, html shells, icons)
// Financial records, API routes, and sensitive accounting data are NEVER stored in CacheStorage.

const CACHE_VERSION = 'afb-pwa-v2.2';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;

// Pre-cached static application shell assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  // Pre-cache static assets
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately so updates take effect right away
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches from prior versions immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Take control of all open client tabs without requiring manual reload
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. Only process GET requests; never intercept POST, PUT, DELETE, etc.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 2. CRITICAL SAFETY: Never cache API calls, database endpoints, or dynamic data
  if (
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('nocache') ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'data:'
  ) {
    return; // Pass through to network directly
  }

  // 3. For SPA page navigation requests: Network-first with offline fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // Update cached index.html with latest network response
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 4. For static assets (JS, CSS, fonts, images, webmanifest): Stale-While-Revalidate
  // Allows instant load while checking network for updates in background
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|webmanifest|json)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
              const resToCache = networkRes.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(req, resToCache);
              });
            }
            return networkRes;
          })
          .catch(() => cachedRes);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // Default network-first for all other requests
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
