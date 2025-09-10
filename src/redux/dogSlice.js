// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const DOG_VERSION = 1;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (n) => Math.round(n * 100) / 100;

// Minimal world defaults (GameScreen may override)
const WORLD = { w: 640, h: 360, tile: 64 };

export const initialState = {
  _version: DOG_VERSION,
  // World + pose
  pos: { x: 320, y: 180 },
  direction: "down",      // 'down'|'left'|'right'|'up'
  moving: false,

  // Core needs (0..100)
  happiness: 75,
  energy: 100,
  hunger: 50,
  hygiene: 85,

  // Progression
  level: 1,
  xp: 0,

  // Aging
  ageDays: 0,             // increments via ticks
  births: 0,              // reserved for lineage later

  // Training systems
  potty: {
    level: 0,             // 0..5
    progress: 0,          // 0..100 per level
    accidents: 0,
    lastAccidentAt: null,
  },
  tricks: {
    sit: 0,               // 0..100 proficiency
    stay: 0,
    paw: 0,
    rollOver: 0,
  },

  // Milestones
  milestones: {
    firstBark: true,
    firstWalk: true,
  },

  // Meta for sync (not saved in Firestore’s `state` directly)
  _meta: {
    lastLocalUpdateAt: 0,
  },
};

function normalizeLoadedState(raw) {
  // Defensive merge to keep app stable when schema changes.
  const s = { ...initialState, ...raw };

  // Fix nested shapes
  s.pos = { ...initialState.pos, ...(raw?.pos || {}) };
  s.potty = { ...initialState.potty, ...(raw?.potty || {}) };
  s.tricks = { ...initialState.tricks, ...(raw?.tricks || {}) };
  s.milestones = { ...initialState.milestones, ...(raw?.milestones || {}) };

  // Clamp ranges
  s.happiness = clamp(Number(s.happiness) || 0, 0, 100);
  s.energy = clamp(Number(s.energy) || 0, 0, 100);
  s.hunger = clamp(Number(s.hunger) || 0, 0, 100);
  s.hygiene = clamp(Number(s.hygiene) || 0, 0, 100);

  s.level = Math.max(1, Math.floor(s.level || 1));
  s.xp = Math.max(0, Math.floor(s.xp || 0));
  s.ageDays = Math.max(0, Math.floor(s.ageDays || 0));
  s._version = DOG_VERSION;

  return s;
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Absolute setters
    setPosition(state, { payload: { x, y, world = WORLD } }) {
      const w = world?.w ?? WORLD.w;
      const h = world?.h ?? WORLD.h;
      const t = world?.tile ?? WORLD.tile;
      state.pos.x = clamp(round2(x), 0, w - t);
      state.pos.y = clamp(round2(y), 0, h - t);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    nudge(state, { payload: { dx = 0, dy = 0, world = WORLD } }) {
      const w = world?.w ?? WORLD.w;
      const h = world?.h ?? WORLD.h;
      const t = world?.tile ?? WORLD.tile;
      state.pos.x = clamp(round2(state.pos.x + dx), 0, w - t);
      state.pos.y = clamp(round2(state.pos.y + dy), 0, h - t);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    setDirection(state, { payload }) {
      state.direction = payload || "down";
      state._meta.lastLocalUpdateAt = Date.now();
    },
    setMoving(state, { payload }) {
      state.moving = !!payload;
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Needs
    setHappiness(state, { payload }) {
      state.happiness = clamp(Math.floor(payload ?? state.happiness), 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    changeHappiness(state, { payload }) {
      state.happiness = clamp(state.happiness + Number(payload || 0), 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    tickNeeds(state, { payload: { dtSec = 1 } = {} }) {
      // Very light simulation step
      const d = Math.max(0, Number(dtSec));
      state.hunger = clamp(state.hunger + 0.005 * d, 0, 100);  // gets hungry slowly
      state.energy = clamp(state.energy - 0.006 * d, 0, 100);  // tires slowly
      state.hygiene = clamp(state.hygiene - 0.003 * d, 0, 100);
      state.happiness = clamp(
        state.happiness +
          (state.hunger > 80 ? -0.01 * d : 0) +
          (state.energy < 20 ? -0.01 * d : 0) +
          (state.hygiene < 20 ? -0.008 * d : 0),
        0,
        100
      );
      state.ageDays = Math.floor(state.ageDays + d / (60 * 60 * 24)); // 1 day per real-time 24h
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Progression
    addXP(state, { payload }) {
      const add = Math.max(0, Math.floor(payload || 0));
      state.xp += add;
      // Simple leveling curve: 100 * level
      while (state.xp >= 100 * state.level) {
        state.xp -= 100 * state.level;
        state.level += 1;
      }
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Potty
    pottyProgress(state, { payload: { delta = 1 } = {} }) {
      state.potty.progress = clamp(state.potty.progress + delta, 0, 100);
      if (state.potty.progress >= 100) {
        state.potty.progress = 0;
        state.potty.level = clamp(state.potty.level + 1, 0, 5);
      }
      state._meta.lastLocalUpdateAt = Date.now();
    },
    pottyAccident(state) {
      state.potty.accidents += 1;
      state.potty.lastAccidentAt = Date.now();
      state.hygiene = clamp(state.hygiene - 10, 0, 100);
      state.happiness = clamp(state.happiness - 5, 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Tricks
    learnTrick(state, { payload: { name, delta = 1 } = {} }) {
      if (!name || !(name in state.tricks)) return;
      state.tricks[name] = clamp(state.tricks[name] + delta, 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Milestones
    setMilestone(state, { payload: { key, value = true } = {} }) {
      if (!key) return;
      state.milestones[key] = !!value;
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Full load/replace from Firestore (already normalized)
    loadState(_state, { payload }) {
      return normalizeLoadedState(payload || initialState);
    },

    // Partial merge from Firestore (keeps local shape)
    mergeState(state, { payload }) {
      const merged = normalizeLoadedState({ ...state, ...(payload || {}) });
      return merged;
    },
  },
});

export const {
  setPosition,
  nudge,
  setDirection,
  setMoving,
  setHappiness,
  changeHappiness,
  tickNeeds,
  addXP,
  pottyProgress,
  pottyAccident,
  learnTrick,
  setMilestone,
  loadState,
  mergeState,
} = dogSlice.actions;

export default dogSlice.reducer;

// -------- Selectors --------
export const selectDog = (s) => s.dog;
export const selectPos = (s) => s.dog.pos;
export const selectDirection = (s) => s.dog.direction;
export const selectMoving = (s) => s.dog.moving;
export const selectHappiness = (s) => s.dog.happiness;
