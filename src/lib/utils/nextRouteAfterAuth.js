// src/utils/nextRouteAfterAuth.js
import { PATHS } from "@/config/routes.js";
import { SS, LS } from "@/config/storageKeys.js";

/**
 * Decide where to send a user after successful auth.
 * Priority:
 *   1) a previously stored "returnTo" path (from a redirect to /login or /signup)
 *   2) if the user has already named a pup → GAME; else → onboarding/setup
 *
 * Notes:
 * - Uses sessionStorage for short-lived redirects (browser/tab scoped).
 * - Uses localStorage for long-lived app state (e.g., dog named).
 * - Fully SSR-safe; guards for storage access errors.
 */

export function nextRouteAfterAuth() {
  // 1) Honor an explicit returnTo from earlier navigation (RequireAuth → Login)
  const from = safeSessionGet(SS.returnTo);
  if (isSafeInternalPath(from)) return from;

  // 2) Fall back to simple “has named a pup?” heuristic
  const named = isDogNamed();
  return named ? PATHS.GAME : safeSetupRoute();
}

/** Store the desired return path before redirecting to /login or /signup. */
export function rememberReturnTo(pathname) {
  if (!isSafeInternalPath(pathname)) return;
  safeSessionSet(SS.returnTo, pathname);
}

/** Clear returnTo after it has been used. */
export function clearReturnTo() {
  safeSessionRemove(SS.returnTo);
}

// ------------------------ internals ------------------------

function isDogNamed() {
  // If you later persist dog state in Firestore, replace this with a selector or a cheap cache.
  const dogName = (safeLocalGet(LS?.dogName || "doggerz:dogName") || "").trim();
  return dogName.length > 0;
}

function safeSetupRoute() {
  // Point this to your actual onboarding flow if/when you add it.
  // For now, go straight to GAME so new users land in the core loop post-signup.
  return PATHS.GAME;
}

function isSafeInternalPath(path) {
  if (!path || typeof path !== "string") return false;
  // Disallow protocol/host to avoid open-redirects. Only allow same-origin paths.
  return path.startsWith("/");
}

// Storage guards (SSR-safe, privacy modes safe)
function safeSessionGet(key) {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSessionSet(key, val) {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}
function safeSessionRemove(key) {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
function safeLocalGet(key) {
  try {
    if (typeof localStorage === "undefined") return null
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}