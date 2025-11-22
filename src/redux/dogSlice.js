import { createSlice } from "@reduxjs/toolkit";

export const DOG_STORAGE_KEY = "doggerz:dogState";

/**
 * Clamp a numeric value between [lo, hi].
 */
const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

/**
 * How fast needs move per *real* hour.
 * - Hunger: goes UP over time (dog gets hungrier).
 * - Happiness / energy / cleanliness decay DOWN over time.
 */
const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;
const SKILL_LEVEL_STEP = 50;

const nowMs = () => Date.now();

const toISODate = (ms) => {
  const d = new Date(ms ?? nowMs());
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
};

const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};

const initialTemperament = {
  primary: "SPICY", // SPICY / SWEET / CHILL / CHAOS etc.
  secondary: "SWEET",
  traits: [
    { id: "zoomies", label: "Zoomies", intensity: 0.7 },
    { id: "clingy", label: "Clingy", intensity: 0.5 },
    { id: "toy_gremlin", label: "Toy Gremlin", intensity: 0.4 },
  ],
};

const initialPotty = {
  accidents: 0,
  successes: 0,
  lastAccidentAt: null,
  lastSuccessAt: null,
};

const initialStats = {
  totalSessions: 0,
  totalMinutesPlayed: 0,
  totalTreatsGiven: 0,
  totalBaths: 0,
  totalWalks: 0,
};

const createInitialDogState = () => ({
  name: null,
  breed: "jackrussell",
  adoptedAtMs: null,
  lastTickMs: null,

  // Core needs [0-100]
  hunger: 45,
  happiness: 75,
  energy: 75,
  cleanliness: 80,

  xp: 0,
  level: 1,

  // Skills / commands
  skills: {
    obedience: {
      sit: { level: 1, xp: 0 },
      stay: { level: 1, xp: 0 },
      rollOver: { level: 1, xp: 0 },
      speak: { level: 1, xp: 0 },
    },
  },

  // mood tracking
  moodSamples: [], // { atMs, happiness, energy, cleanliness }

  temperament: initialTemperament,
  potty: initialPotty,
  stats: initialStats,

  // training subtree consumed by UI (adult streaks + puppy potty goal)
  training: {
    adult: {
      lastCompletedDate: null, // ISO YYYY-MM-DD
      streak: 0,
      misses: 0,
      lastPenaltyDate: null, // ISO
    },
    potty: {
      goal: 8,
      successCount: 0,
      completedAt: null, // ISO
    },
  },

  // session tracking
  lastSessionStartAt: null,
  lastSessionEndAt: null,

  // internal flags
  hydratedFromStorage: false,
});

/**
 * Apply continuous-time decay to the dog's needs based on hours elapsed.
 */
const applyNeedDecay = (state, now) => {
  if (!state.adoptedAtMs) {
    // No dog adopted yet; nothing to decay.
    state.lastTickMs = now;
    return;
  }

  if (!state.lastTickMs) {
    state.lastTickMs = now;
    return;
  }

  const hoursElapsed = (now - state.lastTickMs) / (1000 * 60 * 60);
  if (hoursElapsed <= 0) return;

  const apply = (key) => {
    const decay = DECAY_PER_HOUR[key];
    if (!decay) return;
    const delta = decay * hoursElapsed;

    if (key === "hunger") {
      // Hunger increases over time.
      state.hunger = clamp(state.hunger + delta);
    } else {
      // Others decay.
      state[key] = clamp(state[key] - delta);
    }
  };

  apply("hunger");
  apply("happiness");
  apply("energy");
  apply("cleanliness");

  state.lastTickMs = now;
};

/**
 * Simple heuristic mood label.
 */
const computeMoodLabel = (state) => {
  if (!state.adoptedAtMs) return "NONE";

  const badCount = [
    state.hunger,
    100 - state.happiness,
    100 - state.energy,
  ].filter((v) => v > 75).length;

  if (state.cleanliness < 25) return "GRIMY";
  if (badCount >= 2) return "STRESSED";
  if (state.happiness > 75 && state.energy > 60) return "HAPPY";
  if (state.happiness < 40) return "SULKY";
  return "OKAY";
};

