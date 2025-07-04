// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: "",
  photoURL: "",
  loggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName || "";
      state.photoURL = action.payload.photoURL || "";
      state.loggedIn = true;
    },
  },
  logout: () => ({ ...initialState }),
  updateProfile: (s, a) => Object.assign(s, a.payload),
});

export const { loginSuccess, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;
export const setUser = loginSuccess;
export const clearUser = logout;
