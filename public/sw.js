const CACHE_NAME = '219finances-v1';

// En desarrollo, no cachees nada o usa estrategia diferente
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

const ASSETS = isDevelopment ? [] : [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest-icon-192.maskable.png',
  '/manifest-icon-512.maskable.png'
];

self.addEventListener('install', (e) => {
  if (ASSETS.length > 0) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
  }
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // No interceptar en desarrollo
  if (isDevelopment) return;
  
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});