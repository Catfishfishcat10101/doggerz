import {createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    uid: null,
    email: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
          state.user = {
            uid: action.payload?.uid || null,
            email: action.payload?.email || null,
          };
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;