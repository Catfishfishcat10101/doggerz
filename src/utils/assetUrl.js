/** @format */

// src/utils/assetUrl.js
// Helper for resolving public asset URLs when the app is deployed under a sub-path.
// Vite exposes the base via import.meta.env.BASE_URL (always ends with '/').

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/; // http:, https:, data:, blob:, etc.
const PROTOCOL_RELATIVE_RE = /^\/\//;

function getAssetBaseOverride() {
  try {
    const envBase =
      typeof import.meta !== "undefined" && import.meta?.env?.VITE_ASSET_BASE
        ? String(import.meta.env.VITE_ASSET_BASE || "").trim()
        : "";
    if (envBase) return envBase;
  } catch {
    // ignore
  }

  try {
    const winBase =
      typeof window !== "undefined" && window?.DOGGERZ_ASSET_BASE
        ? String(window.DOGGERZ_ASSET_BASE || "").trim()
        : "";
    if (winBase) return winBase;
  } catch {
    // ignore
  }

  return "";
}

export function getBaseUrl() {
  const override = getAssetBaseOverride();
  if (override) {
    return override.endsWith("/") ? override.slice(0, -1) : override;
  }
  try {
    const raw =
      typeof import.meta !== "undefined" && import.meta?.env?.BASE_URL
        ? import.meta.env.BASE_URL
        : "/";
    const base = String(raw || "/");
    return base.endsWith("/") ? base.slice(0, -1) : base;
  } catch {
    return "";
  }
}

export function isAbsoluteUrl(path) {
  const p = String(path || "").trim();
  return ABSOLUTE_URL_RE.test(p) || PROTOCOL_RELATIVE_RE.test(p);
}

/**
 * Prefix a public-path with Vite's BASE_URL.
 *
 * Examples:
 * - BASE_URL = '/'         => withBaseUrl('/assets/icons/doggerz-192.png') -> '/assets/icons/doggerz-192.png'
 * - BASE_URL = '/doggerz/' => withBaseUrl('/assets/icons/doggerz-192.png') -> '(BASE_URL)assets/icons/doggerz-192.png'
 */
export function withBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (isAbsoluteUrl(p)) return p;

  const baseNormalized = getBaseUrl();

  // If the caller already passed a BASE_URL-prefixed path, return it unchanged.
  if (baseNormalized && p === baseNormalized) return p;
  if (baseNormalized && p.startsWith(`${baseNormalized}/`)) return p;

  if (p.startsWith("/")) return `${baseNormalized}${p}`;
  return `${baseNormalized}/${p}`;
}

export function joinPublicPath(base, file) {
  const b = String(base || "").replace(/\/+$/g, "");
  const f = String(file || "").replace(/^\/+/, "");
  return `${b}/${f}`;
}

export function stripBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  const base = getBaseUrl();
  if (!base) return p;
  if (p === base) return "/";
  if (p.startsWith(`${base}/`)) return p.slice(base.length) || "/";
  return p;
}
