import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";

// Load from localStorage
const loadState = () => {
  try {
    const savedState = localStorage.getItem("dogState");
    return savedState ? JSON.parse(savedState) : undefined;
  } catch (err) {
    console.error("Failed to load state:", err);
    return undefined;
  }
};

// Save to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem("dogState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state:", err);
  }
};

const store = configureStore({
  reducer: {
    dog: dogReducer,
  },
  preloadedState: loadState(),
});

// Persist every state change
store.subscribe(() => {
  saveState(store.getState().dog);
});

export default store;
