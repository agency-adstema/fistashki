// Fistashki Button PWA — Service Worker
const CACHE_NAME = "fistashki-button-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/main.js",
  "/src/style.css",
];

// Install — precache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("🥜 Fistashki SW: caching...");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch — cache first, fallback to offline page
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Don't cache external URLs
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Try network first, cache as fallback
      return (
        fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (
              response.status === 200 &&
              event.request.url.startsWith(self.location.origin)
            ) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          // Offline fallback
          .catch(() => {
            if (cached) {
              return cached;
            }
            // If requesting a page, show offline.html
            if (event.request.mode === "navigate") {
              return caches.match("/offline.html");
            }
            return new Response("Offline", { status: 503 });
          })
      );
    })
  );
});