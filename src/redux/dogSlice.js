// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

/* ------------ Real-time design constants ------------ */

const REAL_HOURS_PER_DAY = 24;

// Hunger / starvation
const HUNGER_25PCT_HOURS = 12;          // 12h → 25% hunger bar
const HUNGER_ZERO_START_HOURS = 24;     // after 24h, you’re “fully starving”
const STARVATION_DEATH_DAYS = 4;        // 4 real days → death
const STARVATION_DEATH_HOURS = STARVATION_DEATH_DAYS * REAL_HOURS_PER_DAY; // 96h

// Cleanliness / condition thresholds (since last bath)
const CLEAN_DIRTY_DAYS = 2;
const CLEAN_FLEAS_DAYS = 5;
const CLEAN_MANGE_DAYS = 10;

const CLEAN_DIRTY_HOURS = CLEAN_DIRTY_DAYS * REAL_HOURS_PER_DAY;  // 48h
const CLEAN_FLEAS_HOURS = CLEAN_FLEAS_DAYS * REAL_HOURS_PER_DAY;  // 120h
const CLEAN_MANGE_HOURS = CLEAN_MANGE_DAYS * REAL_HOURS_PER_DAY;  // 240h

// Potty: how long from “empty” to “really needs to go”
const POTTY_FULL_MINUTES = 120; // 2 real hours to 100% need

// Aging: 60 in-game minutes per 30 real minutes ⇒ 2x speed
const AGE_SPEED_MULTIPLIER = 2;

const nowMs = () => Date.now();

/* ------------ Helpers ------------ */

function computeHunger(hoursSinceFed) {
  if (!Number.isFinite(hoursSinceFed) || hoursSinceFed <= 0) {
    return 100;
  }

  // 0–12h: 100% → 25%
  if (hoursSinceFed <= HUNGER_25PCT_HOURS) {
    const rate = 75 / HUNGER_25PCT_HOURS; // points/hour
    return clamp(100 - rate * hoursSinceFed);
  }

  // 12–24h: 25% → 0%
  if (hoursSinceFed <= HUNGER_ZERO_START_HOURS) {
    const extra = hoursSinceFed - HUNGER_25PCT_HOURS;
    const rate = 25 / (HUNGER_ZERO_START_HOURS - HUNGER_25PCT_HOURS);
    return clamp(25 - rate * extra);
  }

  // 24h+ with no food ⇒ bar is empty
  return 0;
}

function deriveCondition(hoursSinceBath) {
  if (!Number.isFinite(hoursSinceBath) || hoursSinceBath <= 0) {
    return "clean";
  }
  if (hoursSinceBath >= CLEAN_MANGE_HOURS) return "mange";
  if (hoursSinceBath >= CLEAN_FLEAS_HOURS) return "fleas";
  if (hoursSinceBath >= CLEAN_DIRTY_HOURS) return "dirty";
  return "clean";
}

function computeCleanliness(hoursSinceBath) {
  if (!Number.isFinite(hoursSinceBath) || hoursSinceBath <= 0) {
    return 100;
  }
  // Linearly slide to 0 by 10 days (mange)
  const frac = Math.min(1, hoursSinceBath / CLEAN_MANGE_HOURS);
  return clamp(100 - frac * 100);
}

/* ------------ Initial state ------------ */

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,

  stats: {
    hunger: 80,
    happiness: 70,
    energy: 70,
    cleanliness: 80,
  },

  poopCount: 0,          // # accidents / unscooped poops in yard (future UX)
  pottyLevel: 0,         // 0–100: current “need to go” urge
  pottyTraining: 0,      // 0–100: training progress
  isPottyTrained: false, // badge when pottyTraining hits 100

  isAsleep: false,
  ageHours: 0,           // in-game hours, scaled via AGE_SPEED_MULTIPLIER
  condition: "clean",    // clean | dirty | fleas | mange
  health: 100,
  isAlive: true,

  // timestamps (ms since epoch) for real-time tracking
  lastUpdatedAt: null,
  lastFedAt: null,
  lastBathedAt: null,
  lastPottyAt: null,

  debug: false,
};

