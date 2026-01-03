/** @format */

// src/pwa/registerSW.js

/**
 * Register the PWA service worker.
 *
 * - In dev: no-op (avoids caching/HMR weirdness)
 * - In prod: registers the SW generated/served by vite-plugin-pwa or your static `public/sw.js`
 */
export function registerSW() {
  try {
    if (import.meta.env.DEV) return;
    if (!('serviceWorker' in navigator)) return;

    // `vite-plugin-pwa` typically serves the SW at /sw.js unless configured otherwise.
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[Doggerz] SW registration failed', err));
    });
  } catch {
    // no-op: SW support isn't critical to run the app
  }
}

export default registerSW;
