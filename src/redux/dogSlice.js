/** @format */

// src/redux/dogSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { calculateDogAge } from "@/utils/lifecycle.js";
import { CLEANLINESS_TIER_EFFECTS, LIFE_STAGES } from "@/constants/game.js";

export const DOG_STORAGE_KEY = "doggerz:dogState";

// Local persistence schema marker (kept here so cloud/local persistence can version safely).
export const DOG_SAVE_SCHEMA_VERSION = 1;

/* ------------------- small helpers / constants ------------------- */

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const DECAY_PER_HOUR = {
  hunger: 8,
  happiness: 6,
  energy: 5,
  cleanliness: 3,
};
const DECAY_SPEED = 0.65;

const MOOD_SAMPLE_MINUTES = 60;
const LEVEL_XP_STEP = 100;
const SKILL_LEVEL_STEP = 50;

// Vacation mode: reduces decay + slows aging while you’re away.
// multiplier: 0..1 (0 = frozen, 1 = normal)
const DEFAULT_VACATION_STATE = Object.freeze({
  enabled: false,
  multiplier: 0.35,
  startedAt: null,
  skippedMs: 0,
});

const nowMs = () => Date.now();

function parseAdoptedAt(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === "string") {
    const numeric = Number(raw);
    if (!Number.isNaN(numeric)) return numeric;
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

const getDaysBetween = (fromMs, toMs) => {
  if (!fromMs) return Infinity;
  return (toMs - fromMs) / (1000 * 60 * 60 * 24);
};

const POTTY_TRAINING_GOAL = 8;
const REAL_DAY_MS = 24 * 60 * 60 * 1000;
const POTTY_TRAINED_POTTY_GAIN_MULTIPLIER = 0.65;

// Cleanliness value → tier
const CLEANLINESS_THRESHOLDS = {
  FRESH: 70,
  DIRTY: 40,
  FLEAS: 20,
};

// Stage-based stat multipliers
const LIFECYCLE_STAGE_MODIFIERS = {
  [LIFE_STAGES.PUPPY]: {
    hunger: 1.15,
    happiness: 1.0,
    energy: 1.0,
    cleanliness: 1.1,
  },
  [LIFE_STAGES.ADULT]: {
    hunger: 1.0,
    happiness: 1.0,
    energy: 1.0,
    cleanliness: 1.0,
  },
  [LIFE_STAGES.SENIOR]: {
    hunger: 0.9,
    happiness: 0.9,
    energy: 1.1,
    cleanliness: 1.0,
  },
};

const DEFAULT_LIFE_STAGE = {
  stage: LIFE_STAGES.PUPPY,
  label: "Puppy",
  days: 0,
};

// Simple dog poll config; you can tune this later
const DOG_POLL_CONFIG = {
  intervalMs: 10 * 60 * 1000, // spawn roughly every 10 minutes of active play
  timeoutMs: 60 * 1000, // 60s to answer
  prompts: [
    {
      id: "water",
      prompt: "Can we swap my water for something fresh?",
      effects: { happiness: 4, cleanliness: 1 },
    },
    {
      id: "toy",
      prompt: "Can we play with my favorite toy for a bit?",
      effects: { happiness: 8, energy: -6 },
    },
    {
      id: "rest",
      prompt: "I’m kinda wiped… can we chill for a bit?",
      effects: { energy: 10, happiness: 2 },
    },
  ],
};

/* ------------------- initial sub-structures ------------------- */

const initialTemperament = {
  primary: "SPICY",
  secondary: "SWEET",
  traits: [
    { id: "clingy", label: "Clingy", intensity: 70 },
    { id: "toyObsessed", label: "Toy-Obsessed", intensity: 60 },
    { id: "foodMotivated", label: "Food-Motivated", intensity: 55 },
  ],
  revealedAt: null,
  revealReady: false,
  adoptedAt: null,
  lastEvaluatedAt: null,
};

// Personality is a separate, player-shaped system (five axes) and can evolve frequently.
// Trait values are in range [-100, 100]. Positive leans toward the right-hand label.
const initialPersonality = {
  traits: {
    adventurous: 0, // Adventurous (+) ↔ Cautious (-)
    social: 0, // Social (+) ↔ Independent (-)
    energetic: 0, // Energetic (+) ↔ Calm (-)
    playful: 0, // Playful (+) ↔ Serious (-)
    affectionate: 0, // Affectionate (+) ↔ Reserved (-)
  },
  // Most recent first
  history: [],
  lastUpdatedAt: null,
  // Hint for future animation hooks (kept simple + optional)
  animationHint: null,
};

const initialMemory = {
  favoriteToyId: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastBathedAt: null,
  lastTrainedAt: null,
  lastSeenAt: null,
  neglectStrikes: 0,
};

const initialCareer = {
  lifestyle: null,
  chosenAt: null,
  perks: {
    hungerDecayMultiplier: 1.0,
    happinessGainMultiplier: 1.0,
    trainingXpMultiplier: 1.0,
  },
};

const initialSkills = {
  obedience: {
    sit: { level: 0, xp: 0 },
    stay: { level: 0, xp: 0 },
    rollOver: { level: 0, xp: 0 },
    speak: { level: 0, xp: 0 },
  },
};

const initialMood = {
  lastSampleAt: null,
  history: [],
};

const initialDreams = {
  active: null,
  journal: [],
  lastGeneratedAt: null,
};

const initialJournal = {
  entries: [],
};

const initialStreak = {
  currentStreakDays: 0,
  bestStreakDays: 0,
  lastActiveDate: null,
};

const initialBond = {
  value: 0,
  updatedAt: null,
};

const initialMemorial = {
  active: false,
  startedAt: null,
  completedAt: null,
};

const initialCosmetics = {
  unlockedIds: [],
  equipped: {
    collar: null,
    tag: null,
    backdrop: null,
  },
};

const DEFAULT_COSMETIC_CATALOG = Object.freeze([
  { id: "collar_leaf", slot: "collar", threshold: 3, label: "Leaf Collar" },
  { id: "collar_neon", slot: "collar", threshold: 7, label: "Neon Collar" },
  { id: "tag_star", slot: "tag", threshold: 10, label: "Star Tag" },
  {
    id: "backdrop_sunset",
    slot: "backdrop",
    threshold: 14,
    label: "Sunset Backdrop",
  },
]);

function createInitialTrainingState() {
  return {
    potty: {
      successCount: 0,
      goal: POTTY_TRAINING_GOAL,
      completedAt: null,
    },
    adult: {
      lastCompletedDate: null,
      streak: 0,
      misses: 0,
      lastPenaltyDate: null,
    },
  };
}

/* ------------------- root initialState ------------------- */

const initialState = {
  name: "Pup",
  level: 1,
  xp: 0,
  coins: 0,
  adoptedAt: null,
  lifeStage: { ...DEFAULT_LIFE_STAGE },

  // Potty gauge + counters
  pottyLevel: 0,
  potty: {
    training: 0, // 0–100: how potty-trained overall (meta)
    lastSuccessAt: null,
    lastAccidentAt: null,
    totalSuccesses: 0,
    totalAccidents: 0,
  },

  stats: {
    hunger: 50,
    happiness: 60,
    energy: 60,
    cleanliness: 60,
  },

  cleanlinessTier: "FRESH",
  poopCount: 0,

  isAsleep: false,
  debug: false,
  lastUpdatedAt: null,

  vacation: { ...DEFAULT_VACATION_STATE },

  // Used by UI renderers/selectors to derive simple animation hints
  lastAction: null,

  temperament: initialTemperament,
  personality: initialPersonality,
  memory: initialMemory,
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  dreams: initialDreams,
  journal: initialJournal,
  streak: initialStreak,
  training: createInitialTrainingState(),

  // Relationship / collectibles (used by Store + Rainbow Bridge pages)
  bond: initialBond,
  memorial: initialMemorial,
  cosmetics: initialCosmetics,

  polls: {
    active: null,
    lastPromptId: null,
    lastSpawnedAt: null,
    lastResolvedAt: null,
    history: [],
  },
};

/* ------------------- helpers ------------------- */

function pushJournalEntry(state, entry) {
  const ts = entry.timestamp ?? nowMs();
  const id = `${ts}-${state.journal.entries.length + 1}`;

  state.journal.entries.unshift({
    id,
    timestamp: ts,
    type: entry.type || "INFO",
    moodTag: entry.moodTag || null,
    summary: entry.summary || "",
    body: entry.body || "",
  });

  if (state.journal.entries.length > 200) {
    state.journal.entries.length = 200;
  }
}

function ensureDreamState(state) {
  if (!state.dreams || typeof state.dreams !== "object") {
    state.dreams = { ...initialDreams };
  }
  if (!Array.isArray(state.dreams.journal)) {
    state.dreams.journal = [];
  }
  if (!("active" in state.dreams)) state.dreams.active = null;
  if (typeof state.dreams.lastGeneratedAt !== "number") {
    state.dreams.lastGeneratedAt = null;
  }
  return state.dreams;
}

function pushDream(state, dream) {
  const dreams = ensureDreamState(state);
  dreams.journal.unshift(dream);
  if (dreams.journal.length > 100) dreams.journal.length = 100;
}

function buildDreamFromState(state, now = nowMs()) {
  const happiness = Number(state.stats?.happiness || 0);
  const hunger = Number(state.stats?.hunger || 0);
  const energy = Number(state.stats?.energy || 0);
  const cleanliness = Number(state.stats?.cleanliness || 0);
  const neglect = Number(state.memory?.neglectStrikes || 0);

  const isNeglected = neglect > 0 && happiness < 45;
  const isLucid = !isNeglected && happiness > 82 && hunger < 60;

  const kind = isNeglected ? "NIGHTMARE" : isLucid ? "LUCID" : "DREAM";

  const lastAction = String(state.lastAction || "").toLowerCase();

  const withinMs = (t, ms) => typeof t === "number" && now - t <= ms;
  const playedRecently = withinMs(
    state.memory?.lastPlayedAt,
    4 * 60 * 60 * 1000
  );
  const fedRecently = withinMs(state.memory?.lastFedAt, 4 * 60 * 60 * 1000);
  const trainedRecently = withinMs(
    state.memory?.lastTrainedAt,
    24 * 60 * 60 * 1000
  );
  const bathedRecently = withinMs(
    state.memory?.lastBathedAt,
    24 * 60 * 60 * 1000
  );

  let title = "A soft dream";
  let summary = "Floating through a pastel backyard full of squeaky secrets.";
  let motifs = ["clouds", "fireflies", "soft grass"];

  if (kind === "NIGHTMARE") {
    title = "A worried dream";
    summary =
      "The yard feels too big and too quiet. Footsteps echo, and you keep looking for your hooman.";
    motifs = ["empty yard", "distant thunder", "lost leash"];
  } else if (kind === "LUCID") {
    title = "A lucid dream";
    summary =
      "Everything glows. You can jump higher than fences and land on moonbeams like trampoline cushions.";
    motifs = ["moonbeams", "sparkles", "floating tennis balls"];
  }

  // Activity reflections
  if (playedRecently || lastAction === "play") {
    title = kind === "NIGHTMARE" ? "Chasing shadows" : "Chasing squirrels";
    summary =
      kind === "NIGHTMARE"
        ? "You sprint, but the squeak keeps slipping away—like it’s hiding behind the wind."
        : "You chase a legendary squirrel wearing a tiny crown. It squeaks like a tennis ball.";
    motifs = ["squirrels", "tennis balls", "zoomies"];
  } else if (fedRecently || lastAction === "feed") {
    title = kind === "NIGHTMARE" ? "Empty bowl" : "Treat buffet";
    summary =
      kind === "NIGHTMARE"
        ? "The bowl is there… but it’s just out of reach, like a polite ghost."
        : "Biscuits drift like snowflakes. Every chomp makes a happy little *ding*.";
    motifs = ["biscuits", "bowls", "crunchy stars"];
  } else if (trainedRecently || lastAction === "train") {
    title = kind === "NIGHTMARE" ? "Commands in a maze" : "Graduation day";
    summary =
      kind === "NIGHTMARE"
        ? "You try to “sit”… but the floor keeps turning into wiggly grass waves."
        : "You perform perfect “sit” and “stay” while confetti rains down like kibble.";
    motifs = ["whistles", "ribbons", "confetti"];
  } else if (bathedRecently || lastAction === "bathe") {
    title = kind === "NIGHTMARE" ? "Bubbles everywhere" : "Bubble galaxy";
    summary =
      kind === "NIGHTMARE"
        ? "The bubbles rise and rise—pop, pop—until you can’t find your paws."
        : "Bubbles orbit you like tiny planets, and the shampoo smells like comet tails.";
    motifs = ["bubbles", "stardust shampoo", "soft towels"];
  }

  // Small stat seasoning
  if (energy < 25 && kind === "DREAM") {
    motifs = Array.from(new Set([...motifs, "warm blankets"]));
  }
  if (cleanliness < 25 && kind !== "NIGHTMARE") {
    motifs = Array.from(new Set([...motifs, "mud puddles"]));
  }

  return {
    id: `${now}-dream-${Math.floor(Math.random() * 1e6)}`,
    timestamp: now,
    kind,
    title,
    summary,
    motifs,
  };
}

function maybeGenerateDream(state, now = nowMs()) {
  const dreams = ensureDreamState(state);
  if (dreams.active) return;

  const last = dreams.lastGeneratedAt;
  // Prevent “spam dreams” if player taps Rest repeatedly.
  if (last && now - last < 2 * 60 * 60 * 1000) return;

  const dream = buildDreamFromState(state, now);
  dreams.active = dream;
  dreams.lastGeneratedAt = now;
  pushDream(state, dream);
}

const isValidStat = (key) =>
  ["hunger", "happiness", "energy", "cleanliness"].includes(key);

const clampSigned = (n, limit = 100) =>
  Math.max(-limit, Math.min(limit, Number.isFinite(n) ? n : 0));

const pos01 = (v) => Math.max(0, Math.min(1, v / 100));
const neg01 = (v) => Math.max(0, Math.min(1, -v / 100));

function derivePersonalityAnimationHint(traits) {
  const t = traits || {};
  const energetic = Number(t.energetic || 0);
  const playful = Number(t.playful || 0);
  const adventurous = Number(t.adventurous || 0);
  const affectionate = Number(t.affectionate || 0);
  const social = Number(t.social || 0);

  // Keep hints small and stable; UI/actors may ignore them.
  if (energetic > 60 && playful > 40) return "zoomies";
  if (affectionate > 65) return "cuddle";
  if (adventurous > 60) return "explore";
  if (social > 60) return "greet";
  if (energetic < -60) return "chill";
  return null;
}

function ensurePersonalityState(state) {
  if (!state.personality || typeof state.personality !== "object") {
    state.personality = { ...initialPersonality };
  }
  if (
    !state.personality.traits ||
    typeof state.personality.traits !== "object"
  ) {
    state.personality.traits = { ...initialPersonality.traits };
  } else {
    state.personality.traits = {
      ...initialPersonality.traits,
      ...state.personality.traits,
    };
  }
  if (!Array.isArray(state.personality.history)) {
    state.personality.history = [];
  }
  if (typeof state.personality.lastUpdatedAt !== "number") {
    state.personality.lastUpdatedAt = null;
  }
  if (!("animationHint" in state.personality)) {
    state.personality.animationHint = null;
  }
  return state.personality;
}

function pushPersonalityHistory(state, entry) {
  const personality = ensurePersonalityState(state);
  personality.history.unshift(entry);
  if (personality.history.length > 120) {
    personality.history.length = 120;
  }
}

function applyPersonalityShift(state, { now, source, deltas, note }) {
  const personality = ensurePersonalityState(state);
  const t = personality.traits;
  const d = deltas || {};

  const keys = Object.keys(initialPersonality.traits);
  let changed = false;
  const appliedDeltas = {};

  // Gentle smoothing so traits feel like they “drift” instead of snapping.
  // New value = old + (delta * smoothing)
  const smoothing = 0.65;

  keys.forEach((k) => {
    const raw = Number(d[k] || 0);
    if (!raw) return;
    const prev = Number(t[k] || 0);
    const next = clampSigned(prev + raw * smoothing, 100);
    if (next !== prev) {
      t[k] = next;
      appliedDeltas[k] = Math.round((next - prev) * 10) / 10;
      changed = true;
    }
  });

  if (!changed) return;

  const ts = typeof now === "number" ? now : nowMs();
  personality.lastUpdatedAt = ts;
  personality.animationHint = derivePersonalityAnimationHint(t);

  pushPersonalityHistory(state, {
    id: `${ts}-${personality.history.length + 1}`,
    timestamp: ts,
    source: source || "SYSTEM",
    note: note || null,
    deltas: appliedDeltas,
    snapshot: {
      adventurous: Math.round(Number(t.adventurous || 0)),
      social: Math.round(Number(t.social || 0)),
      energetic: Math.round(Number(t.energetic || 0)),
      playful: Math.round(Number(t.playful || 0)),
      affectionate: Math.round(Number(t.affectionate || 0)),
    },
  });
}

function getStageMultiplier(state, statKey) {
  const stageKey = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  const modifiers =
    LIFECYCLE_STAGE_MODIFIERS[stageKey] ||
    LIFECYCLE_STAGE_MODIFIERS[DEFAULT_LIFE_STAGE.stage] ||
    {};
  return modifiers[statKey] ?? 1;
}

function applyDecay(state, now = nowMs()) {
  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  const diffHours = Math.max(0, (now - state.lastUpdatedAt) / (1000 * 60 * 60));
  if (diffHours <= 0) return;

  const vacation = ensureVacationState(state);
  const decayMultiplier = vacation.enabled
    ? clamp(Number(vacation.multiplier) || 1, 0, 1)
    : 1;
  const effectiveHours = diffHours * decayMultiplier;

  const hungerMultiplier = state.career.perks?.hungerDecayMultiplier || 1.0;

  Object.entries(state.stats).forEach(([key, value]) => {
    if (!isValidStat(key)) return;

    const rate = DECAY_PER_HOUR[key] || 0;
    const stageMultiplier = getStageMultiplier(state, key);
    let delta = rate * DECAY_SPEED * effectiveHours * stageMultiplier;

    if (key === "hunger") {
      delta *= hungerMultiplier;
      state.stats[key] = clamp(value + delta, 0, 100);
    } else {
      state.stats[key] = clamp(value - delta, 0, 100);
    }
  });

  // Vacation mode implies your pup is cared for; we skip neglect strikes/journal.
  if (!vacation.enabled && diffHours >= 24) {
    state.memory.neglectStrikes = Math.min(
      (state.memory.neglectStrikes || 0) + 1,
      999
    );

    // Neglect nudges personality toward cautious/independent/reserved.
    applyPersonalityShift(state, {
      now,
      source: "NEGLECT",
      note: "Stayed away a while",
      deltas: {
        adventurous: -2,
        social: -3,
        affectionate: -3,
        playful: -2,
        energetic: -1,
      },
    });

    pushJournalEntry(state, {
      type: "NEGLECT",
      moodTag: "LONELY",
      summary: "Dear hooman… I missed you.",
      body:
        "Dear hooman,\n\nI wasn’t sure if you were chasing squirrels or just busy, " +
        "but I got pretty lonely while you were gone. Next time, can we play a little sooner?\n\n– your pup",
      timestamp: now,
    });
  }

  state.lastUpdatedAt = now;
}

function maybeSampleMood(state, now = nowMs(), reason = "TICK") {
  const last = state.mood.lastSampleAt;
  if (last && now - last < MOOD_SAMPLE_MINUTES * 60 * 1000) return;

  const { hunger, happiness, energy, cleanliness } = state.stats;

  let tag = "NEUTRAL";
  if (happiness > 75 && hunger < 60) tag = "HAPPY";
  else if (hunger > 75) tag = "HUNGRY";
  else if (energy < 30) tag = "SLEEPY";
  else if (cleanliness < 30) tag = "DIRTY";

  state.mood.history.unshift({
    timestamp: now,
    tag,
    reason,
    hunger: Math.round(hunger),
    happiness: Math.round(happiness),
    energy: Math.round(energy),
    cleanliness: Math.round(cleanliness),
  });

  if (state.mood.history.length > 100) {
    state.mood.history.length = 100;
  }

  state.mood.lastSampleAt = now;
}

function applyXp(state, amount = 10) {
  state.xp += amount;
  const targetLevel = 1 + Math.floor(state.xp / LEVEL_XP_STEP);
  if (targetLevel > state.level) {
    state.level = targetLevel;
    pushJournalEntry(state, {
      type: "LEVEL_UP",
      moodTag: "HAPPY",
      summary: `Level up! Now level ${state.level}.`,
      body: `Nice work, hooman. I’m now level ${state.level}! New tricks unlocked soon…`,
    });
  }
}

function applySkillXp(skillBranch, skillId, skillState, amount = 5) {
  if (!skillState[skillBranch] || !skillState[skillBranch][skillId]) return;

  const node = skillState[skillBranch][skillId];
  node.xp += amount;

  const targetLevel = Math.floor(node.xp / SKILL_LEVEL_STEP);
  if (targetLevel > node.level) {
    node.level = targetLevel;
  }
}

function updateStreak(streakState, isoDate) {
  const { currentStreakDays, bestStreakDays, lastActiveDate } = streakState;

  if (!isoDate) return;

  if (!lastActiveDate) {
    streakState.currentStreakDays = 1;
    streakState.bestStreakDays = Math.max(bestStreakDays, 1);
    streakState.lastActiveDate = isoDate;
    return;
  }

  if (lastActiveDate === isoDate) {
    return;
  }

  const prev = new Date(lastActiveDate);
  const curr = new Date(isoDate);
  const diffMs = curr.getTime() - prev.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    streakState.currentStreakDays = currentStreakDays + 1;
  } else {
    streakState.currentStreakDays = 1;
  }

  streakState.bestStreakDays = Math.max(
    streakState.bestStreakDays,
    streakState.currentStreakDays
  );
  streakState.lastActiveDate = isoDate;
}

