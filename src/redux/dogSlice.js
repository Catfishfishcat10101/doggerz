// src/redux/dogSlice.js
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

  // NEW: position + animation for DogAIEngine / DogSpriteView
  pos: {
    x: 160,
    y: 0,
  },
  currentAnimation: "idle",
  lastAction: null,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /* ---------------------------------------------------------
     * HYDRATION / RESET
     * --------------------------------------------------------- */
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      return {
        ...state,
        ...payload,
        stats: {
          ...state.stats,
          ...(payload.stats || {}),
        },
        pos: {
          ...state.pos,
          ...(payload.pos || {}),
        },
      };
    },
    resetDog() {
      return initialState;
    },

    /* ---------------------------------------------------------
     * CORE GAME ACTIONS
     * --------------------------------------------------------- */
    feed(state) {
      state.stats.hunger = clamp(state.stats.hunger + 18);
      state.stats.happiness = clamp(state.stats.happiness + 4);
      state.pottyLevel = clamp(state.pottyLevel + 8);
      state.lastAction = "feed";
    },
    play(state) {
      state.stats.happiness = clamp(state.stats.happiness + 14);
      state.stats.energy = clamp(state.stats.energy - 10);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 5);
      state.lastAction = "play";
    },
    rest(state) {
      state.isAsleep = !state.isAsleep;
      state.lastAction = state.isAsleep ? "sleep_start" : "sleep_end";
    },
    bathe(state) {
      state.stats.cleanliness = clamp(state.stats.cleanliness + 25);
      state.lastAction = "bathe";
    },
    scoopPoop(state) {
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 6);
        state.lastAction = "scoop_poop";
      }
    },
    grantCoins(state, { payload }) {
      const amount = Number(payload ?? 1);
      state.coins += Number.isFinite(amount) ? amount : 0;
    },

    /* ---------------------------------------------------------
     * POTTY / XP / LEVEL
     * --------------------------------------------------------- */
    increasePottyLevel(state, { payload }) {
      const delta = Number(payload ?? 4);
      state.pottyLevel = clamp(state.pottyLevel + delta, 0, 100);
      if (state.pottyLevel >= 100) {
        state.poopCount += 1;
        state.pottyLevel = 0;
      }
    },
    grantXP(state, { payload }) {
      const amount = Number(payload ?? 5);
      state.xp += Number.isFinite(amount) ? amount : 0;
      while (state.xp >= 100) {
        state.xp -= 100;
        state.level += 1;
      }
    },

    /* ---------------------------------------------------------
     * MOVEMENT + ANIMATION (for DogAIEngine / DogSpriteView)
     * --------------------------------------------------------- */
    move(state, { payload }) {
      if (!payload) return;
      const { x, y } = payload;
      if (Number.isFinite(x)) state.pos.x = x;
      if (Number.isFinite(y)) state.pos.y = y;
    },
    setAnimation(state, { payload }) {
      state.currentAnimation = payload || "idle";
    },
    setLastAction(state, { payload }) {
      state.lastAction = payload ?? null;
    },

    /* ---------------------------------------------------------
     * PASSIVE STAT DECAY (AI tick)
     * --------------------------------------------------------- */
    tickStats(state, { payload }) {
      const dt = Number(payload?.dt ?? 1);

      // Small decay per tick
      const hungerDelta = -0.6 * dt;
      const happinessDelta = -0.4 * dt;
      const energyDelta = state.isAsleep ? +0.8 * dt : -0.5 * dt;
      const cleanlinessDelta = -0.2 * dt;

      state.stats.hunger = clamp(state.stats.hunger + hungerDelta);
      state.stats.happiness = clamp(state.stats.happiness + happinessDelta);
      state.stats.energy = clamp(state.stats.energy + energyDelta);
      state.stats.cleanliness = clamp(
        state.stats.cleanliness + cleanlinessDelta
      );

      // Auto-sleep if exhausted
      if (state.stats.energy < 10 && !state.isAsleep) {
        state.isAsleep = true;
        state.currentAnimation = "sleep";
      }

      state.lastUpdatedAt = Date.now();
    },

    /* ---------------------------------------------------------
     * DEBUG
     * --------------------------------------------------------- */
    setDebug(state, { payload }) {
      state.debug = Boolean(payload);
    },
  },
});

/* -------------------------------------------------------------
 * SELECTORS
 * ------------------------------------------------------------- */
export const selectDog = (state) => state.dog ?? initialState;
export const selectCoins = (state) => (state.dog ?? initialState).coins;
export const selectDogStats = (state) => (state.dog ?? initialState).stats;

/* -------------------------------------------------------------
 * ACTIONS / REDUCER
 * ------------------------------------------------------------- */
export const {
  hydrateDog,
  resetDog,
  feed,
  play,
  rest,
  bathe,
  scoopPoop,
  grantCoins,
  increasePottyLevel,
  grantXP,
  move,
  setAnimation,
  setLastAction,
  tickStats,
  setDebug,
} = dogSlice.actions;

export default dogSlice.reducer;
