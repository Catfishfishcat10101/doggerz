// src/redux/userSlice.js
import { createSlice, createListenerMiddleware } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  status: "idle", // "idle" | "loading" | "authed" | "error"
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
      const { uid, email, displayName } = action.payload || {};
      state.uid = uid || null;
      state.email = email || null;
      state.displayName = displayName || null;
      state.status = "authed";
      state.error = null;
    },
    userLoggedOut(state) {
      Object.assign(state, initialState);
    },
    userError(state, action) {
      state.status = "error";
      state.error = action.payload || "Unknown auth error";
    },
  },
});

export const { userLoading, userAuthed, userLoggedOut, userError } = userSlice.actions;

// Selectors
export const selectUser = (s) => s.user;
export const selectUserId = (s) => s.user.uid;
export const selectUserName = (s) => s.user.displayName;
export const selectUserStatus = (s) => s.user.status;

// Listener middleware: persist basic user info to localStorage
export const userListenerMiddleware = createListenerMiddleware();

userListenerMiddleware.startListening({
  actionCreator: userAuthed,
  effect: async (action) => {
    try {
      const { uid, email, displayName } = action.payload || {};
      localStorage.setItem(
        "doggerz:user",
        JSON.stringify({ uid, email, displayName })
      );
    } catch {}
  },
});

userListenerMiddleware.startListening({
  actionCreator: userLoggedOut,
  effect: async () => {
    try {
      localStorage.removeItem("doggerz:user");
    } catch {}
  },
});

export default userSlice.reducer;
