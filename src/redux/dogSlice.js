<<<<<<< Updated upstream
// src/redux/dogSlice.js
import { createSlice, nanoid, createSelector } from "@reduxjs/toolkit";

/**
 * Doggerz state model (v2)
 * - Level/XP with curved progression
 * - Happiness / Energy with clamped ranges
 * - Daily streak
 * - Tricks: learn/forget and per-trick XP
 * - Timestamps for simple cooldowns and login streak logic
 */
=======
import { createSlice } from "@reduxjs/toolkit";
>>>>>>> Stashed changes

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const nowIso = () => new Date().toISOString();

// simple XP curve: next = base * level ^ curve
const xpToNextFor = (level) => Math.floor(50 * Math.pow(level, 1.35)) + 50;

const initialState = {
  version: 2,
  id: "single-dog",
  name: "Odin",
  breed: "Ridgeback",
  level: 1,
  xp: 0,
<<<<<<< Updated upstream
  xpToNext: xpToNextFor(1),
  happiness: 60, // 0..100
  energy: 70,    // 0..100
=======
  ageDays: 0, // 1 per real day

  // Training
  potty: { level: 0, progress: 0, accidents: 0, lastAccidentAt: null },
  tricks: { sit: 0, stay: 0, paw: 0, rollOver: 0 },

  // Milestones
  milestones: { firstBark: true, firstWalk: true, firstPotty: false, breedingPreview: false },

  // Economy & retention
>>>>>>> Stashed changes
  coins: 0,
  streak: 0,
  lastLoginDay: null, // "YYYY-MM-DD"
  lastUpdatedAt: nowIso(),

<<<<<<< Updated upstream
  // Tricks are objects so we can track per-trick XP later (for mastery)
  tricks: [
    // { id: 'sit', name: 'Sit', xp: 15, mastered: false }
  ],

  milestones: {
    tricksLearned: 0,
    highestStreak: 0,
  },
=======
  // Session buffs & cosmetics
  buffs: { xpBoostUntil: null, happinessBoostUntil: null },
  cosmetics: {
    backyardSkin: "default",
    ownedSkins: ["default"],
    accessories: {
      owned: [],
      equipped: { collar: null, hat: null },
    },
  },

  // Shop limited-time sale
  shopSaleEndsAt: null,

  _meta: { lastLocalUpdateAt: 0 },
>>>>>>> Stashed changes
};

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateFromCloud(_state, action) {
      // Replace entire state (guard version)
      const incoming = action.payload;
      if (!incoming || typeof incoming !== "object") return _state;
      if (!("version" in incoming)) return _state;
      return { ...incoming };
    },

    rename(state, action) {
      state.name = String(action.payload || "").slice(0, 32) || state.name;
      state.lastUpdatedAt = nowIso();
    },

    grantCoins(state, action) {
      state.coins = Math.max(0, Math.floor(state.coins + (action.payload ?? 0)));
      state.lastUpdatedAt = nowIso();
    },

    gainXp(state, action) {
      let amt = Math.max(0, Math.floor(action.payload ?? 0));
      state.xp += amt;

      // handle level-ups (multiple if big grant)
      while (state.xp >= state.xpToNext) {
        state.xp -= state.xpToNext;
        state.level += 1;
        state.xpToNext = xpToNextFor(state.level);
        // small happiness/energy bump on level up
        state.happiness = clamp(state.happiness + 4, 0, 100);
        state.energy = clamp(state.energy + 4, 0, 100);
      }
      state.lastUpdatedAt = nowIso();
    },

    adjustHappiness(state, action) {
      state.happiness = clamp(state.happiness + (action.payload ?? 0), 0, 100);
      state.lastUpdatedAt = nowIso();
    },

    adjustEnergy(state, action) {
      state.energy = clamp(state.energy + (action.payload ?? 0), 0, 100);
      state.lastUpdatedAt = nowIso();
    },

    // Simple daily login streak; call this once on app start
    touchDailyStreak(state) {
      const today = new Date();
      const toDayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!state.lastLoginDay) {
        state.lastLoginDay = toDayStr;
        state.streak = 1;
      } else if (state.lastLoginDay !== toDayStr) {
        // check if it’s exactly the next day
        const prev = new Date(state.lastLoginDay + "T00:00:00Z");
        const diffDays = Math.round((today - prev) / 86400000);
        if (diffDays === 1) {
          state.streak += 1;
        } else {
          state.streak = 1; // reset
        }
        state.lastLoginDay = toDayStr;
      }
      if (state.streak > state.milestones.highestStreak) {
        state.milestones.highestStreak = state.streak;
      }
      state.lastUpdatedAt = nowIso();
    },

    resetStreak(state) {
      state.streak = 0;
      state.lastUpdatedAt = nowIso();
    },

    // ---- Tricks ----
    learnTrick: {
      reducer(state, action) {
        const { id, name } = action.payload;
        if (!id) return;
        const exists = state.tricks.some((t) => t.id === id);
        if (!exists) {
          state.tricks.push({ id, name: name ?? id, xp: 0, mastered: false });
          state.milestones.tricksLearned += 1;
          // reward a bit for learning
          state.happiness = clamp(state.happiness + 6, 0, 100);
          state.xp = state.xp + 10; // tiny XP; level loop handled by gainXp usually
        }
        state.lastUpdatedAt = nowIso();
      },
      prepare({ id, name }) {
        return { payload: { id: id || nanoid(), name } };
      },
    },

    forgetTrick(state, action) {
      const id = action.payload;
      state.tricks = state.tricks.filter((t) => t.id !== id);
      state.lastUpdatedAt = nowIso();
    },

    awardTrickXp(state, action) {
      const { id, xp = 5 } = action.payload || {};
      const trick = state.tricks.find((t) => t.id === id);
      if (trick) {
        trick.xp = Math.max(0, trick.xp + xp);
        if (trick.xp >= 100) trick.mastered = true;
        // small global XP for training sessions
        state.xp += Math.floor(xp / 2);
        while (state.xp >= state.xpToNext) {
          state.xp -= state.xpToNext;
          state.level += 1;
          state.xpToNext = xpToNextFor(state.level);
        }
        state.happiness = clamp(state.happiness + 2, 0, 100);
      }
      state.lastUpdatedAt = nowIso();
    },
  },
});

