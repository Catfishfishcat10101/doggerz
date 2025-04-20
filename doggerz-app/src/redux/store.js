import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";

// Load from localStorage (if it exists)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("dogState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
    return undefined;
  }
};

// Save to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("dogState", serializedState);
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
};

const store = configureStore({
  reducer: {
    dog: dogReducer,
  },
  preloadedState: loadState(), // Load state on app start
});

// Save to localStorage whenever the store updates
store.subscribe(() => {
  saveState({
    dog: store.getState().dog,
  });
});

export default store;