function updateTemperamentReveal(state, now = nowMs()) {
  const adoptedAt = state.temperament.adoptedAt;
  if (!adoptedAt) return;
  if (state.temperament.revealedAt) return;

  const days = getDaysBetween(adoptedAt, now);
  if (days >= 3) {
    state.temperament.revealReady = true;
  }
}

function evaluateTemperament(state, now = nowMs()) {
  const t = state.temperament;

  const lastEval = t.lastEvaluatedAt || t.adoptedAt || 0;
  const days = getDaysBetween(lastEval, now);
  if (days < 1) return;

  const findTrait = (id) => t.traits.find((x) => x.id === id);

  const clingy = findTrait("clingy");
  const toyObsessed = findTrait("toyObsessed");
  const foodMotivated = findTrait("foodMotivated");

  if (!clingy || !toyObsessed || !foodMotivated) {
    console.warn("[Doggerz] Missing temperament traits, skipping evaluation");
    return;
  }

  const hunger = state.stats.hunger;
  const happiness = state.stats.happiness;
  const neglect = state.memory.neglectStrikes || 0;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const playedRecently =
    state.memory.lastPlayedAt && now - state.memory.lastPlayedAt < sevenDaysMs;
  const fedRecently =
    state.memory.lastFedAt &&
    now - state.memory.lastFedAt < 12 * 60 * 60 * 1000;
  const trainedRecently =
    state.memory.lastTrainedAt &&
    now - state.memory.lastTrainedAt < 3 * 24 * 60 * 60 * 1000;

  const obedienceSkills = state.skills?.obedience || {};
  const avgObedienceLevel = (() => {
    const vals = Object.values(obedienceSkills).map((s) => s.level || 0);
    return vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  })();

  const recentMoods = (state.mood?.history || []).slice(0, 10);
  const happyMoodCount = recentMoods.filter((m) => m.tag === "HAPPY").length;
  const hungryMoodCount = recentMoods.filter((m) => m.tag === "HUNGRY").length;
  const moodSentiment = {
    happy: happyMoodCount,
    hungry: hungryMoodCount,
  };

  const recentJournal = (state.journal?.entries || []).slice(0, 20);
  const neglectEntries = recentJournal.filter(
    (e) => e.type === "NEGLECT"
  ).length;

  const targetClingy = clamp(
    Math.round(
      clingy.intensity * 0.65 +
        (100 - happiness) * 0.15 +
        neglect * 8 +
        neglectEntries * 5 +
        (trainedRecently ? -5 : 10)
    ),
    0,
    100
  );

  const targetToy = clamp(
    Math.round(
      toyObsessed.intensity * 0.65 +
        (happiness - 50) * 0.2 +
        (playedRecently ? 12 : 0) +
        moodSentiment.happy * 3 +
        avgObedienceLevel * 0.5
    ),
    0,
    100
  );

  const targetFood = clamp(
    Math.round(
      foodMotivated.intensity * 0.65 +
        (hunger - 50) * 0.25 +
        (fedRecently ? 10 : 0) +
        moodSentiment.hungry * 2 +
        (avgObedienceLevel > 0 ? -3 : 0)
    ),
    0,
    100
  );

  clingy.intensity = Math.round(clingy.intensity * 0.65 + targetClingy * 0.35);
  toyObsessed.intensity = Math.round(
    toyObsessed.intensity * 0.65 + targetToy * 0.35
  );
  foodMotivated.intensity = Math.round(
    foodMotivated.intensity * 0.65 + targetFood * 0.35
  );

  const sorted = [...t.traits].sort((a, b) => b.intensity - a.intensity);
  const top = sorted[0];
  const second = sorted[1] || top;

  const traitToLabel = {
    clingy: "SWEET",
    toyObsessed: "SPICY",
    foodMotivated: "CHILL",
  };

  t.primary = traitToLabel[top.id] || t.primary || "SPICY";
  t.secondary = traitToLabel[second.id] || t.secondary || "SWEET";

  t.lastEvaluatedAt = now;
}

