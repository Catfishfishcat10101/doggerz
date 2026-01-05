/** @format */

// src/utils/appVersion.js

/**
 * App version string, injected at build time via Vite `define` (see vite.config.js).
 * Falls back to "dev" when running without the define (local dev server).
 *
 * @type {string}
 */
export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

/**
 * Whether we're running in development mode (no injected version).
 * @type {boolean}
 */
export const IS_DEV_BUILD = APP_VERSION === "dev";

/**
 * Parse a semver-style version string into components.
 * @param {string} version - e.g. "1.2.3" or "1.2.3-beta.1"
 * @returns {{ major: number, minor: number, patch: number, prerelease: string }}
 */
export function parseVersion(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0, prerelease: version };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || "",
  };
}

/**
 * Compare two version strings (semver-style).
 * @param {string} a
 * @param {string} b
 * @returns {-1 | 0 | 1} -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);

  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;

  // Pre-release versions are considered less than release versions
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && pb.prerelease) {
    return pa.prerelease.localeCompare(pb.prerelease);
  }

  return 0;
}
