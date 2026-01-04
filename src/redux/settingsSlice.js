/** @format */

// src/redux/settingsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const SETTINGS_STORAGE_KEY = "doggerz:settingsState";

const loadFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[settingsSlice] Failed to parse settings from storage:", e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[settingsSlice] Failed to save settings to storage:", e);
  }
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function normalizeTrainingInputMode(value, fallback = "both") {
  const v = String(value || "").toLowerCase();
  if (v === "buttons" || v === "voice" || v === "both") return v;
  return fallback;
}

function normalizeLoadedSettings(raw) {
  if (!raw || typeof raw !== "object") return null;

  const next = { ...raw };

  // New setting with backward-compatible default derived from legacy toggle.
  if (!next.trainingInputMode) {
    next.trainingInputMode = next.voiceCommandsEnabled ? "both" : "buttons";
  }
  next.trainingInputMode = normalizeTrainingInputMode(next.trainingInputMode);
  next.voiceCommandsEnabled =
    next.trainingInputMode === "voice" || next.trainingInputMode === "both";

  // Game UI
  next.showGameMicroHud = next.showGameMicroHud !== false;
  next.showCritters = next.showCritters !== false;
  next.roamIntensity = clamp(Number(next.roamIntensity ?? 1), 0, 1);

  // Haptics (mobile vibration)
  next.hapticsEnabled = next.hapticsEnabled !== false;
  next.dailyRemindersEnabled = next.dailyRemindersEnabled !== false;

  // Ensure nested audio exists
  next.audio = {
    enabled: true,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    sleepEnabled: true,
    sleepVolume: 0.25,
    ...(next.audio || {}),
  };
  next.audio.enabled = Boolean(next.audio.enabled);
  next.audio.masterVolume = clamp(Number(next.audio.masterVolume ?? 0.8), 0, 1);
  next.audio.musicVolume = clamp(Number(next.audio.musicVolume ?? 0.5), 0, 1);
  next.audio.sfxVolume = clamp(Number(next.audio.sfxVolume ?? 0.7), 0, 1);
  next.audio.sleepEnabled = Boolean(next.audio.sleepEnabled);
  next.audio.sleepVolume = clamp(Number(next.audio.sleepVolume ?? 0.25), 0, 1);

  // Performance
  const perfMode = String(next.perfMode || "auto").toLowerCase();
  next.perfMode = ["auto", "on", "off"].includes(perfMode) ? perfMode : "auto";

  return next;
}

