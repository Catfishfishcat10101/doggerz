// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initial = { status: "idle", uid: null, email: null, displayName: null, error: null };

const userSlice = createSlice({
  name: "user",
  initialState: initial,
  reducers: {
    userLoading: (s) => { s.status = "loading"; s.error = null; },
    userAuthed: (s, { payload }) => {
      s.status = "authed";
      s.uid = payload.uid;
      s.email = payload.email ?? null;
      s.displayName = payload.displayName ?? null;
      s.error = null;
    },
    userLoggedOut: () => initial,
    userError: (s, { payload }) => { s.status = "error"; s.error = payload || "Auth error"; },
  },
});

export const { userLoading, userAuthed, userLoggedOut, userError } = userSlice.actions;
export const selectUser = (s) => s.user;
export default userSlice.reducer;