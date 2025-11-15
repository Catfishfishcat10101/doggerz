// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const baseStats = {
  hunger: 60, // 100 = full, 0 = starving
  happiness: 60,
  energy: 60,
  cleanliness: 60,
};

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,

  stats: { ...baseStats },

  poopCount: 0,          // accidents in yard
  pottyLevel: 0,         // potty training % (0–100)
  isAsleep: false,
  debug: false,

  ageHours: 0,           // total age in real hours
  condition: "clean",    // "clean" | "dirty" | "fleas" | "mange"
  health: 100,           // 0–100
  isAlive: true,

  lastUpdatedAt: null,   // timestamp ms

  // --- Cooldowns (timestamps, ms since epoch) ---
  lastFedAt: null,
  lastPlayedAt: null,
  lastBathedAt: null,
  lastPottyAt: null,
};

// ~ design tuning knobs
const HUNGER_DECAY_PER_MIN = 0.14;      // ~12 hours from full → empty
const HAPPINESS_DECAY_PER_MIN = 0.08;
const CLEAN_DECAY_PER_MIN = 0.05;

// Awake: ~4 hours from full → empty
const ENERGY_DECAY_AWAKE_PER_MIN = 0.25;
// Sleep: ~30 minutes from empty → full
const ENERGY_REGEN_SLEEP_PER_MIN = 100 / 30;

// Cooldowns in minutes – “no button mash” rules
const FEED_COOLDOWN_MIN = 10;     // can’t feed 6x in a row
const PLAY_COOLDOWN_MIN = 15;
const BATHE_COOLDOWN_MIN = 120;   // baths are a big event
const POTTY_COOLDOWN_MIN = 5;

function minutesSince(now, lastAt) {
  if (!lastAt || !Number.isFinite(lastAt)) return Infinity;
  return (now - lastAt) / 60000;
}

function isOffCooldown(now, lastAt, cooldownMin) {
  return minutesSince(now, lastAt) >= cooldownMin;
}

function ensureStats(state) {
  if (!state.stats) state.stats = { ...baseStats };
  state.stats.hunger = clamp(state.stats.hunger);
  state.stats.happiness = clamp(state.stats.happiness);
  state.stats.energy = clamp(state.stats.energy);
  state.stats.cleanliness = clamp(state.stats.cleanliness);
}

function applyMinutes(state, minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return;
  if (!state.isAlive) return;

  ensureStats(state);
  const s = state.stats;

  // ---- Age ----
  const ageHours = Number(state.ageHours) || 0;
  state.ageHours = ageHours + minutes / 60;

  // ---- Core stat drift over time ----
  s.hunger = clamp(s.hunger - HUNGER_DECAY_PER_MIN * minutes);
  s.happiness = clamp(s.happiness - HAPPINESS_DECAY_PER_MIN * minutes);
  s.cleanliness = clamp(s.cleanliness - CLEAN_DECAY_PER_MIN * minutes);

  if (state.isAsleep) {
    s.energy = clamp(
      s.energy + ENERGY_REGEN_SLEEP_PER_MIN * minutes
    );
  } else {
    s.energy = clamp(
      s.energy - ENERGY_DECAY_AWAKE_PER_MIN * minutes
    );
  }

  // ---- Auto sleep / wake rules ----
  if (!state.isAsleep && s.energy <= 10) {
    state.isAsleep = true;
  } else if (state.isAsleep && s.energy >= 95) {
    state.isAsleep = false;
  }

  // ---- Condition based on cleanliness ----
  let condition = "clean";
  if (s.cleanliness < 20) {
    condition = "mange";
  } else if (s.cleanliness < 40) {
    condition = "fleas";
  } else if (s.cleanliness < 70) {
    condition = "dirty";
  }
  state.condition = condition;

  // ---- Health: neglect hurts, good care helps ----
  let health = Number(state.health);
  if (!Number.isFinite(health)) health = 100;

  const vals = [s.hunger, s.happiness, s.energy, s.cleanliness];
  const lowCount = vals.filter((v) => v < 20).length;
  const goodCount = vals.filter((v) => v > 65).length;

  const LOW_PENALTY_PER_MIN = 0.15;
  const GOOD_BONUS_PER_MIN = 0.05;

  health -= lowCount * LOW_PENALTY_PER_MIN * minutes;
  health += goodCount * GOOD_BONUS_PER_MIN * minutes;

  state.health = clamp(health, 0, 100);
  if (state.health <= 0) {
    state.isAlive = false;
    state.isAsleep = false;
  }
}

