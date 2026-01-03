/** @format */

// src/utils/runtimeLogging.js

const MAX_CAPTURED_ERRORS = 25;

function getBucket() {
  if (typeof window === 'undefined') return null;
  if (!window.__DOGGERZ_ERROR_BUCKET__) {
    window.__DOGGERZ_ERROR_BUCKET__ = [];
  }
  return window.__DOGGERZ_ERROR_BUCKET__;
}

export function captureRuntimeError(err, context = {}) {
  const bucket = getBucket();
  if (!bucket) return;

  const entry = {
    at: new Date().toISOString(),
    message: err?.message || String(err),
    name: err?.name || 'Error',
    stack: err?.stack || null,
    context,
  };

  bucket.unshift(entry);
  if (bucket.length > MAX_CAPTURED_ERRORS) bucket.length = MAX_CAPTURED_ERRORS;
}

export function getCapturedErrors() {
  const bucket = getBucket();
  return Array.isArray(bucket) ? [...bucket] : [];
}

export function initRuntimeLogging({ mode } = {}) {
  if (typeof window === 'undefined') return;

  const isProd = mode === 'prod';

  // Capture unhandled errors for support.
  window.addEventListener('error', (e) => {
    captureRuntimeError(e?.error || e, { source: 'window.error' });
  });

  window.addEventListener('unhandledrejection', (e) => {
    captureRuntimeError(e?.reason || e, {
      source: 'window.unhandledrejection',
    });
  });

  // Logging policy: keep warn/error, suppress noisy logs in prod.
  if (isProd) {
    try {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    } catch {
      // ignore
    }
  }
}
