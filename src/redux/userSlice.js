// src/redux/userSlice.js
// @ts-nocheck

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      const { uid, email, displayName, photoURL } = action.payload || {};
      state.uid = uid ?? null;
      state.email = email ?? null;
      state.displayName = displayName ?? null;
      state.photoURL = photoURL ?? null;
      state.isAuthenticated = Boolean(uid || email);
    },
    clearUser(state) {
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.photoURL = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

// full user slice
export const selectUser = (state) => state.user;

// auth flag only, if you want
export const selectIsAuthenticated = (state) =>
  Boolean(state.user && state.user.isAuthenticated);

export default userSlice.reducer;
