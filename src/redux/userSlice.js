// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  // room later for profile fields, settings, etc.
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, { payload }) {
      if (!payload) return;
      state.uid = payload.uid ?? null;
      state.email = payload.email ?? null;
      state.displayName = payload.displayName ?? null;
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const selectCurrentUser = (state) => state.user;

export default userSlice.reducer;
