// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "Pup",
  level: 1,
  coins: 0,
  stats: { hunger: 50, happiness: 60, energy: 60, cleanliness: 60 },
  pos: { x: 0, y: 0 },
  isPottyTrained: false,
  pottyLevel: 0,
  poopCount: 0,
  lastTrainedAt: null,
};

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setName(state, action) {
      state.name = String(action.payload ?? "").slice(0, 24);
    },
    awardCoins(state, action) {
      state.coins += Math.max(0, Number(action.payload) || 0);
    },
    setStat(state, action) {
      const { key, value } = action.payload || {};
      if (state.stats[key] !== undefined) {
        const v = Math.max(0, Math.min(100, Number(value) || 0));
        state.stats[key] = v;
      }
    },
    move(state, action) {
      const { x = 0, y = 0 } = action.payload || {};
      state.pos = { x: Number(x) || 0, y: Number(y) || 0 };
    },

    // --- potty training ---
    increasePottyLevel(state, action) {
      const inc = Number(action.payload) || 10;
      state.pottyLevel = Math.min(100, state.pottyLevel + inc);
      if (state.pottyLevel >= 100) state.isPottyTrained = true;
      state.lastTrainedAt = new Date().toISOString();
    },
    markAccident(state) {
      state.poopCount += 1;
      state.pottyLevel = Math.max(0, state.pottyLevel - 20);
      state.isPottyTrained = state.pottyLevel >= 100;
    },
    resetPottyLevel(state) {
      state.pottyLevel = 0;
      state.isPottyTrained = false;
      state.lastTrainedAt = null;
    },

    // --- misc ---
    levelUp(state) {
      state.level += 1;
    },
    resetDogState() {
      return { ...initialState };
    },
  },
});

export const {
  setName,
  awardCoins,
  setStat,
  move,
  increasePottyLevel,
  markAccident,
  resetPottyLevel,
  levelUp,
  resetDogState,
} = slice.actions;

export default slice.reducer;

// --- selectors ---
export const selectDog = (s) => s.dog;
export const selectDogLevel = (s) => s.dog.level;
export const selectCoins = (s) => s.dog.coins;
export const selectPottyLevel = (s) => s.dog?.pottyLevel ?? 0;
export const selectPottyLastTrainedAt = (s) => s.dog.lastTrainedAt;
export const selectIsPottyTrained = (s) => !!s.dog?.isPottyTrained;

// --- compatibility shims (to satisfy existing imports) ---
export const grantCoins = awardCoins;        // used by Affection.jsx
export const selectPottyStreak = (s) => 0;   // TODO: implement real streak logic
