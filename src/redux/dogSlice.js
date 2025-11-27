// src/redux/dogSlice.js
// Doggerz: Central Redux slice for all dog state logic.
// Usage: import dogReducer, {
//   selectDog,
//   selectDogLifeStage,
//   selectDogTraining,
//   selectDogPolls,
//   hydrateDog,
//   setDogName,
//   setAdoptedAt,
//   feed,
//   play,
//   bathe,
//   goPotty,
//   scoopPoop,
//   trainObedience,
//   respondToDogPoll,
// } from "@/redux/dogSlice.js";
//
// All care actions follow the documented reducer pattern:
// 1. applyDecay(state, now)
// 2. mutate stats/training/memory
// 3. applyXp(state, xp)
// 4. maybeSampleMood(state, now, tag)
// 5. updateStreak(state.streak, isoDate)
// 6. updateTemperamentReveal(state, now)
// 7. finalizeDerivedState(state, now)
//
// No server calls here. All cloud sync is done via thunks in dogThunks.js.
// @ts-nocheck

import { createSlice, createSelector } from "@reduxjs/toolkit";
import { calculateDogAge } from "@/utils/lifecycle.js";
import {
  LIFECYCLE_STAGE_MODIFIERS,
  CLEANLINESS_THRESHOLDS,
  CLEANLINESS_TIER_EFFECTS,
  DOG_POLL_CONFIG,
  GAME_DAYS_PER_REAL_DAY,
} from "@/constants/game.js";

export const DOG_STORAGE_KEY = "doggerz:dogState";

// --- Time & math helpers ----------------------------------------------------

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};

const DECAY_SPEED = 0.65; // accelerates decay to feel more "alive"

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;
const SKILL_LEVEL_STEP = 50;
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const nowMs = () => Date.now();
const toIsoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / MS_PER_DAY;
};

const getGameAgeDays = (adoptedAt, now) => {
  if (!adoptedAt) return 0;
  const realDays = getDaysBetween(adoptedAt, now);
  return realDays * GAME_DAYS_PER_REAL_DAY;
};

// --- Initial state factories -------------------------------------------------

const createInitialStats = () => ({
  hunger: 100,
  happiness: 100,
  energy: 100,
  cleanliness: 100,
});

const createInitialSkills = () => ({
  obedience: {
    sit: { level: 0, xp: 0 },
    stay: { level: 0, xp: 0 },
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
  },
});

const createInitialTemperament = () => ({
  traits: {
    clingy: 0,
    toyObsessed: 0,
    foodMotivated: 0,
  },
  primaryLabel: null,
  secondaryLabel: null,
  revealReady: false,
  revealedAt: null,
  lastEvaluatedAt: null,
});

const createInitialStreak = () => ({
  current: 0,
  best: 0,
  lastDate: null,
});

const createInitialMood = () => ({
  lastMoodSampleAt: null,
  lastTag: "neutral",
  samples: [], // { at, tag, hunger, happiness, energy, cleanliness }
});

const createInitialMemory = () => ({
  lastFedAt: null,
  lastPlayedAt: null,
  lastRestedAt: null,
  lastBathAt: null,
  lastPottyAt: null,
  lastAccidentAt: null,
  lastTrainingAt: null,
  lastSeenAt: null,
});

const createInitialTraining = () => ({
  puppy: {
    potty: {
      successes: 0,
      attempts: 0,
      completedAt: null,
    },
  },
  adult: {
    obedienceDrill: {
      lastDrillDate: null,
      streak: 0,
      longestStreak: 0,
      missedDays: 0,
    },
  },
});

const createInitialPolls = () => ({
  queue: [],
  lastPollAt: null,
});

const createInitialDebug = () => ({
  enabled: false,
});

const createInitialDogState = () => ({
  id: null,
  name: "Pup",
  breed: "Jack Russell (default)",
  level: 1,
  xp: 0,
  coins: 0,

  adoptedAt: null,
  createdAt: null,
  lastUpdatedAt: null,

  lifeStage: "puppy", // "puppy" | "adult" | "senior"
  lifeStageLabel: "Puppy",
  ageDays: 0,

  stats: createInitialStats(),
  cleanlinessTier: "FRESH", // "FRESH" | "DIRTY" | "FLEAS" | "MANGE"

  temperament: createInitialTemperament(),
  skills: createInitialSkills(),
  streak: createInitialStreak(),
  mood: createInitialMood(),
  memory: createInitialMemory(),
  training: createInitialTraining(),
  polls: createInitialPolls(),
  journal: [],

  debug: createInitialDebug(),
});

