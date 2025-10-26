// src/config/env.js
export const DEV = import.meta.env.DEV;
export const PROD = import.meta.env.PROD;

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Doggerz";
export const BASENAME = import.meta.env.VITE_BASENAME || "/";

// Network timeout (override with VITE_NETWORK_TIMEOUT_MS)
export const NETWORK_TIMEOUT_MS = Number(
  import.meta.env.VITE_NETWORK_TIMEOUT_MS ?? 15000,
);
