/**
 * Service worker — scope /app/
 * Cache samo statički asseti. Ne cacheuje Firestore podatke.
 */
const CACHE_NAME = "bil-app-static-v50";
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
  "./utils/applicationAuth.js",
  "./utils/format.js",
  "./utils/route.js",
  "./utils/textInputValidation.js",
  "./utils/kalkulatorLogic.js",
  "./utils/activity.js",
  "./utils/activityHide.js",
  "./utils/verified.js",
  "./utils/follow.js",
  "./services/firebaseService.js",
  "./services/firestoreReads.js",
  "./services/firestoreWrites.js",
  "./services/chatService.js",
  "./services/storageService.js",
  "./services/weatherOutlook.js",
  "./services/moderation.js",
  "./constants/policy.js",
  "./constants/notifications.js",
  "./constants/reports.js",
  "./services/userProfile.js",
  "./services/publicProfile.js",
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
  "./views/follow.js",
  "./views/aktivnost.js",
  "./views/obavijesti.js",
  "./views/outdoorPlan.js",
  "./views/chatShortcut.js",
  "./views/homeIcons.js",
  "./views/categoryIcons.js",
  "./views/verifiedBadge.js",
  "./utils/workNotesLocal.js",
  "./utils/displaySettings.js",
  "./utils/policyConsent.js",
  "./views/blockedUsers.js",
  "./views/workNotes.js",
  "./views/displaySettings.js",
  "./views/privacyInfo.js",
  "./views/adminModeration.js",
  "./views/securityCenter.js",
  "./views/postavke.js",
  "./views/rating.js",
  "./views/login.js",
  "./views/register.js",
  "./views/verifyEmail.js",
  "./views/onboarding.js",
  "./views/brzo.js",
  "./views/majstori.js",
  "./views/listingAuthor.js",
  "./views/kalkulator.js",
  "./views/shared.js",
  "./views/screenFeed.js",
  "./components/bottomNav.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset)));
      await self.skipWaiting();
    })
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

  const path = url.pathname;
  const isJs = path.endsWith(".js");

  if (isJs) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
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
