import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";
import userReducer from "./userSlice";

const loadState = () => {
  try {
    const serialized = localStorage.getItem("dogState");
    return serialized ? JSON.parse(serialized) : undefined;
  } catch {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("dogState", JSON.stringify(state));
  } catch (err) {
    console.error("Save error", err);
  }
};

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState(store.getState());
});

export default store;
