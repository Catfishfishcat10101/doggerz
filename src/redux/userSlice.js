// src/redux/userSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { removeStoredValue, setStoredValue } from "@/utils/nativeStorage.js";

export const USER_STORAGE_KEY = "doggerz:userState";

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

function toMaybeTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}

function normalizeUserState(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_USER_STATE,
      streak: { ...DEFAULT_USER_STATE.streak },
    };
  }

  const streak = raw.streak && typeof raw.streak === "object" ? raw.streak : {};
  const density = String(raw.uiDensity || "").toLowerCase();
  const preferredScene = String(raw.preferredScene || "")
    .trim()
    .toLowerCase();
  const renderMode = String(raw.dogRenderMode || "").toLowerCase();

  return {
    id: raw.id ?? null,
    displayName:
      typeof raw.displayName === "string" && raw.displayName.trim()
        ? raw.displayName
        : DEFAULT_USER_STATE.displayName,
    email: raw.email ?? null,
    avatarUrl: raw.avatarUrl ?? null,
    zip: raw.zip ?? null,
    dogRenderMode: DOG_RENDER_MODES.includes(renderMode)
      ? renderMode
      : DEFAULT_USER_STATE.dogRenderMode,
    dogName:
      typeof raw.dogName === "string" && raw.dogName.trim()
        ? raw.dogName.trim()
        : null,
    preferredScene: preferredScene || DEFAULT_USER_STATE.preferredScene,
    reduceVfx: Boolean(raw.reduceVfx),
    uiDensity: ["standard", "compact", "spacious"].includes(density)
      ? density
      : DEFAULT_USER_STATE.uiDensity,
    locale: raw.locale ?? null,
    coins: Number.isFinite(Number(raw.coins))
      ? Math.max(0, Number(raw.coins))
      : DEFAULT_USER_STATE.coins,
    streak: {
      current: Number.isFinite(Number(streak.current))
        ? Number(streak.current)
        : DEFAULT_USER_STATE.streak.current,
      best: Number.isFinite(Number(streak.best))
        ? Number(streak.best)
        : DEFAULT_USER_STATE.streak.best,
      lastPlayedAt: toMaybeTimestamp(streak.lastPlayedAt),
    },
    createdAt: toMaybeTimestamp(raw.createdAt),
  };
}

function serializeUserState(state) {
  const copy = {
    ...state,
    streak: {
      ...state.streak,
    },
  };

  // Normalize date fields to ISO strings for portability.
  if (copy.createdAt && typeof copy.createdAt === "number") {
    copy.createdAt = new Date(copy.createdAt).toISOString();
  }
  if (
    copy.streak &&
    copy.streak.lastPlayedAt &&
    typeof copy.streak.lastPlayedAt === "number"
  ) {
    copy.streak.lastPlayedAt = new Date(copy.streak.lastPlayedAt).toISOString();
  }

  return copy;
}

// Debounced save to avoid frequent writes when multiple reducers fire in quick succession.
let _saveTimeout = null;
let _lastSerialized = null;
const saveUserToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    _lastSerialized = JSON.stringify(serializeUserState(state));
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
      const payload = _lastSerialized;
      _saveTimeout = null;
      _lastSerialized = null;
      if (!payload) return;
      setStoredValue(USER_STORAGE_KEY, payload).catch((e) => {
        console.warn("[userSlice] Failed to save user to storage:", e);
      });
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
    if (_lastSerialized) {
      const payload = _lastSerialized;
      _lastSerialized = null;
      setStoredValue(USER_STORAGE_KEY, payload).catch((e) => {
        console.warn("[userSlice] Failed to flush user storage:", e);
      });
    }
  } catch (e) {
    console.warn("[userSlice] Failed to flush user storage:", e);
  }
}

if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("beforeunload", flushUserStorage);
}

const initialState = {
  ...DEFAULT_USER_STATE,
  streak: { ...DEFAULT_USER_STATE.streak },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    hydrateUserState(state, action) {
      const next = normalizeUserState(action.payload);
      state.displayName = next.displayName;
      state.avatarUrl = next.avatarUrl;
      state.zip = next.zip;
      state.dogRenderMode = next.dogRenderMode;
      state.dogName = next.dogName;
      state.preferredScene = next.preferredScene;
      state.reduceVfx = next.reduceVfx;
      state.uiDensity = next.uiDensity;
      state.locale = next.locale;
      state.coins = next.coins;
      state.streak = { ...next.streak };
      state.createdAt = next.createdAt;
      if (!state.id && next.id) state.id = next.id;
      if (!state.email && next.email) state.email = next.email;
    },
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
      state.displayName = DEFAULT_USER_STATE.displayName;
      state.email = null;
      state.avatarUrl = null;
      state.zip = null;
      state.coins = 0;
      state.streak = { ...DEFAULT_USER_STATE.streak };
      state.createdAt = null;
      state.dogRenderMode = DEFAULT_USER_STATE.dogRenderMode;
      state.dogName = null;
      state.preferredScene = DEFAULT_USER_STATE.preferredScene;
      state.reduceVfx = DEFAULT_USER_STATE.reduceVfx;
      state.uiDensity = DEFAULT_USER_STATE.uiDensity;
      state.locale = DEFAULT_USER_STATE.locale;

      removeStoredValue(USER_STORAGE_KEY).catch(() => {
        // ignore
      });
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
      const raw = String(action.payload || "")
        .trim()
        .toLowerCase();
      state.preferredScene = raw || "auto";
      saveUserToStorage(state);
    },
    setReduceVfx(state, action) {
      state.reduceVfx = Boolean(action.payload);
      saveUserToStorage(state);
    },
    setUiDensity(state, action) {
      const raw = String(action.payload || "")
        .trim()
        .toLowerCase();
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
  hydrateUserState,
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
