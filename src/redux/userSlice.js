// src/redux/userSlice.js
import { createSlice, createAsyncThunk, createListenerMiddleware } from "@reduxjs/toolkit";
import { updateProfile } from "firebase/auth";

/** @typedef {{id:string|null,email:string|null,displayName:string|null,photoURL:string|null}} UserState */

const SCHEMA = Object.freeze({
  id: null,
  email: null,
  displayName: null,
  photoURL: null,
});

/** Safe merge into schema */
function materialize(payload = {}) {
  return {
    id: payload.id ?? null,
    email: payload.email ?? null,
    displayName: payload.displayName ?? null,
    photoURL: payload.photoURL ?? null,
  };
}

/** Map Firebase user → our schema */
export function fromFirebaseUser(fbUser) {
  if (!fbUser) return { ...SCHEMA };
  return materialize({
    id: fbUser.uid ?? null,
    email: fbUser.email ?? null,
    displayName: fbUser.displayName ?? null,
    photoURL: fbUser.photoURL ?? null,
  });
}

/** LocalStorage keys */
const LS_KEY = "doggerz_user";

/** Hydrate from localStorage (best-effort) */
function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...SCHEMA };
    const parsed = JSON.parse(raw);
    return materialize(parsed);
  } catch {
    return { ...SCHEMA };
  }
}

/** Initial state */
const initialState = readLS();

/** Async: update displayName on Firebase and reflect in store */
export const updateDisplayName = createAsyncThunk(
  "user/updateDisplayName",
  /** @param {{auth: import('firebase/auth').Auth, displayName: string}} args */
  async ({ auth, displayName }) => {
    if (!auth?.currentUser) throw new Error("Not authenticated");
    await updateProfile(auth.currentUser, { displayName });
    // Return minimal patch for reducer
    return { displayName };
  }
);

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /** Accepts our schema-shaped payload */
    setUser: (_state, { payload }) => materialize(payload),
    /** Accepts Firebase user object directly */
    setUserFromFirebase: (_state, { payload }) => fromFirebaseUser(payload),
    clearUser: () => ({ ...SCHEMA }),
  },
  extraReducers: (builder) => {
    builder.addCase(updateDisplayName.fulfilled, (state, { payload }) => {
      state.displayName = payload.displayName ?? state.displayName;
    });
  },
});

export const { setUser, clearUser, setUserFromFirebase } = slice.actions;
export default slice.reducer;

/* -------------------- Selectors -------------------- */
export const selectUser = (s) => s.user;
export const selectUserId = (s) => s.user?.id ?? null;
export const selectUserEmail = (s) => s.user?.email ?? null;
export const selectUserPhoto = (s) => s.user?.photoURL ?? null;
export const selectUserName = (s) =>
  s.user?.displayName || s.user?.email?.split("@")[0] || "Player";
export const selectIsAuthed = (s) => Boolean(s.user?.id);

/* ---------------- Persistence (listener) ----------------
   Add `userListenerMiddleware.middleware` to your store middleware chain.
--------------------------------------------------------- */
export const userListenerMiddleware = createListenerMiddleware();

userListenerMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(materialize(action.payload))); } catch {}
  },
});

userListenerMiddleware.startListening({
  actionCreator: setUserFromFirebase,
  effect: async (action) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(fromFirebaseUser(action.payload))); } catch {}
  },
});

userListenerMiddleware.startListening({
  actionCreator: clearUser,
  effect: async () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
  },
});
