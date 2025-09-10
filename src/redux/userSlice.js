import { createSlice } from "@reduxjs/toolkit";
const initialState = { id: null, email: null, displayName: null, photoURL: null };

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, { payload }) => ({ ...initialState, ...payload }),
    clearUser: () => initialState,
  },
});
export const { setUser, clearUser } = slice.actions;
export const selectUser = (s) => s.user;
export default slice.reducer;
