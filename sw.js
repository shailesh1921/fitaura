// Fitaura Service Worker

const CACHE = 'fitaura-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return (
        cached ||
        fetch(e.request).then(response => {
          return response;
        })
      );
    })
  );
});