/* -------------------------------------------------------
   Doggerz Service Worker
   - App shell + runtime cache
   - Network-first for pages
   - Cache-first for static assets (sprites, backgrounds, CSS/JS)
-------------------------------------------------------- */

const CACHE_VERSION = "doggerz-v2"; // bump this whenever SW behaviour / CORE_ASSETS change
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Core assets to pre-cache on install.
// These paths are from the *public* root.
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",

  // Icons (keep in sync with manifest.webmanifest)
  "/icons/doggerz-192.png",
  "/icons/doggerz-512.png",
  "/icons/doggerz-maskable.png",

  // Sprite manifest + stage sheets (Doggerz sprite pipeline)
  "/sprites/manifest.json",
  "/sprites/jack_russell_puppy.png",
  "/sprites/jack_russell_adult.png",
  "/sprites/jack_russell_senior.png",

  // If these don't exist yet, it's fine; caching will just log an error.
  "/backgrounds/backyard-day.png",
  "/backgrounds/backyard-night.png",
  "/backgrounds/backyard-dawn.png",
  "/backgrounds/backyard-dusk.png",
];

// Static asset detection patterns
const STATIC_EXTENSIONS =
  /\.(png|jpe?g|webp|gif|svg|ico|css|js|woff2?|ttf|otf)$/i;
const STATIC_PATHS = ["/sprites/", "/icons/", "/backgrounds/"];

/* -------------------------------------------------------
   Install: pre-cache core assets
-------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => {
        // Log error for debugging; app will still work online
        console.error("[SW] Cache addAll failed:", err);
      }),
  );

  // Activate this SW immediately on next load
  self.skipWaiting();
});

/* -------------------------------------------------------
   Activate: clean old Doggerz caches
-------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          // Only touch Doggerz-specific caches
          .filter((key) => key.startsWith("doggerz-") && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );

  // Take control of currently open clients
  self.clients.claim();
});

/* -------------------------------------------------------
   Fetch handler
   - HTML: network-first + offline fallback
   - Static assets (sprites/css/js/backgrounds): cache-first
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
      STATIC_EXTENSIONS.test(pathname) ||
      STATIC_PATHS.some((prefix) => pathname.startsWith(prefix));

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
  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
}
