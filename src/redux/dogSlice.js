// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

/** --- Tuning knobs --- */
const WORLD_WIDTH = 1920;
const WORLD_PADDING = 24;

const IDLE_DECAY_PER_SEC = { hunger: 0.8, energy: 0.4, cleanliness: 0.25 };
const MOVE_DECAY_PER_SEC = { hunger: 1.1, energy: 1.6, cleanliness: 0.35 };

const ACTION_EFFECTS = {
  feed: { hunger: +22, cleanliness: -2, energy: +2, happiness: +6, mood: "fed" },
  play: { hunger: -6, cleanliness: -3, energy: -10, happiness: +12, mood: "play" },
  wash: { hunger: -2, cleanliness: +28, energy: -2, happiness: +4, mood: "clean" },
  rest: { hunger: -3, cleanliness: 0, energy: +24, happiness: +5, mood: "rest" },
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clampStats = (d) => {
  d.hunger = clamp(d.hunger, 0, 100);
  d.energy = clamp(d.energy, 0, 100);
  d.cleanliness = clamp(d.cleanliness, 0, 100);
  d.happiness = clamp(d.happiness, 0, 100);
};
const clampX = (x) => clamp(x, WORLD_PADDING, Math.max(WORLD_PADDING, WORLD_WIDTH - WORLD_PADDING));

/** Level thresholds (XP required for each level) */
const LEVELS = [0, 100, 250, 500, 900, 1400, 2000];
const levelForXp = (xp) => {
  let lvl = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) lvl = i + 1;
  }
  return lvl;
};

/** --- Initial state --- */
const initialState = {
  id: nanoid(),
  name: "Pupper",
  stage: "adult", // "puppy" | "adult" | "senior"
  mood: "idle",   // "idle" | "walk" | "fed" | "play" | "clean" | "rest" | "bark"
  dir: "right",
  moving: false,
  lastTickAt: Date.now(),
  lastBarkAt: 0,
  pos: { x: 240 },
  hunger: 80,
  energy: 80,
  cleanliness: 80,
  happiness: 80,
  xp: 0,
  level: 1,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    resetDog: () => ({ ...initialState, id: nanoid(), lastTickAt: Date.now() }),

    setName(state, action) {
      state.name = String(action.payload || "").slice(0, 20);
    },
    setStage(state, action) {
      const s = String(action.payload);
      if (s === "puppy" || s === "adult" || s === "senior") state.stage = s;
    },

    setPosition(state, action) {
      const x = Number(action.payload?.x ?? state.pos.x);
      state.pos.x = clampX(x);
    },
    moveBy(state, action) {
      const dx = Number(action.payload?.dx ?? 0);
      state.pos.x = clampX(state.pos.x + dx);
      if (dx !== 0) {
        state.mood = "walk";
        state.moving = true;
        state.dir = dx < 0 ? "left" : "right";
      }
    },
    setDirection(state, action) {
      const d = String(action.payload);
      if (d === "left" || d === "right") state.dir = d;
    },
    startMoving(state) {
      state.moving = true;
      if (state.mood === "idle") state.mood = "walk";
    },
    stopMoving(state) {
      state.moving = false;
      if (state.mood === "walk") state.mood = "idle";
    },

    bark(state, action) {
      state.lastBarkAt = Number(action.payload || Date.now());
      state.mood = "bark";
      state.happiness = clamp(state.happiness + 0.5, 0, 100);
      state.xp += 1;
    },

    feed(state) { applyAction(state, ACTION_EFFECTS.feed); },
    play(state) { applyAction(state, ACTION_EFFECTS.play); },
    wash(state) { applyAction(state, ACTION_EFFECTS.wash); },
    rest(state) { applyAction(state, ACTION_EFFECTS.rest); },

    /** Game-loop tick with stat decay */
    tick(state, action) {
      const now = Number(action.payload?.now ?? Date.now());
      const prev = Number(state.lastTickAt || now);
      const dtMs = Math.max(0, now - prev);
      state.lastTickAt = now;
      if (dtMs <= 0) return;

      const decay = state.moving ? MOVE_DECAY_PER_SEC : IDLE_DECAY_PER_SEC;
      const dtSec = dtMs / 1000;
      state.hunger -= decay.hunger * dtSec;
      state.energy -= decay.energy * dtSec;
      state.cleanliness -= decay.cleanliness * dtSec;

      const target = (state.hunger + state.energy + state.cleanliness) / 3;
      const delta = (target - state.happiness) * 0.1 * dtSec;
      state.happiness += delta;

      clampStats(state);

      if (!state.moving && state.mood === "walk") state.mood = "idle";
    },

    /** Level gate used by useGameTick (safe no-op if already correct) */
    levelCheck(state) {
      const next = levelForXp(state.xp);
      if (next !== state.level) state.level = next;
    },
  },
});

function applyAction(state, e) {
  state.hunger += e.hunger;
  state.cleanliness += e.cleanliness;
  state.energy += e.energy;
  state.happiness += e.happiness;
  state.mood = e.mood;
  state.xp += 5; // tiny progression per action
  clampStats(state);
}

/** --- Selectors --- */
export const selectDog = (s) => s?.dog ?? initialState;
export const selectDirection = (s) => s?.dog?.dir ?? "right";
export const selectStage = (s) => s?.dog?.stage ?? "adult";
export const selectMood = (s) => s?.dog?.mood ?? "idle";
export const selectStats = (s) => {
  const d = selectDog(s);
  return { hunger: d.hunger, energy: d.energy, cleanliness: d.cleanliness, happiness: d.happiness };
};

/** --- Actions/Reducer --- */
export const {
  resetDog,
  setName,
  setStage,
  setPosition,
  moveBy,
  setDirection,
  startMoving,
  stopMoving,
  bark,
  feed,
  play,
  wash,
  rest,
  tick,
  levelCheck,
} = dogSlice.actions;

export default dogSlice.reducer;
