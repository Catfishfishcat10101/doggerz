import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "Doggo",
  happiness: 100,
  energy: 100,
  age: 1,
  tricksLearned: [],
  pottyTrained: false,
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: 'Doggo',
  initialState,
reducers: {
  feed: (state) => {
    state.energy = Math.min(state.energy + 20, 100);
  },
  play: (state) => {
    state.energy = Math.max(state.energy - 10, 0);
    state.happiness = Math.min(state.happiness + 15, 100);
  },
  learnTrick: (state, action) => {
    if (!state.tricksLearned.includes(action.payload)) {
      state.tricksLearned.push(action.payload);
    }
  },
  ageUp: (state) => {
    state.age += 1;
  },
  pottyTrain: (state) => {
    state.pottyTrained = true;
  },
  toggleSound: (state) => {
    state.soundEnabled = !state.soundEnabled;
  },
  setName: (state, action) => {
    state.name = action.payload;
  },
}
});

export const { feed, play, learnTrick, ageUp, pottyTrain, toggleSound, setName } = dogSlice.actions;
export default dogSlice.reducer;
