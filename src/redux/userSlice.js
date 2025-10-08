// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle", // 'idle' | 'loading' | 'authed' | 'error'
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
      state.user = action.payload; // { uid, email, displayName, photoURL }
      state.status = "authed";
      state.error = null;
    },
    userError(state, action) {
      state.status = "error";
      state.error = action.payload ?? "Unknown auth error";
    },
    userSignedOut(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    // optional alias if some files import userCleared
    userCleared(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const {
  userLoading,
  userAuthed,
  userError,
  userSignedOut,
  userCleared, // optional
} = userSlice.actions;

export const selectUser = (s) => s.user.user;
export const selectUserStatus = (s) => s.user.status;
export const selectUserError = (s) => s.user.error;

export default userSlice.reducer;
