// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dog from "./dogSlice.js";
import user from "./userSlice.js";

export const store = configureStore({
  reducer: { dog, user },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false, // Firebase user objects aren't strictly serializable
    }),
});

export default store;
