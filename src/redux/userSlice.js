
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  uid: null,
  email: null,
  displayName: "",
  photoURL: null,
  provider: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoading: (s, a) => { s.loading = !!a.payload; if (a.payload) s.error = null; },
    setError: (s, a) => { s.error = a.payload || null; s.loading = false; },
    setUser: (s, a) => {
      const u = a.payload || {};
      s.loggedIn = !!u.uid;
      s.uid = u.uid ?? null;
      s.email = u.email ?? null;
      s.displayName = u.displayName ?? "";
      s.photoURL = u.photoURL ?? null;
      s.provider = u.provider ?? null;
      s.loading = false;
      s.error = null;
    },
    clearUser: (s) => Object.assign(s, initialState),
    updateProfile: (s, a) => {
      const { displayName, photoURL } = a.payload || {};
      if (typeof displayName === "string") s.displayName = displayName;
      if (typeof photoURL === "string" || photoURL === null) s.photoURL = photoURL;
    },
  },
});

export const { setLoading, setError, setUser, clearUser, updateProfile } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectUser = (state) => state.user;
export const selectLoggedIn = (state) => state.user.loggedIn;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;