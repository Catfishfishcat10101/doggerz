// src/utils/routes.js
/** Return true for routes that use the compact public navbar. */
export function isPublicPath(pathname = "/") {
  const PUBLIC = new Set(["/", "/login", "/signup", "/privacy", "/terms"]);
  // treat subpaths of /privacy and /terms as public too, if you have them:
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return true;
  return PUBLIC.has(pathname);
}
