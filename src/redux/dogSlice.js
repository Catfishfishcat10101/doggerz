import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const initialState = {
  animation: "idle",
  lastAction: null,
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
  // world position for DogAIEngine + DogSpriteView
  pos: { x: 0, y: 0 },
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
     setAnimation(state, action) {
  state.animation = action.payload;
},
    setLastAction(state, action) {
  state.lastAction = action.payload;
},

    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return state;

      const next = { ...state, ...payload };

      // ensure stats exists and is clamped
      if (!next.stats) next.stats = { ...state.stats };
      Object.keys(state.stats).forEach((k) => {
        next.stats[k] = clamp(next.stats[k]);
      });

      // ensure pos exists and is sane
      if (!next.pos) {
        next.pos = { ...state.pos };
      } else {
        next.pos = {
          x: Number.isFinite(next.pos.x) ? next.pos.x : state.pos.x,
          y: Number.isFinite(next.pos.y) ? next.pos.y : state.pos.y,
        };
      }

      return next;
    },

    setName(state, { payload }) {
      if (typeof payload === "string" && payload.trim()) {
        state.name = payload.trim();
      }
    },

    setDebug(state, { payload }) {
      state.debug = Boolean(payload);
    },

    /* ---------------------------- core actions ---------------------------- */

    feed(state) {
      state.stats.hunger = clamp(state.stats.hunger + 15);
      state.stats.happiness = clamp(state.stats.happiness + 4);
    },

    play(state) {
      state.stats.happiness = clamp(state.stats.happiness + 12);
      state.stats.energy = clamp(state.stats.energy - 8);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 4);
    },

    rest(state) {
      state.stats.energy = clamp(state.stats.energy + 18);
      state.stats.hunger = clamp(state.stats.hunger - 6);
    },

    bathe(state) {
      state.stats.cleanliness = clamp(state.stats.cleanliness + 25);
      state.stats.happiness = clamp(state.stats.happiness - 3);
    },

    scoopPoop(state) {
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 6);
      }
    },

    markAccident(state) {
      state.poopCount += 1;
      state.stats.cleanliness = clamp(state.stats.cleanliness - 10);
      state.stats.happiness = clamp(state.stats.happiness - 4);
    },

    grantCoins(state, { payload }) {
      const amt = Number(payload) || 0;
      if (amt > 0) state.coins += amt;
    },

    increasePottyLevel(state, { payload }) {
      const delta = Number(payload) || 1;
      state.pottyLevel = clamp(state.pottyLevel + delta, 0, 100);
    },

    /* ----------------------------- movement ------------------------------- */

    // used by DogAIEngine + any manual movement logic
    move(state, { payload }) {
      if (!payload) return;
      const { x, y } = payload;
      if (Number.isFinite(x)) state.pos.x = x;
      if (Number.isFinite(y)) state.pos.y = y;
    },

    /* ---------------------------- passive decay --------------------------- */

    // generic "tick" for when you want a simple time-based decay
    tickStats(state, { payload }) {
      const dt = Number(payload?.dt) || 1;

      state.stats.hunger = clamp(state.stats.hunger - 0.03 * dt);
      state.stats.energy = clamp(state.stats.energy - 0.02 * dt);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 0.01 * dt);
      state.stats.happiness = clamp(state.stats.happiness - 0.015 * dt);

      state.lastUpdatedAt = Date.now();
    },

    resetDog() {
      return initialState;
    },
  },
});

export const selectDog = (state) => state.dog || initialState;

export const {
  hydrateDog,
  setName,
  setDebug,
  feed,
  play,
  rest,
  bathe,
  scoopPoop,
  markAccident,
  grantCoins,
  increasePottyLevel,
  move,
  tickStats,
  resetDog,
} = dogSlice.actions;

export default dogSlice.reducer;
