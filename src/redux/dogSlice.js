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
  toylist: [],
  modalOpen: false,
  x: 96,
  y: 96,
  direction: "down",

  // Cleanliness
  isDirty: false,
  hasFleas: false,
  hasMange: false,
  lastBathed: Date.now(),

  // AI states
  isWalking: false,
  isRunning: false,
  isBarking: false,
  isPooping: false,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Name & Gender
    setDogName: (state, action) => { state.name = action.payload; },
    setDogGender: (state, action) => { state.gender = action.payload; },

    // Movement
    move: (state, action) => {
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.direction = action.payload.direction;
    },

    // XP + Tricks
    gainXP: (state, action) => {
      state.xp += action.payload || 5;
      if (state.xp >= state.level * 100) {
        state.xp = 0;
        state.level += 1;
      }
    },

    scoopPoopReward: (state) => {
      state.xp += 5;
      if (state.xp >= state.level * 100) {
        state.xp = 0;
        state.level += 1;
      }
    },

    teachTrick: (state, action) => {
      if (!state.tricksLearned.includes(action.payload)) {
        state.tricksLearned.push(action.payload);
        state.xp += 10;
      }
    },

    // Hunger / Play
    feedDog: (state) => {
      state.hunger = Math.min(100, state.hunger + 20);
      state.energy = Math.min(100, state.energy + 10);
    },

    playWithDog: (state) => {
      state.happiness = Math.min(100, state.happiness + 15);
      state.energy = Math.max(0, state.energy - 10);
    },

    // Potty
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

    // Toys
    addToy: (state, action) => {
      if (!state.toylist.includes(action.payload)) {
        state.toylist.push(action.payload);
      }
    },

    removeToy: (state, action) => {
      state.toylist = state.toylist.filter(toy => toy.id !== action.payload.id);
    },

    toggleToyModal: (state, action) => {
      state.modalOpen = action.payload;
    },

    // Cleanliness
    batheDog: (state) => {
      state.isDirty = false;
      state.hasFleas = false;
      state.hasMange = false;
      state.lastBathed = Date.now();
    },

    groomDog: (state) => {
      state.isDirty = false;
    },

    treatFleas: (state) => {
      state.hasFleas = false;
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

    // State persistence
    resetDogState: () => initialState,
    resetDog: () => initialState,

    loadState: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setDogName,
  setDogGender,
  move,
  gainXP,
  scoopPoopReward,
  teachTrick,
  feedDog,
  playWithDog,
  increasePottyLevel,
  resetPottyLevel,
  addToy,
  removeToy,
  toggleToyModal,
  batheDog,
  groomDog,
  treatFleas,
  updateCleanliness,
  startWalking,
  stopWalking,
  startRunning,
  stopRunning,
  startBarking,
  stopBarking,
  startPooping,
  stopPooping,
  resetDogState,
  resetDog,
  loadState,
} = dogSlice.actions;

export default dogSlice.reducer;