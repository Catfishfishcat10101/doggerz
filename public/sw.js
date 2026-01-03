<<<<<<< HEAD
=======
/** @format */

>>>>>>> master
// public/sw.js

/* -------------------------------------------------------
   Doggerz Service Worker
   - App shell + runtime cache
   - Network-first for pages
   - Cache-first for static assets
-------------------------------------------------------- */

<<<<<<< HEAD
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
  "/icons/doggerz-192.svg",
  "/icons/doggerz-512.svg",

  // Sprite sheet
  "/assets/sprites/jack_russell_puppy.png",
  "/assets/sprites/jack_russell_adult.png",
  "/assets/sprites/jack_russell_senior.png",
=======
const CACHE_VERSION = 'doggerz-v11'; // bump this when you change cached assets or SW behaviour
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Support deployments under a sub-path (e.g. GitHub Pages):
// - scope might be https://example.com/doggerz/
// - we want precache + fallbacks to use /doggerz/... rather than /...
const SCOPE_URL = new URL(self.registration.scope);
const BASE_PATH = SCOPE_URL.pathname.replace(/\/$/, ''); // '' for root scope

function withBase(path) {
  const p = String(path || '');
  if (!p) return p;
  // absolute scheme (http:, https:, data:, ...)
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(p)) return p;

  if (p === '/') return BASE_PATH ? `${BASE_PATH}/` : '/';

  const normalized = p.startsWith('/') ? p : `/${p}`;
  return BASE_PATH ? `${BASE_PATH}${normalized}` : normalized;
}

// Core assets to pre-cache on install.
// These paths are from the *public* root.
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/offline.html',

  // Icons (must exist under /public/icons)
  '/icons/doggerz-180.png',
  '/icons/doggerz-192.png',
  '/icons/doggerz-512.png',
  '/icons/doggerz-logo.svg',

  // Sprite sheet
  '/sprites/jack_russell_puppy.webp',
  '/sprites/jack_russell_adult.webp',
  '/sprites/jack_russell_senior.webp',

  // Backgrounds
  '/backgrounds/backyard-day.webp',
  '/backgrounds/backyard-night.webp',
  '/backgrounds/backyard-day-wide.webp',
  '/backgrounds/backyard-night-wide.webp',

  // Audio
  '/audio/bark.m4a',
>>>>>>> master
];

/* -------------------------------------------------------
   Install: pre-cache core assets
-------------------------------------------------------- */
<<<<<<< HEAD
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => {
        console.error("Failed to cache core assets:", err);
        // silent fail; app will still work online
      }),
  );

  // Activate this SW immediately on next load
  self.skipWaiting();
=======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS.map(withBase)))
      .catch(() => {
        // silent fail; app will still work online
      })
  );
});

/* -------------------------------------------------------
   Messages
   - SKIP_WAITING: app requested an update after user confirmation
-------------------------------------------------------- */
self.addEventListener('message', (event) => {
  const msg = event?.data;
  if (msg && msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
>>>>>>> master
});

/* -------------------------------------------------------
   Activate: clean old caches
-------------------------------------------------------- */
<<<<<<< HEAD
self.addEventListener("activate", (event) => {
=======
self.addEventListener('activate', (event) => {
>>>>>>> master
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
<<<<<<< HEAD
            .map((key) => caches.delete(key)),
        ),
      ),
=======
            .map((key) => caches.delete(key))
        )
      )
>>>>>>> master
  );

  // Take control of currently open clients
  self.clients.claim();
});

/* -------------------------------------------------------
   Fetch handler
   - HTML: network-first + offline fallback
   - Static assets: cache-first
-------------------------------------------------------- */
<<<<<<< HEAD
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;
=======
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;
>>>>>>> master

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Navigation requests (HTML pages)
  const isNavigation =
<<<<<<< HEAD
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");
=======
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');
>>>>>>> master

  if (isNavigation) {
    // Network-first for pages
    event.respondWith(networkFirst(request));
    return;
  }

  // For same-origin static assets, use cache-first
  if (isSameOrigin) {
    const pathname = url.pathname;
<<<<<<< HEAD

    const isStaticAsset =
      pathname.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i) ||
      pathname.match(/\.(css|js|woff2?|ttf|otf)$/i) ||
      pathname.startsWith("/assets/sprites/") ||
      pathname.startsWith("/icons/");
=======
    const scopedPath =
      BASE_PATH && pathname.startsWith(BASE_PATH)
        ? pathname.slice(BASE_PATH.length) || '/'
        : pathname;

    const isStaticAsset =
      scopedPath.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i) ||
      scopedPath.match(/\.(mp3|wav|ogg|m4a)$/i) ||
      scopedPath.match(/\.(css|js|woff2?|ttf|otf)$/i) ||
      scopedPath.startsWith('/sprites/') ||
      scopedPath.startsWith('/backgrounds/') ||
      scopedPath.startsWith('/audio/') ||
      scopedPath.startsWith('/models/') ||
      scopedPath.startsWith('/icons/');
>>>>>>> master

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
<<<<<<< HEAD
    // Stash a copy in cache for offline, but only for successful responses
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
=======
    // Stash a copy in cache for offline
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
>>>>>>> master
    return response;
  } catch (err) {
    // Offline fallback: cached version or shell
    const cached = await caches.match(request);
    if (cached) return cached;

    // If nothing else, try index.html
<<<<<<< HEAD
    return caches.match("/index.html");
=======
    const offline = await caches.match(withBase('/offline.html'));
    if (offline) return offline;
    return caches.match(withBase('/index.html'));
>>>>>>> master
  }
}

async function cacheFirst(request) {
<<<<<<< HEAD
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
=======
  const cached = await caches.match(request);
  if (cached) return cached;

  // Not cached yet → fetch & store
  try {
>>>>>>> master
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
<<<<<<< HEAD
=======
    // Offline fallbacks to avoid broken UI.
    try {
      const dest = request.destination;
      if (dest === 'image') {
        const fallback = await caches.match(withBase('/icons/doggerz-192.png'));
        if (fallback) return fallback;
      }
      if (dest === 'audio') {
        return new Response(null, { status: 204 });
      }
    } catch {
      // ignore
    }

>>>>>>> master
    throw err;
  }
}
