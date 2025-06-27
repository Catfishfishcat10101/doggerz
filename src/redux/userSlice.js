// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid:        null,
  email:      null,
  displayName: "",
  photoURL:   "",
  loggedIn:   false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (s, a) => {
      Object.assign(s, a.payload, { loggedIn: true });
    },
    logout: () => initialState,
    updateProfile: (s, a) => Object.assign(s, a.payload),
  },
});

export const { loginSuccess, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;