function resolveCleanlinessTierFromValue(value = 0) {
  if (value >= CLEANLINESS_THRESHOLDS.FRESH) return "FRESH";
  if (value >= CLEANLINESS_THRESHOLDS.DIRTY) return "DIRTY";
  if (value >= CLEANLINESS_THRESHOLDS.FLEAS) return "FLEAS";
  return "MANGE";
}

function syncLifecycleState(state, now = nowMs()) {
  const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt || now;
  const ageNow = getVacationAdjustedNow(state, now);
  const age = calculateDogAge(adoptedAt, ageNow);
  state.lifeStage = {
    stage: age.stage || DEFAULT_LIFE_STAGE.stage,
    label: age.label || DEFAULT_LIFE_STAGE.label,
    days: age.days,
  };
  return state.lifeStage;
}

function syncCleanlinessTier(state, now = nowMs()) {
  const cleanliness = state.stats?.cleanliness ?? 0;
  const nextTier = resolveCleanlinessTierFromValue(cleanliness);
  const previousTier = state.cleanlinessTier || "FRESH";

  if (nextTier !== previousTier) {
    state.cleanlinessTier = nextTier;
    const tierEffect = CLEANLINESS_TIER_EFFECTS[nextTier];
    if (tierEffect?.journalSummary) {
      pushJournalEntry(state, {
        type: "CARE",
        moodTag: "DIRTY",
        summary: tierEffect.label || nextTier,
        body: tierEffect.journalSummary,
        timestamp: now,
      });
    }
  } else if (!state.cleanlinessTier) {
    state.cleanlinessTier = nextTier;
  }

  return state.cleanlinessTier;
}

