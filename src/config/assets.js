/** @format */

// src/config/assets.js

export const ASSET_BASE = "/assets";

/** Backgrounds */
export const BACKGROUNDS = {
  yard: {
    day: "/backgrounds/backyard-day.svg",
    night: "/backgrounds/backyard-night.svg",
    dayWide: "/backgrounds/backyard-day-wide.svg",
    nightWide: "/backgrounds/backyard-night-wide.svg",
  },
};

/** Dogs (static renders for now; will extend to actions/sheets later) */
export const DOGS = {
  puppy: {
    clean: `/assets/imports/jr/idle/frame_000.png`,
  },
  adult: {
    clean: `/assets/imports/jr/idle/frame_000.png`,
  },
  senior: {
    clean: `/assets/imports/jr/idle/frame_000.png`,
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
