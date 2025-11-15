// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const MS_PER_HOUR = 1000 * 60 * 60;

// --- Design constants (tunable knobs) ---
//
// These control how fast the sim drifts vs real time. If you want
// Doggerz to feel slower or faster, tweak these numbers.

// Dog ages 6 hours per 1 real hour
// → about 6 in-game months per real month.
const AGE_RATE = 6;

// From "full" hunger (100) to zero in ~16 real hours.
// At ~5h => ~70% (we call that "hungry" in status), at ~12h => ~25%.
const HUNGER_HOURS_TO_ZERO = 16;

// Happiness / boredom drift – slower than hunger.
const HAPPINESS_HOURS_TO_ZERO = 36;

// Cleanliness drops to zero over ~10 days.
const CLEAN_HOURS_TO_ZERO = 240; // 10 days

// Energy: awake drains, sleeping fills.
const ENERGY_AWAKE_HOURS_TO_ZERO = 12; // 12h awake -> 0
const ENERGY_SLEEP_HOURS_TO_FULL = 4; // 4h good sleep -> full

// Potty meter: how fast it fills. Here ~8h from empty to full.
const POTTY_HOURS_TO_FULL = 8;

// Four days of full starvation (0 hunger) = death.
const STARVATION_HOURS_TO_DEATH = 96; // 4 days

// Condition stages based on time since last bath.
const HOURS_UNTIL_DIRTY = 48; // 2 days
const HOURS_UNTIL_FLEAS = 120; // 5 days
const HOURS_UNTIL_MANGE = 240; // 10 days

// LocalStorage key
const STORAGE_KEY = "doggerz:dog";

// --- Initial state ---

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,

  // Core stats (0–100)
  stats: {
    hunger: 60,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
    thirst: 60,
  },

  // Yard & potty
  poopCount: 0,
  pottyLevel: 0, // 0–100 "needs to go"
  pottyTrainingProgress: 0, // 0–100 training completion
  isPottyTrained: false,

  // Lifecycle
  isAsleep: false,
  isAlive: true,
  health: 100, // 0–100
  ageHours: 0, // total in-game hours lived
  lifeStage: "puppy", // "puppy" | "adult" | "senior"

  // Timeline markers
  createdAt: null,
  lastUpdatedAt: null,
  lastFedAt: null,
  lastBathAt: null,
  lastPottyAt: null,

  // Condition: "clean" | "dirty" | "fleas" | "mange"
  condition: "clean",

  debug: false,
};

