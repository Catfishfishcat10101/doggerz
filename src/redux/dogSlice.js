// src/redux/dogSlice.js
import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const HOUR_MS = 1000 * 60 * 60;

const DECAY_PER_HOUR = {
  hunger: 6,       // how fast "fullness" drops
  happiness: 4,
  energy: 5,
  cleanliness: 2,
};

const ACTION_COOLDOWNS = {
  feed: 60,        // seconds
  play: 45,
  rest: 90,
  bathe: 120,
};

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
  stats: {
    hunger: 60,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },
  poopCount: 0,
  pottyLevel: 0,
  isAsleep: false,

  // Long-term lifecycle
  bornAt: null,
  ageHours: 0,
  condition: "clean", // clean | dirty | fleas | mange

  // Time tracking
  lastUpdatedAt: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastRestAt: null,
  lastBathedAt: null,

  // For future: health / death mechanics
  health: 100,
  isAlive: true,

  debug: false,
};

function computeCondition(cleanliness) {
  const c = cleanliness ?? 0;
  if (c >= 70) return "clean";
  if (c >= 40) return "dirty";
  if (c >= 20) return "fleas";
  return "mange";
}

function applyCondition(state) {
  state.condition = computeCondition(state.stats.cleanliness);
}

function applyTimeDecay(state) {
  const now = Date.now();

  if (!state.bornAt) {
    state.bornAt = now;
  }

  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    applyCondition(state);
    return;
  }

  const elapsedMs = now - state.lastUpdatedAt;
  if (elapsedMs <= 0) return;

  const hours = elapsedMs / HOUR_MS;

  // Drift stats over time
  state.stats.hunger = clamp(
    state.stats.hunger - DECAY_PER_HOUR.hunger * hours
  );
  state.stats.happiness = clamp(
    state.stats.happiness - DECAY_PER_HOUR.happiness * hours
  );
  state.stats.energy = clamp(
    state.stats.energy - DECAY_PER_HOUR.energy * hours
  );
  state.stats.cleanliness = clamp(
    state.stats.cleanliness - DECAY_PER_HOUR.cleanliness * hours
  );

  // Age
  state.ageHours += hours;

  // Very rough health penalty if neglected
  let penalty = 0;
  const { hunger, happiness, energy, cleanliness } = state.stats;
  if (hunger < 25) penalty += 0.5 * hours;
  if (happiness < 25) penalty += 0.3 * hours;
  if (energy < 25) penalty += 0.3 * hours;
  if (cleanliness < 25) penalty += 0.4 * hours;

  if (penalty > 0) {
    state.health = clamp(state.health - penalty, 0, 100);
    if (state.health <= 0) {
      state.isAlive = false;
    }
  } else if (state.health < 100) {
    state.health = clamp(state.health + 0.1 * hours, 0, 100);
  }

  state.lastUpdatedAt = now;
  applyCondition(state);
}

function canUseAction(lastAt, cooldownSeconds) {
  if (!lastAt) return true;
  const now = Date.now();
  return now - lastAt >= cooldownSeconds * 1000;
}

function gainXp(state, amount) {
  state.xp += amount;
  // Simple level curve: 100 XP per level
  while (state.xp >= state.level * 100) {
    state.xp -= state.level * 100;
    state.level += 1;
    state.coins += 5; // small level-up coin reward
  }
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      // Used when loading from Firestore/localStorage
      if (!payload || typeof payload !== "object") return;
      const merged = { ...state, ...payload };
      Object.assign(state, merged);
      applyTimeDecay(state);
    },

    setName(state, { payload }) {
      if (typeof payload === "string" && payload.trim()) {
        state.name = payload.trim();
      }
    },

    toggleDebug(state) {
      state.debug = !state.debug;
    },

    tick(state) {
      // For a DogAIEngine interval to call; also runs offline decay.
      applyTimeDecay(state);
    },

    feed(state) {
      applyTimeDecay(state);
      if (!state.isAlive) return;

      if (!canUseAction(state.lastFedAt, ACTION_COOLDOWNS.feed)) {
        return; // anti-spam: too soon
      }

      const now = Date.now();
      state.lastFedAt = now;

      state.stats.hunger = clamp(state.stats.hunger + 25);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 3);
      state.pottyLevel = clamp(state.pottyLevel + 10, 0, 100);

      if (state.pottyLevel >= 60) {
        state.poopCount += 1;
        state.pottyLevel = 0;
        state.stats.cleanliness = clamp(state.stats.cleanliness - 8);
      }

      gainXp(state, 3);
      state.lastUpdatedAt = now;
      applyCondition(state);
    },

    play(state) {
      applyTimeDecay(state);
      if (!state.isAlive) return;

      if (!canUseAction(state.lastPlayedAt, ACTION_COOLDOWNS.play)) {
        return;
      }

      const now = Date.now();
      state.lastPlayedAt = now;

      state.stats.happiness = clamp(state.stats.happiness + 20);
      state.stats.energy = clamp(state.stats.energy - 10);
      state.stats.cleanliness = clamp(state.stats.cleanliness - 4);
      gainXp(state, 4);

      state.lastUpdatedAt = now;
      applyCondition(state);
    },

    rest(state) {
      applyTimeDecay(state);
      if (!state.isAlive) return;

      if (!canUseAction(state.lastRestAt, ACTION_COOLDOWNS.rest)) {
        // Even if you spam the button, we at least toggle sleep flag
        state.isAsleep = !state.isAsleep;
        return;
      }

      const now = Date.now();
      state.lastRestAt = now;

      state.isAsleep = !state.isAsleep;
      if (state.isAsleep) {
        // When toggled to asleep, refill energy a bit and reduce happiness a bit
        state.stats.energy = clamp(state.stats.energy + 25);
        state.stats.happiness = clamp(state.stats.happiness - 5);
      }

      state.lastUpdatedAt = now;
      applyCondition(state);
    },

    bathe(state) {
      applyTimeDecay(state);
      if (!state.isAlive) return;

      if (!canUseAction(state.lastBathedAt, ACTION_COOLDOWNS.bathe)) {
        return;
      }

      const now = Date.now();
      state.lastBathedAt = now;

      state.stats.cleanliness = clamp(state.stats.cleanliness + 35);
      state.poopCount = 0;

      gainXp(state, 3);
      state.lastUpdatedAt = now;
      applyCondition(state);
    },

    scoopPoop(state) {
      applyTimeDecay(state);
      if (!state.isAlive) return;

      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 5);
        gainXp(state, 2);
      }

      state.lastUpdatedAt = Date.now();
      applyCondition(state);
    },
  },
});

export const {
  hydrateDog,
  setName,
  toggleDebug,
  tick,
  feed,
  play,
  rest,
  bathe,
  scoopPoop,
} = dogSlice.actions;

export const selectDog = (state) => state.dog;

export default dogSlice.reducer;
