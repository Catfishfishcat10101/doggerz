// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";

export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths for non-serializable values
        ignoredPaths: ["dog.lastUpdatedAt", "dog.adoptedAt"],
        ignoredActions: ["dog/hydrateDog", "dog/registerSessionStart"],
      },
    }),
});
