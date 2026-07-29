const CACHE_NAME = "orion-pwa-v51-orb-identity";
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
  "/assets/js/avatar-3d.js",
  "/assets/js/brain-vault.js",
  "/assets/js/design-system.js",
  "/assets/js/gsap-orion.js",
  "/assets/js/main.js",
  "/assets/js/living-avatar.js",
  "/assets/js/onboarding.js",
  "/assets/js/portfolio-profile.js",
  "/assets/js/premium-visuals.js",
  "/assets/js/pwa.js",
  "/assets/js/scene.js",
  "/assets/js/socket.js",
  "/assets/js/voice-engine.js",
  "/assets/models/avatar-manifest.json",
  "/assets/animations/animation-manifest.json",
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
  "/assets/icons/orion-maskable.svg",
  "/assets/videos/293297_medium.mp4"
];

function freshRequest(input) {
  return new Request(input, { cache: "reload" });
}

function isAppShellPath(pathname) {
  return (
    APP_SHELL.includes(pathname) ||
    pathname.startsWith("/assets/js/") ||
    pathname.startsWith("/assets/css/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/assets/models/avatar-manifest.json" ||
    pathname === "/assets/animations/animation-manifest.json"
  );
}

async function putFreshResponse(request) {
  const response = await fetch(freshRequest(request));

  if (response && response.ok && request.method === "GET") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function deleteOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
}

async function notifyClients() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  clients.forEach((client) => {
    client.postMessage({
      type: "ORION_SW_ACTIVATED",
      cacheName: CACHE_NAME
    });
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((path) => freshRequest(path))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    deleteOldCaches()
      .then(() => self.clients.claim())
      .then(() => notifyClients())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      putFreshResponse(event.request)
        .catch(() => caches.match("/offline.html"))
    );
    return;
  }

  if (isAppShellPath(requestUrl.pathname)) {
    event.respondWith(
      putFreshResponse(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
