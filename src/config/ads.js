// src/config/ads.js
import { DEV } from "./env.js";

export const ENABLED =
  String(import.meta.env.VITE_ADS_ENABLED || "") === "1" && !DEV;

export const PROVIDER =
  (import.meta.env.VITE_ADS_PROVIDER || "none").toLowerCase(); // "adsense" | "none"

export const UNITS = Object.freeze({
  banner: import.meta.env.VITE_ADS_UNIT_BANNER || "",
  interstitial: import.meta.env.VITE_ADS_UNIT_INTERSTITIAL || "",
  rewarded: import.meta.env.VITE_ADS_UNIT_REWARDED || "",
});

export function canShowAds(route = "/") {
  if (!ENABLED) return false;
  return true;
}