// -------------------- Selectors --------------------
export const selectDog = (state) => state.dog;

export const selectLevel = (state) => state.dog.level;
export const selectXp = (state) => state.dog.xp;
export const selectXpToNext = (state) => state.dog.xpToNext;

export const selectHappiness = (state) => state.dog.happiness;
export const selectEnergy = (state) => state.dog.energy;

export const selectStreak = (state) => state.dog.streak;

// ✅ The selector your component is importing:
export const selectTricks = (state) => state.dog.tricks;

export const selectTrickById = (id) =>
  createSelector(selectTricks, (tricks) => tricks.find((t) => t.id === id) || null);

// Nice derived view for a stats panel
export const selectStatsPanel = createSelector(
  [selectLevel, selectXp, selectXpToNext, selectHappiness, selectEnergy, selectStreak, selectTricks],
  (level, xp, xpToNext, happiness, energy, streak, tricks) => ({
    level,
    xp,
    xpToNext,
    progress: xpToNext ? Math.min(1, xp / xpToNext) : 0,
    happiness,
    energy,
    streak,
    tricksLearned: tricks.length,
    masteredTricks: tricks.filter((t) => t.mastered).length,
  })
);

// -------------------- Actions / Reducer --------------------
export const {
  hydrateFromCloud,
  rename,
  grantCoins,
  gainXp,
  adjustHappiness,
  adjustEnergy,
  touchDailyStreak,
  resetStreak,
  learnTrick,
  forgetTrick,
  awardTrickXp,
} = slice.actions;

export default slice.reducer;
<<<<<<< Updated upstream
=======

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
export const selectPotty = (s) => s.dog.potty;
export const selectBladder = (s) => s.dog.bladder;
export const selectTricks = (s) => s.dog.tricks;
export const selectAgeDays = (s) => s.dog.ageDays;
export const selectAgeStage = (s) => {
  const d = s.dog.ageDays || 0;
  if (d < 90) return "Puppy";
  if (d < 730) return "Adult";
  return "Senior";
};
export const selectStreak = (s) => s.dog.loginStreak;
export const selectLastVisit = (s) => s.dog.lastVisitAt;
export const selectLastClaim = (s) => s.dog.lastDailyClaimAt;
>>>>>>> Stashed changes
