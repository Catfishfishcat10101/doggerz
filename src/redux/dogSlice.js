// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const DOG_VERSION = 1;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (n) => Math.round(n * 100) / 100;
const WORLD = { w: 640, h: 360, tile: 64 };

// --- helpers for “same day” & day gaps (local time ok for now)
const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const dayDiff = (aMs, bMs) => Math.round((startOfDay(aMs) - startOfDay(bMs)) / 86400000);

export const initialState = {
  _version: DOG_VERSION,

  // Pose / world
  pos: { x: 320, y: 180 },
  direction: "down",
  moving: false,

  // Core needs (0..100)
  happiness: 75,
  energy: 100,
  hunger: 50,
  hygiene: 85,
  bladder: 25,

  // Progression
  level: 1,
  xp: 0,

  // Aging (VERY SLOW: 1 age day per real day)
  ageDays: 0,

  // Training
  potty: { level: 0, progress: 0, accidents: 0, lastAccidentAt: null },
  tricks: { sit: 0, stay: 0, paw: 0, rollOver: 0 },

  // Milestones
  milestones: { firstBark: true, firstWalk: true, firstPotty: false, breedingPreview: false },

  // Economy & retention
  coins: 0,
  loginStreak: 0,
  lastVisitAt: null,
  lastDailyClaimAt: null,

  // Session buffs & cosmetics (can be persisted; buffs expire by timestamp)
  buffs: {
    xpBoostUntil: null,         // timestamp ms
    happinessBoostUntil: null,  // timestamp ms
  },
  cosmetics: {
    backyardSkin: "default",          // "default" | "lush"
    ownedSkins: ["default"],
  },

  _meta: { lastLocalUpdateAt: 0 },
};

