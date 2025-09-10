import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "Doggo",
  xp: 0,
  happiness: 50,
  tricks: [],   // <--- add tricks here
  streak: 0,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    learnTrick: (state, action) => {
      state.tricks.push(action.payload);
    },
  },
});

export const { learnTrick } = dogSlice.actions;

// selectors
export const selectDog = (state) => state.dog;
export const selectTricks = (state) => state.dog.tricks;   // <--- add this
export const selectStreak = (state) => state.dog.streak;

export default dogSlice.reducer;