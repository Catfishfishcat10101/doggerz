// src/utils/routes.js
export const PUBLIC_PATHS = [
  "/", "/login", "/signup",
  "/legal/terms", "/legal/privacy",
  "/onboarding",
];

export function isPublicPath(pathname = "/") {
  if (!pathname) return true;
  // Handle nested public paths in the future if needed
  return PUBLIC_PATHS.includes(pathname);
}
