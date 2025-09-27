// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

/** --------------------------------------------------------------------------
 *  World + gameplay tuning (edit as needed)
 *  -------------------------------------------------------------------------- */
const WORLD_WIDTH = 1920;        // px — clamp sprite X within this range
const WORLD_PADDING = 24;        // px — keep away from hard edges
const IDLE_DECAY_PER_SEC = {     // stat drain per second when idle
  hunger: 0.8,
  energy: 0.4,
  cleanliness: 0.25,
};
const MOVE_DECAY_PER_SEC = {     // stat drain per second when moving
  hunger: 1.1,
  energy: 1.6,
  cleanliness: 0.35,
};
const ACTION_EFFECTS = {
  feed:       { hunger: +22, cleanliness: -2,  energy: +2,  happiness: +6,  mood: "fed" },
  play:       { hunger: -6,  cleanliness: -3,  energy: -10, happiness: +12, mood: "play" },
  wash:       { hunger: -2,  cleanliness: +28, energy: -2,  happiness: +4,  mood: "clean" },
  rest:       { hunger: -3,  cleanliness: 0,   energy: +24, happiness: +5,  mood: "rest" },
};
const CLAMP_STAT_MIN = 0;
const CLAMP_STAT_MAX = 100;

/** --------------------------------------------------------------------------
 *  Utilities
 *  -------------------------------------------------------------------------- */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clampStats = (dog) => {
  dog.hunger      = clamp(dog.hunger,      CLAMP_STAT_MIN, CLAMP_STAT_MAX);
  dog.energy      = clamp(dog.energy,      CLAMP_STAT_MIN, CLAMP_STAT_MAX);
  dog.cleanliness = clamp(dog.cleanliness, CLAMP_STAT_MIN, CLAMP_STAT_MAX);
  dog.happiness   = clamp(dog.happiness,   CLAMP_STAT_MIN, CLAMP_STAT_MAX);
};
const clampX = (x) =>
  clamp(x, WORLD_PADDING, Math.max(WORLD_PADDING, WORLD_WIDTH - WORLD_PADDING));

/** --------------------------------------------------------------------------
 *  Initial state
 *  -------------------------------------------------------------------------- */
const initialState = {
  id: nanoid(),
  name: "Pupper",
  stage: "adult",          // "puppy" | "adult" | "senior"
  mood: "idle",            // "idle" | "walk" | "fed" | "play" | "clean" | "rest" | "bark"
  dir: "right",            // "left" | "right"
  moving: false,           // toggled by controls/engine
  lastTickAt: Date.now(),  // ms — for dt-based stat decay
  lastBarkAt: 0,           // ms — optional cooldown logic
  pos: { x: 240 },         // world-space X in px
  // Core stats
  hunger: 80,              // 0 (starving) .. 100 (full)
  energy: 80,              // 0 (exhausted) .. 100 (rested)
  cleanliness: 80,         // 0 (filthy) .. 100 (sparkling)
  happiness: 80,           // 0 .. 100 (meta, boosted by actions)
  // Progression / streak hooks if you want them later
  xp: 0,
  level: 1,
};

/** --------------------------------------------------------------------------
 *  Slice
 *  -------------------------------------------------------------------------- */
const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /** One-off full reset (debug) */
    resetDog: () => ({ ...initialState, id: nanoid(), lastTickAt: Date.now() }),

    /** Identity & lifecycle */
    setName(state, action) {
      state.name = String(action.payload || "").slice(0, 20);
    },
    setStage(state, action) {
      const s = String(action.payload);
      if (s === "puppy" || s === "adult" || s === "senior") {
        state.stage = s;
      }
    },

    /** Movement + direction */
    setPosition(state, action) {
      const x = Number(action.payload?.x ?? state.pos.x);
      state.pos.x = clampX(x);
    },
    moveBy(state, action) {
      const dx = Number(action.payload?.dx ?? 0);
      state.pos.x = clampX(state.pos.x + dx);
      // Update mood when actively moving
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

    /** Bark interaction (consumed by your DogSprite) */
    bark(state, action) {
      state.lastBarkAt = Number(action.payload || Date.now());
      state.mood = "bark";
      // Tiny happiness nudge; debounce naturally via UI if needed
      state.happiness = clamp(state.happiness + 0.5, 0, 100);
    },

    /** Core actions — align with your ActionsBar buttons */
    feed(state) {
      const e = ACTION_EFFECTS.feed;
      state.hunger += e.hunger;
      state.cleanliness += e.cleanliness;
      state.energy += e.energy;
      state.happiness += e.happiness;
      state.mood = e.mood;
      clampStats(state);
    },
    play(state) {
      const e = ACTION_EFFECTS.play;
      state.hunger += e.hunger;
      state.cleanliness += e.cleanliness;
      state.energy += e.energy;
      state.happiness += e.happiness;
      state.mood = e.mood;
      clampStats(state);
    },
    wash(state) {
      const e = ACTION_EFFECTS.wash;
      state.hunger += e.hunger;
      state.cleanliness += e.cleanliness;
      state.energy += e.energy;
      state.happiness += e.happiness;
      state.mood = e.mood;
      clampStats(state);
    },
    rest(state) {
      const e = ACTION_EFFECTS.rest;
      state.hunger += e.hunger;
      state.cleanliness += e.cleanliness;
      state.energy += e.energy;
      state.happiness += e.happiness;
      state.mood = e.mood;
      clampStats(state);
    },

    /** Frame/timer tick: call from an engine loop or requestAnimationFrame */
    tick(state, action) {
      const now = Number(action.payload?.now ?? Date.now());
      const prev = Number(state.lastTickAt || now);
      const dtMs = Math.max(0, now - prev);
      if (dtMs <= 0) {
        state.lastTickAt = now;
        return;
      }

      // Decay stats based on movement
      const decay = state.moving ? MOVE_DECAY_PER_SEC : IDLE_DECAY_PER_SEC;
      const dtSec = dtMs / 1000;

      state.hunger -= decay.hunger * dtSec;
      state.energy -= decay.energy * dtSec;
      state.cleanliness -= decay.cleanliness * dtSec;

      // Passive happiness trends towards the mean of other stats
      const target = (state.hunger + state.energy + state.cleanliness) / 3;
      const delta = (target - state.happiness) * 0.1 * dtSec; // gentle easing
      state.happiness += delta;

      clampStats(state);

      // Auto-idle if we haven't moved recently and mood was walk
      if (!state.moving && state.mood === "walk") state.mood = "idle";

      state.lastTickAt = now;
    },
  },
});

/** --------------------------------------------------------------------------
 *  Selectors
 *  -------------------------------------------------------------------------- */
export const selectDog = (state) => state?.dog ?? initialState;
export const selectDirection = (state) => state?.dog?.dir ?? "right";
export const selectStage = (state) => state?.dog?.stage ?? "adult";

/** Handy derived selectors if you need them later */
export const selectStats = (state) => {
  const d = selectDog(state);
  return {
    hunger: d.hunger,
    energy: d.energy,
    cleanliness: d.cleanliness,
    happiness: d.happiness,
  };
};

/** --------------------------------------------------------------------------
 *  Exports
 *  -------------------------------------------------------------------------- */
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
} = dogSlice.actions;

export default dogSlice.reducer;
