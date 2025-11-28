// src/redux/store.js
// @ts-nocheck

import { configureStore } from "@reduxjs/toolkit";
// use your real reducers — these paths match the project's conventions
import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
});

export default store;
