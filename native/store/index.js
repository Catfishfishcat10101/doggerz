import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "@/redux/dogSlice.js";

const isProd = process.env.NODE_ENV === "production";

const store = configureStore({
  reducer: {
    dog: dogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["meta.arg", "meta.baseQueryMeta"],
        warnAfter: 64,
      },
      immutableCheck: !isProd,
    }),
  devTools: !isProd,
});

export default store;
