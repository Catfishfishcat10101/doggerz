// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import dogReducer from "./dogSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    dog: dogReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // Allow Firestore Timestamps in actions if they ever appear
        ignoredActionPaths: ["payload.updatedAt"],
        ignoredPaths: ["dog._meta"],
      },
    }),
});

export default store;
