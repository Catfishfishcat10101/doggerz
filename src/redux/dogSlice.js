// initial state for the dog
//src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  name: "Buddy",
  poops: [],
  hunger: 0,
  fun: 100,
  cleanliness: 100,
  pottyLevel: 0,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // original
    setName(state, action) {
      state.name = action.payload;
    },
    addPoop(state) {
      state.poops.push({ id: nanoid(), ts: Date.now() });
    },
    clearPoops(state) {
      state.poops = [];
    },

    // aliases / expected names
    setDogName(state, action) {
      state.name = action.payload;
    },

    // load an entire saved state (used by FirebaseAutoSave)
    loadState(state, action) {
      const payload = action.payload || {};
      Object.keys(payload).forEach((k) => {
        state[k] = payload[k];
      });
    },

    // reset to initial state
    resetDogState(state) {
      Object.keys(initialState).forEach((k) => {
        state[k] = initialState[k];
      });
    },

    // potty / poop related
    increasePottyLevel(state, action) {
      const inc = typeof action.payload === "number" ? action.payload : 1;
      state.pottyLevel = (state.pottyLevel || 0) + inc;
    },

    // simple interactions
    feedDog(state, action) {
      state.hunger = Math.max(0, (state.hunger || 0) - (action.payload || 10));
    },
    playWithDog(state, action) {
      state.fun = Math.min(100, (state.fun || 0) + (action.payload || 10));
    },
    batheDog(state) {
      state.cleanliness = 100;
    },
  },
});

export const {
  setName,
  addPoop,
  clearPoops,
  setDogName,
  loadState,
  resetDogState,
  increasePottyLevel,
  feedDog,
  playWithDog,
  batheDog,
} = dogSlice.actions;
export default dogSlice.reducer;