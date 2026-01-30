// src/redux/userSlice.js

import { createSlice } from "@reduxjs/toolkit";

const USER_STORAGE_KEY = "doggerz:userState";

export const DOG_RENDER_MODES = Object.freeze(["sprite", "realistic"]);

const DEFAULT_USER_STATE = {
  id: null,
  displayName: "Trainer",
  email: null,
  avatarUrl: null,
  zip: null,

  // Dog visuals
  dogRenderMode: "sprite", // 'sprite' | 'realistic'
  dogName: null,
  preferredScene: "auto",
  reduceVfx: false,
  uiDensity: "standard", // standard | compact | spacious
  locale: null,

  coins: 0,
  streak: {
    current: 0,
    best: 0,
    lastPlayedAt: null,
  },

  createdAt: null,
};

const loadUserFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Revive date-like fields to numbers when possible
    if (parsed.createdAt && typeof parsed.createdAt === "string") {
      const t = Date.parse(parsed.createdAt);
      parsed.createdAt = Number.isFinite(t) ? t : parsed.createdAt;
    }
    if (parsed.streak && parsed.streak.lastPlayedAt) {
      const lp = parsed.streak.lastPlayedAt;
      if (typeof lp === "string") {
        const t2 = Date.parse(lp);
        parsed.streak.lastPlayedAt = Number.isFinite(t2) ? t2 : lp;
      }
    }

    return parsed;
  } catch (e) {
    console.warn("[userSlice] Failed to parse user from storage:", e);
    return null;
  }
};

// Debounced save to avoid frequent writes when multiple reducers fire in quick succession
let _saveTimeout = null;
let _lastCopy = null;
const saveUserToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    const copy = { ...state };

    // Normalize date fields to ISO strings for portability
    if (copy.createdAt && typeof copy.createdAt === "number") {
      copy.createdAt = new Date(copy.createdAt).toISOString();
    }
    if (
      copy.streak &&
      copy.streak.lastPlayedAt &&
      typeof copy.streak.lastPlayedAt === "number"
    ) {
      copy.streak = {
        ...copy.streak,
        lastPlayedAt: new Date(copy.streak.lastPlayedAt).toISOString(),
      };
    }

    _lastCopy = copy;
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
      try {
        window.localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(_lastCopy)
        );
      } catch (e) {
        console.warn("[userSlice] Failed to save user to storage:", e);
      }
      _saveTimeout = null;
      _lastCopy = null;
    }, 150);
  } catch (e) {
    console.warn("[userSlice] Failed to schedule save to storage:", e);
  }
};

// Flush any pending debounced save immediately. Useful for beforeunload or tests.
export function flushUserStorage() {
  if (typeof window === "undefined") return;
  try {
    if (_saveTimeout) {
      clearTimeout(_saveTimeout);
      _saveTimeout = null;
    }
    if (_lastCopy) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(_lastCopy));
      _lastCopy = null;
    }
  } catch (e) {
    console.warn("[userSlice] Failed to flush user storage:", e);
  }
}

if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("beforeunload", flushUserStorage);
}

