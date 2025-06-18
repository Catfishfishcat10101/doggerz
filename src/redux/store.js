import { configureStore } from "@reduxjs/toolkit";
<<<<<<< HEAD
import dogReducer from "./dogSlice";
import userReducer from './userSlice';

export const store = configureStore({
    reducer:{
        dog: dogReducer,
        user: userReducer,
    },
});
=======
import dogReducer from "./dogSlice.js";
import userReducer from "./userSlice.js";

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
>>>>>>> 3b2685a460845831f4c51ffea0278b9ada898d58
