const CACHE_NAME = "orion-pwa-v37-files-documents";
const APP_SHELL = [
  "/",
  "/index.html",
  "/game.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/css/styles.css",
  "/assets/css/lord-dragons.css",
  "/assets/css/tokens.css",
  "/assets/css/base.css",
  "/assets/css/components.css",
  "/assets/css/accessibility.css",
  "/assets/js/api.js",
  "/assets/js/brain-vault.js",
  "/assets/js/design-system.js",
  "/assets/js/main.js",
  "/assets/js/living-avatar.js",
  "/assets/js/onboarding.js",
  "/assets/js/pwa.js",
  "/assets/js/scene.js",
  "/assets/js/socket.js",
  "/assets/js/voice-engine.js",
  "/assets/js/lord-dragons/content.js",
  "/assets/js/lord-dragons/audio.js",
  "/assets/js/lord-dragons/main.js",
  "/assets/js/lord-dragons/state.js",
  "/assets/js/lord-dragons/ui.js",
  "/assets/js/lord-dragons/scenes/BootScene.js",
  "/assets/js/lord-dragons/scenes/WorldScene.js",
  "/assets/images/lord-dragons/official-title-reference.jpeg",
  "/assets/vendor/phaser.min.js",
  "/assets/icons/orion-icon.svg",
  "/assets/icons/orion-maskable.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match("/offline.html"))
    );
    return;
  }

  if (requestUrl.pathname.startsWith("/assets/js/") || requestUrl.pathname.startsWith("/assets/css/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
