// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dog from "./dogSlice";

const store = configureStore({
  reducer: { dog },
  devTools: true,
});

export default store;