// --- Journal & mood helpers --------------------------------------------------

function pushJournalEntry(state, entry, now) {
  const createdAt = entry.createdAt ?? now ?? nowMs();
  const id = entry.id ?? `${createdAt}-${state.journal.length}`;

  state.journal.push({
    id,
    createdAt,
    type: entry.type ?? "note",
    moodTag: entry.moodTag ?? null,
    summary: entry.summary ?? "",
    body: entry.body ?? "",
  });

  if (state.journal.length > 200) {
    state.journal.splice(0, state.journal.length - 200);
  }
}

function maybeSampleMood(state, now, tag) {
  const mood = state.mood || (state.mood = createInitialMood());
  const last = mood.lastMoodSampleAt;

  if (last && now - last < MOOD_SAMPLE_MINUTES * MS_PER_MINUTE) {
    // too soon to sample again
    mood.lastTag = tag || mood.lastTag;
    return;
  }

  const sample = {
    at: now,
    tag: tag || mood.lastTag || "neutral",
    hunger: state.stats.hunger,
    happiness: state.stats.happiness,
    energy: state.stats.energy,
    cleanliness: state.stats.cleanliness,
  };

  mood.samples.push(sample);
  if (mood.samples.length > 100) {
    mood.samples.splice(0, mood.samples.length - 100);
  }

  mood.lastMoodSampleAt = now;
  mood.lastTag = sample.tag;
}

// --- XP & leveling -----------------------------------------------------------

function applyXp(state, amount) {
  if (!amount || !Number.isFinite(amount)) return;
  state.xp = Math.max(0, (state.xp ?? 0) + amount);

  let leveledUp = false;
  while (state.xp >= LEVEL_XP_STEP) {
    state.xp -= LEVEL_XP_STEP;
    state.level += 1;
    state.coins += 10; // small reward per level
    leveledUp = true;
  }

  if (leveledUp) {
    const now = nowMs();
    pushJournalEntry(
      state,
      {
        type: "level-up",
        moodTag: "proud",
        summary: `Level ${state.level}`,
        body: `Your pup reached level ${state.level}!`,
      },
      now,
    );
  }
}

function gainSkillXp(state, commandId, xp) {
  if (!commandId || !xp) return;
  const skills = state.skills?.obedience || (state.skills.obedience = {});
  const skill =
    skills[commandId] ||
    (skills[commandId] = {
      level: 0,
      xp: 0,
    });

  skill.xp += xp;

  let leveled = false;
  while (skill.xp >= SKILL_LEVEL_STEP) {
    skill.xp -= SKILL_LEVEL_STEP;
    skill.level += 1;
    leveled = true;
  }

  if (leveled) {
    const now = nowMs();
    pushJournalEntry(
      state,
      {
        type: "skill-up",
        moodTag: "focused",
        summary: `${commandId} → Lv.${skill.level}`,
        body: `Your pup improved the ${commandId} command to level ${skill.level}.`,
      },
      now,
    );
  }
}

// --- Streak & daily tracking -------------------------------------------------

function updateStreak(streak, isoDate) {
  if (!isoDate) return;
  if (!streak.lastDate) {
    streak.lastDate = isoDate;
    streak.current = 1;
    streak.best = 1;
    return;
  }

  if (streak.lastDate === isoDate) {
    // same day, nothing changes
    return;
  }

  const last = new Date(streak.lastDate);
  const current = new Date(isoDate);
  const diffDays = Math.round(
    (current.getTime() - last.getTime()) / MS_PER_DAY,
  );

  if (diffDays === 1) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }

  if (streak.current > streak.best) {
    streak.best = streak.current;
  }

  streak.lastDate = isoDate;
}

// --- Cleanliness tiers -------------------------------------------------------

function syncCleanlinessTier(state) {
  const value = clamp(state.stats.cleanliness);

  // Expect CLEANLINESS_THRESHOLDS to look like:
  // { FRESH: 80, DIRTY: 50, FLEAS: 30, MANGE: 15 }
  const t = CLEANLINESS_THRESHOLDS || {};
  let tier = "FRESH";

  if (value < t.MANGE) tier = "MANGE";
  else if (value < t.FLEAS) tier = "FLEAS";
  else if (value < t.DIRTY) tier = "DIRTY";
  else tier = "FRESH";

  state.cleanlinessTier = tier;
}

// --- Temperament evaluation --------------------------------------------------

function bumpTrait(temperament, key, delta) {
  if (!temperament.traits[key] && temperament.traits[key] !== 0) {
    temperament.traits[key] = 0;
  }
  temperament.traits[key] = clamp(temperament.traits[key] + delta, 0, 100);
}

