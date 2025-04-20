import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  age: 0,
  happiness: 100,
  energy: 100,
  x: 96,
  y: 96,
  direction: "down",
  xp: 0,
  tricksLearned: [],
  pottyTrained: false,
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setDogName: (state, action) => {
      state.name = action.payload;
    },
    feed: (state) => {
      state.energy = Math.min(state.energy + 20, 100);
    },
    play: (state, action) => {
      const bonus = action.payload?.bonus || 15;
      state.energy = Math.max(state.energy - 10, 0);
      state.happiness = Math.min(state.happiness + bonus, 100);
      state.xp = Math.min(state.xp + 5, 100);
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
    move: (state, action) => {
      const { x, y, direction } = action.payload;
      state.x = x;
      state.y = y;
      state.direction = direction;
    },
    loadState: (state, action) => {
      return { ...state, ...action.payload };
    },
    gainXP: (state, action) => {
      state.xp += action.payload;
      if (state.xp >= 50 && !state.tricksLearned.includes("sit")) {
        state.tricksLearned.push("sit");
      }
      if (state.xp >= 100 && !state.tricksLearned.includes("roll")) {
        state.tricksLearned.push("roll");
      }
      // ADD MORE MILESTONES HERE
    },
    resetGame: (state, action) => {
      return {
        happiness: 100,
        energy: 100,
        age: 0,
        xp: 0,
        tricksLearned: [],
        pottyTrained: false,
        soundEnabled: true,
        name: "",
        x: 96,
        y: 96,
        direction: "down",
      };
    }
  },
});

export const {
  setDogName,
  feed,
  play,
  learnTrick,
  ageUp,
  pottyTrain,
  toggleSound,
  move,
  loadState,
} = dogSlice.actions;

export default dogSlice.reducer;
