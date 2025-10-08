// src/config/ads.js
import { DEV } from "./env.js";

// Ads are OFF by default. Only flip on when you have policy/compliance sorted.
export const ENABLED = String(import.meta.env.VITE_ADS_ENABLED || "") === "1" && !DEV;
export const PROVIDER = (import.meta.env.VITE_ADS_PROVIDER || "none").toLowerCase(); // "adsense" | "none"

// Example unit IDs (replace with real)
export const UNITS = Object.freeze({
  banner: import.meta.env.VITE_ADS_UNIT_BANNER || "",
  interstitial: import.meta.env.VITE_ADS_UNIT_INTERSTITIAL || "",
  rewarded: import.meta.env.VITE_ADS_UNIT_REWARDED || "",
});

export function canShowAds(route = "/") {
  if (!ENABLED) return false;
  // Add route-level policy filters here if needed (e.g., no ads in /game for kids)
  return true;
}
