// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dog from "./dogSlice.js"; // ensure this file exists
import user, { userListenerMiddleware } from "./userSlice.js";

const store = configureStore({
  reducer: { dog, user },
  middleware: (getDefault) =>
    getDefault().concat(userListenerMiddleware.middleware),
});

export default store;
