// Service Worker for GramCare Offline PWA (sw.js)
const CACHE_NAME = "gramcare-cache-v1";
const ASSETS_TO_CACHE = [
  "index.html",
  "css/styles.css",
  "js/db.js",
  "js/app.js",
  "js/diagnosis.js",
  "js/chat.js",
  "js/dashboard.js",
  "js/marketplace.js",
  "manifest.json"
];

// Install Event - cache core static resources
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network first with cache fallback
self.addEventListener("fetch", (e) => {
  // Only cache same-origin resources, skip external APIs/CDNs if offline
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // If successful, clone response and write to cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network request fails (offline)
          return caches.match(e.request);
        })
    );
  }
});
