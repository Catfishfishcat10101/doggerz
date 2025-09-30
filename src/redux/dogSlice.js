// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

/** Decay rates per second (gentle) */
const IDLE_DECAY_PER_SEC = { hunger: 0.06, energy: 0.03, cleanliness: 0.02 };
const MOVE_DECAY_PER_SEC = { hunger: 0.10, energy: 0.18, cleanliness: 0.04 };

/** World constants (shared) */
export const WORLD = {
  WIDTH: 1920,
  HEIGHT: 1080,
  PADDING: 24,
  YARD_X: 1400, // x >= YARD_X is “outside”
};

/** Helpers */
const clamp01 = (v) => Math.max(0, Math.min(100, v));
const clamp = (min, v, max) => Math.max(min, Math.min(max, v));

/** Derived level/title from dog stats (pure). */
export function levelCheck(d) {
  if (!d) return { level: 1, title: "New Pup" };
  const score =
    ((d.happiness ?? 0) + (d.energy ?? 0) + (d.cleanliness ?? 0) + (d.hunger ?? 0)) / 4;
  const ageBonus = Math.min(5, Math.floor((d.ageDays ?? 0) / 7));
  const pottyBonus = d.isPottyTrained ? 1 : 0;
  const base = Math.round(score / 10);
  const rawLevel = base + Math.floor(ageBonus / 2) + pottyBonus;
  const level = clamp(1, rawLevel, 10);
  const TITLES = [
    "New Pup","Eager Pup","Quick Learner","Good Dog","Loyal Buddy",
    "Trickster","Guardian","Champion","Legendary Pup","Mythic Hound",
  ];
  return { level, title: TITLES[level - 1] ?? "New Pup" };
}

/** Fresh dog factory */
const newDog = (overrides = {}) => {
  const base = {
    id: nanoid(),
    name: "Pupper",
    // core stats
    ageDays: 0,
    happiness: 100,
    energy: 100,
    hunger: 100,
    cleanliness: 100,
    // behavior/state
    mood: "idle",            // 'idle' | 'walk' | 'play' | 'sleep' | 'poop' | 'wash' | 'bark'
    isPottyTrained: false,
    poopCount: 0,
    // movement
    x: WORLD.PADDING,
    y: WORLD.HEIGHT - 128,   // ground-ish
    facing: "right",         // 'left' | 'right'
    moving: false,
    vx: 0,
    vy: 0,
    // environment
    outside: false,          // true when x >= YARD_X or explicitly set
    // meta
    createdAt: Date.now(),
    lastSavedAt: null,
    level: 1,
    title: "New Pup",
    barkCount: 0,
    lastBarkAt: 0,
  };
  const next = { ...base, ...overrides };
  const { level, title } = levelCheck(next);
  next.level = level;
  next.title = title;
  next.outside = next.x >= WORLD.YARD_X || !!next.outside;
  return next;
};

const initialState = newDog();

/** Apply attribute decay */
const applyDecay = (state, perSec, dt) => {
  state.hunger = clamp01(state.hunger - perSec.hunger * dt);
  state.energy = clamp01(state.energy - perSec.energy * dt);
  state.cleanliness = clamp01(state.cleanliness - perSec.cleanliness * dt);
  const avg = (state.hunger + state.energy + state.cleanliness) / 3;
  state.happiness = clamp01(0.5 * state.happiness + 0.5 * avg);
};

