/** @format */

// src/redux/settingsSlice.js

import { createSlice } from '@reduxjs/toolkit';

const SETTINGS_STORAGE_KEY = 'doggerz:settingsState';

const loadFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[settingsSlice] Failed to parse settings from storage:', e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[settingsSlice] Failed to save settings to storage:', e);
  }
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const initialState = loadFromStorage() || {
  // Theme: system | dark | light
  theme: 'system',

  // Accessibility
  reduceMotion: 'system', // system | on | off
  highContrast: false,
  reduceTransparency: false,
  focusRings: 'auto', // auto | always
  hitTargets: 'auto', // auto | large
  fontScale: 1, // 0.9–1.15

  // UI preferences
  showHints: true,

  // Input / features
  voiceCommandsEnabled: false,

  // Audio (not all screens use this yet, but we persist it for future wiring)
  audio: {
    enabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8,
  },

  // Safety
  confirmDangerousActions: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action) {
      const mode = String(action.payload || '').toLowerCase();
      if (!['system', 'dark', 'light'].includes(mode)) return;
      state.theme = mode;
      saveToStorage(state);
    },

    setReduceMotion(state, action) {
      const mode = String(action.payload || '').toLowerCase();
      if (!['system', 'on', 'off'].includes(mode)) return;
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
      const mode = String(action.payload || '').toLowerCase();
      if (!['auto', 'always'].includes(mode)) return;
      state.focusRings = mode;
      saveToStorage(state);
    },

    setHitTargets(state, action) {
      const mode = String(action.payload || '').toLowerCase();
      if (!['auto', 'large'].includes(mode)) return;
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

    setVoiceCommandsEnabled(state, action) {
      state.voiceCommandsEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setAudioEnabled(state, action) {
      state.audio.enabled = Boolean(action.payload);
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

    setConfirmDangerousActions(state, action) {
      state.confirmDangerousActions = Boolean(action.payload);
      saveToStorage(state);
    },

    hydrateSettings(state, action) {
      if (!action.payload || typeof action.payload !== 'object') return;
      // Shallow merge + nested audio merge.
      const next = { ...state, ...action.payload };
      next.audio = { ...state.audio, ...(action.payload.audio || {}) };

      state.theme = next.theme;
      state.reduceMotion = next.reduceMotion;
      state.highContrast = Boolean(next.highContrast);
      state.reduceTransparency = Boolean(next.reduceTransparency);
      state.focusRings = next.focusRings;
      state.hitTargets = next.hitTargets;
      state.fontScale = clamp(Number(next.fontScale ?? 1), 0.9, 1.15);
      state.showHints = Boolean(next.showHints);
      state.voiceCommandsEnabled = Boolean(next.voiceCommandsEnabled);
      state.audio.enabled = Boolean(next.audio?.enabled);
      state.audio.musicVolume = clamp(
        Number(next.audio?.musicVolume ?? 0.6),
        0,
        1
      );
      state.audio.sfxVolume = clamp(Number(next.audio?.sfxVolume ?? 0.8), 0, 1);
      state.confirmDangerousActions = Boolean(next.confirmDangerousActions);

      saveToStorage(state);
    },

    resetSettings() {
      const fresh = {
        theme: 'system',
        reduceMotion: 'system',
        highContrast: false,
        reduceTransparency: false,
        focusRings: 'auto',
        hitTargets: 'auto',
        fontScale: 1,
        showHints: true,
        voiceCommandsEnabled: true,
        audio: { enabled: true, musicVolume: 0.6, sfxVolume: 0.8 },
        confirmDangerousActions: true,
      };

      if (typeof window !== 'undefined') {
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
  setTheme,
  setReduceMotion,
  setHighContrast,
  setReduceTransparency,
  setFocusRings,
  setHitTargets,
  setFontScale,
  setShowHints,
  setVoiceCommandsEnabled,
  setAudioEnabled,
  setMusicVolume,
  setSfxVolume,
  setConfirmDangerousActions,
  hydrateSettings,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeMode = (state) => state.settings?.theme || 'system';

export { SETTINGS_STORAGE_KEY };
export default settingsSlice.reducer;
