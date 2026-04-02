const CACHE_NAME = '219finances-v3';

// Detectar si es desarrollo
const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

const ASSETS = isDev ? [] : [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest-icon-192.maskable.png',
  '/manifest-icon-512.maskable.png'
];

self.addEventListener('install', (e) => {
  if (ASSETS.length > 0) {
    e.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
        .catch(console.error)
    );
  }
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // No interceptar en desarrollo
  if (isDev) return;
  
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request)
      .then(res => res || fetch(e.request))
  );
});