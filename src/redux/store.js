import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";
import userReducer from "./userSlice";

// Persistent state load/save
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("dogState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem("dogState", JSON.stringify(state));
  } catch (err) {
    console.error("Could not save state", err);
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
