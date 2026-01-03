<<<<<<< HEAD
/** @format */

// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import dogReducer from './dogSlice.js';
import userReducer from './userSlice.js';
import weatherReducer from './weatherSlice.js';
import workflowsReducer from './workflowSlice.js';
=======
// src/redux/store.js
// @ts-nocheck

import { configureStore } from "@reduxjs/toolkit";
// use your real reducers — these paths match the project's conventions
import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from '@/redux/settingsSlice.js';
import weatherReducer from '@/redux/weatherSlice.js';
>>>>>>> master

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
<<<<<<< HEAD
    weather: weatherReducer, // <-- new slice
    workflows: workflowsReducer,
=======
    settings: settingsReducer,
    weather: weatherReducer,
>>>>>>> master
  },
});

export default store;
