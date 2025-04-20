// src/store/dogSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Example trick definitions with XP and play count requirements
const TRICKS = [
  { name: 'Sit', xpRequired: 100, playRequired: 5 },
  { name: 'Roll Over', xpRequired: 200, playRequired: 10 },
  { name: 'Play Dead', xpRequired: 300, playRequired: 15 },
  // add more tricks as needed
];

const initialState = {
  name: 'Fido',          // dog's name
  age: 0,                // dog's age
  happiness: 50,
  energy: 50,
  xp: 0,
  unlockedTricks: [],    // tricks unlocked so far (by name)
  stats: {
    playCount: 0,
    // you can track other interactions like feedCount, walkCount, etc.
  }
};

const dogSlice = createSlice({
  name: 'dog',
  initialState,
  reducers: {
    gainXP: (state, action) => {
      // Increase XP by a certain amount (action.payload or default 1)
      const amount = action.payload || 1;
      state.xp += amount;
      // Check for any new unlockable tricks after gaining XP
      TRICKS.forEach(trick => {
        const { name, xpRequired, playRequired = 0 } = trick;
        if (
          state.xp >= xpRequired && 
          state.stats.playCount >= playRequired &&
          !state.unlockedTricks.includes(name)
        ) {
          state.unlockedTricks.push(name);
        }
      });
    },
    playWithDog: (state) => {
      // Example interaction: playing increases happiness, decreases energy, gives XP
      state.happiness = Math.min(state.happiness + 10, 100);
      state.energy = Math.max(state.energy - 10, 0);
      state.stats.playCount += 1;
      // Award some XP for playing
      state.xp += 20;
      // Check and unlock tricks if conditions met
      TRICKS.forEach(trick => {
        const { name, xpRequired, playRequired = 0 } = trick;
        if (
          state.xp >= xpRequired && 
          state.stats.playCount >= playRequired &&
          !state.unlockedTricks.includes(name)
        ) {
          state.unlockedTricks.push(name);
        }
      });
    },
    // You could add more interaction reducers, e.g., feedDog, trainDog, etc.

    loadDogState: (state, action) => {
      // Load dog's state (e.g. from database) into Redux state
      return { ...state, ...action.payload };
    }
  }
});

export const { gainXP, playWithDog, loadDogState } = dogSlice.actions;
export default dogSlice.reducer;
