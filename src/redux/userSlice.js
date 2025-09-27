// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Auth state:
 *  - idle         : not checked yet / signed out
 *  - loading      : auth op in-flight
 *  - authenticated: user present
 *  - error        : last op failed
 */
const initialState = {
  status: "idle",
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    userAuthed(state, action) {
      const u = action.payload || {};
      state.status = "authenticated";
      state.uid = u.uid ?? null;
      state.email = u.email ?? null;
      state.displayName = u.displayName ?? null;
      state.photoURL = u.photoURL ?? null;
      state.error = null;
    },
    userError(state, action) {
      state.status = "error";
      state.error = action.payload ?? "Unknown auth error";
    },
    userProfileUpdated(state, action) {
      const u = action.payload || {};
      if (typeof u.displayName !== "undefined") state.displayName = u.displayName;
      if (typeof u.photoURL !== "undefined") state.photoURL = u.photoURL;
      if (typeof u.email !== "undefined") state.email = u.email;
    },
    /** This is the thing NavBar imports */
    userSignedOut(state) {
      state.status = "idle";
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.photoURL = null;
      state.error = null;
    },
  },
});

export const {
  userLoading,
  userAuthed,
  userError,
  userProfileUpdated,
  userSignedOut,
} = userSlice.actions;

export const selectUser = (s) =>
  s?.user?.uid
    ? {
        uid: s.user.uid,
        email: s.user.email,
        displayName: s.user.displayName,
        photoURL: s.user.photoURL,
      }
    : null;

export const selectAuthStatus = (s) => s?.user?.status ?? "idle";
export const selectAuthError = (s) => s?.user?.error ?? null;

export default userSlice.reducer;
