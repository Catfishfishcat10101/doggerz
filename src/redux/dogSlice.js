import { createSlice, nanoid } from "@reduxjs/toolkit";

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const LEVEL_XP = 100;

const initialState = {
  /* identity */
  name: "",
  gender: "",
  /* progression */
  xp: 0,
  level: 1,
  /* needs & stats (0..100) */
  happiness: 100,
  energy: 100,
  hunger: 100,
  /* potty */
  pottyLevel: 0,
  isPottyTrained: false,
  /* tricks & items */
  tricksLearned: [],
  toylist: [],
  modalOpen: false,
  /* position & facing */
  x: 96,
  y: 96,
  direction: "down",
  /* cleanliness */
  isDirty: false,
  hasFleas: false,
  hasMange: false,
  lastBathed: Date.now(),
  /* animation / AI flags */
  isWalking: false,
  isRunning: false,
  isBarking: false,
  isPooping: false,
  /* world */
  poops: [], // [{id,x,y}]
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // movement / animation
    move: (state, action) => {
      const { x, y, direction } = action.payload || {};
      if (typeof x === "number") state.x = x;
      if (typeof y === "number") state.y = y;
      if (direction) state.direction = direction;
    },
    startWalking: (state) => { state.isWalking = true; },
    stopWalking: (state) => { state.isWalking = false; },

    // core interactions
    feedDog: (state) => {
      state.hunger = clamp(state.hunger + 20);
      state.happiness = clamp(state.happiness + 5);
      state.xp += 2;
      while (state.xp >= LEVEL_XP) { state.xp -= LEVEL_XP; state.level += 1; }
    },
    playWithDog: (state) => {
      state.happiness = clamp(state.happiness + 12);
      state.energy = clamp(state.energy - 6);
      if (Math.random() < 0.12) state.isDirty = true;
      state.xp += 5;
      while (state.xp >= LEVEL_XP) { state.xp -= LEVEL_XP; state.level += 1; }
    },
    batheDog: (state) => {
      state.isDirty = false;
      state.lastBathed = Date.now();
      state.hasFleas = false; // mange persists (future vet feature)
      state.happiness = clamp(state.happiness + 4);
    },
    gainXP: (state, action) => {
      const add = Number(action.payload || 0);
      if (!Number.isFinite(add)) return;
      state.xp += add;
      while (state.xp >= LEVEL_XP) { state.xp -= LEVEL_XP; state.level += 1; }
    },

    // potty & poop
    trainPotty: (state) => {
      if (state.isPottyTrained) return;
      state.pottyLevel = clamp(state.pottyLevel + 10);
      if (state.pottyLevel >= 100) state.isPottyTrained = true;
      state.xp += 8;
      while (state.xp >= LEVEL_XP) { state.xp -= LEVEL_XP; state.level += 1; }
    },
    addPoop: (state, action) => {
      const { x, y } = action.payload || {};
      if (typeof x !== "number" || typeof y !== "number") return;
      state.poops.push({ id: nanoid(), x, y });
      state.isDirty = true;
    },
    removePoop: (state, action) => {
      const id = action.payload;
      state.poops = state.poops.filter((p) => p.id !== id);
    },

    // tricks
    learnTrick: (state, action) => {
      const trick = (action.payload || "").trim();
      if (!trick) return;
      if (!state.tricksLearned.includes(trick)) {
        state.tricksLearned.push(trick);
        state.happiness = clamp(state.happiness + 6);
        state.xp += 12;
        while (state.xp >= LEVEL_XP) { state.xp -= LEVEL_XP; state.level += 1; }
      }
    },

    // cleanliness toggles (for timed progression)
    setDirty: (state, action) => { state.isDirty = !!action.payload; },
    setFleas: (state, action) => { state.hasFleas = !!action.payload; },
    setMange: (state, action) => { state.hasMange = !!action.payload; },

    // global reset (used on logout)
    resetDog: () => initialState,
  },
});

export const {
  move,
  startWalking,
  stopWalking,
  feedDog,
  playWithDog,
  batheDog,
  gainXP,
  trainPotty,
  addPoop,
  removePoop,
  learnTrick,
  setDirty,
  setFleas,
  setMange,
  resetDog,
} = dogSlice.actions;

export default dogSlice.reducer;
