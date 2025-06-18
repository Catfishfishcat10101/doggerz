import {createSlice } from "@reduxjs/toolkit";

const initialState = {
    uid: null,
    email: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.uid = action.payload?.uid || null;
            state.email = action.payload?.email || null;
        },
        clearUser:(state) => {
            state.uid = null;
            state.email = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;