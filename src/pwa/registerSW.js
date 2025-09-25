// src/pwa/registerSW.js
// Thin wrapper around vite-plugin-pwa's virtual module.
// In dev, it's a no-op; in prod, it registers the SW and returns an updater.

import { registerSW as viteRegisterSW } from "virtual:pwa-register";

/**
 * @param {Object} options
 * @param {(reload: ()=>void)=>void} [options.onNeedRefresh] - Called when a new SW is waiting. Call reload() to activate.
 * @param {()=>void} [options.onOfflineReady] - Called once app is cached for offline.
 * @param {(reg: ServiceWorkerRegistration | undefined) => void} [options.onRegistered]
 * @returns {() => void} updateSW - Call to trigger immediate update/activation.
 */
export function registerSW(options = {}) {
  // Don’t register a real SW in dev unless you explicitly enable it via devOptions in VitePWA.
  if (import.meta.env.DEV) {
    return () => {};
  }

  const updateSW = viteRegisterSW({
    immediate: true, // install as soon as possible after first load
    onNeedRefresh() {
      // new version waiting; let UI decide when to reload
      if (typeof options.onNeedRefresh === "function") {
        const reload = () => updateSW();
        options.onNeedRefresh(reload);
      }
    },
    onOfflineReady() {
      if (typeof options.onOfflineReady === "function") {
        options.onOfflineReady();
      }
    },
    onRegistered(swRegistration) {
      if (typeof options.onRegistered === "function") {
        options.onRegistered(swRegistration);
      }
    },
  });

  return updateSW;
}
