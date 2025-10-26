// src/utils/nextRouteAfterAuth.js
import { PATHS } from "@/config/routes.js";
import { SS, LS } from "@/config/storageKeys.js";

/**
 * Decide where to send a user after successful auth.
 */
export function nextRouteAfterAuth() {
  const from = safeSessionGet(SS.returnTo);
  if (isSafeInternalPath(from)) return from;

  return isDogNamed() ? PATHS.GAME : PATHS.ONBOARDING;
}

/** Save intended route before redirecting to login/signup */
export function rememberReturnTo(pathname) {
  if (isSafeInternalPath(pathname)) {
    safeSessionSet(SS.returnTo, pathname);
  }
}

/** Clear the remembered route after usage */
export function clearReturnTo() {
  safeSessionRemove(SS.returnTo);
}

// ------------------------ Internals ------------------------

function isDogNamed() {
  try {
    const raw = safeLocalGet(LS.dog);
    const dog = raw ? JSON.parse(raw) : null;
    return !!dog?.name?.trim();
  } catch {
    return false;
  }
}

function isSafeInternalPath(path) {
  return typeof path === "string" && path.startsWith("/");
}

// ------------------------ Safe Storage Access ------------------------

function safeSessionGet(key) {
  try {
    return typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(key)
      : null;
  } catch {
    return null;
  }
}
function safeSessionSet(key, val) {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(key, val);
    }
  } catch {}
}
function safeSessionRemove(key) {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(key);
    }
  } catch {}
}
function safeLocalGet(key) {
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(key)
      : null;
  } catch {
    return null;
  }
}
