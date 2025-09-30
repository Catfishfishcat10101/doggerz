import { configureStore } from "@reduxjs/toolkit";
import user from "./userSlice.js";
import dog from "./dogSlice.js"; // you already have this; file must exist

const store = configureStore({
  reducer: { user, dog },
  devTools: true,
});

export default store;