function evaluateTemperament(state, now) {
  const temperament =
    state.temperament || (state.temperament = createInitialTemperament());

  // Only re-evaluate about once per day
  if (
    temperament.lastEvaluatedAt &&
    now - temperament.lastEvaluatedAt < MS_PER_DAY
  ) {
    return;
  }

  const mem = state.memory || createInitialMemory();
  const stats = state.stats;

  // Simple heuristic based on recent care:
  const hoursSinceFed =
    mem.lastFedAt != null ? (now - mem.lastFedAt) / MS_PER_HOUR : Infinity;
  const hoursSincePlayed =
    mem.lastPlayedAt != null
      ? (now - mem.lastPlayedAt) / MS_PER_HOUR
      : Infinity;
  const hoursSinceSeen =
    mem.lastSeenAt != null ? (now - mem.lastSeenAt) / MS_PER_HOUR : Infinity;

  // Food motivated: fed often + good hunger
  if (hoursSinceFed < 6 && stats.hunger > 70) {
    bumpTrait(temperament, "foodMotivated", 2);
  } else if (hoursSinceFed > 18 || stats.hunger < 30) {
    bumpTrait(temperament, "foodMotivated", -1);
  }

  // Toy obsessed: played with often + high happiness
  if (hoursSincePlayed < 6 && stats.happiness > 70) {
    bumpTrait(temperament, "toyObsessed", 2);
  } else if (hoursSincePlayed > 18 || stats.happiness < 40) {
    bumpTrait(temperament, "toyObsessed", -1);
  }

  // Clingy: long gaps without interaction or low happiness
  if (hoursSinceSeen > 24 || stats.happiness < 40) {
    bumpTrait(temperament, "clingy", 2);
  } else if (hoursSinceSeen < 8 && stats.happiness > 70) {
    bumpTrait(temperament, "clingy", -1);
  }

  // Derive primary/secondary labels from highest traits
  const traitEntries = Object.entries(temperament.traits);
  traitEntries.sort((a, b) => b[1] - a[1]);

  const [first, second] = traitEntries;
  let primaryLabel = null;
  let secondaryLabel = null;

  const mapTraitToLabel = (traitKey) => {
    switch (traitKey) {
      case "toyObsessed":
        return "SPICY";
      case "clingy":
        return "SWEET";
      case "foodMotivated":
        return "CHILL";
      default:
        return null;
    }
  };

  if (first && first[1] >= 20) {
    primaryLabel = mapTraitToLabel(first[0]);
  }
  if (second && second[1] >= 20 && second[0] !== first[0]) {
    secondaryLabel = mapTraitToLabel(second[0]);
  }

  temperament.primaryLabel = primaryLabel;
  temperament.secondaryLabel = secondaryLabel;
  temperament.lastEvaluatedAt = now;
}

function updateTemperamentReveal(state, now) {
  const temperament =
    state.temperament || (state.temperament = createInitialTemperament());
  if (!state.adoptedAt || temperament.revealReady) return;

  const ageDays = getGameAgeDays(state.adoptedAt, now);
  if (ageDays >= 3) {
    temperament.revealReady = true;
    temperament.revealedAt = now;
  }
}

// --- Decay -------------------------------------------------------------------

/**
 * Apply time-based stat decay based on elapsed time since lastUpdatedAt.
 * @param {object} state
 * @param {number} now
 * @param {{ bladderModel?: "realistic"|"meals", difficultyMultiplier?: number }} opts
 */
function applyDecay(state, now, opts = {}) {
  const { difficultyMultiplier = 1 } = opts;

  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  const elapsedMs = now - state.lastUpdatedAt;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return;

  const elapsedHours = (elapsedMs / MS_PER_HOUR) * DECAY_SPEED;

  const stageMods =
    (state.lifeStage && LIFECYCLE_STAGE_MODIFIERS[state.lifeStage]) || {};
  const tierEffects =
    (state.cleanlinessTier &&
      CLEANLINESS_TIER_EFFECTS[state.cleanlinessTier]) ||
    {};

  const tierDecayMult = tierEffects.decayMultiplier || 1;

  ["hunger", "happiness", "energy", "cleanliness"].forEach((key) => {
    const baseRate = DECAY_PER_HOUR[key] || 0;
    if (!baseRate) return;

    const stageMult = stageMods[`${key}DecayMultiplier`] || 1;
    const effectiveRate =
      baseRate * stageMult * difficultyMultiplier * tierDecayMult;

    const delta = effectiveRate * elapsedHours;
    const current = state.stats[key] ?? 0;
    state.stats[key] = clamp(current - delta);
  });

  state.lastUpdatedAt = now;
}

