// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./store/dogSlice";
import userReducer from "./store/userSlice";

export const store = configureStore({
  reducer: {
    dog:  dogReducer,
    user: userReducer,
  },
  // Redux DevTools + RTK serialisable checks stay on by default
});