// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    // Add more slices here if needed!
  },
});