function finalizeDerivedState(state, now = nowMs()) {
  syncLifecycleState(state, now);
  return syncCleanlinessTier(state, now);
}

function ensureVacationState(state) {
  if (!state.vacation || typeof state.vacation !== "object") {
    state.vacation = { ...DEFAULT_VACATION_STATE };
    return state.vacation;
  }

  state.vacation.enabled = Boolean(state.vacation.enabled);

  const mult = Number(state.vacation.multiplier);
  state.vacation.multiplier = Number.isFinite(mult)
    ? clamp(mult, 0, 1)
    : DEFAULT_VACATION_STATE.multiplier;

  if (typeof state.vacation.startedAt !== "number") {
    state.vacation.startedAt = null;
  }

  const skipped = Number(state.vacation.skippedMs);
  state.vacation.skippedMs = Number.isFinite(skipped)
    ? Math.max(0, skipped)
    : 0;

  return state.vacation;
}

function getVacationAdjustedNow(state, now = nowMs()) {
  const v = ensureVacationState(state);
  const baseSkipped = Number(v.skippedMs) || 0;

  if (!v.enabled || typeof v.startedAt !== "number") {
    return Math.max(0, now - baseSkipped);
  }

  const mult = clamp(Number(v.multiplier) || 1, 0, 1);
  const liveMs = Math.max(0, now - v.startedAt);
  const liveSkipped = liveMs * (1 - mult);
  return Math.max(0, now - baseSkipped - liveSkipped);
}

