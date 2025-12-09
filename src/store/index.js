// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";
import uiReducer from "./uiSlice.js";
import weatherReducer from "./weatherSlice.js";

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    ui: uiReducer,
    weather: weatherReducer,
  },
});

export default store;
