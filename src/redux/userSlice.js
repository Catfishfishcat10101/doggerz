//src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  email: null,
  displayName: null,
  photoURL: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, { payload }) {
      state.id = payload?.id ?? null;
      state.email = payload?.email ?? null;
      state.displayName = payload?.displayName ?? null;
      state.photoURL = payload?.photoURL ?? null;
    },
    clearUser(state) {
      state.id = null;
      state.email = null;
      state.displayName = null;
      state.photoURL = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// selectors
export const selectUser = (s) => s.user;
export const selectUserId = (s) => s.user.id;