function getPersonalityPerks(state) {
  const personality = ensurePersonalityState(state);
  const t = personality.traits;

  // Map trait lean into small, safe multipliers.
  return {
    playHappinessBonus:
      1 +
      0.25 * pos01(t.playful) +
      0.12 * pos01(t.adventurous) +
      0.08 * pos01(t.social),
    playEnergyCostMultiplier: 1 - 0.2 * pos01(t.energetic),
    feedHappinessBonus:
      1 + 0.25 * pos01(t.affectionate) + 0.08 * pos01(t.social),
    restEnergyBonus: 1 + 0.25 * neg01(t.energetic),
    bathHappinessPenaltyMultiplier:
      1 - 0.2 * neg01(t.energetic) - 0.1 * pos01(t.affectionate),
    trainingHappinessBonus: 1 + 0.2 * neg01(t.playful),
  };
}

function applyCleanlinessPenalties(state, tierOverride) {
  const tier = tierOverride || state.cleanlinessTier || "FRESH";
  const effects = CLEANLINESS_TIER_EFFECTS[tier];
  if (!effects) return;

  if (effects.penalties?.happinessTickPenalty) {
    state.stats.happiness = clamp(
      state.stats.happiness - effects.penalties.happinessTickPenalty,
      0,
      100
    );
  }

  if (effects.penalties?.energyTickPenalty) {
    state.stats.energy = clamp(
      state.stats.energy - effects.penalties.energyTickPenalty,
      0,
      100
    );
  }
}

function getCleanlinessEffect(state) {
  return (
    CLEANLINESS_TIER_EFFECTS[state.cleanlinessTier] ||
    CLEANLINESS_TIER_EFFECTS.FRESH ||
    {}
  );
}

function getIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function ensureTrainingState(state) {
  if (!state.training) {
    state.training = createInitialTrainingState();
    return state.training;
  }
  const defaults = createInitialTrainingState();
  if (!state.training.potty) {
    state.training.potty = { ...defaults.potty };
  }
  if (!state.training.adult) {
    state.training.adult = { ...defaults.adult };
  }
  return state.training;
}

function recordPuppyPottySuccess(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const potty = training.potty;
  if (!potty || potty.completedAt) return;
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage !== LIFE_STAGES.PUPPY) return;

  potty.successCount = Math.min(potty.successCount + 1, potty.goal);

  if (potty.successCount >= potty.goal) {
    potty.completedAt = now;
    state.stats.happiness = clamp(state.stats.happiness + 5, 0, 100);
    pushJournalEntry(state, {
      type: "TRAINING",
      moodTag: "PROUD",
      summary: "Potty training complete",
      body: "Your puppy now knows how to signal when nature calls. Accidents will slow way down!",
      timestamp: now,
    });
  }
}

function getPottyTrainingMultiplier(state) {
  const training = ensureTrainingState(state);
  return training.potty?.completedAt ? POTTY_TRAINED_POTTY_GAIN_MULTIPLIER : 1;
}

function completeAdultTrainingSession(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === LIFE_STAGES.PUPPY) return;
  const adult = training.adult;
  const iso = getIsoDate(now);
  if (adult.lastCompletedDate === iso) return;

  if (adult.lastCompletedDate) {
    const lastDate = new Date(adult.lastCompletedDate);
    const currentDate = new Date(iso);
    const diffMs = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / REAL_DAY_MS);
    adult.streak = diffDays === 1 ? adult.streak + 1 : 1;
  } else {
    adult.streak = 1;
  }

  adult.lastCompletedDate = iso;
  adult.misses = 0;
  adult.lastPenaltyDate = null;
  state.coins += 40;

  pushJournalEntry(state, {
    type: "TRAINING",
    moodTag: "FOCUSED",
    summary: "Adult training complete",
    body: `Today's obedience session is logged. Training streak: ${adult.streak}.`,
    timestamp: now,
  });
}

function applyAdultTrainingMissPenalty(state, now = nowMs()) {
  const training = ensureTrainingState(state);
  const stage = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  if (stage === LIFE_STAGES.PUPPY) return;

  const adult = training.adult;
  if (!adult.lastCompletedDate) return;

  const iso = getIsoDate(now);
  if (adult.lastPenaltyDate === iso) return;
  if (adult.lastCompletedDate === iso) return;

  const lastDate = new Date(adult.lastCompletedDate);
  const currentDate = new Date(iso);
  const diffMs = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / REAL_DAY_MS));

  adult.misses += diffDays;
  adult.streak = 0;
  adult.lastPenaltyDate = iso;
  state.stats.happiness = clamp(state.stats.happiness - diffDays * 3, 0, 100);

  pushJournalEntry(state, {
    type: "TRAINING",
    moodTag: "RESTLESS",
    summary: "Needs adult training",
    body: "Too many days without a training session. Schedule time to practice commands!",
    timestamp: now,
  });
}

function ensurePollState(state) {
  if (!state.polls) {
    state.polls = {
      active: null,
      lastPromptId: null,
      lastSpawnedAt: null,
      lastResolvedAt: null,
      history: [],
    };
  }
  if (!Array.isArray(state.polls.history)) {
    state.polls.history = [];
  }
  return state.polls;
}