const _loaded = loadUserFromStorage();
const initialState = {
  ...DEFAULT_USER_STATE,
  ...(_loaded || {}),
  // keep nested defaults stable
  streak: { ...DEFAULT_USER_STATE.streak, ...(_loaded?.streak || {}) },
  dogRenderMode: DOG_RENDER_MODES.includes(_loaded?.dogRenderMode)
    ? _loaded.dogRenderMode
    : DEFAULT_USER_STATE.dogRenderMode,
  uiDensity:
    _loaded?.uiDensity === "compact" ||
    _loaded?.uiDensity === "spacious" ||
    _loaded?.uiDensity === "standard"
      ? _loaded.uiDensity
      : DEFAULT_USER_STATE.uiDensity,
  preferredScene:
    typeof _loaded?.preferredScene === "string"
      ? _loaded.preferredScene
      : DEFAULT_USER_STATE.preferredScene,
  reduceVfx: Boolean(_loaded?.reduceVfx),
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      const {
        id,
        displayName,
        email,
        avatarUrl,
        coins,
        streak,
        createdAt,
        zip,
      } = action.payload || {};

      state.id = id ?? state.id;
      state.displayName = displayName ?? state.displayName;
      state.email = email ?? state.email;
      state.avatarUrl = avatarUrl ?? state.avatarUrl;

      if (typeof coins === "number") state.coins = coins;

      if (streak && typeof streak === "object") {
        state.streak.current = streak.current ?? state.streak.current;
        state.streak.best = streak.best ?? state.streak.best;
        state.streak.lastPlayedAt =
          streak.lastPlayedAt ?? state.streak.lastPlayedAt;
      }

      state.createdAt = createdAt ?? state.createdAt;
      if (zip !== undefined) state.zip = zip;

      saveUserToStorage(state);
    },

    clearUser(state) {
      state.id = null;
      state.displayName = "Trainer";
      state.email = null;
      state.avatarUrl = null;
      state.coins = 0;
      state.streak = { current: 0, best: 0, lastPlayedAt: null };
      state.createdAt = null;

      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(USER_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    },

    addCoins(state, action) {
      const amount = Number(action.payload || 0);
      if (!Number.isFinite(amount)) return;
      state.coins = Math.max(0, (state.coins || 0) + amount);
      saveUserToStorage(state);
    },

    setCoins(state, action) {
      const amount = Number(action.payload || 0);
      if (!Number.isFinite(amount)) return;
      state.coins = Math.max(0, amount);
      saveUserToStorage(state);
    },

    updateStreak(state, action) {
      const { current, best, lastPlayedAt } = action.payload || {};
      if (typeof current === "number") state.streak.current = current;
      if (typeof best === "number") state.streak.best = best;
      if (lastPlayedAt !== undefined) state.streak.lastPlayedAt = lastPlayedAt;
      saveUserToStorage(state);
    },

    setZip(state, action) {
      const raw = String(action.payload || "").trim();
      const valid = /^[0-9]{5}$/.test(raw) ? raw : null;
      state.zip = valid;
      saveUserToStorage(state);
    },
    setDogRenderMode(state, action) {
      const raw = String(action.payload || "")
        .trim()
        .toLowerCase();
      if (!DOG_RENDER_MODES.includes(raw)) return;
      state.dogRenderMode = raw;
      saveUserToStorage(state);
    },
    setDogName(state, action) {
      const raw = String(action.payload || "").trim();
      state.dogName = raw || null;
      saveUserToStorage(state);
    },
    setPreferredScene(state, action) {
      const raw = String(action.payload || "").trim().toLowerCase();
      state.preferredScene = raw || "auto";
      saveUserToStorage(state);
    },
    setReduceVfx(state, action) {
      state.reduceVfx = Boolean(action.payload);
      saveUserToStorage(state);
    },
    setUiDensity(state, action) {
      const raw = String(action.payload || "").trim().toLowerCase();
      if (!["standard", "compact", "spacious"].includes(raw)) return;
      state.uiDensity = raw;
      saveUserToStorage(state);
    },
    setLocale(state, action) {
      const raw = String(action.payload || "").trim();
      state.locale = raw || null;
      saveUserToStorage(state);
    },
  },
});

export const {
  setUser,
  clearUser,
  addCoins,
  setCoins,
  updateStreak,
  setZip,
  setDogRenderMode,
  setDogName,
  setPreferredScene,
  setReduceVfx,
  setUiDensity,
  setLocale,
} = userSlice.actions;

export const selectUser = (state) => state.user;
export const selectUserZip = (state) => state.user?.zip || null;

// Authentication is considered "on" when we have an id (preferred) or an email.
// This avoids treating the default local-only user object as authenticated.
export const selectIsLoggedIn = (state) =>
  Boolean(state.user?.id || state.user?.email);

export const selectDogRenderMode = (state) =>
  state.user?.dogRenderMode || DEFAULT_USER_STATE.dogRenderMode;
export const selectUserDogName = (state) => state.user?.dogName || null;
export const selectPreferredScene = (state) =>
  state.user?.preferredScene || "auto";
export const selectReduceVfx = (state) => Boolean(state.user?.reduceVfx);
export const selectUiDensity = (state) =>
  state.user?.uiDensity || DEFAULT_USER_STATE.uiDensity;
export const selectUserLocale = (state) => state.user?.locale || null;

export const selectUserCoins = (state) => state.user?.coins ?? 0;
export const selectUserStreak = (state) =>
  state.user?.streak ?? { current: 0, best: 0, lastPlayedAt: null };

export default userSlice.reducer;
