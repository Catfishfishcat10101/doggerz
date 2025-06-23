import { createSlice } from "@reduxjs/toolkit";

// Initial state with `user` key (needed for App.jsx)
const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set user on Firebase auth login
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // Clear user on logout
    clearUser: (state) => {
      state.user = null;
    },
  },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;