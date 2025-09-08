import { configureStore } from "@reduxjs/toolkit";

// Example placeholder reducer so the store is valid.
// Replace with your real slices when ready:
// import auth from "./slices/authSlice";
// import game from "./slices/gameSlice";

export const store = configureStore({
  reducer: {
    // auth,
    // game,
  },
});

// Optional: quick dev debug
if (import.meta.env.DEV) {
  window.__STORE__ = store;
}
