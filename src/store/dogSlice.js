// src/store/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: "Fireball",
  adoptedAt: null,
  stage: "puppy",
  hunger: 30,
  energy: 70,
  hygiene: 60,
  happiness: 65,
  pottyTraining: 0,
  obedience: 0,
  mood: "curious",
  cleanlinessTier: "CLEAN",
  lastTick: null,
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    adoptDog(state, action) {
      const name = action.payload?.name || "Fireball";
      const now = new Date().toISOString();
      state.id = nanoid();
      state.name = name;
      state.adoptedAt = now;
      state.stage = "puppy";
      state.hunger = 40;
      state.energy = 80;
      state.hygiene = 70;
      state.happiness = 70;
      state.pottyTraining = 0;
      state.obedience = 0;
      state.mood = "excited";
      state.cleanlinessTier = "CLEAN";
      state.lastTick = now;
    },
    feedDog(state) {
      state.hunger = clamp(state.hunger - 25);
      state.happiness = clamp(state.happiness + 5);
    },
    playWithDog(state) {
      state.energy = clamp(state.energy - 15);
      state.happiness = clamp(state.happiness + 15);
      state.hygiene = clamp(state.hygiene - 5);
    },
    cleanDog(state) {
      state.hygiene = clamp(state.hygiene + 30);
      state.cleanlinessTier = "CLEAN";
    },
    pottyTrain(state) {
      state.pottyTraining = clamp(state.pottyTraining + 10);
      state.happiness = clamp(state.happiness + 3);
    },
    obedienceTrain(state) {
      if (state.pottyTraining < 60) return;
      state.obedience = clamp(state.obedience + 8);
      state.mood = "focused";
    },
    tick(state, action) {
      const now = action.payload?.now || new Date().toISOString();
      state.lastTick = now;

      state.hunger = clamp(state.hunger + 1);
      state.energy = clamp(state.energy - 0.5);
      state.hygiene = clamp(state.hygiene - 0.3);

      if (state.hygiene < 25 && state.cleanlinessTier === "CLEAN") {
        state.cleanlinessTier = "DIRTY";
      } else if (state.hygiene < 15 && state.cleanlinessTier === "DIRTY") {
        state.cleanlinessTier = "FLEAS";
      }

      if (state.hunger > 70) {
        state.mood = "hungry";
        state.happiness = clamp(state.happiness - 1);
      } else if (state.energy < 25) {
        state.mood = "tired";
      } else {
        state.mood = "playful";
      }
    },
  },
});

export const {
  adoptDog,
  feedDog,
  playWithDog,
  cleanDog,
  pottyTrain,
  obedienceTrain,
  tick,
} = dogSlice.actions;

export default dogSlice.reducer;
