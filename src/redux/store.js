import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import dogReducer from "./dogSlice";

export default configureStore({
  reducer: { user: userReducer, dog: dogReducer },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredPaths: ["dog._meta"], ignoredActionPaths: ["payload.updatedAt"] },
    }),
});
