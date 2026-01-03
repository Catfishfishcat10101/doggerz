// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import dogReducer from './dogSlice.js';
import userReducer from './userSlice.js';
import settingsReducer from './settingsSlice.js';
import weatherReducer from './weatherSlice.js';
import workflowsReducer from './workflowSlice.js';

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
    settings: settingsReducer,
    weather: weatherReducer,
    workflows: workflowsReducer,
  },
});

export default store;
