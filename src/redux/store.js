// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Everything in dog + user slices is serializable (numbers/strings/booleans),
      // so we can keep the default checks on.
      serializableCheck: true,
    }),
  devTools: true,
});

export default store;
