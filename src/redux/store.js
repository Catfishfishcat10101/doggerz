import { configureStore } from '@reduxjs/toolkit';
import user from './userSlice.js';
import dog from './dogSlice.js';

const store = configureStore({
  reducer: { user, dog },
  devTools: import.meta.env.DEV,
});

export default store;
export * from './userSlice.js';
export * from './dogSlice.js';
