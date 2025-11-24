// src/redux/store.js
// @ts-nocheck

import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";
import weatherReducer from "./weatherSlice.js";

export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer, // 👈 this MUST be "user" for selectUser(state).user to work
    weather: weatherReducer,
  },
});

// Optional: type helpers if you decide to add TS later
// export const RootState = store.getState;
// export const AppDispatch = store.dispatch;