const dogSlice = createSlice({
  name: "dog",
  initialState: createInitialDogState(),
  reducers: {
    /**
     * Reset back to a fresh dog state. Used when adopting a new pup.
     */
    resetDogState() {
      return createInitialDogState();
    },

    setDogName(state, action) {
      state.name = (action.payload || "").toString().trim() || "Pup";
    },

    setBreed(state, action) {
      state.breed = action.payload || "jackrussell";
    },

    /**
     * Adoption timestamp in ms.
     */
    setAdoptedAt(state, action) {
      const adoptedAt = action.payload ?? nowMs();
      state.adoptedAtMs = adoptedAt;
      state.lastTickMs = adoptedAt;
    },

    /**
     * Begin a play session (called when user hits /game or similar).
     */
    registerSessionStart(state, action) {
      const start = action.payload?.startMs ?? nowMs();
      state.lastSessionStartAt = start;
      // If we want, we could bump stats.totalSessions here:
      state.stats = {
        ...state.stats,
        totalSessions: (state.stats.totalSessions ?? 0) + 1,
      };
    },

    /**
     * End a play session, accumulate minutes played.
     */
    registerSessionEnd(state, action) {
      const end = action.payload?.endMs ?? nowMs();
      state.lastSessionEndAt = end;

      if (state.lastSessionStartAt) {
        const minutes = (end - state.lastSessionStartAt) / (1000 * 60) || 0;
        state.stats = {
          ...state.stats,
          totalMinutesPlayed:
            (state.stats.totalMinutesPlayed ?? 0) + Math.max(0, minutes),
        };
      }

      state.lastSessionStartAt = null;
    },

    /**
     * Tick dog needs forward to "now" (or a provided timestamp).
     * Meant to be called when:
     * - user opens the app
     * - user returns to game
     */
    tickDogNeeds(state, action) {
      const now = action?.payload?.nowMs ?? nowMs();
      applyNeedDecay(state, now);

      // Optionally sample mood once per hour.
      const lastSample =
        state.moodSamples[state.moodSamples.length - 1] || null;
      const needsSample =
        !lastSample ||
        (now - lastSample.atMs) / (1000 * 60) >= MOOD_SAMPLE_MINUTES;

      if (needsSample) {
        state.moodSamples.push({
          atMs: now,
          happiness: state.happiness,
          energy: state.energy,
          cleanliness: state.cleanliness,
        });

        // avoid unbounded growth
        if (state.moodSamples.length > 200) {
          state.moodSamples.shift();
        }
      }
    },

    /**
     * Adjust individual needs by delta values (used by actions:
     * feeding, playing, bath, nap, etc).
     */
    adjustNeeds(state, action) {
      const {
        hunger = 0,
        happiness = 0,
        energy = 0,
        cleanliness = 0,
      } = action.payload || {};

      state.hunger = clamp(state.hunger + hunger);
      state.happiness = clamp(state.happiness + happiness);
      state.energy = clamp(state.energy + energy);
      state.cleanliness = clamp(state.cleanliness + cleanliness);
    },

    /**
     * XP & leveling. You can call this from game actions.
     */
    awardXp(state, action) {
      const delta = Number(action.payload) || 0;
      state.xp = Math.max(0, state.xp + delta);

      let needed = state.level * LEVEL_XP_STEP;
      while (state.xp >= needed) {
        state.level += 1;
        needed = state.level * LEVEL_XP_STEP;
      }
    },

    /**
     * Potty tracking – simple hooks for your Potty page to use.
     */
    registerPottySuccess(state, action) {
      const atMs = action.payload?.atMs ?? nowMs();
      state.potty = {
        ...state.potty,
        successes: (state.potty.successes ?? 0) + 1,
        lastSuccessAt: atMs,
      };

      // Update training potty progress
      const today = toISODate(atMs);
      const pt = state.training?.potty || {
        goal: 8,
        successCount: 0,
        completedAt: null,
      };
      if (!state.training)
        state.training = {
          adult: {
            lastCompletedDate: null,
            streak: 0,
            misses: 0,
            lastPenaltyDate: null,
          },
          potty: pt,
        };
      // If already completed, do nothing further
      if (!pt.completedAt) {
        pt.successCount = Math.min(pt.goal || 8, (pt.successCount || 0) + 1);
        if (pt.successCount >= (pt.goal || 8)) {
          pt.completedAt = today;
        }
      }
      state.training.potty = pt;
    },

    registerPottyAccident(state, action) {
      const atMs = action.payload?.atMs ?? nowMs();
      state.potty = {
        ...state.potty,
        accidents: (state.potty.accidents ?? 0) + 1,
        lastAccidentAt: atMs,
      };
    },

    /**
     * Hydrate dog state from a snapshot (localStorage, backend, etc).
     * Thunks in dogThunks.js will call this.
     */
    hydrateFromSnapshot(state, action) {
      const snapshot = action.payload || {};
      // Start from a clean base, then merge snapshot fields.
      const base = createInitialDogState();
      const merged = {
        ...base,
        ...snapshot,
        temperament: snapshot.temperament || base.temperament,
        potty: snapshot.potty || base.potty,
        stats: snapshot.stats || base.stats,
      };
      // Immer: returning a new object replaces the state.
      return {
        ...merged,
        hydratedFromStorage: true,
      };
    },

    /**
     * Mark that we tried to hydrate (even if there was nothing).
     */
    markHydrated(state) {
      state.hydratedFromStorage = true;
    },

    /**
     * Simple game actions to satisfy UI hooks
     */
    feed(state, action) {
      // Feeding lowers hunger (less hungry) and bumps happiness/energy a bit
      state.hunger = clamp(state.hunger - 20);
      state.happiness = clamp(state.happiness + 5);
      state.energy = clamp(state.energy + 5);
    },

    play(state, action) {
      // Playing increases happiness, costs some energy
      state.happiness = clamp(state.happiness + 10);
      state.energy = clamp(state.energy - 8);
    },

    bathe(state, action) {
      // Bath improves cleanliness; small happiness bump
      state.cleanliness = clamp(state.cleanliness + 25);
      state.happiness = clamp(state.happiness + 4);
    },

    goPotty(state, action) {
      // Mark a successful potty (basic)
      const atMs = action?.payload?.atMs ?? nowMs();
      state.potty = {
        ...state.potty,
        successes: (state.potty.successes ?? 0) + 1,
        lastSuccessAt: atMs,
      };
    },

    scoopPoop(state, action) {
      // No yard state tracked here yet – keep as a no-op placeholder
    },

    trainObedience(state, action) {
      // Basic XP award placeholder; UI can display progress
      const xp = Number(action?.payload?.xp ?? 10);
      const cmd = (action?.payload?.commandId || "").toString();

      // Global XP
      state.xp = Math.max(0, state.xp + xp);

      // Per-command XP/leveling
      if (cmd && state.skills?.obedience?.[cmd]) {
        const node = state.skills.obedience[cmd];
        node.xp = Math.max(0, (node.xp || 0) + xp);
        const needed = (node.level || 1) * SKILL_LEVEL_STEP;
        if (node.xp >= needed) {
          node.level = (node.level || 1) + 1;
          node.xp = node.xp - needed;
        }
      }

      // Adult daily training session logging if special routine command used
      if (cmd === "routine_session") {
        const todayIso = toISODate(nowMs());
        if (!state.training) {
          state.training = {
            adult: {
              lastCompletedDate: null,
              streak: 0,
              misses: 0,
              lastPenaltyDate: null,
            },
            potty: { goal: 8, successCount: 0, completedAt: null },
          };
        }
        const adult = state.training.adult || {
          lastCompletedDate: null,
          streak: 0,
          misses: 0,
          lastPenaltyDate: null,
        };

        const last = adult.lastCompletedDate;
        if (!last) {
          adult.streak = 1;
          adult.lastCompletedDate = todayIso;
        } else if (last === todayIso) {
          // already logged today; keep streak as-is
        } else {
          const lastDateMs = new Date(last).getTime();
          const todayMs = new Date(todayIso).getTime();
          const diffDays = Math.round(
            (todayMs - lastDateMs) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 1) {
            adult.streak = (adult.streak || 0) + 1;
          } else if (diffDays > 1) {
            adult.misses = (adult.misses || 0) + (diffDays - 1);
            adult.streak = 1; // reset
            adult.lastPenaltyDate = todayIso;
          }
          adult.lastCompletedDate = todayIso;
        }
        state.training.adult = adult;
      }
    },

    respondToDogPoll(state, action) {
      // Placeholder for poll interactions
    },
  },
});

