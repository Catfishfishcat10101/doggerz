// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  level: 1,
  xp: 0,
  happiness: 50,
  needs: {
    hunger: 50,
    thirst: 50,
    energy: 50,
  },
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    feedDog: (state) => {
      state.needs.hunger = Math.min(state.needs.hunger + 20, 100);
      state.happiness = Math.min(state.happiness + 5, 100);
    },
    waterDog: (state) => {
      state.needs.thirst = Math.min(state.needs.thirst + 20, 100);
      state.happiness = Math.min(state.happiness + 5, 100);
    },
    restDog: (state) => {
      state.needs.energy = Math.min(state.needs.energy + 20, 100);
    },
    trainDog: (state) => {
      state.xp += 10;
      state.happiness = Math.max(state.happiness - 5, 0);
      if (state.xp >= state.level * 100) {
        state.level += 1;
        state.xp = 0;
      }
    },
    playDog: (state) => {
      state.happiness = Math.min(state.happiness + 15, 100);
      state.xp += 5;
    },
  },
});

export const { feedDog, waterDog, restDog, trainDog, playDog } =
  dogSlice.actions;

// ✅ Selectors
export const selectDog = (state) => state.dog;
export const selectDogLevel = (state) => state.dog.level;
export const selectDogNeeds = (state) => state.dog.needs;
export const selectDogHappiness = (state) => state.dog.happiness;
export const selectDogXP = (state) => state.dog.xp;

export default dogSlice.reducer;