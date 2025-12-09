// src/lib/env.js
export function getEnv(name) {
  const value = import.meta.env[name];
  if (!value) {
    console.warn(`[env] Missing env var "${name}"`);
  }
  return value;
}
