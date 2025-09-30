// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initial = {
  status: "idle", // idle | loading | authed | error
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  error: null,
};

const slice = createSlice({
  name: "user",
  initialState: initial,
  reducers: {
    userLoading(s) { s.status = "loading"; s.error = null; },
    userAuthed(s, { payload }) {
      s.status = "authed";
      s.uid = payload?.uid ?? null;
      s.email = payload?.email ?? null;
      s.displayName = payload?.displayName ?? null;
      s.photoURL = payload?.photoURL ?? null;
      s.error = null;
    },
    userSignedOut() { return { ...initial, status: "idle" }; },
    userError(s, { payload }) { s.status = "error"; s.error = payload || "Auth error"; },
  }
});

export const { userLoading, userAuthed, userSignedOut, userError } = slice.actions;
export const selectUser = (s) => (s?.user?.uid ? s.user : null);
export const selectUserStatus = (s) => s?.user?.status ?? "idle";
export default slice.reducer;
