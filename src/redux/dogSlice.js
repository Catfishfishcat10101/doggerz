// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

/* --------------------------- Helpers --------------------------- */

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const adjustStat = (value, delta) => clamp((value ?? 0) + delta);

const xpNeededForLevel = (level) => {
  const lvl = Number(level || 1);
  // Same shape as your StatsPanel fallback:
  // 50 + floor(level^1.5 * 25)
  return 50 + Math.floor(Math.pow(lvl, 1.5) * 25);
};

/* ------------------------ Initial state ------------------------ */

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,

  stats: {
    hunger: 50,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },

  pos: { x: 0, y: 0 },

  isPottyTrained: false,
  pottyLevel: 0,
  poopCount: 0,

  isAsleep: false,
  debug: false,

  lastUpdatedAt: null,
  lastTrainedAt: null,

  sprite: "/sprites/jackrussell/idle.svg",

  // For future shop/inventory
  accessories: {
    owned: [],
    equipped: null,
  },
};

/* --------------------------- Slice ----------------------------- */

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /**
     * Hydrate from Firestore or localStorage.
     * Shallow-merge top level, deep-merge stats & accessories.
     */
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;

      const merged = {
        ...state,
        ...payload,
        stats: {
          ...state.stats,
          ...(payload.stats || {}),
        },
        accessories: {
          ...state.accessories,
          ...(payload.accessories || {}),
        },
      };

      const s = merged.stats || {};
      merged.stats = {
        hunger: clamp(s.hunger),
        happiness: clamp(s.happiness),
        energy: clamp(s.energy),
        cleanliness: clamp(s.cleanliness),
      };

      return merged;
    },

    resetDog() {
      return initialState;
    },

    setName(state, { payload }) {
      const name = String(payload || "").trim();
      state.name = name || "Pup";
    },

    /**
     * Generic coin grant (used by Affection, scoop, etc.)
     */
    grantCoins(state, { payload }) {
      const amount = Number.isFinite(payload) ? payload : 1;
      state.coins = Math.max(0, (state.coins ?? 0) + amount);
    },

    /* --------------------- Core player actions --------------------- */

    feed(state) {
      const s = state.stats;
      s.hunger = adjustStat(s.hunger, 18);
      s.happiness = adjustStat(s.happiness, 6);
      s.energy = adjustStat(s.energy, -2);
      s.cleanliness = adjustStat(s.cleanliness, -1);
      state.lastUpdatedAt = Date.now();
    },

    play(state) {
      const s = state.stats;
      s.happiness = adjustStat(s.happiness, 14);
      s.energy = adjustStat(s.energy, -10);
      s.hunger = adjustStat(s.hunger, 6);
      state.lastUpdatedAt = Date.now();
    },

    rest(state) {
      const s = state.stats;
      s.energy = adjustStat(s.energy, 20);
      s.happiness = adjustStat(s.happiness, 3);
      state.isAsleep = true;
      state.lastUpdatedAt = Date.now();
    },

    wake(state) {
      state.isAsleep = false;
    },

    poop(state) {
      state.poopCount = Math.max(0, (state.poopCount ?? 0) + 1);
      state.stats.cleanliness = adjustStat(state.stats.cleanliness, -10);
      state.lastUpdatedAt = Date.now();
    },

    scoopPoop(state) {
      if ((state.poopCount ?? 0) > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = adjustStat(state.stats.cleanliness, 12);
        state.coins = Math.max(0, (state.coins ?? 0) + 1);
        state.lastUpdatedAt = Date.now();
      }
    },

    trainPotty(state, { payload }) {
      const delta = Number.isFinite(payload) ? payload : 10;
      state.pottyLevel = clamp((state.pottyLevel ?? 0) + delta);
      if (state.pottyLevel >= 100) {
        state.isPottyTrained = true;
      }
      state.lastTrainedAt = Date.now();
    },

    /**
     * XP + leveling.
     * You can call this from actions or DogAIEngine when player does stuff.
     */
    addXp(state, { payload }) {
      const gain = Number.isFinite(payload) ? payload : 0;
      const current = Math.max(0, (state.xp ?? 0) + gain);
      let xp = current;
      let lvl = state.level ?? 1;
      let needed = xpNeededForLevel(lvl);

      // Loop in case a big gain jumps multiple levels.
      while (xp >= needed) {
        xp -= needed;
        lvl += 1;
        needed = xpNeededForLevel(lvl);
      }

      state.level = lvl;
      state.xp = xp;
    },

    /**
     * AI tick from DogAIEngine
     * payload: { dt } seconds
     */
    aiTick(state, { payload }) {
      const dt = Number(payload?.dt) || 1;
      const factor = Math.min(Math.max(dt, 0), 10);

      const s = state.stats;

      // Basic needs decay
      s.hunger = adjustStat(s.hunger, 0.7 * factor);
      s.energy = adjustStat(s.energy, -0.5 * factor);
      s.cleanliness = adjustStat(s.cleanliness, -0.2 * factor);

      // Mood drift
      const stressed =
        s.hunger > 80 || s.energy < 20 || s.cleanliness < 30;

      s.happiness = adjustStat(
        s.happiness,
        stressed ? -0.8 * factor : 0.3 * factor
      );

      state.lastUpdatedAt = Date.now();
    },
  },
});

/* --------------------------- Exports ---------------------------- */

export const {
  hydrateDog,
  resetDog,
  setName,
  grantCoins,
  feed,
  play,
  rest,
  wake,
  poop,
  scoopPoop,
  trainPotty,
  addXp,
  aiTick,
} = dogSlice.actions;

export default dogSlice.reducer;

/* --------------------------- Selectors -------------------------- */

export const selectDog = (state) => state.dog || initialState;

export const selectDogStats = (state) =>
  (state.dog && state.dog.stats) || initialState.stats;

export const selectDogLevel = (state) =>
  typeof state.dog?.level === "number" ? state.dog.level : initialState.level;

export const selectCoins = (state) =>
  typeof state.dog?.coins === "number" ? state.dog.coins : initialState.coins;

export const selectAccessories = (state) =>
  (state.dog && state.dog.accessories) || initialState.accessories;

// happiness/energy normalized to 0..1 for StatsPanel
export const selectHappiness = (state) => {
  const h = selectDogStats(state).happiness ?? 0;
  return clamp(h, 0, 100) / 100;
};

export const selectEnergy = (state) => {
  const e = selectDogStats(state).energy ?? 0;
  return clamp(e, 0, 100) / 100;
};

export const selectXp = (state) =>
  typeof state.dog?.xp === "number" ? state.dog.xp : initialState.xp;

export const selectXpToNext = (state) => {
  const lvl = selectDogLevel(state);
  return xpNeededForLevel(lvl);
};