const initialState = normalizeLoadedSettings(loadFromStorage()) || {
  // Theme: system | dark | light
  theme: "system",

  // Accessibility
  reduceMotion: "system", // system | on | off
  highContrast: false,
  reduceTransparency: false,
  focusRings: "auto", // auto | always
  hitTargets: "auto", // auto | large
  fontScale: 1, // 0.9–1.15

  // UI preferences
  showHints: true,
  dailyRemindersEnabled: true,

  // Haptics
  hapticsEnabled: true,

  // Game UI
  showGameMicroHud: true,
  showCritters: true,
  roamIntensity: 1,

  // Performance
  // Battery-friendly mode: reduce heavy visual effects (canvas particles, ambient animations, etc.)
  batterySaver: false,

  // Extra perf mode (separate from accessibility reduce-motion)
  // - auto: reduce effects on low-power devices/hints
  // - on: always reduce effects
  // - off: never auto-reduce (batterySaver can still be used manually)
  perfMode: "auto",

  // Input / features
  voiceCommandsEnabled: false,
  trainingInputMode: "both",

  // Audio (not all screens use this yet, but we persist it for future wiring)
  audio: {
    enabled: true,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    sleepEnabled: true,
    sleepVolume: 0.25,
  },

  // Safety
  confirmDangerousActions: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setPerfMode(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "on", "off"].includes(mode)) return;
      state.perfMode = mode;
      saveToStorage(state);
    },
    setTheme(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["system", "dark", "light"].includes(mode)) return;
      state.theme = mode;
      saveToStorage(state);
    },

    setReduceMotion(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["system", "on", "off"].includes(mode)) return;
      state.reduceMotion = mode;
      saveToStorage(state);
    },

    setHighContrast(state, action) {
      state.highContrast = Boolean(action.payload);
      saveToStorage(state);
    },

    setReduceTransparency(state, action) {
      state.reduceTransparency = Boolean(action.payload);
      saveToStorage(state);
    },

    setFocusRings(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "always"].includes(mode)) return;
      state.focusRings = mode;
      saveToStorage(state);
    },

    setHitTargets(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "large"].includes(mode)) return;
      state.hitTargets = mode;
      saveToStorage(state);
    },

    setFontScale(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.fontScale = clamp(raw, 0.9, 1.15);
      saveToStorage(state);
    },

    setShowHints(state, action) {
      state.showHints = Boolean(action.payload);
      saveToStorage(state);
    },

    setDailyRemindersEnabled(state, action) {
      state.dailyRemindersEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setHapticsEnabled(state, action) {
      state.hapticsEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setBatterySaver(state, action) {
      state.batterySaver = Boolean(action.payload);
      saveToStorage(state);
    },

    setVoiceCommandsEnabled(state, action) {
      const enabled = Boolean(action.payload);
      state.voiceCommandsEnabled = enabled;
      // Keep new setting in sync.
      const currentMode = normalizeTrainingInputMode(
        state.trainingInputMode,
        enabled ? "both" : "buttons"
      );
      if (!enabled && (currentMode === "voice" || currentMode === "both")) {
        state.trainingInputMode = "buttons";
      }
      if (enabled && currentMode === "buttons") {
        state.trainingInputMode = "both";
      }
      saveToStorage(state);
    },

    setTrainingInputMode(state, action) {
      const mode = normalizeTrainingInputMode(
        action.payload,
        state.trainingInputMode
      );
      state.trainingInputMode = mode;
      state.voiceCommandsEnabled = mode === "voice" || mode === "both";
      saveToStorage(state);
    },

    setShowGameMicroHud(state, action) {
      state.showGameMicroHud = Boolean(action.payload);
      saveToStorage(state);
    },

    setShowCritters(state, action) {
      state.showCritters = Boolean(action.payload);
      saveToStorage(state);
    },

    setRoamIntensity(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.roamIntensity = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setAudioEnabled(state, action) {
      state.audio.enabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setMasterVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.masterVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setMusicVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.musicVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setSfxVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.sfxVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setSleepAudioEnabled(state, action) {
      state.audio.sleepEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setSleepVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.sleepVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setConfirmDangerousActions(state, action) {
      state.confirmDangerousActions = Boolean(action.payload);
      saveToStorage(state);
    },

    hydrateSettings(state, action) {
      if (!action.payload || typeof action.payload !== "object") return;
      // Shallow merge + nested audio merge.
      const merged = { ...state, ...action.payload };
      merged.audio = { ...state.audio, ...(action.payload.audio || {}) };
      const next = normalizeLoadedSettings(merged) || merged;

      state.theme = next.theme;
      state.reduceMotion = next.reduceMotion;
      state.highContrast = Boolean(next.highContrast);
      state.reduceTransparency = Boolean(next.reduceTransparency);
      state.focusRings = next.focusRings;
      state.hitTargets = next.hitTargets;
      state.fontScale = clamp(Number(next.fontScale ?? 1), 0.9, 1.15);

      state.perfMode = next.perfMode || state.perfMode || "auto";
      state.showHints = Boolean(next.showHints);
      state.dailyRemindersEnabled = next.dailyRemindersEnabled !== false;

      state.showGameMicroHud = next.showGameMicroHud !== false;
      state.showCritters = next.showCritters !== false;
      state.roamIntensity = clamp(Number(next.roamIntensity ?? 1), 0, 1);
      state.batterySaver = Boolean(next.batterySaver);
      state.trainingInputMode = normalizeTrainingInputMode(
        next.trainingInputMode,
        next.voiceCommandsEnabled ? "both" : "buttons"
      );
      state.voiceCommandsEnabled = Boolean(next.voiceCommandsEnabled);
      state.audio.enabled = Boolean(next.audio?.enabled);
      state.audio.masterVolume = clamp(
        Number(next.audio?.masterVolume ?? 0.8),
        0,
        1
      );
      state.audio.musicVolume = clamp(
        Number(next.audio?.musicVolume ?? 0.5),
        0,
        1
      );
      state.audio.sfxVolume = clamp(Number(next.audio?.sfxVolume ?? 0.7), 0, 1);
      state.audio.sleepEnabled = Boolean(next.audio?.sleepEnabled);
      state.audio.sleepVolume = clamp(
        Number(next.audio?.sleepVolume ?? 0.25),
        0,
        1
      );
      state.confirmDangerousActions = Boolean(next.confirmDangerousActions);

      saveToStorage(state);
    },

    resetSettings() {
      const fresh = {
        theme: "system",
        reduceMotion: "system",
        highContrast: false,
        reduceTransparency: false,
        focusRings: "auto",
        hitTargets: "auto",
        fontScale: 1,
        showHints: true,
        dailyRemindersEnabled: true,
        showGameMicroHud: true,
        showCritters: true,
        roamIntensity: 1,
        batterySaver: false,
        perfMode: "auto",
        voiceCommandsEnabled: true,
        trainingInputMode: "both",
        audio: {
          enabled: true,
          masterVolume: 0.8,
          musicVolume: 0.5,
          sfxVolume: 0.7,
          sleepEnabled: true,
          sleepVolume: 0.25,
        },
        confirmDangerousActions: true,
      };

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(fresh)
          );
        } catch {
          // ignore
        }
      }

      return fresh;
    },
  },
});

export const {
  setPerfMode,
  setTheme,
  setReduceMotion,
  setHighContrast,
  setReduceTransparency,
  setFocusRings,
  setHitTargets,
  setFontScale,
  setShowHints,
  setDailyRemindersEnabled,
  setHapticsEnabled,
  setBatterySaver,
  setVoiceCommandsEnabled,
  setTrainingInputMode,
  setShowGameMicroHud,
  setShowCritters,
  setRoamIntensity,
  setAudioEnabled,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setSleepAudioEnabled,
  setSleepVolume,
  setConfirmDangerousActions,
  hydrateSettings,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeMode = (state) => state.settings?.theme || "system";

export { SETTINGS_STORAGE_KEY };
export default settingsSlice.reducer;
