/* src/utils/nextRouteAfterAuth.js */

const STORE_KEY = "doggerz:returnTo";
const DEFAULT_AFTER_LOGIN = "/game";   // change if your app uses a different path
const BLOCKED = new Set(["/login", "/signup", "/auth", "/logout"]);

function isSafeInternal(path) {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  // disallow protocol-ish or double-slash tricks
  if (path.includes("://") || path.startsWith("//")) return false;
  return true;
}

export function rememberReturnTo(locationLike) {
  try {
    if (!locationLike) return;
    const path = (locationLike.pathname || "/") +
                 (locationLike.search || "") +
                 (locationLike.hash || "");
    if (!isSafeInternal(path)) return;
    if (BLOCKED.has(locationLike.pathname)) return;
    sessionStorage.setItem(STORE_KEY, path);
  } catch {/* ignore */}
}

export function clearReturnTo() {
  try { sessionStorage.removeItem(STORE_KEY); } catch {/* ignore */}
}

function takeReturnTo() {
  try {
    const v = sessionStorage.getItem(STORE_KEY);
    if (v) sessionStorage.removeItem(STORE_KEY);
    return v;
  } catch {
    return null;
  }
}

/**
 * Decide where to go after auth succeeds.
 * Usage in Login.jsx:
 *   navigate(nextRouteAfterAuth({ defaultPath: PATHS.GAME }, location), { replace: true });
 */
export function nextRouteAfterAuth({ defaultPath = DEFAULT_AFTER_LOGIN } = {}, locationLike = null) {
  // Prefer an explicit remembered path
  const remembered = takeReturnTo();
  if (isSafeInternal(remembered) && !BLOCKED.has(remembered)) return remembered;

  // If the login page carried a ?returnTo=/foo param, honor it
  try {
    const search = (locationLike && locationLike.search) || "";
    if (search.startsWith("?")) {
      const p = new URLSearchParams(search);
      const q = p.get("returnTo");
      if (isSafeInternal(q) && !BLOCKED.has(q)) return q;
    }
  } catch {/* ignore */}

  return defaultPath;
}
