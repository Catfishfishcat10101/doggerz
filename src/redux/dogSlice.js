import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(n) || 0));

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
  stats: { hunger: 50, happiness: 60, energy: 60, cleanliness: 60 },
  pos: { x: 0, y: 0 },
  isPottyTrained: false,
  pottyLevel: 0,
  poopCount: 0,
  lastTrainedAt: null,
};

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // hydration (Firestore -> Redux)
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      const next = { ...state, ...payload };
      next.stats = {
        hunger: clamp(payload?.stats?.hunger ?? state.stats.hunger),
        happiness: clamp(payload?.stats?.happiness ?? state.stats.happiness),
        energy: clamp(payload?.stats?.energy ?? state.stats.energy),
        cleanliness: clamp(payload?.stats?.cleanliness ?? state.stats.cleanliness),
      };
      next.pos = {
        x: Number(payload?.pos?.x ?? state.pos.x) || 0,
        y: Number(payload?.pos?.y ?? state.pos.y) || 0,
      };
      next.level = Number(payload?.level ?? state.level) || 1;
      next.xp = Math.max(0, Number(payload?.xp ?? state.xp) || 0);
      next.coins = Math.max(0, Number(payload?.coins ?? state.coins) || 0);
      next.name = String(payload?.name ?? state.name).slice(0, 24);
      next.pottyLevel = clamp(payload?.pottyLevel ?? state.pottyLevel);
      next.isPottyTrained = !!(payload?.isPottyTrained ?? state.isPottyTrained);
      next.poopCount = Math.max(0, Number(payload?.poopCount ?? state.poopCount) || 0);
      next.lastTrainedAt = payload?.lastTrainedAt ?? state.lastTrainedAt;
      return next;
    },

    setName(state, action) {
      state.name = String(action.payload ?? "").slice(0, 24);
    },
    awardCoins(state, action) {
      state.coins += Math.max(0, Number(action.payload) || 0);
    },
    setStat(state, action) {
      const { key, value } = action.payload || {};
      if (state.stats[key] !== undefined) {
        state.stats[key] = clamp(value);
      }
    },
    move(state, action) {
      const { x = 0, y = 0 } = action.payload || {};
      state.pos = { x: Number(x) || 0, y: Number(y) || 0 };
    },

    // --- core interactions used by your Game UI ---
    feedDog(state) {
      state.stats.hunger = clamp(state.stats.hunger + 18);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 2);
      state.xp = Math.min(999999, state.xp + 4);
    },
    playWithDog(state) {
      state.stats.happiness = clamp(state.stats.happiness + 16);
      state.stats.energy = clamp(state.stats.energy - 8);
      state.xp = Math.min(999999, state.xp + 6);
    },
    batheDog(state) {
      state.stats.cleanliness = clamp(state.stats.cleanliness + 22);
      state.stats.happiness = clamp(state.stats.happiness - 2); // some dogs hate baths 🤷
      state.xp = Math.min(999999, state.xp + 3);
    },

    // --- potty training ---
    increasePottyLevel(state, action) {
      const inc = Number(action.payload) || 10;
      state.pottyLevel = clamp(state.pottyLevel + inc);
      if (state.pottyLevel >= 100) state.isPottyTrained = true;
      state.lastTrainedAt = new Date().toISOString();
    },
    markAccident(state) {
      state.poopCount += 1;
      state.pottyLevel = clamp(state.pottyLevel - 20);
      state.isPottyTrained = state.pottyLevel >= 100;
    },
    resetPottyLevel(state) {
      state.pottyLevel = 0;
      state.isPottyTrained = false;
      state.lastTrainedAt = null;
    },

    // --- misc ---
    levelUp(state) {
      state.level += 1;
    },
    resetDogState() {
      return JSON.parse(JSON.stringify(initialState));
    },
  },
});

export const {
  hydrateDog,
  setName,
  awardCoins,
  setStat,
  move,
  feedDog,
  playWithDog,
  batheDog,
  increasePottyLevel,
  markAccident,
  resetPottyLevel,
  levelUp,
  resetDogState,
} = slice.actions;

export default slice.reducer;

// selectors
export const selectDog = (s) => s.dog;
export const selectDogLevel = (s) => s.dog.level;
export const selectCoins = (s) => s.dog.coins;
export const selectPottyLevel = (s) => s.dog?.pottyLevel ?? 0;
export const selectPottyLastTrainedAt = (s) => s.dog.lastTrainedAt;
export const selectIsPottyTrained = (s) => !!s.dog?.isPottyTrained;

// compatibility shims
export const grantCoins = awardCoins;        // Affection.jsx
export const selectPottyStreak = (s) => 0;   // TODO: real streak logic later

// --- extra selectors used by StatsPanel ---
export const selectAccessories = (s) => s.dog?.accessories ?? { owned: [] };
export const selectHappiness  = (s) => ((s.dog?.stats?.happiness ?? 0) / 100);
export const selectEnergy     = (s) => ((s.dog?.stats?.energy ?? 0) / 100);
export const selectXp         = (s) => s.dog?.xp ?? 0;
export const selectXpToNext   = (s) => {
  const lvl = Number(s.dog?.level ?? 1) || 1;
  return 50 + Math.floor(lvl ** 1.5 * 25);
};