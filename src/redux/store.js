import { configureStore } from "@reduxjs/toolkit";
import dogReducer from "./dogSlice";
import userReducer from "./userSlice";

const loadDogState = () => {
  try {
    const serializedState = localStorage.getItem("dogState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

const saveDogState = (state) => {
  try {
    localStorage.setItem("dogState", JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save dog state", err);
  }
};

const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  preloadedState: {
    dog: loadDogState(),
  },
});

store.subscribe(() => {
  saveDogState(store.getState().dog);
});

export default store;
