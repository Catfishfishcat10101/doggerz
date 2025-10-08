// src/config/configureHelpers.js
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function assert(cond, msg = "Assertion failed") {
  if (!cond) throw new Error(msg);
}

export function deepFreeze(obj) {
  Object.freeze(obj);
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "object" && v !== null && !Object.isFrozen(v)) {
      deepFreeze(v);
    }
  }
  return obj;
}

// Merge with overwrite (simple, predictable)
export function merge(target, src) {
  const out = { ...target };
  for (const [k, v] of Object.entries(src || {})) {
    if (isPlainObject(v) && isPlainObject(out[k])) out[k] = merge(out[k], v);
    else out[k] = v;
  }
  return out;
}

function isPlainObject(v) {
  return Object.prototype.toString.call(v) === "[object Object]";
}
