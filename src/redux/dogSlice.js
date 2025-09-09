import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const initialState = {
  name: "Pupper",
  happiness: 100,
  energy: 100,
  hunger: 100,
  cleanliness: 100,
  mood: "idle",
  poopCount: 0,
  isPottyTrained: false,
  toys: ["Ball", "Rope", "Bone"],
  learnedTricks: [],
  xp: 0,
  level: 1,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    loadState: (state, action) => {
      // Replace state but keep unknown keys safe
      return { ...state, ...action.payload };
    },
    setName: (state, action) => {
      state.name = String(action.payload?.name ?? "").slice(0, 24) || "Pupper";
    },
    feed: (state) => {
      state.hunger = clamp(state.hunger + 20);
      state.cleanliness = clamp(state.cleanliness - 5);
      state.happiness = clamp(state.happiness + 5);
      state.mood = "happy";
    },
    play: (state) => {
      state.happiness = clamp(state.happiness + 12);
      state.energy = clamp(state.energy - 10);
      state.hunger = clamp(state.hunger - 6);
      state.mood = "happy";
    },
    train: (state) => {
      state.energy = clamp(state.energy - 12);
      state.hunger = clamp(state.hunger - 8);
      state.happiness = clamp(state.happiness + 4);
      state.xp += 6;
      if (state.xp >= state.level * 50) state.level += 1;
      state.mood = "focused";
    },
    rest: (state) => {
      state.energy = clamp(state.energy + 18);
      state.happiness = clamp(state.happiness + 2);
      state.mood = "sleeping";
    },
    useToy: (state, action) => {
      const toy = action.payload?.toy;
      if (!toy) return;
      state.happiness = clamp(state.happiness + 10);
      state.energy = clamp(state.energy - 5);
      state.mood = "happy";
    },
    learnTrick: (state, action) => {
      const trick = action.payload?.trick;
      if (trick && !state.learnedTricks.includes(trick)) {
        state.learnedTricks.push(trick);
        state.happiness = clamp(state.happiness + 6);
        state.xp += 10;
      }
      state.mood = "proud";
    },
    pottyTrain: (state) => {
      state.isPottyTrained = true;
      state.happiness = clamp(state.happiness + 5);
      state.mood = "proud";
    },
    scoopPoop: (state) => {
      state.poopCount = Math.max(0, state.poopCount - 1);
      state.cleanliness = clamp(state.cleanliness + 12);
      state.mood = "relieved";
    },
    tick: (state) => {
      state.energy = clamp(state.energy - 1);
      state.hunger = clamp(state.hunger - 1);
      state.cleanliness = clamp(state.cleanliness - (state.poopCount > 0 ? 2 : 0.5));
      if (Math.random() < 0.06) state.poopCount += 1;
      if (state.energy < 25) state.mood = "tired";
      else if (state.hunger < 25) state.mood = "hungry";
      else state.mood = "idle";
    },
    reset: () => initialState,
  },
});

export const {
  loadState,
  setName,
  feed,
  play,
  train,
  rest,
  useToy,
  learnTrick,
  pottyTrain,
  scoopPoop,
  tick,
  reset,
} = dogSlice.actions;

export default dogSlice.reducer;