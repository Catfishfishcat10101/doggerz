import { configureStore } from "@reduxjs/toolkit";
import user from "./userSlice";
import dog from "./dogSlice";

export const store = configureStore({
  reducer: { user, dog },
  devTools: process.env.NODE_ENV !== "production",
});