function pickNextPoll(previousId) {
  const prompts = DOG_POLL_CONFIG?.prompts || [];
  if (!prompts.length) return null;
  const pool = prompts.filter((p) => p.id !== previousId);
  const selection = pool.length ? pool : prompts;
  const index = Math.floor(Math.random() * selection.length);
  return selection[index] || null;
}

function applyPollEffects(state, effects = {}) {
  Object.entries(effects).forEach(([stat, delta]) => {
    if (typeof state.stats?.[stat] !== "number") return;
    state.stats[stat] = clamp(state.stats[stat] + delta, 0, 100);
  });
}

function spawnDogPollInternal(state, now = nowMs()) {
  const pollState = ensurePollState(state);
  if (pollState.active) return pollState.active;
  const next = pickNextPoll(pollState.lastPromptId);
  if (!next) return null;

  pollState.active = {
    id: next.id,
    prompt: next.prompt,
    effects: next.effects || {},
    startedAt: now,
    expiresAt: now + (DOG_POLL_CONFIG?.timeoutMs || 60000),
  };
  pollState.lastPromptId = next.id;
  pollState.lastSpawnedAt = now;
  return pollState.active;
}

function resolveActivePoll(state, { accepted, reason, now = nowMs() }) {
  const pollState = ensurePollState(state);
  const active = pollState.active;
  if (!active) return;

  if (accepted) {
    applyPollEffects(state, active.effects);
    applyXp(state, 4);
    maybeSampleMood(state, now, "POLL_ACCEPT");
    pushJournalEntry(state, {
      type: "POLL",
      moodTag: "HAPPY",
      summary: "You handled a dog poll",
      body: `You said yes to: ${active.prompt}`,
      timestamp: now,
    });
  } else {
    const penalty = reason === "TIMEOUT" ? 6 : 4;
    state.stats.happiness = clamp(state.stats.happiness - penalty, 0, 100);
    maybeSampleMood(
      state,
      now,
      reason === "TIMEOUT" ? "POLL_TIMEOUT" : "POLL_DECLINE"
    );
    pushJournalEntry(state, {
      type: "POLL",
      moodTag: "SASSY",
      summary: "Ignored pup feedback",
      body:
        reason === "TIMEOUT"
          ? "The pup asked for help and eventually gave up."
          : "You said no this time. They took note!",
      timestamp: now,
    });
  }

  pollState.history.unshift({
    id: active.id,
    prompt: active.prompt,
    accepted,
    reason: reason || (accepted ? "ACCEPT" : "DECLINE"),
    resolvedAt: now,
  });
  if (pollState.history.length > 20) {
    pollState.history.length = 20;
  }

  pollState.active = null;
  pollState.lastResolvedAt = now;
  finalizeDerivedState(state, now);
}

