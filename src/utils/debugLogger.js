const DEBUG_STORAGE_KEY = "doggerz:debugLogs";

function readStorageFlag() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage?.getItem(DEBUG_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function isDebugLoggingEnabled(explicit = null) {
  if (typeof explicit === "boolean") return explicit;

  const envEnabled =
    String(import.meta.env.VITE_ENABLE_DEBUG_LOGS || "false") === "true";
  const runtimeEnabled =
    typeof window !== "undefined" &&
    Boolean(window.__DOGGERZ_DEBUG__?.enabled === true);

  return Boolean(
    import.meta.env.DEV || envEnabled || runtimeEnabled || readStorageFlag()
  );
}

export function setDebugLoggingEnabled(enabled) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(DEBUG_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage failures in private or unsupported environments.
  }
  window.__DOGGERZ_DEBUG__ = {
    ...(window.__DOGGERZ_DEBUG__ || {}),
    enabled: Boolean(enabled),
  };
}

function normalizeScope(scope) {
  const value = String(scope || "App").trim();
  return value || "App";
}

export function debugLog(scope, message, details = undefined, options = {}) {
  const enabled = isDebugLoggingEnabled(options.enabled);
  if (!enabled) return;

  const prefix = `[Doggerz:${normalizeScope(scope)}]`;
  if (typeof details === "undefined") {
    console.log(prefix, message);
    return;
  }
  console.log(prefix, message, details);
}

export function debugWarn(scope, message, details = undefined, options = {}) {
  const enabled = isDebugLoggingEnabled(options.enabled);
  if (!enabled) return;

  const prefix = `[Doggerz:${normalizeScope(scope)}]`;
  if (typeof details === "undefined") {
    console.warn(prefix, message);
    return;
  }
  console.warn(prefix, message, details);
}

export function debugError(scope, message, details = undefined, options = {}) {
  const enabled = isDebugLoggingEnabled(options.enabled);
  if (!enabled) return;

  const prefix = `[Doggerz:${normalizeScope(scope)}]`;
  if (typeof details === "undefined") {
    console.error(prefix, message);
    return;
  }
  console.error(prefix, message, details);
}

export function summarizeDogState(state) {
  const dog = state?.dog || {};
  return {
    name: dog?.name || null,
    action: dog?.lastAction || null,
    aiState: dog?.aiState || null,
    isAsleep: Boolean(dog?.isAsleep),
    position: dog?.position || null,
    targetPosition: dog?.targetPosition || null,
    stats: {
      hunger: dog?.stats?.hunger ?? null,
      thirst: dog?.stats?.thirst ?? null,
      happiness: dog?.stats?.happiness ?? null,
      energy: dog?.stats?.energy ?? null,
      health: dog?.stats?.health ?? null,
      cleanliness: dog?.stats?.cleanliness ?? null,
    },
  };
}
