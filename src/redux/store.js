import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from './userSlice.js';

export const store = configureStore({
    reducer:{
        dog: dogReducer,
        user: userReducer,
    },
});