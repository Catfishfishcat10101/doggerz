import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  uid: null,
  email: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { uid, email } = action.payload || {};
      state.loggedIn = true;
      state.uid = uid || null;
      state.email = email || null;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;