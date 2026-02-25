// src/lib/env.js

export function getEnv(key, fallback = "") {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const v = import.meta.env[key];
      if (v !== undefined) return v;
    }
  } catch {
    // ignore
  }

  try {
    if (typeof process !== "undefined" && process.env) {
      const v = process.env[key];
      if (v !== undefined) return v;
    }
  } catch {
    // ignore
  }

  return fallback;
}

export default { getEnv };
