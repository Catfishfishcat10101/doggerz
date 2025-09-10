import { configureStore } from "@reduxjs/toolkit";
import user from "./userSlice";
import dog from "./dogSlice";

const store = configureStore({
  reducer: { user, dog },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});
export default store;