/** @format */

// src/game/assetPaths.js
export const ASSETS = {
  // NOTE: These are PUBLIC assets (served from Vite's /public root), not bundled build artifacts.
  sprite: (name) => `/sprites/${name}`,
  bg: (name) => `/backgrounds/${name}`,
  audio: (name) => `/audio/${name}`,
};
