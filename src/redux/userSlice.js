// src/redux/userSlice.js
// @ts-nocheck

import { createSlice } from "@reduxjs/toolkit";

export const USER_STORAGE_KEY = "doggerz:userState";

const initialState = {
  uid: null,
  displayName: null,
  email: null,
  avatarUrl: null,
  coins: 0,
  streakDays: 0,
  lastLoginAt: null,
  isGuest: false,
};

// tiny helper so we can load from localStorage later if you want
function safeParseUser(raw) {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      ...initialState,
      ...parsed,
    };
  } catch {
    return null;
  }
}

// if you want to hydrate from localStorage at app start, you can
// call restoreUserState() inside your root, but for now we just
// keep it here for later.
export function restoreUserState() {
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  return safeParseUser(raw) ?? initialState;
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      const {
        uid = null,
        displayName = null,
        email = null,
        avatarUrl = null,
        coins = 0,
        streakDays = 0,
        lastLoginAt = null,
        isGuest = false,
      } = action.payload || {};

      state.uid = uid;
      state.displayName = displayName;
      state.email = email;
      state.avatarUrl = avatarUrl;
      state.coins = Number.isFinite(coins) ? coins : 0;
      state.streakDays = Number.isFinite(streakDays) ? streakDays : 0;
      state.lastLoginAt = lastLoginAt;
      state.isGuest = !!isGuest;
    },

    clearUser(state) {
      Object.assign(state, initialState);
    },

    addCoins(state, action) {
      const delta = Number(action.payload) || 0;
      const next = (state.coins || 0) + delta;
      state.coins = Math.max(0, next);
    },

    setStreakDays(state, action) {
      const days = Number(action.payload) || 0;
      state.streakDays = Math.max(0, days);
    },
  },
});

export const { setUser, clearUser, addCoins, setStreakDays } =
  userSlice.actions;

// ✅ THIS is what GameTopBar is trying to import
export const selectUser = (state) => state.user;

// Some convenience selectors if you want them:
export const selectUserId = (state) => state.user?.uid ?? null;
export const selectUserName = (state) => state.user?.displayName ?? "Guest";
export const selectUserCoins = (state) => state.user?.coins ?? 0;
export const selectUserStreak = (state) => state.user?.streakDays ?? 0;
export const selectIsGuest = (state) => !!state.user?.isGuest;

export default userSlice.reducer;