/* ---------------------- slice ---------------------- */

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== "object") return;

      const adoptedAt =
        parseAdoptedAt(payload.adoptedAt) ||
        parseAdoptedAt(state.adoptedAt) ||
        nowMs();

      const merged = {
        ...state,
        ...payload,
        stats: {
          ...initialState.stats,
          ...state.stats,
          ...(payload.stats || {}),
        },
        adoptedAt,
      };

      merged.vacation = {
        ...DEFAULT_VACATION_STATE,
        ...(state.vacation || {}),
        ...(payload.vacation || {}),
      };

      merged.lifeStage = payload.lifeStage ||
        state.lifeStage || { ...DEFAULT_LIFE_STAGE };

      merged.training = {
        ...createInitialTrainingState(),
        ...(payload.training || state.training || {}),
      };

      merged.temperament = {
        ...initialTemperament,
        ...(payload.temperament || state.temperament || {}),
        adoptedAt,
      };

      merged.personality = {
        ...initialPersonality,
        ...(payload.personality || state.personality || {}),
        traits: {
          ...initialPersonality.traits,
          ...(payload.personality?.traits || state.personality?.traits || {}),
        },
        history: Array.isArray(payload.personality?.history)
          ? payload.personality.history
          : Array.isArray(state.personality?.history)
            ? state.personality.history
            : initialPersonality.history,
        lastUpdatedAt:
          typeof payload.personality?.lastUpdatedAt === "number"
            ? payload.personality.lastUpdatedAt
            : typeof state.personality?.lastUpdatedAt === "number"
              ? state.personality.lastUpdatedAt
              : null,
        animationHint:
          payload.personality?.animationHint ??
          state.personality?.animationHint ??
          null,
      };

      merged.memory = {
        ...initialMemory,
        ...(payload.memory || state.memory || {}),
      };

      merged.career = {
        ...initialCareer,
        ...(payload.career || state.career || {}),
      };

      merged.skills = {
        obedience: {
          ...initialSkills.obedience,
          ...(payload.skills?.obedience || state.skills?.obedience || {}),
        },
      };

      merged.mood = {
        ...initialMood,
        ...(payload.mood || state.mood || {}),
      };

      merged.dreams = {
        ...initialDreams,
        ...(payload.dreams || state.dreams || {}),
        journal: Array.isArray(payload.dreams?.journal)
          ? payload.dreams.journal
          : Array.isArray(state.dreams?.journal)
            ? state.dreams.journal
            : initialDreams.journal,
        active:
          payload.dreams?.active ??
          state.dreams?.active ??
          initialDreams.active,
        lastGeneratedAt:
          typeof payload.dreams?.lastGeneratedAt === "number"
            ? payload.dreams.lastGeneratedAt
            : typeof state.dreams?.lastGeneratedAt === "number"
              ? state.dreams.lastGeneratedAt
              : null,
      };

      merged.journal = {
        ...initialJournal,
        ...(payload.journal || state.journal || {}),
      };

      merged.streak = {
        ...initialStreak,
        ...(payload.streak || state.streak || {}),
      };

      merged.bond = {
        ...initialBond,
        ...(payload.bond || state.bond || {}),
      };

      merged.memorial = {
        ...initialMemorial,
        ...(payload.memorial || state.memorial || {}),
      };

      merged.cosmetics = {
        ...initialCosmetics,
        ...(payload.cosmetics || state.cosmetics || {}),
        unlockedIds: Array.isArray(payload.cosmetics?.unlockedIds)
          ? payload.cosmetics.unlockedIds
          : Array.isArray(state.cosmetics?.unlockedIds)
            ? state.cosmetics.unlockedIds
            : initialCosmetics.unlockedIds,
        equipped: {
          ...initialCosmetics.equipped,
          ...(payload.cosmetics?.equipped || state.cosmetics?.equipped || {}),
        },
      };

      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;

      ensureTrainingState(merged);
      ensurePollState(merged);
      ensurePersonalityState(merged);
      ensureDreamState(merged);
      ensureVacationState(merged);

      merged.cleanlinessTier =
        payload.cleanlinessTier || state.cleanlinessTier || "FRESH";

      finalizeDerivedState(merged, nowMs());
      return merged;
    },

    setDogName(state, { payload }) {
      state.name = payload || "Pup";
    },

    setAdoptedAt(state, { payload }) {
      const adoptedAt = parseAdoptedAt(payload) ?? nowMs();
      state.temperament.adoptedAt = adoptedAt;
      state.adoptedAt = adoptedAt;
      ensurePersonalityState(state);
      finalizeDerivedState(state, adoptedAt);
    },

    setCareerLifestyle(state, { payload }) {
      const { lifestyle, perks } = payload || {};
      state.career.lifestyle = lifestyle || null;
      state.career.chosenAt = nowMs();
      if (perks && typeof perks === "object") {
        state.career.perks = { ...state.career.perks, ...perks };
      }
    },

    markTemperamentRevealed(state) {
      state.temperament.revealedAt = nowMs();
      state.temperament.revealReady = false;
    },

    updateFavoriteToy(state, { payload }) {
      state.memory.favoriteToyId = payload || null;
    },

    /* ------------- care actions ------------- */

    feed(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const amount = payload?.amount ?? 20;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

      const perks = getPersonalityPerks(state);

      state.stats.hunger = clamp(state.stats.hunger - amount, 0, 100);
      state.stats.happiness = clamp(
        state.stats.happiness + 5 * careerMultiplier * perks.feedHappinessBonus,
        0,
        100
      );

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = "feed";

      applyPersonalityShift(state, {
        now,
        source: "FEED",
        deltas: { affectionate: 2, social: 1 },
      });

      applyXp(state, 5);
      maybeSampleMood(state, now, "FEED");

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const zoomiesMultiplier = payload?.timeOfDay === "MORNING" ? 2 : 1;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

      const baseHappiness = payload?.happinessGain ?? 15;
      const perks = getPersonalityPerks(state);
      const gain =
        baseHappiness *
        zoomiesMultiplier *
        careerMultiplier *
        perks.playHappinessBonus;

      state.stats.happiness = clamp(state.stats.happiness + gain, 0, 100);

      const energyCost = Math.max(
        6,
        Math.round(10 * Math.max(0.65, perks.playEnergyCostMultiplier))
      );
      state.stats.energy = clamp(state.stats.energy - energyCost, 0, 100);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = "play";

      applyPersonalityShift(state, {
        now,
        source: "PLAY",
        deltas: {
          adventurous: 2,
          social: 2,
          energetic: 1,
          playful: 3,
          affectionate: 1,
        },
      });

      applyXp(state, 8);
      maybeSampleMood(state, now, "PLAY");

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const perks = getPersonalityPerks(state);

      state.isAsleep = true;
      state.stats.energy = clamp(
        state.stats.energy + 20 * perks.restEnergyBonus,
        0,
        100
      );
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);

      state.memory.lastSeenAt = now;
      state.lastAction = "rest";

      maybeGenerateDream(state, now);

      applyPersonalityShift(state, {
        now,
        source: "REST",
        deltas: {
          energetic: -2,
          adventurous: -1,
          playful: -1,
          affectionate: 1,
        },
      });

      applyXp(state, 3);
      maybeSampleMood(state, now, "REST");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    wakeUp(state) {
      state.isAsleep = false;
      state.lastAction = "wake";

      const dreams = ensureDreamState(state);
      dreams.active = null;
    },

    dismissActiveDream(state) {
      const dreams = ensureDreamState(state);
      dreams.active = null;
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const perks = getPersonalityPerks(state);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.happiness = clamp(
        state.stats.happiness -
          5 * Math.max(0.6, perks.bathHappinessPenaltyMultiplier),
        0,
        100
      );

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = "bathe";

      applyPersonalityShift(state, {
        now,
        source: "BATHE",
        deltas: { energetic: -1, adventurous: -1, affectionate: -1 },
      });

      applyXp(state, 4);
      maybeSampleMood(state, now, "BATHE");
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    increasePottyLevel(state, { payload }) {
      const effects = getCleanlinessEffect(state);
      const multiplier = effects.pottyGainMultiplier || 1;
      const trainingMultiplier = getPottyTrainingMultiplier(state);
      const inc = (payload?.amount ?? 10) * multiplier * trainingMultiplier;
      state.pottyLevel = clamp(state.pottyLevel + inc, 0, 100);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      state.pottyLevel = 0;
      state.poopCount += 1;
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = "potty";

      applyXp(state, 2);
      maybeSampleMood(state, now, "POTTY");
      recordPuppyPottySuccess(state, now);
      finalizeDerivedState(state, now);
    },

    scoopPoop(state, { payload }) {
      const now = payload?.now ?? nowMs();
      if (state.poopCount > 0) {
        state.poopCount -= 1;
        state.stats.cleanliness = clamp(state.stats.cleanliness + 10, 0, 100);
        state.stats.happiness = clamp(state.stats.happiness + 2, 0, 100);
        applyXp(state, 2);
        maybeSampleMood(state, now, "SCOOP");
      }
      state.memory.lastSeenAt = now;
      state.lastAction = "scoop";

      finalizeDerivedState(state, now);
    },

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, "TICK");
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, "SESSION_START");
      state.memory.lastSeenAt = now;
      state.lastAction = "session_start";

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
      applyAdultTrainingMissPenalty(state, now);
    },

    tickDogPolls(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const pollState = ensurePollState(state);
      if (pollState.active) {
        if (pollState.active.expiresAt && now >= pollState.active.expiresAt) {
          resolveActivePoll(state, {
            accepted: false,
            reason: "TIMEOUT",
            now,
          });
        }
        return;
      }

      const interval = DOG_POLL_CONFIG?.intervalMs || 0;
      if (!interval) return;
      if (
        !pollState.lastSpawnedAt ||
        now - pollState.lastSpawnedAt >= interval
      ) {
        spawnDogPollInternal(state, now);
      }
    },

    respondToDogPoll(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const accepted = !!payload?.accepted;
      const reason = payload?.reason || (accepted ? "ACCEPT" : "DECLINE");
      resolveActivePoll(state, { accepted, reason, now });
    },

    /* ------------- skills ------------- */

    trainObedience(state, { payload }) {
      const training = ensureTrainingState(state);
      const pottyDone = !!training?.potty?.completedAt;
      if (!pottyDone) {
        state.lastAction = "trainBlocked";
        return;
      }
      const {
        commandId,
        success = true,
        xp = 6,
        now: payloadNow,
      } = payload || {};

      if (!commandId || !success) return;

      const now = payloadNow ?? nowMs();
      applyDecay(state, now);

      const perks = getPersonalityPerks(state);

      const trainingMultiplier =
        state.career.perks?.trainingXpMultiplier || 1.0;
      const adjustedXp = Math.round(xp * trainingMultiplier);

      applySkillXp("obedience", commandId, state.skills, adjustedXp);
      state.memory.lastTrainedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = "train";

      state.stats.happiness = clamp(
        state.stats.happiness + 8 * perks.trainingHappinessBonus,
        0,
        100
      );
      state.stats.energy = clamp(state.stats.energy - 5, 0, 100);

      applyPersonalityShift(state, {
        now,
        source: "TRAINING",
        deltas: { playful: -2, social: -1, adventurous: -1 },
      });

      applyXp(state, 10);
      completeAdultTrainingSession(state, now);
      maybeSampleMood(state, now, "TRAINING");

      pushJournalEntry(state, {
        type: "TRAINING",
        moodTag: "HAPPY",
        summary: `Practiced ${commandId}.`,
        body: `We worked on "${commandId}" today. I think I'm getting the hang of it!`,
        timestamp: now,
      });

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    addJournalEntry(state, { payload }) {
      pushJournalEntry(state, payload || {});
    },

    purchaseCosmetic(state, { payload }) {
      const id = String(payload?.id || "").trim();
      if (!id) return;

      const price = Math.max(0, Math.round(Number(payload?.price) || 0));
      const now = typeof payload?.now === "number" ? payload.now : nowMs();

      if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
      if (!Array.isArray(state.cosmetics.unlockedIds))
        state.cosmetics.unlockedIds = [];
      if (!state.cosmetics.equipped)
        state.cosmetics.equipped = { ...initialCosmetics.equipped };

      if (state.cosmetics.unlockedIds.includes(id)) return;
      if (price > 0 && (state.coins || 0) < price) return;

      state.coins = Math.max(0, Math.round((state.coins || 0) - price));
      state.cosmetics.unlockedIds.push(id);

      pushJournalEntry(state, {
        type: "STORE",
        moodTag: "HAPPY",
        summary: "Bought a cosmetic",
        body: `Purchased: ${id}${price ? ` for ${price} coins` : ""}.`,
        timestamp: now,
      });
    },

    equipCosmetic(state, { payload }) {
      const slot = String(payload?.slot || "").toLowerCase();
      const id = payload?.id == null ? null : String(payload.id).trim();
      if (!slot) return;

      if (!state.cosmetics) state.cosmetics = { ...initialCosmetics };
      if (!state.cosmetics.equipped)
        state.cosmetics.equipped = { ...initialCosmetics.equipped };

      if (!["collar", "tag", "backdrop"].includes(slot)) return;
      state.cosmetics.equipped[slot] = id || null;
    },

    startRainbowBridge(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      if (!state.memorial) state.memorial = { ...initialMemorial };
      state.memorial.active = true;
      state.memorial.startedAt = now;
      if (!state.memorial.completedAt) {
        pushJournalEntry(state, {
          type: "MEMORIAL",
          moodTag: "CALM",
          summary: "Visited Rainbow Bridge",
          body: "You began a quiet moment of remembrance.",
          timestamp: now,
        });
      }
    },

    completeRainbowBridge(state, { payload }) {
      const now = typeof payload?.now === "number" ? payload.now : nowMs();
      if (!state.memorial) state.memorial = { ...initialMemorial };
      state.memorial.active = false;
      state.memorial.completedAt = now;

      pushJournalEntry(state, {
        type: "MEMORIAL",
        moodTag: "CALM",
        summary: "Completed the memorial",
        body: "The memorial is complete. You can revisit this space anytime.",
        timestamp: now,
      });
    },

    setVacationMode(state, { payload }) {
      const now = nowMs();
      const v = ensureVacationState(state);
      const nextEnabled = Boolean(payload);

      if (nextEnabled === v.enabled) return;

      if (nextEnabled) {
        v.enabled = true;
        v.startedAt = now;
        state.lastUpdatedAt = now;
        state.lastAction = "vacation_on";

        pushJournalEntry(state, {
          type: "INFO",
          moodTag: "CALM",
          summary: "Vacation mode enabled",
          body: "Your pup is being cared for while you’re away. Decay and aging slow down.",
          timestamp: now,
        });
      } else {
        const mult = clamp(Number(v.multiplier) || 1, 0, 1);
        if (typeof v.startedAt === "number") {
          const dt = Math.max(0, now - v.startedAt);
          v.skippedMs = Math.max(
            0,
            (Number(v.skippedMs) || 0) + dt * (1 - mult)
          );
        }

        v.enabled = false;
        v.startedAt = null;
        state.lastUpdatedAt = now;
        state.lastAction = "vacation_off";

        pushJournalEntry(state, {
          type: "INFO",
          moodTag: "HAPPY",
          summary: "Vacation mode disabled",
          body: "Welcome back! Your pup is excited to see you.",
          timestamp: now,
        });
      }

      finalizeDerivedState(state, now);
    },

    toggleDebug(state) {
      state.debug = !state.debug;
    },

    resetDogState() {
      return initialState;
    },
  },
});

