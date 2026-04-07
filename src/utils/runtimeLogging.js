// src/utils/runtimeLogging.js

/**
 * @typedef {Object} ErrorEntry
 * @property {string} at
 * @property {string} message
 * @property {string} name
 * @property {string|null} stack
 * @property {Object} context
 */

/** @type {ErrorEntry[]} */
const MAX_CAPTURED_ERRORS = 25;

function getBucket() {
  if (typeof window === "undefined") return null;
  if (!window.__DOGGERZ_ERROR_BUCKET__) {
    window.__DOGGERZ_ERROR_BUCKET__ = [];
  }
  return window.__DOGGERZ_ERROR_BUCKET__;
}

function normalizeError(err, context = {}) {
  if (err instanceof Error) {
    return {
      at: new Date().toISOString(),
      message: err.message || "Unknown error",
      name: err.name || "Error",
      stack: err.stack || null,
      context,
    };
  }

  if (typeof err === "string") {
    return {
      at: new Date().toISOString(),
      message: err,
      name: "Error",
      stack: null,
      context,
    };
  }

  return {
    at: new Date().toISOString(),
    message: "Unknown runtime error",
    name: "Error",
    stack: null,
    context: { ...context, raw: err },
  };
}

export function captureRuntimeError(err, context = {}) {
  const bucket = getBucket();
  if (!bucket) return;

  const entry = normalizeError(err, context);

  bucket.unshift(entry);
  if (bucket.length > MAX_CAPTURED_ERRORS) bucket.length = MAX_CAPTURED_ERRORS;
}

export function getCapturedErrors() {
  const bucket = getBucket();
  return Array.isArray(bucket) ? [...bucket] : [];
}

function hasRuntimeLoggingInit() {
  return (
    typeof window !== "undefined" &&
    window.__DOGGERZ_RUNTIME_LOGGING_INIT__ === true
  );
}

function markRuntimeLoggingInit() {
  if (typeof window !== "undefined") {
    window.__DOGGERZ_RUNTIME_LOGGING_INIT__ = true;
  }
}

export function initRuntimeLogging() {
  if (typeof window === "undefined") return;
  if (hasRuntimeLoggingInit()) return;
  markRuntimeLoggingInit();

  // Capture unhandled errors for support.
  window.addEventListener("error", (e) => {
    captureRuntimeError(e?.error || e, {
      source: "window.error",
      filename: e?.filename || null,
      lineno: e?.lineno || null,
      colno: e?.colno || null,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    captureRuntimeError(e?.reason || e, {
      source: "window.unhandledrejection",
    });
  });
}
