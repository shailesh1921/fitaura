// sw.js - FitAura Service Worker
const CACHE = 'fitaura-v2';
const ASSETS = [
    '/app/index.html', '/app/dashboard.html', '/app/workout.html',
    '/app/cardio.html', '/app/diet.html', '/app/analytics.html',
    '/app/ai-coach.html', '/app/profile.html', '/app/login.html',
    '/app/css/premium.css', '/js/fitnessEngine.js', '/js/cardioEngine.js',
    '/js/dietEngine.js', '/js/fitaura-global.js', '/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached);
        })
    );
});
