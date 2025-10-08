/**
 * routes.js — robust public/private route detection
 *
 * Key features:
 * - Accepts raw paths OR full URLs (e.g. "https://example.com/privacy?id=1#t").
 * - Strips query/hash, normalizes trailing slashes, collapses double slashes.
 * - Handles a configurable base path (e.g. "/app" or Vite base).
 * - Supports both exact public paths AND "prefix" paths (entire subtree).
 * - Pure ESM with zero deps.
 *
 * Usage:
 *   isPublicPath("/login")                      // true
 *   isPublicPath("/privacy/policy")             // true (prefix rule)
 *   isPublicUrl("https://x/y#z?x=1")            // depends on path
 *   isPublicPath("/app/login", { base: "/app" })// true
 */

/** Exact public routes (no trailing slash). */
export const PUBLIC_STATIC = Object.freeze([
  "/",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
]);

/** Public subtrees: any path that starts with one of these prefixes. */
export const PUBLIC_PREFIXES = Object.freeze([
  "/privacy",
  "/terms",
]);

/**
 * Normalize an input path or URL to a canonical pathname:
 * - Removes origin, query, and hash
 * - Strips `base` prefix if provided
 * - Collapses duplicate slashes
 * - Removes trailing slash (except root)
 *
 * @param {string} input - pathname like "/foo/bar" OR full URL
 * @param {{ base?: string }} [opts]
 * @returns {string} normalized pathname
 */
export function normalizePath(input = "/", opts = {}) {
  const { base = "" } = opts;

  // Derive pathname from full URL if needed
  let pathname = "/";
  try {
    if (typeof input === "string") {
      if (input.includes("://")) {
        // Full URL
        pathname = new URL(input).pathname || "/";
      } else {
        // Already a path
        pathname = input || "/";
      }
    }
  } catch {
    // Fallback to raw input if URL parsing fails
    pathname = typeof input === "string" ? input : "/";
  }

  // Remove query/hash if they slipped through (defensive)
  pathname = pathname.split("#")[0].split("?")[0] || "/";

  // Normalize multiple slashes
  pathname = pathname.replace(/\/{2,}/g, "/");

  // Strip base path if provided (e.g., "/app")
  if (base && pathname.toLowerCase().startsWith(base.toLowerCase())) {
    pathname = pathname.slice(base.length) || "/";
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  }

  // Remove trailing slash (except root)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  return pathname;
}

/**
 * Fast path check for public routes.
 *
 * @param {string} pathname - path or full URL
 * @param {{ base?: string, static?: string[], prefixes?: string[] }} [opts]
 * @returns {boolean}
 */
export function isPublicPath(pathname = "/", opts = {}) {
  const p = normalizePath(pathname, { base: opts.base });

  const staticList = (opts.static ?? PUBLIC_STATIC);
  const prefixList = (opts.prefixes ?? PUBLIC_PREFIXES);

  // Prebuild sets for O(1) exact checks
  // (for small arrays this is negligible, but future-proof)
  const STATIC_SET = toSet(staticList);

  if (STATIC_SET.has(p)) return true;

  // Prefix subtree match: "/privacy" AND "/privacy/..." are public
  for (const prefix of prefixList) {
    if (p === prefix || p.startsWith(prefix + "/")) return true;
  }
  return false;
}

/**
 * URL variant of isPublicPath: accepts any href.
 * @param {string} href
 * @param {{ base?: string, static?: string[], prefixes?: string[] }} [opts]
 * @returns {boolean}
 */
export function isPublicUrl(href = "/", opts = {}) {
  return isPublicPath(href, opts);
}

/** Utility: safe Set builder for arrays (no prototype surprises). */
function toSet(arr) {
  const s = new Set();
  for (const item of arr || []) s.add(item);
  return s;
}

/* ---------------------------
   Examples / sanity checks
   (delete if you don’t like inline docs)
-----------------------------

isPublicPath("/")                          // true
isPublicPath("/login")                     // true
isPublicPath("/privacy")                   // true
isPublicPath("/privacy/anything")          // true
isPublicPath("/terms/v2")                  // true
isPublicPath("/game")                      // false

// Base path:
isPublicPath("/app/login", { base: "/app" })  // true
isPublicPath("/app/privacy/x", { base: "/app" }) // true

// URL forms:
isPublicUrl("https://ex.com/privacy?id=1#k") // true
isPublicUrl("https://ex.com/game?t=1")       // false

*/
