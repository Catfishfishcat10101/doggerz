// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = { id: null, email: null, displayName: null, photoURL: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(_, { payload }) {
      return { ...initialState, ...payload };
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (s) => s.user;
export default userSlice.reducer;
