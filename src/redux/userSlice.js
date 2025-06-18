<<<<<<< HEAD
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

=======
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
	name: "user",
	initialState: {
		currentUser: null,
	},
	reducers: {
		setUser: (state, action) => {
			state.currentUser = action.payload;
		},
		clearUser: (state) => {
			state.currentUser = null;
		},
	},
});

export const { setUser, clearUser } = userSlice.actions;
>>>>>>> 3b2685a460845831f4c51ffea0278b9ada898d58
export default userSlice.reducer;