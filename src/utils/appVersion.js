/** @format */

// src/utils/appVersion.js

// Injected at build time via Vite `define` (see vite.config.js).
// Falls back to "dev" when running without the define.
export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
