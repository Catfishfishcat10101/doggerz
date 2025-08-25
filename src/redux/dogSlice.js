// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

/** Clamp helper */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/** Leveling curve — can be made progressive later */
const LEVEL_XP = 100;

/** Centralized XP/Level helper (pure; no I/O) */
function addXP(state, amount = 0) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.xp += amount;
  while (state.xp >= LEVEL_XP) {
    state.xp -= LEVEL_XP;
    state.level += 1;
  }
}

/** Initial dog state (deterministic for tests/SSR) */
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
  lastBathed: null, // set on first bathe; keeps initial state pure
  /* animation / AI flags */
  isWalking: false,
  isRunning: false,
  isBarking: false,
  isPooping: false,
  /* world */
  poops: [], // [{id,x,y,ts}]
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /* =========================
       Movement / animation
       ========================= */
    move: (state, action) => {
      const { x, y, direction } = action.payload || {};
      if (typeof x === "number") state.x = x;
      if (typeof y === "number") state.y = y;
      if (direction) state.direction = direction;
    },
    startWalking: (state) => { state.isWalking = true; },
    stopWalking: (state) => { state.isWalking = false; },
    startRunning: (state) => { state.isRunning = true; },
    stopRunning: (state) => { state.isRunning = false; },

    /* =========================
       Core interactions
       NOTE: keep