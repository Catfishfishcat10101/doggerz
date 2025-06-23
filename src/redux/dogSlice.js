import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: '',
  gender: '',
  xp: 0,
  level: 1,
  happiness: 100,
  energy: 100,
  hunger: 100,
  pottyLevel: 0,
  isPottyTrained: false,
  tricksLearned: [],
  x: 96,
  y: 96,
  direction: "down",

  // Cleanliness
  isDirty: false,
  hasFleas: false,
  hasMange: false,
  lastBathed: Date.now(),

  // AI state
  isWalking: false,
  isRunning: false,
  isBarking: false,
  isPooping: false,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    feedDog: (state) => {
      state.hunger = Math.min(100, state.hunger + 20);
      state.energy = Math.min(100, state.energy + 10);
    },
    playWithDog: (state) => {
      state.happiness = Math.min(100, state.happiness + 15);
      state.energy = Math.max(0, state.energy - 10);
    },
    teachTrick: (state, action) => {
      if (!state.tricksLearned.includes(action.payload)) {
        state.tricksLearned.push(action.payload);
        state.xp += 10;
      }
    },
    gainXP: (state, action) => {
      state.xp += action.payload || 5;
      if (state.xp >= state.level * 100) {
        state.xp = 0;
        state.level += 1;
      }
    },
    move: (state, action) => {
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.direction = action.payload.direction;
    },
    increasePottyLevel: (state, action) => {
      state.pottyLevel = Math.min(100, state.pottyLevel + (action.payload || 5));
      if (state.pottyLevel >= 100) {
        state.isPottyTrained = true;
      }
    },
    resetPottyLevel: (state) => {
      state.pottyLevel = 0;
      state.isPottyTrained = false;
    },
    setDogName: (state, action) => { state.name = action.payload; },
    setDogGender: (state, action) => { state.gender = action.payload; },
    resetDogState: () => initialState,
    resetDog: () => initialState,

    // Cleanliness
    batheDog: (state) => {
      state.isDirty = false;
      state.hasFleas = false;
      state.hasMange = false;
      state.lastBathed = Date.now();
    },
    updateCleanliness: (state) => {
      const days = (Date.now() - state.lastBathed) / (1000 * 60 * 60 * 24);
      if (days >= 3 && !state.isDirty) state.isDirty = true;
      if (days >= 7 && !state.hasFleas) state.hasFleas = true;
      if (days >= 14 && !state.hasMange) state.hasMange = true;
    },

    // AI flags
    startWalking: (state) => { state.isWalking = true; },
    stopWalking: (state) => { state.isWalking = false; },
    startRunning: (state) => { state.isRunning = true; },
    stopRunning: (state) => { state.isRunning = false; },
    startBarking: (state) => { state.isBarking = true; },
    stopBarking: (state) => { state.isBarking = false; },
    startPooping: (state) => { state.isPooping = true; },
    stopPooping: (state) => { state.isPooping = false; },

    loadState: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  feedDog, playWithDog, teachTrick, gainXP,
  move, increasePottyLevel, resetPottyLevel,
  setDogName, setDogGender, resetDogState, resetDog,
  startWalking, stopWalking, startRunning, stopRunning,
  startBarking, stopBarking, startPooping, stopPooping,
  loadState,
  batheDog, updateCleanliness,
} = dogSlice.actions;

export default dogSlice.reducer;