// Helper: recompute life stage from age hours
function computeLifeStage(ageHours) {
  const days = ageHours / 24;
  if (days < 120) return "puppy"; // ~4 months
  if (days < 365 * 3) return "adult"; // up to ~3 years
  return "senior";
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Initialize a new pup when we have no saved state
    initDog(state, { payload }) {
      const now = payload?.now ?? Date.now();
      return {
        ...initialState,
        createdAt: now,
        lastUpdatedAt: now,
        lastBathAt: now,
        lastFedAt: now,
      };
    },

    // Hydrate from saved data (localStorage / cloud)
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      const now = Date.now();
      return {
        ...state,
        ...payload,
        createdAt: payload.createdAt ?? now,
        lastUpdatedAt: payload.lastUpdatedAt ?? now,
        lastBathAt: payload.lastBathAt ?? payload.createdAt ?? now,
        lastFedAt: payload.lastFedAt ?? payload.createdAt ?? now,
        pottyTrainingProgress: payload.pottyTrainingProgress ?? 0,
        isPottyTrained: payload.isPottyTrained ?? false,
      };
    },

    // Main game loop – apply real-time drift based on elapsed time.
    tick(state, { payload }) {
      const now = payload?.now ?? Date.now();
      const last = state.lastUpdatedAt ?? now;
      const dtMs = Math.max(0, now - last);

      if (!Number.isFinite(dtMs) || dtMs <= 0) {
        state.lastUpdatedAt = now;
        return;
      }

      const realHours = dtMs / MS_PER_HOUR;
      if (realHours <= 0) {
        state.lastUpdatedAt = now;
        return;
      }

      // If the pup has passed, freeze stats but still track lastUpdatedAt
      if (!state.isAlive) {
        state.lastUpdatedAt = now;
        return;
      }

      // --- Age & life stage ---
      state.ageHours += realHours * AGE_RATE;
      state.lifeStage = computeLifeStage(state.ageHours);

      // --- Stats drift ---

      // Hunger decays from current value toward 0 over HUNGER_HOURS_TO_ZERO.
      const hungerDrop = (realHours / HUNGER_HOURS_TO_ZERO) * 100;
      state.stats.hunger = clamp(state.stats.hunger - hungerDrop);

      // Happiness drifts down more slowly.
      const happinessDrop = (realHours / HAPPINESS_HOURS_TO_ZERO) * 100;
      state.stats.happiness = clamp(
        state.stats.happiness - happinessDrop
      );

      // Cleanliness decays
      const cleanDrop = (realHours / CLEAN_HOURS_TO_ZERO) * 100;
      state.stats.cleanliness = clamp(
        state.stats.cleanliness - cleanDrop
      );

      // Thirst – simple linear drop toward 0 over 24h.
      const THIRST_HOURS_TO_ZERO = 24;
      const thirstDrop = (realHours / THIRST_HOURS_TO_ZERO) * 100;
      state.stats.thirst = clamp(state.stats.thirst - thirstDrop);

      // Energy: awake drains, sleeping recovers
      if (!state.isAsleep) {
        const energyDrop =
          (realHours / ENERGY_AWAKE_HOURS_TO_ZERO) * 100;
        state.stats.energy = clamp(state.stats.energy - energyDrop);

        // Auto-sleep if very tired
        if (state.stats.energy <= 10) {
          state.isAsleep = true;
        }
      } else {
        const energyGain =
          (realHours / ENERGY_SLEEP_HOURS_TO_FULL) * 100;
        state.stats.energy = clamp(state.stats.energy + energyGain);

        // Wake when mostly rested
        if (state.stats.energy >= 90) {
          state.isAsleep = false;
        }
      }

      // Potty meter fills over time
      const pottyGain = (realHours / POTTY_HOURS_TO_FULL) * 100;
      state.pottyLevel = clamp(state.pottyLevel + pottyGain);

      // --- Condition based on time since last bath ---

      const lastBath = state.lastBathAt ?? state.createdAt ?? now;
      const hoursSinceBath = (now - lastBath) / MS_PER_HOUR;

      if (hoursSinceBath < HOURS_UNTIL_DIRTY) {
        state.condition = "clean";
      } else if (hoursSinceBath < HOURS_UNTIL_FLEAS) {
        state.condition = "dirty";
      } else if (hoursSinceBath < HOURS_UNTIL_MANGE) {
        state.condition = "fleas";
      } else {
        state.condition = "mange";
      }

      // --- Health & death ---

      // Starvation: 0 hunger is worst, 100 hunger is best
      const hungerFactor = 1 - state.stats.hunger / 100; // 0–1
      const healthDropFromHunger =
        hungerFactor *
        (realHours / STARVATION_HOURS_TO_DEATH) *
        100;

      // Condition penalty
      const condPenalty =
        state.condition === "clean"
          ? 0
          : state.condition === "dirty"
          ? 0.1
          : state.condition === "fleas"
          ? 0.3
          : 0.6; // mange is rough

      const healthDropFromCondition = condPenalty * realHours; // % per hour

      state.health = clamp(
        state.health -
          healthDropFromHunger -
          healthDropFromCondition
      );

      if (state.health <= 0) {
        state.isAlive = false;
        state.health = 0;
      }

      // --- XP / level / coins over time alive ---
      const xpGain = realHours * 2; // 2 XP per real hour of survival
      state.xp += xpGain;

      while (state.xp >= state.level * 100) {
        state.xp -= state.level * 100;
        state.level += 1;
        state.coins += 5; // small level-up bonus
      }

      state.lastUpdatedAt = now;
    },

    // --- Player actions ---

    feed(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? Date.now();

      // Big hunger bump, small happiness bump
      state.stats.hunger = clamp(state.stats.hunger + 40);
      state.stats.happiness = clamp(state.stats.happiness + 5);

      state.lastFedAt = now;
    },

    play(state) {
      if (!state.isAlive) return;

      // Fun: more happiness, some energy cost
      state.stats.happiness = clamp(state.stats.happiness + 20);
      state.stats.energy = clamp(state.stats.energy - 10);
    },

    bathe(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? Date.now();

      state.stats.cleanliness = 100;
      state.condition = "clean";
      state.lastBathAt = now;

      // Slight happiness boost for feeling fresh
      state.stats.happiness = clamp(state.stats.happiness + 5);
    },

    goPotty(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? Date.now();

      // Only meaningful if they actually need to go
      if (state.pottyLevel < 40) return;

      // They go potty outside: empty the meter, clear one "house accident" if any.
      state.pottyLevel = 0;
      if (state.poopCount > 0) {
        state.poopCount -= 1;
      }

      state.lastPottyAt = now;

      // Potty training: faster while puppy, slower after.
      const trainingDelta =
        state.lifeStage === "puppy" ? 10 : 4;

      if (!state.isPottyTrained) {
        const prev = state.pottyTrainingProgress ?? 0;
        const next = clamp(prev + trainingDelta);
        state.pottyTrainingProgress = next;

        // When they finally hit 100, lock it in and reward
        if (next >= 100) {
          state.pottyTrainingProgress = 100;
          state.isPottyTrained = true;

          // Tiny celebration reward
          state.coins += 10;
          state.stats.happiness = clamp(
            state.stats.happiness + 10
          );
        }
      }
    },

    // Manual poop (e.g., if we ever add random accidents)
    addPoop(state) {
      if (!state.isAlive) return;
      state.poopCount += 1;
    },

    toggleDebug(state) {
      state.debug = !state.debug;
    },
  },
});

// --- Selectors ---
export const selectDog = (state) => state.dog;
export const DOG_STORAGE_KEY = STORAGE_KEY;

// --- Exports ---
export const {
  initDog,
  hydrateDog,
  tick,
  feed,
  play,
  bathe,
  goPotty,
  addPoop,
  toggleDebug,
} = dogSlice.actions;

export default dogSlice.reducer;
