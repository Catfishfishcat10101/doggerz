// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  uid: null,
  email: null,
  // You can add displayName, photoURL, etc. if using Google/Firebase profile info
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.loggedIn = true;
      state.uid = action.payload.uid;
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.loggedIn = false;
      state.uid = null;
      state.email = null;
    },
    // Optionally: add user profile update actions
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
