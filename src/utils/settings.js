// src/utils/settings.js
// @ts-nocheck
//
// Doggerz: per-device settings helper.
// - Stores/loads the "doggerz:settings" key in localStorage
// - Exposes stable defaults so engine + UI can stay in sync
// - NO Redux imports here; this file is purely ambient configuration.

const SETTINGS_STORAGE_KEY = "doggerz:settings";

/**
 * Defaults for all Doggerz settings.
 * These are merged over anything loaded from localStorage.
 */
export const DEFAULT_SETTINGS = {
  // Location / time
  zip: "65401", // Fallback ZIP
  useRealTime: true, // true = use ZIP + OpenWeather if available

  // Appearance
  theme: "dark" | "light",
  accent: "emerald", // "emerald" | "teal" | "violet"

  // Gameplay tuning
  bladderModel: "realistic", // "realistic" | "meals"
  difficulty: "normal", // "chill" | "normal" | "hard"
  runMs: 800, // sprint animation duration (ms)
  autoPause: true, // pause tick loop when tab hidden

  // Reserved for future:
  // soundEnabled: true,
  // vibrationEnabled: false,
};

/**
 * Safely parse JSON; returns null on failure.
 */
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Load settings from localStorage, merged with DEFAULT_SETTINGS.
 * Always returns a full object, never null/undefined.
 */
export function loadSettings() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS };
  }

  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };

  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  return { ...DEFAULT_SETTINGS, ...parsed };
}

/**
 * Persist settings back to localStorage.
 * Non-fatal on failure (e.g., private mode / quota).
 */
export function saveSettings(nextSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(nextSettings),
    );
  } catch {
    // ignore
  }
}

/**
 * Convenience: get just the location-relevant settings.
 */
export function getLocationSettings() {
  const { zip, useRealTime } = loadSettings();
  return { zip, useRealTime };
}

/**
 * Convenience: get theme + accent.
 * This is mainly for the Settings page / theming layer.
 */
export function getAppearanceSettings() {
  const { theme, accent } = loadSettings();
  return { theme, accent };
}

/**
 * Gameplay knobs that DogAI cares about.
 */
export function getGameplayTuning() {
  const { bladderModel, difficulty, runMs, autoPause } = loadSettings();
  return { bladderModel, difficulty, runMs, autoPause };
}

/**
 * Difficulty → decay multiplier.
 * DogAI should multiply base DECAY_PER_HOUR by this.
 */
export function getDifficultyMultiplier(difficulty) {
  switch (difficulty) {
    case "chill":
      return 0.7;
    case "hard":
      return 1.35;
    case "normal":
    default:
      return 1.0;
  }
}

/**
 * Helper for writing partial patches:
 * const settings = loadSettings();
 * const next = patchSettings(settings, { difficulty: "hard" });
 * saveSettings(next);
 */
export function patchSettings(current, patch) {
  return { ...DEFAULT_SETTINGS, ...current, ...patch };
}
