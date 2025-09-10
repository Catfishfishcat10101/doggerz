import { createSlice } from "@reduxjs/toolkit";

const initialState = { id: null, email: null, displayName: null };

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, { payload }) => Object.assign(state, payload),
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = slice.actions;
export default slice.reducer;