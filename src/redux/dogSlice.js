import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

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
  poopCount: 0,
  pottyLevel: 0,
  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      return {
        ...state,
        ...payload,
        stats: {
          ...state.stats,
          ...(payload.stats || {}),
        },
      };
    },

    setName(state, { payload }) {
      state.name = String(payload || "Pup").slice(0, 24);
    },

    // ---- Core game actions ----

    feed(state, { payload }) {
      const amount = Number(payload) || 20;
      state.stats.hunger = clamp(state.stats.hunger + amount);
      state.stats.happiness = clamp(state.stats.happiness + 5);
      state.xp += 1;
    },

    play(state, { payload }) {
      const intensity = Number(payload) || 15;
      state.stats.happiness = clamp(state.stats.happiness + intensity);
      state.stats.energy = clamp(state.stats.energy - 10);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 5);
      state.xp += 2;
    },

    rest(state, { payload }) {
      const amount = Number(payload) || 20;
      state.isAsleep = true;
      state.stats.energy = clamp(state.stats.energy + amount);
      state.stats.hunger = clamp(state.stats.hunger - 5);
    },

    wake(state) {
      state.isAsleep = false;
    },

    bathe(state, { payload }) {
      const amount = Number(payload) || 30;
      state.stats.cleanliness = clamp(state.stats.cleanliness + amount);
      state.stats.happiness = clamp(state.stats.happiness + 3);
    },

    scoopPoop(state) {
      state.poopCount = 0;
      state.stats.cleanliness = clamp(state.stats.cleanliness + 10);
      state.xp += 1;
    },

    dropPoop(state) {
      state.poopCount += 1;
      state.stats.cleanliness = clamp(state.stats.cleanliness - 10);
    },

    increasePottyLevel(state, { payload }) {
      const step = Number(payload) || 10;
      state.pottyLevel = clamp(state.pottyLevel + step);
    },

    grantCoins(state, { payload }) {
      const amount = Number(payload) || 1;
      state.coins = Math.max(0, state.coins + amount);
    },

    tick(state, { payload }) {
      const dt = Number(payload) || 1;
      state.stats.hunger = clamp(state.stats.hunger - 0.5 * dt);
      state.stats.energy = clamp(state.stats.energy - 0.4 * dt);
      state.stats.happiness = clamp(state.stats.happiness - 0.3 * dt);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 0.2 * dt);
    },

    setDebug(state, { payload }) {
      state.debug = Boolean(payload);
    },

    resetDog() {
      return initialState;
    },
  },
});

export const {
  hydrateDog,
  setName,
  feed,
  play,
  rest,
  wake,
  bathe,
  scoopPoop,
  dropPoop,
  increasePottyLevel,
  grantCoins,
  tick,
  setDebug,
  resetDog,
} = dogSlice.actions;

// Alias exports for older components (Game.jsx, NeedsHUD, etc.)
export const feedDog = feed;
export const playWithDog = play;
export const batheDog = bathe;

export const selectDog = (state) => state.dog;

export default dogSlice.reducer;
