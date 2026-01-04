/** @format */

// src/utils/assetUrl.js
// Helper for resolving public asset URLs when the app is deployed under a sub-path.
// Vite exposes the base via import.meta.env.BASE_URL (always ends with '/').

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/; // http:, https:, data:, blob:, etc.

/**
 * Prefix a public-path with Vite's BASE_URL.
 *
 * Examples:
 * - BASE_URL = '/'         => withBaseUrl('/icons/doggerz-192.png') -> '/icons/doggerz-192.png'
 * - BASE_URL = '/doggerz/' => withBaseUrl('/icons/doggerz-192.png') -> '(BASE_URL)icons/doggerz-192.png'
 */
export function withBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (ABSOLUTE_URL_RE.test(p)) return p;

  const base = String(import.meta.env.BASE_URL || "/");
  const baseNormalized = base.endsWith("/") ? base.slice(0, -1) : base;

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
