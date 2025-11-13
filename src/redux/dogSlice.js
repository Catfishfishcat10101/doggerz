// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

function levelThreshold(level) {
  // Simple curve: gets a bit harder each level
  const base = 100;
  const step = 25;
  return base + (Math.max(1, level) - 1) * step;
}

function ensureAnimation(state) {
  if (!state.animation) {
    state.animation = "idle";
  }
}

function awardXp(state, amount = 5) {
  const gain = Number.isFinite(amount) ? amount : 0;
  if (gain <= 0) return;

  state.xp += gain;

  // Handle multiple level-ups if XP jumps a lot
  // but cap to something sane
  let safety = 20;
  while (state.xp >= levelThreshold(state.level) && safety-- > 0) {
    state.xp -= levelThreshold(state.level);
    state.level += 1;
  }
}

function randomIdleVariant() {
  const roll = Math.random();
  if (roll < 0.33) return "idle_scratch";
  if (roll < 0.66) return "idle_tail";
  return "idle";
}

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

  // Animation / behavior
  animation: "idle",
  lastAction: "feed" | "play" | "rest" | "poop" | "scoop" | etc.

  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /* ---------- hydration / debug ---------- */
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

    resetDog() {
      return { ...initialState, animation: "idle" };
    },

    setDebug(state, { payload }) {
      state.debug = Boolean(payload);
    },

    setName(state, { payload }) {
      if (typeof payload === "string" && payload.trim()) {
        state.name = payload.trim();
      }
    },

    /* ---------- core animation helpers ---------- */
    setAnimation(state, { payload }) {
      // payload: one of the animation strings
      state.animation = payload || "idle";
    },

    setLastAction(state, { payload }) {
      state.lastAction = payload || null;
    },

    // Fancy idle variants to keep the dog from looking dead
    triggerIdleScratch(state) {
      state.animation = "idle_scratch";
      state.lastAction = "idle_scratch";
    },

    triggerIdleTail(state) {
      state.animation = "idle_tail";
      state.lastAction = "idle_tail";
    },

    triggerIdle(state) {
      state.animation = randomIdleVariant();
      state.lastAction = "idle";
    },

    /* ---------- stat & progression helpers ---------- */
    grantCoins(state, { payload }) {
      const amount = Number.isFinite(payload) ? payload : 0;
      if (amount <= 0) return;
      state.coins = Math.max(0, state.coins + amount);
    },

    setStats(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      const s = state.stats;
      if (payload.hunger != null) s.hunger = clamp(payload.hunger);
      if (payload.happiness != null) s.happiness = clamp(payload.happiness);
      if (payload.energy != null) s.energy = clamp(payload.energy);
      if (payload.cleanliness != null) s.cleanliness = clamp(payload.cleanliness);
    },

    /* ---------- game actions (used by UI) ---------- */

    // Feed button
    feed(state) {
      const s = state.stats;
      s.hunger = clamp(s.hunger + 20);
      s.happiness = clamp(s.happiness + 5);
      s.energy = clamp(s.energy + 5);

      state.lastAction = "feed";
      state.animation = "eat";
      state.lastUpdatedAt = Date.now();

      // Coins optional here; core loop uses XP
      awardXp(state, 12);
    },

    // Play button
    play(state) {
      const s = state.stats;
      s.happiness = clamp(s.happiness + 18);
      s.energy = clamp(s.energy - 10);
      s.hunger = clamp(s.hunger - 5);

      state.lastAction = "play";
      state.animation = "play";
      state.lastUpdatedAt = Date.now();

      awardXp(state, 15);
    },

    // Bath / clean button
    bathe(state) {
      const s = state.stats;
      s.cleanliness = clamp(s.cleanliness + 25);
      s.happiness = clamp(s.happiness - 5); // some dogs hate baths

      state.lastAction = "bathe";
      state.animation = "dirty"; // shows dirty → then idle in animator
      state.lastUpdatedAt = Date.now();

      awardXp(state, 10);
    },

    // Rest / sleep button
    rest(state) {
      const s = state.stats;

      if (state.isAsleep) {
        // Wake up
        state.isAsleep = false;
        s.energy = clamp(s.energy + 15);
        state.animation = randomIdleVariant();
        state.lastAction = "wake";
      } else {
        // Go to sleep
        state.isAsleep = true;
        state.animation = "sleep";
        state.lastAction = "sleep";
      }

      state.lastUpdatedAt = Date.now();
      awardXp(state, 8);
    },

    // AI or button can drive potty level
    increasePottyLevel(state, { payload }) {
      const delta = Number.isFinite(payload) ? payload : 5;
      state.pottyLevel = clamp(state.pottyLevel + delta, 0, 100);

      // Auto-poop if over threshold
      if (state.pottyLevel >= 75) {
        state.pottyLevel = 0;
        state.poopCount += 1;

        const s = state.stats;
        s.cleanliness = clamp(s.cleanliness - 10);
        s.happiness = clamp(s.happiness - 5);

        state.animation = "poop";
        state.lastAction = "poop";
      }

      state.lastUpdatedAt = Date.now();
    },

    // Scoop Poop button
    scoopPoop(state) {
      const piles = state.poopCount;
      if (piles <= 0) {
        // No poop: just a tiny “scoop” wobble
        state.animation = "scoop";
        state.lastAction = "scoop_empty";
        state.lastUpdatedAt = Date.now();
        return;
      }

      // Reward cleaning up
      const s = state.stats;
      s.cleanliness = clamp(s.cleanliness + 15 + piles * 5);
      s.happiness = clamp(s.happiness + 5);

      // Reward player with coins & XP
      const coinReward = 2 * piles;
      state.coins = Math.max(0, state.coins + coinReward);
      awardXp(state, 10 + 5 * piles);

      state.poopCount = 0;
      state.pottyLevel = 0;
      state.animation = "scoop";
      state.lastAction = "scoop";
      state.lastUpdatedAt = Date.now();
    },

    // Generic tick from DogAIEngine (background decay etc.)
    tickNeeds(state, { payload }) {
      const delta = payload && Number.isFinite(payload.delta) ? payload.delta : 1;
      const s = state.stats;

      s.hunger = clamp(s.hunger - 0.05 * delta);
      s.energy = clamp(s.energy - 0.03 * delta);
      s.cleanliness = clamp(s.cleanliness - 0.02 * delta);

      // Mood based on needs
      if (s.hunger < 25 || s.energy < 20) {
        state.animation = "tired";
      } else if (s.cleanliness < 25) {
        state.animation = "dirty";
      } else if (s.happiness < 30) {
        state.animation = "sad";
      } else {
        // Let the animator pick an idle variant
        ensureAnimation(state);
      }

      state.lastUpdatedAt = Date.now();
    },
  },
});

/* ---------- selectors ---------- */

export const selectDog = (state) => state.dog;
export const selectDogStats = (state) => state.dog.stats;
export const selectDogCoins = (state) => state.dog.coins;
export const selectDogLevel = (state) => ({
  level: state.dog.level,
  xp: state.dog.xp,
  threshold: levelThreshold(state.dog.level),
});

/* ---------- actions / aliases ---------- */

export const {
  hydrateDog,
  resetDog,
  setDebug,
  setName,
  setAnimation,
  setLastAction,
  triggerIdleScratch,
  triggerIdleTail,
  triggerIdle,
  grantCoins,
  setStats,
  feed,
  play,
  bathe,
  rest,
  increasePottyLevel,
  scoopPoop,
  tickNeeds,
} = dogSlice.actions;

// Old names used in some components
export const feedDog = feed;
export const playWithDog = play;
export const batheDog = bathe;

// For components expecting scoopPoopAction etc.
export const scoopPoopAction = scoopPoop;

export default dogSlice.reducer;