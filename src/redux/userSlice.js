// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Keep only what you actually use in the app UI.
export const initialUserState = {
  id: null,
  email: null,
  displayName: null,
  photoURL: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    setUser(state, { payload = {} }) {
      // only accept whitelisted keys to avoid accidental state pollution
      const { id = null, email = null, displayName = null, photoURL = null } = payload || {};
      state.id = id;
      state.email = email;
      state.displayName = displayName;
      state.photoURL = photoURL;
    },
    clearUser() {
      // return a fresh copy to avoid shared object references
      return { ...initialUserState };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;