// --- Derived state sync ------------------------------------------------------

function finalizeDerivedState(state, now) {
  if (!now) now = nowMs();

  // Age + life stage
  if (state.adoptedAt) {
    const ageInfo = calculateDogAge(state.adoptedAt, now) || {};
    // calculateDogAge is expected to return { lifeStage, label, ageDays }
    state.lifeStage = ageInfo.lifeStage || ageInfo.stage || state.lifeStage;
    state.lifeStageLabel = ageInfo.label || state.lifeStageLabel;
    state.ageDays = ageInfo.ageDays ?? state.ageDays;
  } else {
    state.lifeStage = state.lifeStage || "puppy";
    state.lifeStageLabel = state.lifeStageLabel || "Puppy";
  }

  // Cleanliness tier
  syncCleanlinessTier(state);

  // Temperament evolution
  evaluateTemperament(state, now);
}

// --- Polls (very light scaffolding) -----------------------------------------

// Use DOG_POLL_CONFIG later for richer poll logic; we just keep queue minimal
function removePollFromQueue(state, pollId) {
  if (!pollId || !state.polls?.queue) return;
  state.polls.queue = state.polls.queue.filter((p) => p.id !== pollId);
}

// --- Slice -------------------------------------------------------------------

const initialState = createInitialDogState();

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      // Merge payload over initial state; defensive on shape.
      const base = createInitialDogState();

      const merged = {
        ...base,
        ...payload,
        stats: {
          ...base.stats,
          ...(payload?.stats || {}),
        },
        temperament: {
          ...base.temperament,
          ...(payload?.temperament || {}),
          traits: {
            ...base.temperament.traits,
            ...(payload?.temperament?.traits || {}),
          },
        },
        skills: {
          ...base.skills,
          ...(payload?.skills || {}),
          obedience: {
            ...base.skills.obedience,
            ...(payload?.skills?.obedience || {}),
          },
        },
        streak: {
          ...base.streak,
          ...(payload?.streak || {}),
        },
        mood: {
          ...base.mood,
          ...(payload?.mood || {}),
        },
        memory: {
          ...base.memory,
          ...(payload?.memory || {}),
        },
        training: {
          ...base.training,
          ...(payload?.training || {}),
        },
        polls: {
          ...base.polls,
          ...(payload?.polls || {}),
        },
        debug: {
          ...base.debug,
          ...(payload?.debug || {}),
        },
      };

      Object.assign(state, merged);
      const now = nowMs();
      finalizeDerivedState(state, now);
      if (!state.lastUpdatedAt) {
        state.lastUpdatedAt = now;
      }
    },

    toggleDebug(state) {
      state.debug.enabled = !state.debug.enabled;
    },

    setDogName(state, { payload }) {
      state.name = (payload || "").trim() || "Pup";
    },

    setAdoptedAt(state, { payload }) {
      const when = payload ?? nowMs();
      state.adoptedAt = when;
      if (!state.createdAt) {
        state.createdAt = when;
      }
      finalizeDerivedState(state, when);
    },

    // --- Core care actions ---------------------------------------------------

    feed(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const amount = payload?.amount ?? 25;
      state.stats.hunger = clamp(state.stats.hunger + amount);
      state.stats.happiness = clamp(state.stats.happiness + 5);

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 10);
      maybeSampleMood(state, now, "fed");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "care-feed",
          moodTag: "fed",
          summary: "You fed your pup",
          body: "A meal was served. Belly: happier, life: slightly less chaotic.",
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const happinessGain = payload?.happiness ?? 20;
      const energyCost = payload?.energyCost ?? 10;

      state.stats.happiness = clamp(state.stats.happiness + happinessGain);
      state.stats.energy = clamp(state.stats.energy - energyCost);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 10);
      maybeSampleMood(state, now, "playful");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "care-play",
          moodTag: "playful",
          summary: "Playtime!",
          body: "You played with your pup. Toys have feelings too, probably.",
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.stats.cleanliness = 100;
      state.stats.happiness = clamp(state.stats.happiness - 5); // baths are suspicious
      state.memory.lastBathAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 8);
      maybeSampleMood(state, now, "fresh");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "care-bath",
          moodTag: "fresh",
          summary: "Bath time",
          body: "Soap happened. Dignity may or may not recover.",
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      // For now, treat every commanded potty as a success. Later, you can
      // gate this with bladder pressure or timing windows.
      const potty = state.training.puppy.potty;
      potty.attempts += 1;
      if (potty.successes < 8) {
        potty.successes += 1;
      }

      if (!potty.completedAt && potty.successes >= 8) {
        potty.completedAt = now;
        pushJournalEntry(
          state,
          {
            type: "training-potty-complete",
            moodTag: "proud",
            summary: "Potty training complete",
            body: "Your pup reliably heads outside now. Accident rate will drop.",
          },
          now,
        );
      } else {
        pushJournalEntry(
          state,
          {
            type: "training-potty",
            moodTag: "relieved",
            summary: "Successful potty break",
            body: "You guided your pup to the right spot. Floors remain safe.",
          },
          now,
        );
      }

      state.memory.lastPottyAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 12);
      maybeSampleMood(state, now, "relieved");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      finalizeDerivedState(state, now);
    },

    scoopPoop(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 10);
      state.memory.lastAccidentAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 5);
      maybeSampleMood(state, now, "grossed");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "care-cleanup",
          moodTag: "grossed",
          summary: "Cleanup duty",
          body: "You handled an accident. Heroic, in a very specific way.",
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    trainObedience(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const commandId = payload?.commandId || "sit";
      applyDecay(state, now);

      gainSkillXp(state, commandId, payload?.xp ?? 10);

      const adultDrill = state.training.adult.obedienceDrill;
      const today = toIsoDate(now);
      if (adultDrill.lastDrillDate !== today) {
        adultDrill.lastDrillDate = today;
        adultDrill.streak += 1;
        if (adultDrill.streak > adultDrill.longestStreak) {
          adultDrill.longestStreak = adultDrill.streak;
        }
      }

      state.memory.lastTrainingAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.bonusXp ?? 5);
      maybeSampleMood(state, now, "focused");
      updateStreak(state.streak, today);
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "training-obedience",
          moodTag: "focused",
          summary: `Obedience drill: ${commandId}`,
          body: `You practiced the ${commandId} command. Reps build reliable behavior.`,
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    respondToDogPoll(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const { pollId, choiceId } = payload || {};

      applyDecay(state, now);

      // Very light treatment: remove from queue, record timestamp.
      removePollFromQueue(state, pollId);
      state.polls.lastPollAt = now;
      state.memory.lastSeenAt = now;

      applyXp(state, payload?.xp ?? 3);
      maybeSampleMood(state, now, "curious");
      updateStreak(state.streak, toIsoDate(now));
      updateTemperamentReveal(state, now);

      pushJournalEntry(
        state,
        {
          type: "dog-poll",
          moodTag: "curious",
          summary: "You answered a dog poll",
          body: `Poll ${pollId || ""} was answered with choice ${
            choiceId || ""
          }. Future builds can shape temperament or events from this.`,
        },
        now,
      );

      finalizeDerivedState(state, now);
    },

    // --- Engine tick (driven by DogAIEngine) ---------------------------------

    engineTick(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const bladderModel = payload?.bladderModel || "realistic";
      const difficultyMultiplier = payload?.difficultyMultiplier ?? 1;

      // For now, bladderModel is just a hint; actual bladder logic
      // can live in applyDecay or a dedicated bladder system.
      applyDecay(state, now, { bladderModel, difficultyMultiplier });

      // Mood sample tagged as "tick" so we can track passive history
      maybeSampleMood(state, now, "tick");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },
  },
});

// --- Selectors ---------------------------------------------------------------

export const selectDog = (state) => state.dog;

export const selectDogStats = (state) => state.dog.stats;

export const selectDogLifeStage = createSelector(
  [
    (state) => state.dog.lifeStage,
    (state) => state.dog.lifeStageLabel,
    (state) => state.dog.ageDays,
  ],
  (lifeStage, lifeStageLabel, ageDays) => ({
    lifeStage,
    lifeStageLabel,
    ageDays,
  }),
);

export const selectDogTraining = (state) => state.dog.training;

export const selectDogPolls = (state) => state.dog.polls;

export const selectDogMood = (state) => state.dog.mood;

export const selectDogTemperament = (state) => state.dog.temperament;

// --- Exports -----------------------------------------------------------------
// Selector for skills
export const selectDogSkills = (state) => state.dog.skills;
// Selector for cleanlinessTier
export const selectDogCleanlinessTier = (state) => state.dog.cleanlinessTier;

export const {
  hydrateDog,
  toggleDebug,
  setDogName,
  setAdoptedAt,
  feed,
  play,
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
  engineTick,
} = dogSlice.actions;

const dogReducer = dogSlice.reducer;
export default dogReducer;