/** After any meaningful state change, sync deriveds */
const syncDerived = (state) => {
  const d = levelCheck(state);
  state.level = d.level;
  state.title = d.title;
  state.outside = state.x >= WORLD.YARD_X || !!state.outside;
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /** Arbitrary partial patch from UI/Cloud. */
    dogPatched(state, { payload }) {
      for (const [k, v] of Object.entries(payload || {})) {
        if (k in state) state[k] = v;
      }
      syncDerived(state);
      state.lastSavedAt = Date.now();
    },

    /** Rename the dog, trims and clamps length. */
    setName(state, { payload }) {
      const raw = String(payload ?? "").trim();
      state.name = raw.slice(0, 24) || "Pupper";
      syncDerived(state);
      state.lastSavedAt = Date.now();
    },

    /** Advance simulation by delta seconds (float). Also decays stats. */
    tick(state, { payload }) {
      const dt = Math.max(0, Number(payload ?? 0));
      if (!dt) return;
      const moving = state.mood === "walk" || state.mood === "play" || state.moving;
      applyDecay(state, moving ? MOVE_DECAY_PER_SEC : IDLE_DECAY_PER_SEC, dt);

      // Integrate simple velocity if any (basic physics)
      if (state.vx || state.vy) {
        state.x = clamp(WORLD.PADDING, state.x + state.vx * dt, WORLD.WIDTH - WORLD.PADDING);
        state.y = clamp(WORLD.PADDING, state.y + state.vy * dt, WORLD.HEIGHT - WORLD.PADDING);
        if (state.vx > 0) state.facing = "right";
        if (state.vx < 0) state.facing = "left";
      }

      state.ageDays += dt / 86400;
      syncDerived(state);
    },

    /** --- Movement API expected by PupStage.jsx --- */

    /** Move by deltas (pixels). Allows PupStage to nudge dog directly. */
    moveBy(state, { payload }) {
      const { dx = 0, dy = 0 } = payload || {};
      state.x = clamp(WORLD.PADDING, state.x + dx, WORLD.WIDTH - WORLD.PADDING);
      state.y = clamp(WORLD.PADDING, state.y + dy, WORLD.HEIGHT - WORLD.PADDING);
      if (dx > 0) state.facing = "right";
      if (dx < 0) state.facing = "left";
      state.mood = "walk";
      state.moving = true;
      syncDerived(state);
    },

    /** Begin continuous movement (PupStage can set vx/vy). speed in px/s. */
    startMoving(state, { payload }) {
      const { dir = "right", speed = 160 } = payload || {};
      const s = Math.abs(Number(speed)) || 160;
      if (dir === "left") { state.vx = -s; state.facing = "left"; }
      else if (dir === "right") { state.vx = s; state.facing = "right"; }
      else if (dir === "up") { state.vy = -s; }
      else if (dir === "down") { state.vy = s; }
      state.mood = "walk";
      state.moving = true;
      syncDerived(state);
    },

    /** Halt continuous movement. */
    stopMoving(state) {
      state.vx = 0;
      state.vy = 0;
      state.moving = false;
      if (state.mood === "walk") state.mood = "idle";
      syncDerived(state);
    },

    /** Fun bark action (UI can play sfx when this fires). */
    bark(state) {
      state.barkCount = (state.barkCount || 0) + 1;
      state.lastBarkAt = Date.now();
      state.mood = "bark";
      state.happiness = clamp01(state.happiness + 2); // tiny joy bump
      syncDerived(state);
    },

    /** Teleport/flag the dog to outside/inside. */
    takeOutside(state, { payload }) {
      const outside = payload === undefined ? true : !!payload;
      state.outside = outside;
      if (outside) {
        state.x = Math.max(state.x, WORLD.YARD_X + 1);
      } else {
        state.x = Math.min(state.x, WORLD.YARD_X - 1);
      }
      state.mood = "idle";
      syncDerived(state);
    },

    /** --- Core actions --- */

    feed(state) {
      state.hunger = clamp01(state.hunger + 22);
      state.happiness = clamp01(state.happiness + 8);
      state.mood = "idle";
      syncDerived(state);
    },
    play(state) {
      state.happiness = clamp01(state.happiness + 15);
      state.energy = clamp01(state.energy - 8);
      state.mood = "play";
      syncDerived(state);
    },
    wash(state) {
      state.cleanliness = clamp01(state.cleanliness + 28);
      state.mood = "wash";
      syncDerived(state);
    },
    rest(state) {
      state.energy = clamp01(state.energy + 22);
      state.mood = "sleep";
      syncDerived(state);
    },

    poop(state) {
      state.poopCount = Math.max(0, state.poopCount + 1);
      state.cleanliness = clamp01(state.cleanliness - 12);
      state.mood = "poop";
      syncDerived(state);
    },
    scoopPoop(state) {
      state.poopCount = Math.max(0, state.poopCount - 1);
      state.cleanliness = clamp01(state.cleanliness + 6);
      syncDerived(state);
    },
    setPottyTrained(state, { payload }) {
      state.isPottyTrained = !!payload;
      syncDerived(state);
    },

    hydrateFromCloud(_state, { payload }) {
      return newDog({ ...payload });
    },
    resetDog() {
      return newDog();
    },
  },
});

export const {
  // movement & environment
  moveBy,
  startMoving,
  stopMoving,
  bark,
  takeOutside,
  // core
  dogPatched,
  setName,
  tick,
  feed,
  play,
  wash,
  rest,
  poop,
  scoopPoop,
  setPottyTrained,
  hydrateFromCloud,
  resetDog,
} = dogSlice.actions;

export default dogSlice.reducer;

/** Selectors */
export const selectDog = (s) => s.dog;
export const selectDogName = (s) => s.dog?.name ?? "Pupper";
export const selectStats = (s) => {
  const d = s.dog;
  return d
    ? { hunger: d.hunger, energy: d.energy, cleanliness: d.cleanliness, happiness: d.happiness }
    : { hunger: 0, energy: 0, cleanliness: 0, happiness: 0 };
};
export const selectMood = (s) => s.dog?.mood ?? "idle";
export const selectAgeDays = (s) => s.dog?.ageDays ?? 0;
export const selectPoopCount = (s) => s.dog?.poopCount ?? 0;
export const selectIsPottyTrained = (s) => !!s.dog?.isPottyTrained;
export const selectLastSavedAt = (s) => s.dog?.lastSavedAt || null;
export const selectCreatedAt = (s) => s.dog?.createdAt || null;
export const selectLevel = (s) => s.dog?.level ?? 1;
export const selectTitle = (s) => s.dog?.title ?? "New Pup";
export const selectPos = (s) =>
  ({ x: s.dog?.x ?? WORLD.PADDING, y: s.dog?.y ?? WORLD.HEIGHT - 128, facing: s.dog?.facing ?? "right" });
export const selectOutside = (s) => !!s.dog?.outside;
