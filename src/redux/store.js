// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { userListenerMiddleware } from "./userSlice";
import dogReducer from "./dogSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    dog: dogReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(userListenerMiddleware.middleware),
});

export default store;
