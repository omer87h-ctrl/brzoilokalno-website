/**
 * Service worker — scope /app/
 * Cache samo statički asseti. Ne cacheuje Firestore podatke.
 */
const CACHE_NAME = "bil-app-static-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./firebase.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./services/firebaseService.js",
  "./views/maintenance.js",
  "./views/prep.js",
  "./views/shell.js",
  "./components/bottomNav.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin.includes("googleapis.com") || url.origin.includes("gstatic.com") || url.origin.includes("firebase")) {
    return;
  }

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
