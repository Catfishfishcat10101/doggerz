/** @format */
// src/utils/assetUtils.js
// Small helpers for asset URLs and app metadata.

export function withBaseUrl(path) {
  const raw = String(path || "");
  const base = String(import.meta.env.BASE_URL || "/");
  if (!raw) return base;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("data:")) return raw;

  const normalizedPath = raw.replace(/^\/+/, "");
  const baseHref =
    typeof document !== "undefined"
      ? document.baseURI
      : typeof window !== "undefined"
        ? `${window.location.origin}/`
        : "http://localhost/";

  try {
    return new URL(normalizedPath, new URL(base, baseHref)).href;
  } catch {
    const pathClean = raw.startsWith("/") ? raw : `/${raw}`;
    return pathClean;
  }
}

export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined"
    ? __APP_VERSION__
    : String(import.meta.env.VITE_APP_VERSION || "dev");
