import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import dogReducer from "./dogSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    dog: dogReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});false
export default store;
