// src/redux/userSlice.js
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
      const { uid, email, displayName, photoURL } = action.payload;
      state.uid = uid;
      state.email = email;
      state.displayName = displayName;
      state.photoURL = photoURL;
      state.isAuthenticated = true;
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

// SELECTOR (this is the missing export you need!)
export const selectUser = (state) => state.user;

export default userSlice.reducer;