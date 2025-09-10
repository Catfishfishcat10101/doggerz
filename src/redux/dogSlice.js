// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const DOG_VERSION = 1;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (n) => Math.round(n * 100) / 100;
const WORLD = { w: 640, h: 360, tile: 64 };

const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0,0,0,0); return d.getTime(); };
const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);

export const initialState = {
  _version: DOG_VERSION,

  // Pose / world
  pos: { x: 320, y: 180 },
  direction: "down",
  moving: false,

  // Needs (0..100)
  happiness: 75,
  energy: 100,
  hunger: 50,
  hygiene: 85,
  bladder: 25,

  // Progression
  level: 1,
  xp: 0,
  ageDays: 0, // 1 per real day (slow)

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

  // Session buffs & cosmetics
  buffs: { xpBoostUntil: null, happinessBoostUntil: null },
  cosmetics: {
    backyardSkin: "default",
    ownedSkins: ["default"],
    accessories: {
      owned: [], // ["collar_red", "collar_blue", "hat_party", ...]
      equipped: { collar: null, hat: null },
    },
  },

  // Shop limited-time sale
  shopSaleEndsAt: null, // timestamp (ms) while a banner is active

  _meta: { lastLocalUpdateAt: 0 },
};

function normalizeLoadedState(raw) {
  const s = { ...initialState, ...raw };
  s.pos = { ...initialState.pos, ...(raw?.pos || {}) };
  s.potty = { ...initialState.potty, ...(raw?.potty || {}) };
  s.tricks = { ...initialState.tricks, ...(raw?.tricks || {}) };
  s.milestones = { ...initialState.milestones, ...(raw?.milestones || {}) };

  for (const k of ["happiness","energy","hunger","hygiene","bladder"]) s[k] = clamp(Number(s[k])||0,0,100);
  s.level = Math.max(1, Math.floor(s.level || 1));
  s.xp = Math.max(0, Math.floor(s.xp || 0));
  s.ageDays = Math.max(0, Math.floor(s.ageDays || 0));

  s.coins = Math.max(0, Math.floor(s.coins || 0));
  s.loginStreak = Math.max(0, Math.floor(s.loginStreak || 0));

  s.buffs = { ...initialState.buffs, ...(raw?.buffs || {}) };
  s.cosmetics = {
    ...initialState.cosmetics,
    ...(raw?.cosmetics || {}),
    accessories: {
      owned: raw?.cosmetics?.accessories?.owned || [],
      equipped: { collar: null, hat: null, ...(raw?.cosmetics?.accessories?.equipped || {}) },
    },
  };

  s.shopSaleEndsAt = raw?.shopSaleEndsAt ?? null;

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

    // Needs (+happiness buff)
    setHappiness(state, { payload }) { state.happiness = clamp(Math.floor(payload ?? state.happiness), 0, 100); state._meta.lastLocalUpdateAt = Date.now(); },
    changeHappiness(state, { payload }) {
      const now = Date.now();
      let d = Number(payload || 0);
      if (d > 0 && state.buffs.happinessBoostUntil && now < state.buffs.happinessBoostUntil) d = Math.ceil(d * 1.25);
      state.happiness = clamp(state.happiness + d, 0, 100);
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
      state.ageDays = Math.floor(state.ageDays + d / 86400);

      const now = Date.now();
      if (state.buffs.xpBoostUntil && now >= state.buffs.xpBoostUntil) state.buffs.xpBoostUntil = null;
      if (state.buffs.happinessBoostUntil && now >= state.buffs.happinessBoostUntil) state.buffs.happinessBoostUntil = null;

      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Progression (+xp buff)
    addXP(state, { payload }) {
      const now = Date.now();
      let add = Math.max(0, Math.floor(payload || 0));
      if (state.buffs.xpBoostUntil && now < state.buffs.xpBoostUntil) add = Math.ceil(add * 1.5);
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
    setMilestone(state, { payload: { key, value = true } = {} }) { if (!key) return; state.milestones[key] = !!value; state._meta.lastLocalUpdateAt = Date.now(); },

    // Economy & retention
    addCoins(state, { payload }) { state.coins = Math.max(0, state.coins + Math.floor(payload || 0)); state._meta.lastLocalUpdateAt = Date.now(); },
    spendCoins(state, { payload }) { const amt = Math.max(0, Math.floor(payload || 0)); if (state.coins >= amt) state.coins -= amt; state._meta.lastLocalUpdateAt = Date.now(); },
    registerDailyVisit(state, { payload: { now = Date.now() } = {} }) {
      const prev = state.lastVisitAt;
      if (prev == null) state.loginStreak = 1;
      else {
        const diff = dayDiff(now, prev);
        if (diff === 1) state.loginStreak += 1;
        else if (diff > 1) state.loginStreak = 1;
      }
      state.lastVisitAt = now; state._meta.lastLocalUpdateAt = now;
    },
    claimDailyReward(state, { payload: { now = Date.now(), amount = 20 } = {} }) {
      const last = state.lastDailyClaimAt;
      if (!last || dayDiff(now, last) >= 1) { state.coins += Math.max(0, Math.floor(amount)); state.lastDailyClaimAt = now; }
      state._meta.lastLocalUpdateAt = now;
    },

    // Buffs & cosmetics
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
      if (!state.cosmetics.ownedSkins.includes(skin)) state.cosmetics.ownedSkins.push(skin);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    equipBackyardSkin(state, { payload: { skin } }) {
      if (!skin) return;
      if (state.cosmetics.ownedSkins.includes(skin)) state.cosmetics.backyardSkin = skin;
      state._meta.lastLocalUpdateAt = Date.now();
    },

    unlockAccessory(state, { payload: { id } }) {
      if (!id) return;
      if (!state.cosmetics.accessories.owned.includes(id)) state.cosmetics.accessories.owned.push(id);
      state._meta.lastLocalUpdateAt = Date.now();
    },
    equipAccessory(state, { payload: { slot, id } }) {
      if (!slot) return;
      if (id && !state.cosmetics.accessories.owned.includes(id)) return;
      state.cosmetics.accessories.equipped[slot] = id ?? null;
      state._meta.lastLocalUpdateAt = Date.now();
    },

    // Shop sale banner
    startShopSale(state, { payload: { minutes = 180, from = Date.now() } = {} }) {
      state.shopSaleEndsAt = from + Math.max(1, minutes) * 60_000;
      state._meta.lastLocalUpdateAt = from;
    },
    endShopSale(state) { state.shopSaleEndsAt = null; state._meta.lastLocalUpdateAt = Date.now(); },

    // Sync
    loadState: (_s, { payload }) => normalizeLoadedState(payload || initialState),
    mergeState: (s, { payload }) => normalizeLoadedState({ ...s, ...(payload || {}) }),
  },
});

