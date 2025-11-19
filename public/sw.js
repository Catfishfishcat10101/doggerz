// public/sw.js

/* -------------------------------------------------------
   Doggerz Service Worker
   - App shell + runtime cache
   - Network-first for pages
   - Cache-first for static assets
-------------------------------------------------------- */

const CACHE_VERSION = "doggerz-v1"; // bump this when you change SW behaviour
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Core assets to pre-cache on install.
// These paths are from the *public* root.
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",

  // Icons (adjust to whatever icons you actually have)
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",

  // Sprite sheet
  "/sprites/jack_russell_directions.png",
];

/* -------------------------------------------------------
   Install: pre-cache core assets
-------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {
        // silent fail; app will still work online
      })
  );

  // Activate this SW immediately on next load
  self.skipWaiting();
});

/* -------------------------------------------------------
   Activate: clean old caches
-------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
  );

  // Take control of currently open clients
  self.clients.claim();
});

/* -------------------------------------------------------
   Fetch handler
   - HTML: network-first + offline fallback
   - Static assets: cache-first
-------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Navigation requests (HTML pages)
  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    // Network-first for pages
    event.respondWith(networkFirst(request));
    return;
  }

  // For same-origin static assets, use cache-first
  if (isSameOrigin) {
    const pathname = url.pathname;

    const isStaticAsset =
      pathname.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i) ||
      pathname.match(/\.(css|js|woff2?|ttf|otf)$/i) ||
      pathname.startsWith("/sprites/") ||
      pathname.startsWith("/icons/");

    if (isStaticAsset) {
      event.respondWith(cacheFirst(request));
      return;
    }
  }

  // Fallback: straight network, with cache fallback
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

/* -------------------------------------------------------
   Strategies
-------------------------------------------------------- */

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Stash a copy in cache for offline
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    // Offline fallback: cached version or shell
    const cached = await caches.match(request);
    if (cached) return cached;

    // If nothing else, try index.html
    return caches.match("/index.html");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  // Not cached yet → fetch & store
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    throw err;
  }
}