function awardXpAndCoins(state, { xp = 0, coins = 0 } = {}) {
  if (!state.isAlive) return;
  const nextXp = (Number(state.xp) || 0) + xp;
  state.xp = nextXp;

  const nextCoins = (Number(state.coins) || 0) + coins;
  state.coins = Math.max(0, Math.floor(nextCoins));

  // Simple leveling curve: +1 level every 100 XP
  const lvlFromXp = Math.max(1, Math.floor(nextXp / 100) + 1);
  if (lvlFromXp > state.level) {
    state.level = lvlFromXp;
  }
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return state;

      // Merge into a fresh baseline to pick up new fields
      const merged = {
        ...initialState,
        ...payload,
        stats: {
          ...initialState.stats,
          ...(payload.stats || {}),
        },
      };

      return merged;
    },

    renameDog(state, { payload }) {
      if (typeof payload === "string" && payload.trim()) {
        state.name = payload.trim();
      }
    },

    feed(state) {
      if (!state.isAlive) return;
      const now = Date.now();
      if (!isOffCooldown(now, state.lastFedAt, FEED_COOLDOWN_MIN)) return;

      ensureStats(state);
      const s = state.stats;

      s.hunger = clamp(s.hunger + 18);
      s.cleanliness = clamp(s.cleanliness - 2);
      s.happiness = clamp(s.happiness + 4);

      state.lastFedAt = now;
      awardXpAndCoins(state, { xp: 4, coins: 1 });
    },

    play(state) {
      if (!state.isAlive) return;
      const now = Date.now();
      if (!isOffCooldown(now, state.lastPlayedAt, PLAY_COOLDOWN_MIN)) return;

      ensureStats(state);
      const s = state.stats;

      s.happiness = clamp(s.happiness + 16);
      s.energy = clamp(s.energy - 10);
      s.hunger = clamp(s.hunger - 4);

      state.lastPlayedAt = now;
      awardXpAndCoins(state, { xp: 6, coins: 2 });
    },

    // Manual nap toggle – AI engine still controls slow recharge.
    rest(state) {
      if (!state.isAlive) return;
      state.isAsleep = !state.isAsleep;
    },

    bathe(state) {
      if (!state.isAlive) return;
      const now = Date.now();
      if (!isOffCooldown(now, state.lastBathedAt, BATHE_COOLDOWN_MIN)) return;

      ensureStats(state);
      const s = state.stats;

      s.cleanliness = clamp(s.cleanliness + 30);
      s.happiness = clamp(s.happiness - 2); // some dogs hate baths

      state.lastBathedAt = now;
      awardXpAndCoins(state, { xp: 5, coins: 0 });
    },

    goPotty(state) {
      if (!state.isAlive) return;
      const now = Date.now();
      if (!isOffCooldown(now, state.lastPottyAt, POTTY_COOLDOWN_MIN)) return;

      state.poopCount = 0;
      state.pottyLevel = clamp((state.pottyLevel || 0) + 5);
      ensureStats(state);
      state.stats.cleanliness = clamp(state.stats.cleanliness + 3);

      state.lastPottyAt = now;
      awardXpAndCoins(state, { xp: 3, coins: 0 });
    },

    tick(state, { payload }) {
      const now =
        payload && typeof payload.now === "number" ? payload.now : Date.now();
      const last =
        typeof state.lastUpdatedAt === "number" ? state.lastUpdatedAt : now;

      let minutes = (now - last) / 60000;
      if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;

      state.lastUpdatedAt = now;
      if (minutes > 0) {
        applyMinutes(state, minutes);
      }
    },
  },
});

export const {
  hydrateDog,
  renameDog,
  feed,
  play,
  rest,
  bathe,
  goPotty,
  tick,
} = dogSlice.actions;

export const selectDog = (state) => state.dog;

export default dogSlice.reducer;
