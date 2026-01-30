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
export function normalizeVersionInput(version) {
  const raw = String(version || "").trim();
  if (!raw) return "";
  return raw.startsWith("v") ? raw.slice(1) : raw;
}

export function parseVersion(version) {
  const normalized = normalizeVersionInput(version);
  const match = String(normalized).match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/
  );
  if (!match) {
    return { major: 0, minor: 0, patch: 0, prerelease: normalized };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || "",
    build: match[5] || "",
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

export function formatAppVersion(version = APP_VERSION) {
  const v = normalizeVersionInput(version);
  if (!v || v === "dev") return "dev";
  return v.startsWith("v") ? v : `v${v}`;
}

export function isVersionAtLeast(version, minimum) {
  if (!version || !minimum) return false;
  return compareVersions(version, minimum) >= 0;
}

export function getAppVersionMeta() {
  const parsed = parseVersion(APP_VERSION);
  return {
    raw: APP_VERSION,
    display: formatAppVersion(APP_VERSION),
    isDev: IS_DEV_BUILD,
    ...parsed,
  };
}
