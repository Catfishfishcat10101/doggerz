// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * GOAL
 * - In dev/guest mode, create a stable local uid so the app works without Firebase.
 * - When Firebase Auth signs in, we overwrite uid/email/displayName with real values.
 * - On sign out, we either null-out the user (strict) or keep a guest uid (guest mode).
 *
 * CONFIG
 * - Set VITE_GUEST_MODE=true (or leave undefined) to allow a fallback guest uid when signed out.
 */
const GUEST_MODE = import.meta?.env?.VITE_GUEST_MODE !== "false"; // default true unless explicitly "false"
const KEY = "doggerz_dev_uid";

function safeGetLocalStorage(key) {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  } catch { return null; }
}
function safeSetLocalStorage(key, val) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, val);
  } catch {}
}

function makeId() {
  try {
    if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  // fallback
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function devUid() {
  const existing = safeGetLocalStorage(KEY);
  if (existing) return existing;
  const id = makeId();
  safeSetLocalStorage(KEY, id);
  return id;
}

/** Initial state:
 * If guest-mode on → seed with dev uid (so app works signed-out).
 * If guest-mode off → start null (ProtectedRoute will redirect to /login).
 */
const initialState = {
  uid: GUEST_MODE ? devUid() : null,
  email: null,
  displayName: null,
  // optional surface:
  isGuest: GUEST_MODE, // toggled false when real auth attaches
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /** Generic setter from any auth source (Firebase, mock, etc.) */
    setUser(state, action) {
      const u = action.payload || {};
      state.uid = u.uid ?? null;
      state.email = u.email ?? null;
      state.displayName = u.displayName ?? null;
      state.isGuest = !u.uid; // if no real uid, treat as guest
    },

    /** Explicit sign-out path.
     * If guest-mode: revert to guest uid so app can still play offline.
     * If not guest-mode: hard null everything.
     */
    signOut(state) {
      if (GUEST_MODE) {
        state.uid = devUid();
        state.email = null;
        state.displayName = null;
        state.isGuest = true;
      } else {
        state.uid = null;
        state.email = null;
        state.displayName = null;
        state.isGuest = false;
      }
    },

    /** Optional helper: set display name without auth round-trip */
    setDisplayName(state, action) {
      state.displayName = action.payload ?? null;
    },
  },
});

export const { setUser, signOut, setDisplayName } = slice.actions;

/* ---------- Selectors ---------- */
export const selectUser = (s) => s.user || initialState;
export const selectUid = (s) => s.user?.uid ?? null;
export const selectEmail = (s) => s.user?.email ?? null;
export const selectDisplayName = (s) => s.user?.displayName ?? null;
export const selectIsGuest = (s) => !!s.user?.isGuest;

/* ---------- Reducer ---------- */
export default slice.reducer;
