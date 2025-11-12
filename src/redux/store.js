// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";

// If dogSlice.js doesn’t exist yet, we’ll wire it next.
// For now we assume your dog state lives in redux/dogSlice.js

const store = configureStore({
  reducer: {
    dog: dogReducer,
  },
  // You can add more slices here later, e.g. ui: uiReducer
});

export default store;