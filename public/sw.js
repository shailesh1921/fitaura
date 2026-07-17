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
self.addEventListener('fetch', event => {

  if (
    !event.request.url.startsWith('http') ||
    event.request.url.startsWith('chrome-extension://')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(networkResponse => {

          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const clone = networkResponse.clone();

            caches.open(CACHE).then(cache => {
              cache.put(event.request, clone);
            });
          }

          return networkResponse;
        })
      );
    })
  );
});