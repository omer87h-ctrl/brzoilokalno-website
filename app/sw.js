/**
 * Service worker — scope /app/
 * Cache samo statički asseti. Ne cacheuje Firestore podatke.
 */
const CACHE_NAME = "bil-app-static-v15";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./firebase.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./data/categories.js",
  "./utils/format.js",
  "./utils/route.js",
  "./utils/textInputValidation.js",
  "./utils/kalkulatorLogic.js",
  "./services/firebaseService.js",
  "./services/firestoreReads.js",
  "./services/firestoreWrites.js",
  "./services/chatService.js",
  "./services/storageService.js",
  "./constants/policy.js",
  "./services/userProfile.js",
  "./views/maintenance.js",
  "./views/prep.js",
  "./views/shell.js",
  "./views/home.js",
  "./views/kategorije.js",
  "./views/poslovi.js",
  "./views/posao.js",
  "./views/radovi.js",
  "./views/ponude.js",
  "./views/pretraga.js",
  "./views/prijave.js",
  "./views/chat.js",
  "./views/forms.js",
  "./views/profil.js",
  "./views/login.js",
  "./views/register.js",
  "./views/onboarding.js",
  "./views/brzo.js",
  "./views/majstori.js",
  "./views/kalkulator.js",
  "./views/shared.js",
  "./views/screenFeed.js",
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
