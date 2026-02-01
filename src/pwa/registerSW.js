/** @format */

// src/pwa/registerSW.js

import { withBaseUrl } from "@/utils/assetUrl.js";

/**
 * Register the PWA service worker.
 *
 * - In dev: no-op (avoids caching/HMR weirdness)
 * - In prod: registers the SW generated/served by vite-plugin-pwa or your static `public/sw.js`
 */
export function registerSW(options = {}) {
  try {
    if (import.meta.env.DEV) return;
    if (!("serviceWorker" in navigator)) return;

    const {
      swPath = "/sw.js",
      scope,
      immediate = false,
      onSuccess,
      onUpdate,
      onError,
    } = options || {};

    const doRegister = async () => {
      try {
        const reg = await navigator.serviceWorker.register(
          withBaseUrl(swPath),
          {
            scope: scope ? withBaseUrl(scope) : undefined,
          }
        );

        if (typeof onSuccess === "function") onSuccess(reg);

        if (reg.waiting && typeof onUpdate === "function") {
          onUpdate(reg);
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              if (typeof onUpdate === "function") onUpdate(reg);
            }
          });
        });

        return reg;
      } catch (err) {
        console.warn("[Doggerz] SW registration failed", err);
        if (typeof onError === "function") onError(err);
        return null;
      }
    };

    // `vite-plugin-pwa` typically serves the SW at /sw.js unless configured otherwise.
    window.addEventListener("load", () => {
      if (immediate) {
        void doRegister();
        return;
      }
      window.setTimeout(() => {
        void doRegister();
      }, 0);
    });
  } catch {
    // no-op: SW support isn't critical to run the app
  }
}

export default registerSW;
