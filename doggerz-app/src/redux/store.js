import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("dogState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("dogState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state", err);
  }
};

const store = configureStore({
  reducer: { dog: dogReducer },
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState(store.getState().dog); // only save the dog slice
});

export default store;