export const {
  resetDogState,
  setDogName,
  setBreed,
  setAdoptedAt,
  registerSessionStart,
  registerSessionEnd,
  tickDogNeeds,
  adjustNeeds,
  awardXp,
  registerPottySuccess,
  registerPottyAccident,
  hydrateFromSnapshot,
  markHydrated,
  // simple actions for UI wiring
  feed,
  play,
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
} = dogSlice.actions;

/* SELECTORS */

export const selectDog = (state) => state.dog;

export const selectHasDog = (state) => Boolean(state.dog?.adoptedAtMs);

export const selectDogName = (state) => state.dog?.name ?? "Pup";

export const selectDogNeeds = (state) => ({
  hunger: state.dog.hunger,
  happiness: state.dog.happiness,
  energy: state.dog.energy,
  cleanliness: state.dog.cleanliness,
});

export const selectDogLevelInfo = (state) => ({
  level: state.dog.level,
  xp: state.dog.xp,
  nextLevelXp: state.dog.level * LEVEL_XP_STEP,
});

export const selectDogMoodLabel = (state) => computeMoodLabel(state.dog);

export const selectTemperament = (state) => state.dog.temperament;

export const selectPotty = (state) => state.dog.potty;

export const selectDogStats = (state) => state.dog.stats;

export const selectDogTraining = (state) =>
  state.dog?.training || { adult: {}, potty: {} };
export const selectDogSkills = (state) =>
  state.dog?.skills || { obedience: {} };

export const selectDogHydrated = (state) => state.dog.hydratedFromStorage;

// Derived selectors expected by views
export const selectDogLifeStage = (state) => {
  const adopted = state.dog?.adoptedAtMs;
  if (!adopted) return { stage: "PUPPY", label: "Puppy", days: 0 };
  const days = Math.max(
    0,
    Math.floor((Date.now() - adopted) / (1000 * 60 * 60 * 24)),
  );
  const stage = days < 30 ? "PUPPY" : days < 360 ? "ADULT" : "SENIOR";
  const label =
    stage === "PUPPY" ? "Puppy" : stage === "ADULT" ? "Adult" : "Senior";
  return { stage, label, days };
};

export const selectDogCleanlinessTier = (state) => {
  const c = Number(state.dog?.cleanliness ?? 0);
  if (c >= 80) return "FRESH";
  if (c >= 50) return "DIRTY";
  if (c >= 20) return "FLEAS";
  return "MANGE";
};

/** @returns {{active: any}} */
export const selectDogPolls = () => ({ active: null });

// (selectDogTraining defined above)

export default dogSlice.reducer;
