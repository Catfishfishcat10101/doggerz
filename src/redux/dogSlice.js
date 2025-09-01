// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  // Core needs
  happiness: 100,
  energy: 100,
  hunger: 100,

  // Training/health
  pottyLevel: 0,
  isPottyTrained: false,
  isDirty: false,
  hasFleas: false,
  hasMange: false,

  // Progression
  level: 1,
  xp: 0,
  xpNeeded: 100,

  // Sprite-facing pose
  x: 96,
  y: 96,
  direction: "down", // 'up' | 'down' | 'left' | 'right'
  // Keep both flags for compatibility with different components
  walking: false,     // <- canonical going forward
  isWalking: false,   // <- backwards-compat alias
  isRunning: false,
};

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // ---- Needs / care -------------------------------------------------------
    feed(state, { payload = 15 }) {
      state.hunger = clamp(state.hunger + payload);
      state.happiness = clamp(state.happiness + 5);
    },
    play(state, { payload = 10 }) {
      state.happiness = clamp(state.happiness + payload);
      state.energy = clamp(state.energy - 10);
      state.hunger = clamp(state.hunger - 5);
      state.isDirty = true;
    },
    rest(state, { payload = 20 }) {
      state.energy = clamp(state.energy + payload);
      state.hunger = clamp(state.hunger - 5);
    },

    // ---- Movement (simple step API used by MainGame.jsx) --------------------
    startWalking(state) {
      state.walking = true;
      state.isWalking = true; // keep alias in sync
    },
    stopWalking(state) {
      state.walking = false;
      state.isWalking = false; // keep alias in sync
      state.isRunning = false;
    },
    move(state, { payload = {} }) {
      const { x = state.x, y = state.y, direction = state.direction, running = false } = payload;
      state.x = x;
      state.y = y;
      state.direction = direction;
      state.isRunning = !!running;
      // Note: we do NOT change needs here; MainGame can call addXp/tick separately.
    },

    // ---- Movement (legacy "walk" that also adjusts needs) -------------------
    walk(state, { payload = { dx: 0, dy: 0, direction: "down" } }) {
      const { dx = 0, dy = 0, direction = "down", running = false } = payload;
      state.x += dx;
      state.y += dy;
      state.direction = direction;
      state.walking = !!(dx || dy);
      state.isWalking = state.walking;
      state.isRunning = !!running;
      state.energy = clamp(state.energy - (running ? 6 : 2), 0, 100);
      state.hunger = clamp(state.hunger - (running ? 3 : 1), 0, 100);
      state.happiness = clamp(state.happiness + 1, 0, 100);
      state.pottyLevel = clamp(state.pottyLevel + 2);
    },

    // ---- Hygiene / training -------------------------------------------------
    bathe(state) {
      state.isDirty = false;
      state.hasFleas = false;
    },
    giveFleaTreatment(state) {
      state.hasFleas = false;
    },
    pottyTrain(state, { payload = 10 }) {
      state.pottyLevel = clamp(state.pottyLevel + payload);
      if (state.pottyLevel >= 100) {
        state.isPottyTrained = true;
        state.pottyLevel = 100;
      }
    },

    // ---- Progression --------------------------------------------------------
    addXp(state, { payload = 10 }) {
      state.xp += payload;
      while (state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded;
        state.level += 1;
        state.xpNeeded = Math.round(state.xpNeeded * 1.15); // simple curve
        state.happiness = clamp(state.happiness + 5);
      }
    },

    // ---- Ambient decay tick -------------------------------------------------
    tick(state) {
      state.energy = clamp(state.energy - 0.2);
      state.hunger = clamp(state.hunger - 0.25);
      state.happiness = clamp(state.happiness - 0.1);
      state.pottyLevel = clamp(state.pottyLevel + 0.3);
    },

    resetDog() {
      return { ...initialState };
    },
  },
});

export const {
  // needs
  feed,
  play,
  rest,
  // movement
  startWalking,
  stopWalking,
  move,
  walk,
  // hygiene/training
  bathe,
  giveFleaTreatment,
  pottyTrain,
  // progression/system
  addXp,
  tick,
  resetDog,
} = dogSlice.actions;

export default dogSlice.reducer;