/* ------------ Slice ------------ */

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;

      const merged = {
        ...state,
        ...payload,
        stats: { ...state.stats, ...(payload.stats || {}) },
      };

      // Backfill timestamps if you’re loading older saves
      if (merged.lastUpdatedAt == null) merged.lastUpdatedAt = nowMs();
      if (merged.lastFedAt == null) merged.lastFedAt = merged.lastUpdatedAt;
      if (merged.lastBathedAt == null) merged.lastBathedAt = merged.lastUpdatedAt;
      if (merged.lastPottyAt == null) merged.lastPottyAt = merged.lastUpdatedAt;
      if (merged.pottyTraining == null) merged.pottyTraining = 0;
      if (merged.isPottyTrained == null) merged.isPottyTrained = false;

      return merged;
    },

    tick(state, { payload }) {
      const now = payload?.now ?? nowMs();

      if (!state.lastUpdatedAt) {
        // First tick after startup / install: set baselines
        state.lastUpdatedAt = now;
        if (!state.lastFedAt) state.lastFedAt = now;
        if (!state.lastBathedAt) state.lastBathedAt = now;
        if (!state.lastPottyAt) state.lastPottyAt = now;
        return;
      }

      const diffMs = Math.max(0, now - state.lastUpdatedAt);
      if (diffMs === 0) return;

      const diffMinutes = diffMs / 60000;
      const diffHours = diffMinutes / 60;

      state.lastUpdatedAt = now;

      if (!state.isAlive) return;

      /* ---- Aging (2x speed) ---- */
      const gameMinutes = diffMinutes * AGE_SPEED_MULTIPLIER;
      const gameHours = gameMinutes / 60;
      state.ageHours += gameHours;

      /* ---- Hunger & starvation ---- */

      const lastFedAt = state.lastFedAt ?? now;
      const hoursSinceFed = (now - lastFedAt) / 3600000;

      state.stats.hunger = computeHunger(hoursSinceFed);

      // After 24h of no food, start draining health; at 4 days, the dog dies.
      if (hoursSinceFed > HUNGER_ZERO_START_HOURS) {
        const maxStarvingHours =
          STARVATION_DEATH_HOURS - HUNGER_ZERO_START_HOURS; // 72h “death window”
        const healthLossRatePerHour = 100 / maxStarvingHours; // lose 100hp across window
        const healthLoss = healthLossRatePerHour * diffHours;

        state.health = clamp(state.health - healthLoss, 0, 100);

        if (hoursSinceFed >= STARVATION_DEATH_HOURS || state.health <= 0) {
          state.health = 0;
          state.isAlive = false;
        }
      }

      /* ---- Cleanliness / condition (time since last bath) ---- */

      const lastBathedAt = state.lastBathedAt ?? now;
      const hoursSinceBath = (now - lastBathedAt) / 3600000;

      state.condition = deriveCondition(hoursSinceBath);
      state.stats.cleanliness = computeCleanliness(hoursSinceBath);

      /* ---- Happiness & energy drift ---- */

      // Slow baseline decay; actual actions will push these up/down more.
      state.stats.happiness = clamp(
        state.stats.happiness - diffHours * 0.5 // ~12 points / day
      );
      state.stats.energy = clamp(
        state.stats.energy - diffHours * 1.0 // ~24 points / day
      );

      // Auto-sleep when exhausted
      if (state.stats.energy <= 10 && !state.isAsleep) {
        state.isAsleep = true;
      }

      // While asleep, recharge quickly; wake up around 80% energy
      if (state.isAsleep) {
        state.stats.energy = clamp(
          state.stats.energy + diffHours * 8 // “night” ~8h → +64 energy
        );
        if (state.stats.energy >= 80) {
          state.isAsleep = false;
        }
      }

      /* ---- Potty need (time since last potty) ---- */

      const lastPottyAt = state.lastPottyAt ?? now;
      const minutesSincePotty = (now - lastPottyAt) / 60000;
      const pottyFrac = Math.min(1, minutesSincePotty / POTTY_FULL_MINUTES);

      state.pottyLevel = clamp(pottyFrac * 100);

      // If you leave the dog way past “I really gotta go”, penalize cleanliness
      if (minutesSincePotty > POTTY_FULL_MINUTES * 1.5) {
        state.poopCount += 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness - 5);
      }
    },

    /* ---- Player actions ---- */

    feed(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? nowMs();
      state.lastFedAt = now;
      state.stats.hunger = clamp(state.stats.hunger + 35);
      state.stats.happiness = clamp(state.stats.happiness + 5);
      state.health = clamp(state.health + 5);
    },

    play(state) {
      if (!state.isAlive) return;
      state.stats.happiness = clamp(state.stats.happiness + 15);
      state.stats.energy = clamp(state.stats.energy - 10);
      state.xp += 5;
    },

    rest(state) {
      if (!state.isAlive) return;
      // Manual rest just nudges toward sleep; full sleep is handled in tick()
      state.isAsleep = true;
      state.stats.energy = clamp(state.stats.energy + 10);
    },

    bathe(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? nowMs();
      state.lastBathedAt = now;
      state.stats.cleanliness = 100;
      state.condition = "clean";
      state.xp += 5;
    },

    // This reducer is named "scoopPoop" to match existing imports,
    // but conceptually it’s "Go Potty / Take Pup Outside".
    scoopPoop(state, { payload }) {
      if (!state.isAlive) return;
      const now = payload?.now ?? nowMs();

      const lastPottyAt = state.lastPottyAt ?? now;
      const minutesSincePotty = (now - lastPottyAt) / 60000;

      const goodTimingThreshold = POTTY_FULL_MINUTES * 0.75; // 90 minutes
      const didWaitUntilReallyNeeded = minutesSincePotty >= goodTimingThreshold;

      const trainingGain = didWaitUntilReallyNeeded ? 6 : 3;
      state.pottyTraining = clamp(state.pottyTraining + trainingGain);

      if (state.pottyTraining >= 100) {
        state.pottyTraining = 100;
        state.isPottyTrained = true; // badge unlocked
      }

      // Reset the “need to go” meter and timestamp
      state.lastPottyAt = now;
      state.pottyLevel = 0;

      // Yard cleanliness & minor reward
      if (state.poopCount > 0) {
        state.poopCount -= 1;
      }
      state.stats.cleanliness = clamp(state.stats.cleanliness + 4);
      state.coins += didWaitUntilReallyNeeded ? 2 : 1;
    },

    renameDog(state, { payload }) {
      if (typeof payload === "string" && payload.trim()) {
        state.name = payload.trim();
      }
    },

    setDebug(state, { payload }) {
      state.debug = Boolean(payload);
    },
  },
});

/* ------------ Exports ------------ */

export const {
  hydrateDog,
  tick,
  feed,
  play,
  rest,
  bathe,
  scoopPoop,
  renameDog,
  setDebug,
} = dogSlice.actions;

export const selectDog = (state) => state.dog;

export default dogSlice.reducer;
