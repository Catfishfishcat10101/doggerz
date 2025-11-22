// src/redux/userSlice.js
// @ts-nocheck

import { createSlice } from "@reduxjs/toolkit";

const USER_STORAGE_KEY = "doggerz:userState";

const loadUserFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[userSlice] Failed to parse user from storage:", e);
    return null;
  }
};

const saveUserToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[userSlice] Failed to save user to storage:", e);
  }
};

const initialState = loadUserFromStorage() || {
  id: null,
  displayName: "Trainer",
  email: null,
  avatarUrl: null,

  coins: 0,
  streak: {
    current: 0,
    best: 0,
    lastPlayedAt: null,
  },

  createdAt: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      const { id, displayName, email, avatarUrl, coins, streak, createdAt } =
        action.payload || {};

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
      if (lastPlayedAt !== undefined) {
        state.streak.lastPlayedAt = lastPlayedAt;
      }
      saveUserToStorage(state);
    },
  },
});

export const { setUser, clearUser, addCoins, setCoins, updateStreak } =
  userSlice.actions;

/**
 * ✅ This is the selector GameTopBar imports.
 */
export const selectUser = (state) => state.user;

/** Some optional helpers if you want them later */
export const selectUserCoins = (state) => state.user?.coins ?? 0;
export const selectUserStreak = (state) =>
  state.user?.streak ?? {
    current: 0,
    best: 0,
    lastPlayedAt: null,
  };

export default userSlice.reducer;
