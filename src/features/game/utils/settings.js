// src/features/game/utils/settings.js
// @ts-nocheck
// Doggerz: per-device settings helper.
// - Stores/loads the "doggerz:settings" key in localStorage
// - Exposes stable defaults so engine + UI can stay in sync
// - NO Redux imports here; this file is purely ambient configuration.

const SETTINGS_STORAGE_KEY = "doggerz:settings";

export const DEFAULT_SETTINGS = {
  zip: "65401",
  useRealTime: true,
  theme: "dark",
  accent: "emerald",
  bladderModel: "realistic",
  difficulty: "normal",
  runMs: 800,
  autoPause: true,
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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

export function getLocationSettings() {
  const { zip, useRealTime } = loadSettings();
  return { zip, useRealTime };
}

export function getAppearanceSettings() {
  const { theme, accent } = loadSettings();
  return { theme, accent };
}

export function getGameplayTuning() {
  const { bladderModel, difficulty, runMs, autoPause } = loadSettings();
  return { bladderModel, difficulty, runMs, autoPause };
}

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

export function patchSettings(current, patch) {
  return { ...DEFAULT_SETTINGS, ...current, ...patch };
}
