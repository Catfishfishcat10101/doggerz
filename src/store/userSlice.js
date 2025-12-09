// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    uid: null,
    displayName: null,
    email: null,
    isGuest: true,
  },
  reducers: {
    setUser(state, action) {
      const { uid, displayName, email } = action.payload;
      state.uid = uid;
      state.displayName = displayName ?? null;
      state.email = email ?? null;
      state.isGuest = !uid;
    },
    clearUser(state) {
      state.uid = null;
      state.displayName = null;
      state.email = null;
      state.isGuest = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