/* ---------------------- selectors ---------------------- */

export const selectDog = (state) => state.dog;
export const selectDogStats = (state) => state.dog.stats;
export const selectDogMood = (state) => state.dog.mood;
export const selectDogJournal = (state) => state.dog.journal;
export const selectDogTemperament = (state) => state.dog.temperament;
export const selectDogPersonality = (state) => state.dog.personality;
export const selectDogDreams = (state) => state.dog.dreams;
export const selectDogSkills = (state) => state.dog.skills;
export const selectDogStreak = (state) => state.dog.streak;
export const selectDogLifeStage = (state) => state.dog.lifeStage;
export const selectDogCleanlinessTier = (state) => state.dog.cleanlinessTier;
export const selectDogPolls = (state) => state.dog.polls;
export const selectDogTraining = (state) => state.dog.training;

export const selectDogBond = (state) => state.dog.bond;
export const selectDogMemorial = (state) => state.dog.memorial;
export const selectDogVacation = (state) => state.dog.vacation;

export const selectCosmeticCatalog = () => DEFAULT_COSMETIC_CATALOG;

export const selectNextStreakReward = (state) => {
  const dog = state.dog;
  const streakDays = Math.max(
    0,
    Math.floor(Number(dog?.streak?.currentStreakDays) || 0)
  );
  const unlocked = new Set(
    Array.isArray(dog?.cosmetics?.unlockedIds) ? dog.cosmetics.unlockedIds : []
  );

  const next =
    DEFAULT_COSMETIC_CATALOG.filter((it) => it && it.id)
      .filter((it) => !unlocked.has(it.id))
      .sort((a, b) => (Number(a.threshold) || 0) - (Number(b.threshold) || 0))
      .find((it) => (Number(it.threshold) || 0) > streakDays) || null;

  return { streakDays, next };
};

/* ----------------------- actions / reducer ----------------------- */

export const {
  hydrateDog,
  setDogName,
  setAdoptedAt,
  setCareerLifestyle,
  markTemperamentRevealed,
  updateFavoriteToy,
  feed,
  play,
  rest,
  wakeUp,
  dismissActiveDream,
  bathe,
  increasePottyLevel,
  goPotty,
  scoopPoop,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  respondToDogPoll,
  trainObedience,
  addJournalEntry,
  purchaseCosmetic,
  equipCosmetic,
  startRainbowBridge,
  completeRainbowBridge,
  setVacationMode,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
