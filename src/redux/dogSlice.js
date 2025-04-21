// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  happiness: 100,
  energy: 100,
  age: 0,
  xp: 0,               // make sure you have an xp field
  tricksLearned: [],
  pottyTrained: false,
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    feed: (state) => { /* … */ },
    play: (state) => { /* … */ },
    ageUp: (state) => { state.age++; },
    gainXP: (state, action) => { state.xp += action.payload; },   // <-- new
    learnTrick: (state, action) => { /* … */ },
    pottyTrain: (state) => { /* … */ },
    resetDog: () => initialState,                                  // <-- use this
    setDogName: (state, action) => { /* … */ },
    toggleSound: (state) => { /* … */ },
    loadState: (state, action) => ({ ...state, ...action.payload }),
    move: (state, action) => { /* … */ },
  },
});

export const {
  feed,
  play,
  ageUp,
  gainXP,            // <-- export it here
  learnTrick,
  pottyTrain,
  resetDog,          // <-- this replaces resetGame
  setDogName,
  toggleSound,
  loadState,
  move,
} = dogSlice.actions;

export default dogSlice.reducer;
