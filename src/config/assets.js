/** @format */

// src/config/assets.js

export const ASSET_BASE = "/assets";

/** Backgrounds */
export const BACKGROUNDS = {
  yard: {
    day: "/backgrounds/backyard-day.webp",
    night: "/backgrounds/backyard-night.webp",
    dayWide: "/backgrounds/backyard-day-wide.webp",
    nightWide: "/backgrounds/backyard-night-wide.webp",
  },
};

/** Dogs (static renders for now; will extend to actions/sheets later) */
export const DOGS = {
  puppy: {
    clean: `${ASSET_BASE}/dogs/puppy/clean.webp`,
  },
  adult: {
    clean: `${ASSET_BASE}/dogs/adult/clean.webp`,
  },
  senior: {
    clean: `${ASSET_BASE}/dogs/senior/clean.webp`,
  },
};

/** Audio */
export const AUDIO = {
  bark: `${ASSET_BASE}/audio/bark.m4a`,
  musicDir: `${ASSET_BASE}/audio/music`,
};

/**
 * Safe getter utility for nested maps.
 * @param {object} obj
 * @param {string[]} path
 * @param {string|null} fallback
 */
export function getAsset(obj, path, fallback = null) {
  let cur = obj;
  for (const k of path) {
    if (!cur || typeof cur !== "object" || !(k in cur)) return fallback;
    cur = cur[k];
  }
  return typeof cur === "string" ? cur : fallback;
}
