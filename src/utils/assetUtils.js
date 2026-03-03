/** @format */
// src/utils/assetUtils.js
// Small helpers for asset URLs and app metadata.

export function withBaseUrl(path) {
  const base = String(import.meta.env.BASE_URL || "/");
  const raw = String(path || "");
  if (!raw) return base;
  if (/^https?:\/\//i.test(raw)) return raw;

  const baseClean = base.endsWith("/") ? base.slice(0, -1) : base;
  const pathClean = raw.startsWith("/") ? raw : `/${raw}`;
  return baseClean ? `${baseClean}${pathClean}` : pathClean;
}

export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined"
    ? __APP_VERSION__
    : String(import.meta.env.VITE_APP_VERSION || "dev");
