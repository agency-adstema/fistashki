// Ime keša - menjaj broj kad ažuriraš
const CACHE_NAME = 'pwa-test-v1';

// Fajlovi koji se keširaju pri instalaciji
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  'icon.svg'
];

// Instalacija - keširaj osnovne fajlove
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Keš otvoren');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Aktivacija - očisti stari keš
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - offline support
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
  );
});