function normalizeLoadedState(raw) {
  const s = { ...initialState, ...raw };
  s.pos = { ...initialState.pos, ...(raw?.pos || {}) };
  s.potty = { ...initialState.potty, ...(raw?.potty || {}) };
  s.tricks = { ...initialState.tricks, ...(raw?.tricks || {}) };
  s.milestones = { ...initialState.milestones, ...(raw?.milestones || {}) };

  s.happiness = clamp(Number(s.happiness) || 0, 0, 100);
  s.energy = clamp(Number(s.energy) || 0, 0, 100);
  s.hunger = clamp(Number(s.hunger) || 0, 0, 100);
  s.hygiene = clamp(Number(s.hygiene) || 0, 0, 100);
  s.bladder = clamp(Number(s.bladder) || 0, 0, 100);

  s.level = Math.max(1, Math.floor(s.level || 1));
  s.xp = Math.max(0, Math.floor(s.xp || 0));
  s.ageDays = Math.max(0, Math.floor(s.ageDays || 0));

  s.coins = Math.max(0, Math.floor(s.coins || 0));
  s.loginStreak = Math.max(0, Math.floor(s.loginStreak || 0));
  s.lastVisitAt = s.lastVisitAt ?? null;
  s.lastDailyClaimAt = s.lastDailyClaimAt ?? null;

  // Buffs & cosmetics defensive merge
  s.buffs = { ...initialState.buffs, ...(raw?.buffs || {}) };
  s.cosmetics = { ...initialState.cosmetics, ...(raw?.cosmetics || {}) };

  s._version = DOG_VERSION;
  return s;
}

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Movement / pose
    setPosition(state, { payload: { x, y, world = WORLD } }) {
      const w = world?.w ?? WORLD.w, h = world?.h ?? WORLD.h, t = world?.tile ?? WORLD.tile;
      state.pos.x = clamp(round2(x), 0, w - t);
      state.pos.y = clamp(round2(y), 0, h - t);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    nudge(state, { payload: { dx = 0, dy = 0, world = WORLD } }) {
      const w = world?.w ?? WORLD.w, h = world?.h ?? WORLD.h, t = world?.tile ?? WORLD.tile;
      state.pos.x = clamp(round2(state.pos.x + dx), 0, w - t);
      state.pos.y = clamp(round2(state.pos.y + dy), 0, h - t);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    setDirection(state, { payload }) { state.direction = payload || "down"; state._meta.lastLocalUpdateAt = Date.now(); },
    setMoving(state, { payload }) { state.moving = !!payload; state._meta.lastLocalUpdateAt = Date.now(); },

    // Needs (apply happiness buff multiplier on positive change)
    setHappiness(state, { payload }) { state.happiness = clamp(Math.floor(payload ?? state.happiness), 0, 100); state._meta.lastLocalUpdateAt = Date.now(); },
    changeHappiness(state, { payload }) {
      const now = Date.now();
      let delta = Number(payload || 0);
      if (delta > 0 && state.buffs.happinessBoostUntil && now < state.buffs.happinessBoostUntil) {
        delta = Math.ceil(delta * 1.25); // +25% during buff
      }
      state.happiness = clamp(state.happiness + delta, 0, 100);
      state._meta.lastLocalUpdateAt = now;
    },

    setBladder(state, { payload }) { state.bladder = clamp(Math.floor(payload ?? state.bladder), 0, 100); state._meta.lastLocalUpdateAt = Date.now(); },
    changeBladder(state, { payload }) { state.bladder = clamp(state.bladder + Number(payload || 0), 0, 100); state._meta.lastLocalUpdateAt = Date.now(); },

    tickNeeds(state, { payload: { dtSec = 1 } = {} }) {
      const d = Math.max(0, Number(dtSec));
      state.hunger = clamp(state.hunger + 0.005 * d, 0, 100);
      state.energy = clamp(state.energy - 0.006 * d, 0, 100);
      state.hygiene = clamp(state.hygiene - 0.003 * d, 0, 100);
      state.bladder = clamp(state.bladder + 0.012 * d, 0, 100);

      state.happiness = clamp(
        state.happiness +
          (state.hunger > 80 ? -0.01 * d : 0) +
          (state.energy < 20 ? -0.01 * d : 0) +
          (state.hygiene < 20 ? -0.008 * d : 0) +
          (state.bladder > 80 ? -0.012 * d : 0),
        0, 100
      );

      // Aging: 1 age day per *real* day
      state.ageDays = Math.floor(state.ageDays + d / 86400);

      // Clear expired buffs (cheap check)
      const now = Date.now();
      if (state.buffs.xpBoostUntil && now >= state.buffs.xpBoostUntil) state.buffs.xpBoostUntil = null;
      if (state.buffs.happinessBoostUntil && now >= state.buffs.happinessBoostUntil) state.buffs.happinessBoostUntil = null;

      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Progression (apply xp buff multiplier)
    addXP(state, { payload }) {
      const now = Date.now();
      let add = Math.max(0, Math.floor(payload || 0));
      if (state.buffs.xpBoostUntil && now < state.buffs.xpBoostUntil) {
        add = Math.ceil(add * 1.5); // 1.5x during buff
      }
      state.xp += add;
      while (state.xp >= 100 * state.level) { state.xp -= 100 * state.level; state.level += 1; }
      state._meta.lastLocalUpdateAt = now;
    },

    // Potty
    pottyProgress(state, { payload: { delta = 1 } = {} }) {
      state.potty.progress = clamp(state.potty.progress + delta, 0, 100);
      if (state.potty.progress >= 100) { state.potty.progress = 0; state.potty.level = clamp(state.potty.level + 1, 0, 5); }
      state._meta.lastLocalUpdateAt = Date.now();
    },
    pottyAccident(state) {
      state.potty.accidents += 1;
      state.potty.lastAccidentAt = Date.now();
      state.hygiene = clamp(state.hygiene - 10, 0, 100);
      state.happiness = clamp(state.happiness - 8, 0, 100);
      state.bladder = clamp(state.bladder - 40, 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Tricks
    learnTrick(state, { payload: { name, delta = 1 } = {} }) {
      if (!name || !(name in state.tricks)) return;
      state.tricks[name] = clamp(state.tricks[name] + delta, 0, 100);
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Milestones
    setMilestone(state, { payload: { key, value = true } = {} }) {
      if (!key) return; state.milestones[key] = !!value; state._meta.lastLocalUpdateAt = Date.now();
    },

    // Economy & retention
    addCoins(state, { payload }) { state.coins = Math.max(0, state.coins + Math.floor(payload || 0)); state._meta.lastLocalUpdateAt = Date.now(); },
    spendCoins(state, { payload }) {
      const amt = Math.max(0, Math.floor(payload || 0));
      if (state.coins >= amt) state.coins -= amt;
      state._meta.lastLocalUpdateAt = Date.now();
    },
    registerDailyVisit(state, { payload: { now = Date.now() } = {} }) {
      const prev = state.lastVisitAt;
      if (prev == null) {
        state.loginStreak = 1;
      } else {
        const diffDays = dayDiff(now, prev);
        if (diffDays <= 0) {
          // same day, do nothing
        } else if (diffDays === 1) {
          state.loginStreak += 1;
        } else {
          state.loginStreak = 1; // streak broken
        }
      }
      state.lastVisitAt = now;
      state._meta.lastLocalUpdateAt = now;
    },
    claimDailyReward(state, { payload: { now = Date.now(), amount = 20 } = {} }) {
      const last = state.lastDailyClaimAt;
      if (!last || dayDiff(now, last) >= 1) {
        state.coins += Math.max(0, Math.floor(amount));
        state.lastDailyClaimAt = now;
      }
      state._meta.lastLocalUpdateAt = now;
    },

    // Buffs + Cosmetics
    grantBuff(state, { payload: { kind, minutes = 10, from = Date.now() } = {} }) {
      const until = from + Math.max(1, minutes) * 60_000;
      if (kind === "xp") state.buffs.xpBoostUntil = until;
      if (kind === "happiness") state.buffs.happinessBoostUntil = until;
      state._meta.lastLocalUpdateAt = from;
    },
    clearExpiredBuffs(state, { payload: { now = Date.now() } = {} }) {
      if (state.buffs.xpBoostUntil && now >= state.buffs.xpBoostUntil) state.buffs.xpBoostUntil = null;
      if (state.buffs.happinessBoostUntil && now >= state.buffs.happinessBoostUntil) state.buffs.happinessBoostUntil = null;
      state._meta.lastLocalUpdateAt = now;
    },
    unlockBackyardSkin(state, { payload: { skin } }) {
      if (!skin) return;
      if (!state.cosmetics.ownedSkins.includes(skin)) {
        state.cosmetics.ownedSkins.push(skin);
      }
      state._meta.lastLocalUpdateAt = Date.now();
    },
    equipBackyardSkin(state, { payload: { skin } }) {
      if (!skin) return;
      if (state.cosmetics.ownedSkins.includes(skin)) {
        state.cosmetics.backyardSkin = skin;
      }
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Firestore sync
    loadState: (_s, { payload }) => normalizeLoadedState(payload || initialState),
    mergeState: (s, { payload }) => normalizeLoadedState({ ...s, ...(payload || {}) }),
  },
});

export const {
  // movement & needs
  setPosition, nudge, setDirection, setMoving,
  setHappiness, changeHappiness,
  setBladder, changeBladder,
  tickNeeds,
  // progression & training
  addXP, pottyProgress, pottyAccident, learnTrick, setMilestone,
  // economy & retention
  addCoins, spendCoins, registerDailyVisit, claimDailyReward,
  // buffs & cosmetics
  grantBuff, clearExpiredBuffs, unlockBackyardSkin, equipBackyardSkin,
  // sync
  loadState, mergeState,
} = slice.actions;

export default slice.reducer;

// --------- Selectors ----------
export const selectDog = (s) => s.dog;
export const selectPos = (s) => s.dog.pos;
export const selectDirection = (s) => s.dog.direction;
export const selectMoving = (s) => s.dog.moving;
export const selectHappiness = (s) => s.dog.happiness;
export const selectBladder = (s) => s.dog.bladder;
export const selectPotty = (s) => s.dog.potty;

export const selectXP = (s) => ({ xp: s.dog.xp, level: s.dog.level, next: 100 * s.dog.level });
export const selectCoins = (s) => s.dog.coins;
export const selectStreak = (s) => s.dog.loginStreak;
export const selectLastVisit = (s) => s.dog.lastVisitAt;
export const selectLastClaim = (s) => s.dog.lastDailyClaimAt;
export const selectTricks = (s) => s.dog.tricks;
export const selectAgeDays = (s) => s.dog.ageDays;

// Derived age stage: Puppy < 90 days, Adult 90–730, Senior 730+
export const selectAgeStage = (s) => {
  const d = s.dog.ageDays || 0;
  if (d < 90) return "Puppy";
  if (d < 730) return "Adult";
  return "Senior";
};

// Feature gates by level
export const selectUnlocks = (s) => {
  const L = s.dog.level;
  return {
    pottyTrainer: L >= 1,
    tricksTrainer: L >= 2,
    shop: L >= 3,
    backyardUpgrade: L >= 5,
    accessories: L >= 8,
    breeding: L >= 12,
  };
};

export const selectBuffs = (s) => s.dog.buffs;
export const selectCosmetics = (s) => s.dog.cosmetics;
export const selectBackyardSkin = (s) => s.dog.cosmetics.backyardSkin;