export const {
  setPosition, nudge, setDirection, setMoving,
  setHappiness, changeHappiness, setBladder, changeBladder, tickNeeds,
  addXP, pottyProgress, pottyAccident, learnTrick, setMilestone,
  addCoins, spendCoins, registerDailyVisit, claimDailyReward,
  grantBuff, clearExpiredBuffs, unlockBackyardSkin, equipBackyardSkin,
  unlockAccessory, equipAccessory,
  startShopSale, endShopSale,
  loadState, mergeState,
} = slice.actions;

export default slice.reducer;

// Selectors
export const selectDog = (s) => s.dog;
export const selectPos = (s) => s.dog.pos;
export const selectDirection = (s) => s.dog.direction;
export const selectMoving = (s) => s.dog.moving;
export const selectHappiness = (s) => s.dog.happiness;
export const selectXP = (s) => ({ xp: s.dog.xp, level: s.dog.level, next: 100 * s.dog.level });
export const selectCoins = (s) => s.dog.coins;
export const selectUnlocks = (s) => {
  const L = s.dog.level;
  return { pottyTrainer: L >= 1, tricksTrainer: L >= 2, shop: L >= 3, backyardUpgrade: L >= 5, accessories: L >= 8, breeding: L >= 12 };
};
export const selectBuffs = (s) => s.dog.buffs;
export const selectCosmetics = (s) => s.dog.cosmetics;
export const selectBackyardSkin = (s) => s.dog.cosmetics.backyardSkin;
export const selectAccessories = (s) => s.dog.cosmetics.accessories;
export const selectShopSaleEnds = (s) => s.dog.shopSaleEndsAt;
