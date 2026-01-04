/** @format */

// src/game/assetPaths.js
export const ASSETS = {
  // NOTE: These are PUBLIC assets (served from Vite's /public root), not bundled build artifacts.
  // Sprite assets have been removed - sprite function kept for compatibility but returns placeholder
  sprite: (name) => `/icons/doggerz-192.png`, // eslint-disable-line no-unused-vars
  bg: (name) => `/backgrounds/${name}`,
  audio: (name) => `/audio/${name}`,
};
