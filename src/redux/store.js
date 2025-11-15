// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";

export const store = configureStore({
  reducer: {
    dog: dogReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});
