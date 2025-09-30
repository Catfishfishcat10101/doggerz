// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

/** Decay rates per second (gentle) */
const IDLE_DECAY_PER_SEC = { hunger: 0.06, energy: 0.03, cleanliness: 0.02 };
const MOVE_DECAY_PER_SEC = { hunger: 0.10, energy: 0.18, cleanliness: 0.04 };

/** World constants (shared by UI/AI if needed) */
export const WORLD = {
  WIDTH: 1920,
  PADDING: 24,
  YARD_X: 1400, // x >= YARD_X is “outside”
};

/** Helpers */
const clamp01 = (v) => Math.max(0, Math.min(100, v));
const clamp = (min, v, max) => Math.max(min, Math.min(max, v));

/**
 * Compute level + title from current dog stats (pure).
 * Exported because hooks like useGameTick import it directly.
 */
export function levelCheck(d) {
  if (!d) return { level: 1, title: "New Pup" };

  // Score reflects current well-being
  const score =
    ((d.happiness ?? 0) +
      (d.energy ?? 0) +
      (d.cleanliness ?? 0) +
      (d.hunger ?? 0)) / 4; // 0..100

  // Age adds small progression; every 7 days ~= +1, softly capped
  const ageBonus = Math.min(5, Math.floor((d.ageDays ?? 0) / 7));
  const pottyBonus = d.isPottyTrained ? 1 : 0;

  const base = Math.round(score / 10); // 0..10
  const rawLevel = base + Math.floor(ageBonus / 2) + pottyBonus;
  const level = clamp(1, rawLevel, 10);

  const TITLES = [
    "New Pup",         // 1
    "Eager Pup",       // 2
    "Quick Learner",   // 3
    "Good Dog",        // 4
    "Loyal Buddy",     // 5
    "Trickster",       // 6
    "Guardian",        // 7
    "Champion",        // 8
    "Legendary Pup",   // 9
    "Mythic Hound",    // 10
  ];
  return { level, title: TITLES[level - 1] ?? "New Pup" };
}

/** Factory for a fresh dog object */
const newDog = (overrides = {}) => {
  const base = {
    id: nanoid(),
    name: "Pupper",
    ageDays: 0,
    happiness: 100,
    energy: 100,
    hunger: 100,
    cleanliness: 100,
    mood: "idle", // 'idle' | 'walk' | 'play' | 'sleep' | 'poop' | 'wash'
    poopCount: 0,
    isPottyTrained: false,
    createdAt: Date.now(),
    lastSavedAt: null,
    level: 1,
    title: "New Pup",
  };
  const next = { ...base, ...overrides };
  const { level, title } = levelCheck(next);
  next.level = level;
  next.title = title;
  return next;
};

const initialState = newDog();

/** Internal: apply attribute decay */
const applyDecay = (state, perSec, dt) => {
  state.hunger = clamp01(state.hunger - perSec.hunger * dt);
  state.energy = clamp01(state.energy - perSec.energy * dt);
  state.cleanliness = clamp01(state.cleanliness - perSec.cleanliness * dt);
  // Happiness is a soft aggregate so it doesn’t whipsaw
  const avg = (state.hunger + state.energy + state.cleanliness) / 3;
  state.happiness = clamp01(0.5 * state.happiness + 0.5 * avg);
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
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
      state.lastSavedAt = Date.now();
    },

    /** Rename the dog, trims and clamps length. */
    setName(state, { payload }) {
      const raw = String(payload ?? "").trim();
      state.name = raw.slice(0, 24) || "Pupper";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
      state.lastSavedAt = Date.now();
    },

    /** Advance simulation by delta seconds (float). */
    tick(state, { payload }) {
      const dt = Math.max(0, Number(payload ?? 0));
      if (!dt) return;
      const moving = state.mood === "walk" || state.mood === "play";
      applyDecay(state, moving ? MOVE_DECAY_PER_SEC : IDLE_DECAY_PER_SEC, dt);
      state.ageDays += dt / 86400;
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },

    /** High-level actions used by UI buttons. */
    feed(state) {
      state.hunger = clamp01(state.hunger + 22);
      state.happiness = clamp01(state.happiness + 8);
      state.mood = "idle";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },
    play(state) {
      state.happiness = clamp01(state.happiness + 15);
      state.energy = clamp01(state.energy - 8);
      state.mood = "play";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },
    wash(state) {
      state.cleanliness = clamp01(state.cleanliness + 28);
      state.mood = "wash";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },
    rest(state) {
      state.energy = clamp01(state.energy + 22);
      state.mood = "sleep";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },

    /** Poop lifecycle, used by potty training loop. */
    poop(state) {
      state.poopCount = Math.max(0, state.poopCount + 1);
      state.cleanliness = clamp01(state.cleanliness - 12);
      state.mood = "poop";
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },
    scoopPoop(state) {
      state.poopCount = Math.max(0, state.poopCount - 1);
      state.cleanliness = clamp01(state.cleanliness + 6);
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },
    setPottyTrained(state, { payload }) {
      state.isPottyTrained = !!payload;
      const { level, title } = levelCheck(state);
      state.level = level;
      state.title = title;
    },

    /** Cloud hydration from Firestore profile. */
    hydrateFromCloud(_state, { payload }) {
      return newDog({ ...payload });
    },

    /** Hard reset for a fresh run. */
    resetDog() {
      return newDog();
    },
  },
});

export const {
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
    ? {
        hunger: d.hunger,
        energy: d.energy,
        cleanliness: d.cleanliness,
        happiness: d.happiness,
      }
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
