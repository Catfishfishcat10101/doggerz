/** @format */

// src/redux/dogSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { calculateDogAge } from '@/utils/lifecycle.js';
import { CLEANLINESS_TIER_EFFECTS, LIFE_STAGES } from '@/constants/game.js';

export const DOG_STORAGE_KEY = 'doggerz:dogState';

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

// Long-term progression (months, not days)
// - Season: 90-day track with a level ladder
// - Journey: slower, account-like track that persists across seasons
// - Weekly challenges: rotate every week-start (UTC Monday)
const SEASON_LENGTH_DAYS = 90;
const SEASON_LEVEL_XP_STEP = 100;
const JOURNEY_LEVEL_XP_STEP = 150;

// Caps prevent grinding a whole season in a day while still feeling rewarding.
const DAILY_SEASON_XP_CAP = 120;
const DAILY_JOURNEY_XP_CAP = 40;

// Autonomy / "alive" behaviors
const AUTONOMY = {
  decisionMinIntervalMs: 15 * 1000,
  promptCooldownMs: 2.5 * 60 * 1000,
  emoteCooldownMs: 60 * 1000,
  promptTimeoutMs: 45 * 1000,
};

const nowMs = () => Date.now();

function getWeekKeyUtc(ms) {
  // Returns the UTC date (YYYY-MM-DD) of the Monday that starts this week.
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)
  );
  return monday.toISOString().slice(0, 10);
}

function stableHash32(str) {
  // Small deterministic hash for weekly challenge selection.
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01FromSeed(seed) {
  // Deterministic 0..1 for a given seed.
  const h = stableHash32(seed);
  return (h % 1_000_000_000) / 1_000_000_000;
}

function getLocalHour(ms) {
  return new Date(ms).getHours();
}

function getTimeOfDayBucket(ms) {
  const h = getLocalHour(ms);
  if (h >= 5 && h < 11) return 'MORNING';
  if (h >= 11 && h < 17) return 'AFTERNOON';
  if (h >= 17 && h < 22) return 'EVENING';
  return 'NIGHT';
}

function parseAdoptedAt(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === 'string') {
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

const CLEANLINESS_TIER_ORDER = ['FRESH', 'DIRTY', 'FLEAS', 'MANGE'];

// Stage-based stat multipliers (legacy; decay v2 uses its own stage tuning)
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
  label: 'Puppy',
  days: 0,
};

// Simple dog poll config; you can tune this later
const DOG_POLL_CONFIG = {
  intervalMs: 10 * 60 * 1000, // spawn roughly every 10 minutes of active play
  timeoutMs: 60 * 1000, // 60s to answer
  prompts: [
    {
      id: 'water',
      prompt: 'Can we swap my water for something fresh?',
      effects: { happiness: 4, cleanliness: 1 },
    },
    {
      id: 'toy',
      prompt: 'Can we play with my favorite toy for a bit?',
      effects: { happiness: 8, energy: -6 },
    },
    {
      id: 'rest',
      prompt: 'I’m kinda wiped… can we chill for a bit?',
      effects: { energy: 10, happiness: 2 },
    },
  ],
};

/* ------------------- decay v2: realistic, not punishing ------------------- */
// Stat semantics in this slice:
// - hunger: 0 = full, 100 = starving (need rises over time)
// - happiness/energy/cleanliness: 0 = bad, 100 = great (good decays over time)
// - pottyLevel: 0 = empty/comfortable, 100 = urgent (need rises over time)

const DECAY_V2 = {
  tick: {
    stepMinutes: 10,
    fullSimMinutes: 24 * 60, // 24h full-fidelity
    extraSimDecayMultiplier: 0.25, // beyond 24h, gentle tail
    extraSimGoodFloor: 25, // beyond 24h: good stats won't drift below 25 passively
    extraSimNeedCeiling: 75, // beyond 24h: needs won't drift above 75 passively
    hardCapMinutes: 30 * 24 * 60, // safety cap for extreme gaps
  },

  zones: {
    greenMin: 70,
    yellowMin: 40,
    redMin: 15, // for good stats
    goodFloor: 15,
    // because hunger/potty are inverted meters, this ceiling is 100 - floor
    needCeiling: 85,
    greenFactor: 1.0,
    yellowFactor: 0.65,
    redFactor: 0.4,
  },

  wellbeing: {
    // decayProtection = lerp(1.0, protectMin, wellbeing/100)
    protectMin: 0.65,
    drainPerMinute: 0.12, // * needPressure
    regenPerMinuteWhenFine: 0.03, // when needPressure < 0.2
    fragileThreshold: 10,
  },

  careDebt: {
    buildPerMinute: 0.1, // * needPressure
    buildExtraWhenWellbeingEmpty: 0.06,
    forgivePerMinuteWhenFine: 0.1,
    cap: 100,
  },

  sleep: {
    autoEnterAtEnergyOrBelow: 30,
    autoWakeAtEnergyOrAbove: 70,
    autoMaxMinutes: 90,

    hungerNeedMultiplierWhileAsleep: 0.65,
    happinessDecayMultiplierWhileAsleep: 0.8,
    pottyNeedMultiplierWhileAsleep: 0.85,
    cleanlinessDecayMultiplierWhileAsleep: 1.0,
  },

  accidents: {
    triggerAtPottyOrAbove: 95,
    cooldownMinutes: 8 * 60, // max 1 accident per 8h simulated
    relieveTo: 30,
    cleanlinessPenalty: 10,
    happinessPenalty: 6,
    careDebtPenalty: 4,

    chancePerStepUntrained: 0.2,
    chancePerStepTrained: 0.06,
  },

  // “Hours for GOOD stat to drift from 100 → 40” (60 points) while awake & no protection.
  // Need meters (hunger/potty): approximately 0 → 60 over the same hours.
  lifeStages: {
    [LIFE_STAGES.PUPPY]: {
      hoursTo40: {
        hunger: 12,
        energy: 10,
        happiness: 18,
        cleanliness: 40,
        potty: 4.5,
      },
      energyRecoverPerMinuteWhileAsleep: 0.55,
    },
    [LIFE_STAGES.ADULT]: {
      hoursTo40: {
        hunger: 22,
        energy: 16,
        happiness: 30,
        cleanliness: 55,
        potty: 7.5,
      },
      energyRecoverPerMinuteWhileAsleep: 0.4,
    },
    [LIFE_STAGES.SENIOR]: {
      hoursTo40: {
        hunger: 26,
        energy: 18,
        happiness: 32,
        cleanliness: 50,
        potty: 9.0,
      },
      energyRecoverPerMinuteWhileAsleep: 0.35,
    },
  },
};

const lerp = (a, b, t) => a + (b - a) * t;

function avg(...nums) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
}

function basePointsPerMinuteFromHoursTo40(hoursTo40) {
  const minutes = Math.max(1, hoursTo40 * 60);
  return 60 / minutes;
}

// zone factor for GOOD stats (happiness/energy/cleanliness)
function zoneFactorGood(value) {
  const z = DECAY_V2.zones;
  if (value >= z.greenMin) return z.greenFactor;
  if (value >= z.yellowMin) return z.yellowFactor;
  if (value >= z.redMin) return z.redFactor;
  return 0.0;
}

// zone factor for NEED meters (hunger/potty)
function zoneFactorNeed(needValue) {
  const goodEquivalent = 100 - needValue;
  return zoneFactorGood(goodEquivalent);
}

// urgency for GOOD stats (0..1)
function urgencyGood(value) {
  if (value >= 70) return 0;
  if (value >= 40) return ((70 - value) / 30) * 0.7;
  if (value >= 15) return 0.7 + ((40 - value) / 25) * 0.3;
  return 1;
}

// urgency for NEED meters (0..1)
function urgencyNeed(needValue) {
  return urgencyGood(100 - needValue);
}

/* ------------------- initial sub-structures ------------------- */

const initialTemperament = {
  primary: 'SPICY',
  secondary: 'SWEET',
  traits: [
    { id: 'clingy', label: 'Clingy', intensity: 70 },
    { id: 'toyObsessed', label: 'Toy-Obsessed', intensity: 60 },
    { id: 'foodMotivated', label: 'Food-Motivated', intensity: 55 },
  ],
  revealedAt: null,
  revealReady: false,
  adoptedAt: null,
  lastEvaluatedAt: null,
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

const initialJournal = {
  entries: [],
};

function makeHourArray() {
  return Array.from({ length: 24 }, () => 0);
}

const initialAutonomy = {
  enabled: true,
  nextDecisionAt: null,
  lastDecisionAt: null,
  // UI can show these as toasts for "alive" feel.
  lastEvent: null, // { id, kind, message, createdAt, expiresAt? }
  boredom: 20, // 0..100
  preferences: {
    // 0..100: how likely the dog is to ask for / enjoy these.
    feed: 55,
    play: 60,
    bathe: 25,
    potty: 45,
    rest: 40,
    train: 45,
  },
  routine: {
    // Soft habit maps (local hour buckets).
    byHour: {
      feed: makeHourArray(),
      play: makeHourArray(),
      potty: makeHourArray(),
      rest: makeHourArray(),
      train: makeHourArray(),
      bathe: makeHourArray(),
    },
    updatedAt: null,
  },
  cooldowns: {
    promptAt: 0,
    emoteAt: 0,
  },
};

const WEEKLY_CHALLENGE_POOL = [
  {
    id: 'care_feed_14',
    label: 'Feed your dog 14 times',
    type: 'feed',
    goal: 14,
    reward: { seasonXp: 140, journeyXp: 40, coins: 60 },
  },
  {
    id: 'care_play_10',
    label: 'Play 10 times',
    type: 'play',
    goal: 10,
    reward: { seasonXp: 120, journeyXp: 30, coins: 50 },
  },
  {
    id: 'care_bathe_3',
    label: 'Bathe 3 times',
    type: 'bathe',
    goal: 3,
    reward: { seasonXp: 110, journeyXp: 25, coins: 45 },
  },
  {
    id: 'care_potty_12',
    label: 'Go potty 12 times',
    type: 'potty',
    goal: 12,
    reward: { seasonXp: 120, journeyXp: 30, coins: 50 },
  },
  {
    id: 'care_scoop_10',
    label: 'Scoop 10 messes',
    type: 'scoop',
    goal: 10,
    reward: { seasonXp: 100, journeyXp: 25, coins: 40 },
  },
  {
    id: 'training_sessions_5',
    label: 'Complete 5 trick training sessions',
    type: 'train',
    goal: 5,
    reward: { seasonXp: 170, journeyXp: 55, coins: 85 },
  },
  {
    id: 'sessions_5days',
    label: 'Start 5 play sessions this week',
    type: 'session',
    goal: 5,
    reward: { seasonXp: 150, journeyXp: 45, coins: 70 },
  },
];

const initialProgression = {
  // Journey is the slow, multi-season track.
  journey: {
    level: 1,
    xp: 0,
    startedAt: null,
  },
  // Season is the 90-day ladder.
  season: {
    id: null,
    startedAt: null,
    endsAt: null,
    level: 1,
    xp: 0,
  },
  // Daily caps for fairness.
  daily: {
    date: null, // YYYY-MM-DD (UTC)
    seasonXpEarned: 0,
    journeyXpEarned: 0,
  },
  // Weekly challenge rotation.
  weekly: {
    weekKey: null, // week-start YYYY-MM-DD (UTC)
    challenges: [],
  },
  legacy: {
    points: 0,
    spent: 0,
  },
};

const initialStreak = {
  currentStreakDays: 0,
  bestStreakDays: 0,
  lastActiveDate: null,
};

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
  name: 'Pup',
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

  cleanlinessTier: 'FRESH',
  poopCount: 0,

  isAsleep: false,

  // Decay v2 buffers
  wellbeing: 60, // 0–100
  careDebt: 0, // 0–100
  sleepState: {
    mode: 'AWAKE', // 'AWAKE' | 'MANUAL' | 'AUTO'
    minutesLeft: 0,
  },

  debug: false,
  lastUpdatedAt: null,

  // Used by UI renderers/selectors to derive simple animation hints
  lastAction: null,

  temperament: initialTemperament,
  memory: initialMemory,
  career: initialCareer,
  skills: initialSkills,
  mood: initialMood,
  journal: initialJournal,
  streak: initialStreak,
  training: createInitialTrainingState(),

  // Months-long progression: seasons + journey + weekly challenges.
  progression: initialProgression,

  // "Alive" behaviors: desire planner + routines + preferences.
  autonomy: initialAutonomy,

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
    type: entry.type || 'INFO',
    moodTag: entry.moodTag || null,
    summary: entry.summary || '',
    body: entry.body || '',
  });

  if (state.journal.entries.length > 200) {
    state.journal.entries.length = 200;
  }
}

function ensureProgressionState(state) {
  if (!state.progression || typeof state.progression !== 'object') {
    state.progression =
      typeof structuredClone === 'function'
        ? structuredClone(initialProgression)
        : JSON.parse(JSON.stringify(initialProgression));
  }

  const p = state.progression;

  // shallow-merge defaults for back-compat
  p.journey = { ...initialProgression.journey, ...(p.journey || {}) };
  p.season = { ...initialProgression.season, ...(p.season || {}) };
  p.daily = { ...initialProgression.daily, ...(p.daily || {}) };
  p.weekly = { ...initialProgression.weekly, ...(p.weekly || {}) };
  p.legacy = { ...initialProgression.legacy, ...(p.legacy || {}) };

  if (!Array.isArray(p.weekly.challenges)) p.weekly.challenges = [];
  return p;
}

function ensureAutonomyState(state) {
  if (!state.autonomy || typeof state.autonomy !== 'object') {
    state.autonomy =
      typeof structuredClone === 'function'
        ? structuredClone(initialAutonomy)
        : JSON.parse(JSON.stringify(initialAutonomy));
  }

  const a = state.autonomy;
  a.enabled = a.enabled !== false;
  a.boredom = clamp(a.boredom ?? initialAutonomy.boredom, 0, 100);
  a.preferences = { ...initialAutonomy.preferences, ...(a.preferences || {}) };
  a.routine = { ...initialAutonomy.routine, ...(a.routine || {}) };
  a.routine.byHour = {
    ...initialAutonomy.routine.byHour,
    ...(a.routine.byHour || {}),
  };

  for (const key of Object.keys(initialAutonomy.routine.byHour)) {
    const arr = a.routine.byHour[key];
    if (!Array.isArray(arr) || arr.length !== 24) {
      a.routine.byHour[key] = makeHourArray();
    }
  }

  a.cooldowns = { ...initialAutonomy.cooldowns, ...(a.cooldowns || {}) };
  return a;
}

function recordRoutineAction(state, actionKey, now) {
  const a = ensureAutonomyState(state);
  const hour = getLocalHour(now);
  const map = a.routine.byHour?.[actionKey];
  if (!Array.isArray(map) || map.length !== 24) return;

  // Exponential-ish decay to keep habits adaptive over weeks.
  for (let i = 0; i < 24; i += 1) {
    map[i] = Math.max(0, map[i] * 0.995);
  }
  map[hour] = map[hour] * 0.9 + 1.0;
  a.routine.updatedAt = now;
}

function getTraitIntensity(state, id) {
  const t = state.temperament?.traits || [];
  const found = t.find((x) => x.id === id);
  return clamp(found?.intensity ?? 0, 0, 100);
}

function habitBias(state, actionKey, now) {
  const a = ensureAutonomyState(state);
  const hour = getLocalHour(now);
  const arr = a.routine.byHour?.[actionKey];
  if (!Array.isArray(arr) || arr.length !== 24) return 0;
  const v = Number(arr[hour] || 0);
  // 0..~1-ish
  return Math.max(0, Math.min(1, v / 6));
}

function buildWeeklyChallenges(weekKey) {
  const pool = WEEKLY_CHALLENGE_POOL;
  const h = stableHash32(weekKey);
  const picked = [];
  const used = new Set();

  // Pick 3 distinct challenges deterministically.
  for (let i = 0; i < 3 && used.size < pool.length; i += 1) {
    const idx = (h + i * 97) % pool.length;
    // probe forward if collision
    let j = 0;
    while (j < pool.length && used.has(pool[(idx + j) % pool.length].id)) {
      j += 1;
    }
    const item = pool[(idx + j) % pool.length];
    if (!item || used.has(item.id)) continue;
    used.add(item.id);
    picked.push({
      id: item.id,
      label: item.label,
      type: item.type,
      goal: item.goal,
      progress: 0,
      reward: item.reward,
      completedAt: null,
      claimedAt: null,
    });
  }

  return picked;
}

function maybeResetDailyCaps(prog, now) {
  const date = getIsoDate(now);
  if (prog.daily.date !== date) {
    prog.daily.date = date;
    prog.daily.seasonXpEarned = 0;
    prog.daily.journeyXpEarned = 0;
  }
}

function ensureSeasonInitialized(state, now) {
  const prog = ensureProgressionState(state);
  if (prog.journey.startedAt == null) prog.journey.startedAt = now;

  const season = prog.season;
  if (season.startedAt && season.endsAt && season.id) return;

  const startedAt = now;
  const endsAt = startedAt + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000;
  season.startedAt = startedAt;
  season.endsAt = endsAt;
  season.id = `S-${new Date(startedAt).toISOString().slice(0, 10)}`;
  season.level = Math.max(1, Number(season.level || 1));
  season.xp = Math.max(0, Number(season.xp || 0));
}

function maybeRollSeason(state, now) {
  const prog = ensureProgressionState(state);
  ensureSeasonInitialized(state, now);

  const season = prog.season;
  if (!season.endsAt || now < season.endsAt) return;

  // Season ended: grant legacy points based on season level.
  const earnedLegacy = Math.max(
    0,
    Math.floor((Number(season.level || 1) - 1) / 10)
  );
  if (earnedLegacy > 0) {
    prog.legacy.points = (prog.legacy.points || 0) + earnedLegacy;
  }

  pushJournalEntry(state, {
    type: 'PROGRESSION',
    moodTag: 'PROUD',
    summary: 'A new season begins',
    body:
      `Season complete! You reached Season Level ${season.level}. ` +
      (earnedLegacy > 0
        ? `Earned ${earnedLegacy} legacy point${earnedLegacy === 1 ? '' : 's'}.`
        : 'Keep going for legacy points next season.'),
    timestamp: now,
  });

  // Start a new season anchored at now (simple + robust across timezones).
  const startedAt = now;
  const endsAt = startedAt + SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000;
  prog.season = {
    id: `S-${new Date(startedAt).toISOString().slice(0, 10)}`,
    startedAt,
    endsAt,
    level: 1,
    xp: 0,
  };

  // Reset weekly challenges so the new season feels fresh.
  const weekKey = getWeekKeyUtc(now);
  prog.weekly.weekKey = weekKey;
  prog.weekly.challenges = buildWeeklyChallenges(weekKey);
}

function ensureWeeklyChallenges(state, now) {
  const prog = ensureProgressionState(state);
  const weekKey = getWeekKeyUtc(now);
  if (prog.weekly.weekKey === weekKey && prog.weekly.challenges.length) return;

  prog.weekly.weekKey = weekKey;
  prog.weekly.challenges = buildWeeklyChallenges(weekKey);
}

function awardProgressionXp(
  state,
  { seasonXp = 0, journeyXp = 0, coins = 0, now }
) {
  const prog = ensureProgressionState(state);
  ensureSeasonInitialized(state, now);
  maybeResetDailyCaps(prog, now);

  const addWithCap = (requested, earnedSoFar, cap) => {
    const remaining = Math.max(0, cap - (earnedSoFar || 0));
    return Math.max(0, Math.min(requested, remaining));
  };

  const seasonAdd = addWithCap(
    seasonXp,
    prog.daily.seasonXpEarned,
    DAILY_SEASON_XP_CAP
  );
  const journeyAdd = addWithCap(
    journeyXp,
    prog.daily.journeyXpEarned,
    DAILY_JOURNEY_XP_CAP
  );

  if (seasonAdd > 0) {
    prog.season.xp = (prog.season.xp || 0) + seasonAdd;
    prog.daily.seasonXpEarned += seasonAdd;
    const targetSeasonLevel =
      1 + Math.floor(prog.season.xp / SEASON_LEVEL_XP_STEP);
    if (targetSeasonLevel > (prog.season.level || 1)) {
      prog.season.level = targetSeasonLevel;
      pushJournalEntry(state, {
        type: 'PROGRESSION',
        moodTag: 'HAPPY',
        summary: `Season level up! Now level ${prog.season.level}.`,
        body: 'Season progress unlocked. Keep completing weekly challenges to climb the track.',
        timestamp: now,
      });
    }
  }

  if (journeyAdd > 0) {
    prog.journey.xp = (prog.journey.xp || 0) + journeyAdd;
    prog.daily.journeyXpEarned += journeyAdd;
    const targetJourneyLevel =
      1 + Math.floor(prog.journey.xp / JOURNEY_LEVEL_XP_STEP);
    if (targetJourneyLevel > (prog.journey.level || 1)) {
      prog.journey.level = targetJourneyLevel;
      pushJournalEntry(state, {
        type: 'PROGRESSION',
        moodTag: 'PROUD',
        summary: `Journey level up! Now level ${prog.journey.level}.`,
        body: 'This is your long-term progression — it carries across seasons.',
        timestamp: now,
      });
    }
  }

  if (coins) state.coins = (state.coins || 0) + coins;
}

function bumpWeeklyChallengeProgress(state, type, amount, now) {
  const prog = ensureProgressionState(state);
  ensureWeeklyChallenges(state, now);

  const list = prog.weekly.challenges || [];
  for (const c of list) {
    if (!c || c.type !== type) continue;
    if (c.claimedAt) continue;

    const next = Math.min(
      Number(c.goal || 0),
      Number(c.progress || 0) + (amount || 0)
    );
    c.progress = next;
    if (!c.completedAt && next >= Number(c.goal || 0)) {
      c.completedAt = now;

      // Auto-claim on completion to keep UX simple.
      c.claimedAt = now;
      const reward = c.reward || {};
      awardProgressionXp(state, {
        seasonXp: Number(reward.seasonXp || 0),
        journeyXp: Number(reward.journeyXp || 0),
        coins: Number(reward.coins || 0),
        now,
      });

      pushJournalEntry(state, {
        type: 'PROGRESSION',
        moodTag: 'HAPPY',
        summary: 'Weekly challenge complete',
        body: `Completed: ${c.label}`,
        timestamp: now,
      });
    }
  }
}

const isValidStat = (key) =>
  ['hunger', 'happiness', 'energy', 'cleanliness'].includes(key);

function getStageMultiplier(state, statKey) {
  const stageKey = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  const modifiers =
    LIFECYCLE_STAGE_MODIFIERS[stageKey] ||
    LIFECYCLE_STAGE_MODIFIERS[DEFAULT_LIFE_STAGE.stage] ||
    {};
  return modifiers[statKey] ?? 1;
}

function ensurePottyState(state) {
  if (!state.potty || typeof state.potty !== 'object') {
    state.potty = {
      training: 0,
      lastSuccessAt: null,
      lastAccidentAt: null,
      totalSuccesses: 0,
      totalAccidents: 0,
    };
  }
  return state.potty;
}

function applyDecay(state, now = nowMs()) {
  if (!state.lastUpdatedAt) {
    state.lastUpdatedAt = now;
    return;
  }

  let dtMinutes = (now - state.lastUpdatedAt) / (1000 * 60);
  if (!Number.isFinite(dtMinutes) || dtMinutes <= 0) return;

  dtMinutes = Math.min(dtMinutes, DECAY_V2.tick.hardCapMinutes);

  // ensure new fields exist for older saves
  if (typeof state.wellbeing !== 'number') state.wellbeing = 60;
  if (typeof state.careDebt !== 'number') state.careDebt = 0;
  if (!state.sleepState || typeof state.sleepState !== 'object') {
    state.sleepState = { mode: 'AWAKE', minutesLeft: 0 };
  }
  ensurePottyState(state);

  // Neglect strike/journal (once if >= 24h since last update)
  if (dtMinutes >= 24 * 60) {
    state.memory.neglectStrikes = Math.min(
      (state.memory.neglectStrikes || 0) + 1,
      999
    );
    pushJournalEntry(state, {
      type: 'NEGLECT',
      moodTag: 'LONELY',
      summary: 'Dear hooman… I missed you.',
      body:
        'Dear hooman,\n\nI wasn’t sure if you were chasing squirrels or just busy, ' +
        'but I got pretty lonely while you were gone. Next time, can we play a little sooner?\n\n– your pup',
      timestamp: now,
    });
  }

  const fullSim = Math.min(dtMinutes, DECAY_V2.tick.fullSimMinutes);
  const extraSim = Math.max(0, dtMinutes - fullSim);

  simulateDecayMinutes(state, fullSim, now, {
    decayMultiplier: 1.0,
    goodFloor: DECAY_V2.zones.goodFloor,
    needCeiling: DECAY_V2.zones.needCeiling,
    allowAccidents: true,
  });

  if (extraSim > 0) {
    simulateDecayMinutes(state, extraSim, now, {
      decayMultiplier: DECAY_V2.tick.extraSimDecayMultiplier,
      goodFloor: DECAY_V2.tick.extraSimGoodFloor,
      needCeiling: DECAY_V2.tick.extraSimNeedCeiling,
      allowAccidents: false,
    });
  }

  state.lastUpdatedAt = now;
}

function simulateDecayMinutes(state, minutesTotal, now, opts) {
  const step = DECAY_V2.tick.stepMinutes;
  let remaining = minutesTotal;

  const stageKey = state.lifeStage?.stage || DEFAULT_LIFE_STAGE.stage;
  const stageCfg =
    DECAY_V2.lifeStages[stageKey] || DECAY_V2.lifeStages[LIFE_STAGES.ADULT];

  const h2 = stageCfg.hoursTo40;

  const base = {
    hungerNeed: basePointsPerMinuteFromHoursTo40(h2.hunger),
    energyDown: basePointsPerMinuteFromHoursTo40(h2.energy),
    happinessDown: basePointsPerMinuteFromHoursTo40(h2.happiness),
    cleanlinessDown: basePointsPerMinuteFromHoursTo40(h2.cleanliness),
    pottyNeed: basePointsPerMinuteFromHoursTo40(h2.potty),
  };

  // career perk: hunger increases faster/slower
  const hungerRateMult = state.career.perks?.hungerDecayMultiplier || 1.0;

  while (remaining > 0) {
    const stepMin = Math.min(step, remaining);
    remaining -= stepMin;

    const simNow = now - remaining * 60 * 1000;

    // Auto-nap: if energy low and not already asleep, enter AUTO sleep
    if (
      !state.isAsleep &&
      state.stats.energy <= DECAY_V2.sleep.autoEnterAtEnergyOrBelow
    ) {
      state.isAsleep = true;
      state.sleepState.mode = 'AUTO';
      state.sleepState.minutesLeft = DECAY_V2.sleep.autoMaxMinutes;
    }

    const asleepNow = !!state.isAsleep;
    const autoMode = state.sleepState?.mode === 'AUTO';

    // count down auto nap window
    if (asleepNow && autoMode) {
      state.sleepState.minutesLeft = Math.max(
        0,
        (state.sleepState.minutesLeft || 0) - stepMin
      );
    }

    // Need pressure drives wellbeing + debt
    const needPressure = avg(
      urgencyNeed(state.stats.hunger),
      urgencyGood(state.stats.energy),
      urgencyGood(state.stats.happiness),
      urgencyGood(state.stats.cleanliness),
      urgencyNeed(state.pottyLevel)
    );

    const wb = clamp(state.wellbeing, 0, 100);
    const protect = lerp(1.0, DECAY_V2.wellbeing.protectMin, wb / 100);
    const simMult = (opts.decayMultiplier ?? 1.0) * protect;

    // multipliers while asleep
    const sleepMult = asleepNow
      ? {
          hunger: DECAY_V2.sleep.hungerNeedMultiplierWhileAsleep,
          happiness: DECAY_V2.sleep.happinessDecayMultiplierWhileAsleep,
          potty: DECAY_V2.sleep.pottyNeedMultiplierWhileAsleep,
          cleanliness: DECAY_V2.sleep.cleanlinessDecayMultiplierWhileAsleep,
        }
      : { hunger: 1, happiness: 1, potty: 1, cleanliness: 1 };

    // HUNGER (need rises, soft-ceiling)
    {
      const ceiling = opts.needCeiling ?? DECAY_V2.zones.needCeiling;
      const zf = zoneFactorNeed(state.stats.hunger);
      const delta =
        base.hungerNeed *
        zf *
        simMult *
        hungerRateMult *
        sleepMult.hunger *
        stepMin;
      state.stats.hunger = clamp(
        Math.min(ceiling, state.stats.hunger + delta),
        0,
        100
      );
    }

    // HAPPINESS (good decays, soft-floor)
    {
      const floor = opts.goodFloor ?? DECAY_V2.zones.goodFloor;
      const zf = zoneFactorGood(state.stats.happiness);
      const delta =
        base.happinessDown * zf * simMult * sleepMult.happiness * stepMin;
      state.stats.happiness = clamp(
        Math.max(floor, state.stats.happiness - delta),
        0,
        100
      );
    }

    // CLEANLINESS (good decays, soft-floor)
    {
      const floor = opts.goodFloor ?? DECAY_V2.zones.goodFloor;
      const zf = zoneFactorGood(state.stats.cleanliness);
      const delta =
        base.cleanlinessDown * zf * simMult * sleepMult.cleanliness * stepMin;
      state.stats.cleanliness = clamp(
        Math.max(floor, state.stats.cleanliness - delta),
        0,
        100
      );
    }

    // POTTY LEVEL (need rises; respects cleanliness + training multipliers)
    {
      const effects = getCleanlinessEffect(state);
      const pottyGainMultiplier = effects.pottyGainMultiplier || 1;
      const trainingMultiplier = getPottyTrainingMultiplier(state); // 0.65 if trained
      const ceiling = opts.needCeiling ?? DECAY_V2.zones.needCeiling;

      const zf = zoneFactorNeed(state.pottyLevel);
      const delta =
        base.pottyNeed *
        zf *
        simMult *
        pottyGainMultiplier *
        trainingMultiplier *
        sleepMult.potty *
        stepMin;

      const cap = opts.allowAccidents ? 100 : ceiling;
      state.pottyLevel = clamp(Math.min(cap, state.pottyLevel + delta), 0, 100);
    }

    // ENERGY (decay or recover while asleep)
    if (state.isAsleep) {
      const rec = (stageCfg.energyRecoverPerMinuteWhileAsleep || 0.4) * stepMin;
      state.stats.energy = clamp(state.stats.energy + rec, 0, 100);

      // Auto wake conditions
      if (autoMode) {
        if (
          state.stats.energy >= DECAY_V2.sleep.autoWakeAtEnergyOrAbove ||
          (state.sleepState.minutesLeft || 0) <= 0
        ) {
          state.isAsleep = false;
          state.sleepState.mode = 'AWAKE';
          state.sleepState.minutesLeft = 0;
        }
      }
    } else {
      const floor = opts.goodFloor ?? DECAY_V2.zones.goodFloor;
      const zf = zoneFactorGood(state.stats.energy);
      const delta = base.energyDown * zf * simMult * stepMin;
      state.stats.energy = clamp(
        Math.max(floor, state.stats.energy - delta),
        0,
        100
      );
    }

    // ACCIDENTS (full sim only)
    if (opts.allowAccidents) {
      maybeTriggerAccidentV2(state, simNow);
    }

    // WELLBEING / CARE DEBT
    if (needPressure < 0.2) {
      state.wellbeing = clamp(
        state.wellbeing + DECAY_V2.wellbeing.regenPerMinuteWhenFine * stepMin,
        0,
        100
      );
      state.careDebt = clamp(
        state.careDebt - DECAY_V2.careDebt.forgivePerMinuteWhenFine * stepMin,
        0,
        DECAY_V2.careDebt.cap
      );
    } else {
      state.wellbeing = clamp(
        state.wellbeing -
          DECAY_V2.wellbeing.drainPerMinute * needPressure * stepMin,
        0,
        100
      );

      const extra =
        state.wellbeing <= DECAY_V2.wellbeing.fragileThreshold
          ? DECAY_V2.careDebt.buildExtraWhenWellbeingEmpty
          : 0;

      state.careDebt = clamp(
        state.careDebt +
          (DECAY_V2.careDebt.buildPerMinute * needPressure + extra) * stepMin,
        0,
        DECAY_V2.careDebt.cap
      );
    }
  }
}

function maybeTriggerAccidentV2(state, simNowMs) {
  ensurePottyState(state);

  const pottyLevel = state.pottyLevel ?? 0;
  if (pottyLevel < DECAY_V2.accidents.triggerAtPottyOrAbove) return;

  const lastAcc = state.potty.lastAccidentAt || 0;
  const cooldownMs = DECAY_V2.accidents.cooldownMinutes * 60 * 1000;
  if (lastAcc && simNowMs - lastAcc < cooldownMs) return;

  const trained = getPottyTrainingMultiplier(state) < 1;
  const baseChance = trained
    ? DECAY_V2.accidents.chancePerStepTrained
    : DECAY_V2.accidents.chancePerStepUntrained;

  const scale = clamp((pottyLevel - 95) / 5, 0, 1);
  const chance = clamp(baseChance * (1 + 0.5 * scale), 0, 0.95);

  if (Math.random() > chance) return;

  // Accident!
  state.potty.lastAccidentAt = simNowMs;
  state.potty.totalAccidents = (state.potty.totalAccidents || 0) + 1;

  state.pottyLevel = clamp(DECAY_V2.accidents.relieveTo, 0, 100);
  state.poopCount = (state.poopCount || 0) + 1;

  state.stats.cleanliness = clamp(
    (state.stats.cleanliness ?? 0) - DECAY_V2.accidents.cleanlinessPenalty,
    0,
    100
  );
  state.stats.happiness = clamp(
    (state.stats.happiness ?? 0) - DECAY_V2.accidents.happinessPenalty,
    0,
    100
  );
  state.careDebt = clamp(
    (state.careDebt ?? 0) + DECAY_V2.accidents.careDebtPenalty,
    0,
    DECAY_V2.careDebt.cap
  );

  pushJournalEntry(state, {
    type: 'CARE',
    moodTag: 'EMBARRASSED',
    summary: 'Accident indoors',
    body: 'Uh oh… your pup couldn’t hold it. Clean up the mess and try taking them out a bit sooner.',
    timestamp: simNowMs,
  });
}

function maybeSampleMood(state, now = nowMs(), reason = 'TICK') {
  const last = state.mood.lastSampleAt;
  if (last && now - last < MOOD_SAMPLE_MINUTES * 60 * 1000) return;

  const { hunger, happiness, energy, cleanliness } = state.stats;

  let tag = 'NEUTRAL';
  if (happiness > 75 && hunger < 60) tag = 'HAPPY';
  else if (hunger > 75) tag = 'HUNGRY';
  else if (energy < 30) tag = 'SLEEPY';
  else if (cleanliness < 30) tag = 'DIRTY';

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
      type: 'LEVEL_UP',
      moodTag: 'HAPPY',
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

  const clingy = findTrait('clingy');
  const toyObsessed = findTrait('toyObsessed');
  const foodMotivated = findTrait('foodMotivated');

  if (!clingy || !toyObsessed || !foodMotivated) {
    console.warn('[Doggerz] Missing temperament traits, skipping evaluation');
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
  const happyMoodCount = recentMoods.filter((m) => m.tag === 'HAPPY').length;
  const hungryMoodCount = recentMoods.filter((m) => m.tag === 'HUNGRY').length;
  const moodSentiment = {
    happy: happyMoodCount,
    hungry: hungryMoodCount,
  };

  const recentJournal = (state.journal?.entries || []).slice(0, 20);
  const trainingEntries = recentJournal.filter(
    (e) => e.type === 'TRAINING'
  ).length;
  const neglectEntries = recentJournal.filter(
    (e) => e.type === 'NEGLECT'
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
    clingy: 'SWEET',
    toyObsessed: 'SPICY',
    foodMotivated: 'CHILL',
  };

  t.primary = traitToLabel[top.id] || t.primary || 'SPICY';
  t.secondary = traitToLabel[second.id] || t.secondary || 'SWEET';

  t.lastEvaluatedAt = now;
}

function resolveCleanlinessTierFromValue(value = 0) {
  if (value >= CLEANLINESS_THRESHOLDS.FRESH) return 'FRESH';
  if (value >= CLEANLINESS_THRESHOLDS.DIRTY) return 'DIRTY';
  if (value >= CLEANLINESS_THRESHOLDS.FLEAS) return 'FLEAS';
  return 'MANGE';
}

function syncLifecycleState(state, now = nowMs()) {
  const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt || now;
  const age = calculateDogAge(adoptedAt);
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
  const previousTier = state.cleanlinessTier || 'FRESH';

  if (nextTier !== previousTier) {
    state.cleanlinessTier = nextTier;
    const tierEffect = CLEANLINESS_TIER_EFFECTS[nextTier];
    if (tierEffect?.journalSummary) {
      pushJournalEntry(state, {
        type: 'CARE',
        moodTag: 'DIRTY',
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

function applyCleanlinessPenalties(state, tierOverride) {
  const tier = tierOverride || state.cleanlinessTier || 'FRESH';
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
      type: 'TRAINING',
      moodTag: 'PROUD',
      summary: 'Potty training complete',
      body: 'Your puppy now knows how to signal when nature calls. Accidents will slow way down!',
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
    type: 'TRAINING',
    moodTag: 'FOCUSED',
    summary: 'Adult training complete',
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
    type: 'TRAINING',
    moodTag: 'RESTLESS',
    summary: 'Needs adult training',
    body: 'Too many days without a training session. Schedule time to practice commands!',
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
    if (typeof state.stats?.[stat] !== 'number') return;
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

function spawnCustomPoll(state, { id, prompt, effects, action, now }) {
  const pollState = ensurePollState(state);
  if (pollState.active) return null;

  const safeId = String(id || 'custom');
  pollState.active = {
    id: safeId,
    prompt: String(prompt || '...'),
    effects: effects || {},
    action: action || null,
    startedAt: now,
    expiresAt: now + AUTONOMY.promptTimeoutMs,
  };
  pollState.lastPromptId = safeId;
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
    maybeSampleMood(state, now, 'POLL_ACCEPT');
    pushJournalEntry(state, {
      type: 'POLL',
      moodTag: 'HAPPY',
      summary: 'You handled a dog poll',
      body: `You said yes to: ${active.prompt}`,
      timestamp: now,
    });
  } else {
    const penalty = reason === 'TIMEOUT' ? 6 : 4;
    state.stats.happiness = clamp(state.stats.happiness - penalty, 0, 100);
    maybeSampleMood(
      state,
      now,
      reason === 'TIMEOUT' ? 'POLL_TIMEOUT' : 'POLL_DECLINE'
    );
    pushJournalEntry(state, {
      type: 'POLL',
      moodTag: 'SASSY',
      summary: 'Ignored pup feedback',
      body:
        reason === 'TIMEOUT'
          ? 'The pup asked for help and eventually gave up.'
          : 'You said no this time. They took note!',
      timestamp: now,
    });
  }

  // Preference learning: if the dog asked for a specific action and you declined,
  // it becomes a bit less likely to ask again soon.
  try {
    const a = ensureAutonomyState(state);
    const action = active?.action;
    if (action && a?.preferences?.[action] != null) {
      const delta = accepted ? 1.5 : reason === 'TIMEOUT' ? -3 : -2;
      a.preferences[action] = clamp(
        Number(a.preferences[action]) + delta,
        0,
        100
      );
    }
  } catch {
    // ignore
  }

  pollState.history.unshift({
    id: active.id,
    prompt: active.prompt,
    accepted,
    reason: reason || (accepted ? 'ACCEPT' : 'DECLINE'),
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
  name: 'dog',
  initialState,
  reducers: {
    hydrateDog(state, { payload }) {
      if (!payload || typeof payload !== 'object') return;

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

      merged.lifeStage = payload.lifeStage ||
        state.lifeStage || { ...DEFAULT_LIFE_STAGE };

      merged.training = {
        ...createInitialTrainingState(),
        ...(payload.training || state.training || {}),
      };

      merged.progression = {
        ...initialProgression,
        ...(payload.progression || state.progression || {}),
      };

      // back-compat: ensure nested structures exist and are clamped
      ensureProgressionState(merged);

      merged.autonomy = {
        ...initialAutonomy,
        ...(payload.autonomy || state.autonomy || {}),
      };
      ensureAutonomyState(merged);

      merged.temperament = {
        ...initialTemperament,
        ...(payload.temperament || state.temperament || {}),
        adoptedAt,
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

      merged.journal = {
        ...initialJournal,
        ...(payload.journal || state.journal || {}),
      };

      merged.streak = {
        ...initialStreak,
        ...(payload.streak || state.streak || {}),
      };

      merged.lastAction =
        payload.lastAction ?? state.lastAction ?? initialState.lastAction;

      merged.cleanlinessTier =
        payload.cleanlinessTier || state.cleanlinessTier || 'FRESH';

      // decay v2 fields
      merged.wellbeing =
        typeof payload.wellbeing === 'number'
          ? clamp(payload.wellbeing, 0, 100)
          : typeof state.wellbeing === 'number'
          ? clamp(state.wellbeing, 0, 100)
          : initialState.wellbeing;

      merged.careDebt =
        typeof payload.careDebt === 'number'
          ? clamp(payload.careDebt, 0, 100)
          : typeof state.careDebt === 'number'
          ? clamp(state.careDebt, 0, 100)
          : initialState.careDebt;

      merged.sleepState = {
        ...(initialState.sleepState || {}),
        ...(state.sleepState || {}),
        ...(payload.sleepState || {}),
      };

      ensureTrainingState(merged);
      ensurePollState(merged);
      ensurePottyState(merged);

      // Ensure the season/week are initialized for older saves.
      ensureSeasonInitialized(merged, nowMs());
      ensureWeeklyChallenges(merged, nowMs());

      // Ensure autonomy has a reasonable next decision time.
      if (!merged.autonomy.nextDecisionAt) {
        merged.autonomy.nextDecisionAt =
          nowMs() + AUTONOMY.decisionMinIntervalMs;
      }

      finalizeDerivedState(merged, nowMs());
      return merged;
    },

    setDogName(state, { payload }) {
      state.name = payload || 'Pup';
    },

    setAdoptedAt(state, { payload }) {
      const adoptedAt = parseAdoptedAt(payload) ?? nowMs();
      state.temperament.adoptedAt = adoptedAt;
      state.adoptedAt = adoptedAt;
      finalizeDerivedState(state, adoptedAt);
    },

    setCareerLifestyle(state, { payload }) {
      const { lifestyle, perks } = payload || {};
      state.career.lifestyle = lifestyle || null;
      state.career.chosenAt = nowMs();
      if (perks && typeof perks === 'object') {
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

      state.stats.hunger = clamp(state.stats.hunger - amount, 0, 100);
      state.stats.happiness = clamp(
        state.stats.happiness + 5 * careerMultiplier,
        0,
        100
      );

      state.memory.lastFedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = 'feed';

      recordRoutineAction(state, 'feed', now);

      applyXp(state, 5);
      maybeSampleMood(state, now, 'FEED');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      awardProgressionXp(state, { seasonXp: 8, journeyXp: 3, now });
      bumpWeeklyChallengeProgress(state, 'feed', 1, now);

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    play(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      const zoomiesMultiplier = payload?.timeOfDay === 'MORNING' ? 2 : 1;
      const careerMultiplier =
        state.career.perks?.happinessGainMultiplier || 1.0;

      const baseHappiness = payload?.happinessGain ?? 15;
      const gain = baseHappiness * zoomiesMultiplier * careerMultiplier;

      state.stats.happiness = clamp(state.stats.happiness + gain, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 10, 0, 100);

      state.memory.lastPlayedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = 'play';

      recordRoutineAction(state, 'play', now);

      applyXp(state, 8);
      maybeSampleMood(state, now, 'PLAY');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      awardProgressionXp(state, { seasonXp: 10, journeyXp: 4, now });
      bumpWeeklyChallengeProgress(state, 'play', 1, now);

      const date = getIsoDate(now);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    rest(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.isAsleep = true;
      state.sleepState.mode = 'MANUAL';
      state.sleepState.minutesLeft = 0;

      state.stats.energy = clamp(state.stats.energy + 20, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);

      state.memory.lastSeenAt = now;
      state.lastAction = 'rest';

      recordRoutineAction(state, 'rest', now);

      applyXp(state, 3);
      maybeSampleMood(state, now, 'REST');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      // Rest gives tiny long-term progress, mostly to reward checking in.
      awardProgressionXp(state, { seasonXp: 3, journeyXp: 1, now });
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    wakeUp(state) {
      state.isAsleep = false;
      if (state.sleepState) {
        state.sleepState.mode = 'AWAKE';
        state.sleepState.minutesLeft = 0;
      }
      state.lastAction = 'wake';
    },

    bathe(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.stats.cleanliness = clamp(state.stats.cleanliness + 30, 0, 100);
      state.stats.happiness = clamp(state.stats.happiness - 5, 0, 100);

      state.memory.lastBathedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = 'bathe';

      recordRoutineAction(state, 'bathe', now);

      applyXp(state, 4);
      maybeSampleMood(state, now, 'BATHE');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      awardProgressionXp(state, { seasonXp: 9, journeyXp: 3, now });
      bumpWeeklyChallengeProgress(state, 'bathe', 1, now);
      updateTemperamentReveal(state, now);
      finalizeDerivedState(state, now);
    },

    // Optional manual increments (keep only for special events; DO NOT also run a timer with it)
    increasePottyLevel(state, { payload }) {
      const effects = getCleanlinessEffect(state);
      const multiplier = effects.pottyGainMultiplier || 1;
      const trainingMultiplier = getPottyTrainingMultiplier(state);
      const inc = (payload?.amount ?? 10) * multiplier * trainingMultiplier;
      state.pottyLevel = clamp(state.pottyLevel + inc, 0, 100);
    },

    goPotty(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      state.pottyLevel = 0;
      state.poopCount += 1;

      ensurePottyState(state);
      state.potty.lastSuccessAt = now;
      state.potty.totalSuccesses = (state.potty.totalSuccesses || 0) + 1;

      state.stats.happiness = clamp(state.stats.happiness + 3, 0, 100);
      state.memory.lastSeenAt = now;
      state.lastAction = 'potty';

      recordRoutineAction(state, 'potty', now);

      applyXp(state, 2);
      maybeSampleMood(state, now, 'POTTY');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      awardProgressionXp(state, { seasonXp: 6, journeyXp: 2, now });
      bumpWeeklyChallengeProgress(state, 'potty', 1, now);
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
        maybeSampleMood(state, now, 'SCOOP');

        ensureSeasonInitialized(state, now);
        ensureWeeklyChallenges(state, now);
        maybeRollSeason(state, now);
        awardProgressionXp(state, { seasonXp: 5, journeyXp: 2, now });
        bumpWeeklyChallengeProgress(state, 'scoop', 1, now);
      }
      state.memory.lastSeenAt = now;
      state.lastAction = 'scoop';

      finalizeDerivedState(state, now);
    },

    /* ------------- time / login ------------- */

    tickDog(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, 'TICK');
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
    },

    registerSessionStart(state, { payload }) {
      const now = payload?.now ?? nowMs();
      applyDecay(state, now);

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);

      // Session starts are valuable long-term progress (but still capped).
      awardProgressionXp(state, { seasonXp: 10, journeyXp: 5, now });
      bumpWeeklyChallengeProgress(state, 'session', 1, now);
      const tier = finalizeDerivedState(state, now);
      applyCleanlinessPenalties(state, tier);
      maybeSampleMood(state, now, 'SESSION_START');
      state.memory.lastSeenAt = now;
      state.lastAction = 'session_start';

      // Autonomy resets/cooldowns on session start.
      const a = ensureAutonomyState(state);
      a.nextDecisionAt = now + AUTONOMY.decisionMinIntervalMs;

      const date = new Date(now).toISOString().slice(0, 10);
      updateStreak(state.streak, date);
      updateTemperamentReveal(state, now);
      evaluateTemperament(state, now);
      applyAdultTrainingMissPenalty(state, now);
    },

    tickDogAutonomy(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const weather = payload?.weather || null;

      const a = ensureAutonomyState(state);
      ensurePollState(state);

      if (!a.enabled) return;
      if (a.nextDecisionAt && now < a.nextDecisionAt) return;

      // Never stack prompts.
      if (state.polls?.active) {
        a.nextDecisionAt = now + AUTONOMY.decisionMinIntervalMs;
        return;
      }

      const adoptedAt = state.adoptedAt || state.temperament?.adoptedAt || 0;
      const seed = `${adoptedAt}:${Math.floor(
        now / AUTONOMY.decisionMinIntervalMs
      )}`;
      const r = rand01FromSeed(seed);

      // Update boredom from time since last play.
      const lastPlay = state.memory?.lastPlayedAt || 0;
      const minsSincePlay = lastPlay ? (now - lastPlay) / 60000 : 999;
      if (minsSincePlay > 20) a.boredom = clamp(a.boredom + 3, 0, 100);
      else a.boredom = clamp(a.boredom - 2, 0, 100);

      const hungerNeed = clamp((state.stats?.hunger ?? 0) / 100, 0, 1);
      const pottyNeed = clamp((state.pottyLevel ?? 0) / 100, 0, 1);
      const restNeed = clamp((45 - (state.stats?.energy ?? 0)) / 45, 0, 1);
      const boredNeed = clamp(a.boredom / 100, 0, 1);
      const dirtyNeed = clamp(
        (55 - (state.stats?.cleanliness ?? 0)) / 55,
        0,
        1
      );
      const sadNeed = clamp((55 - (state.stats?.happiness ?? 0)) / 55, 0, 1);

      const toy = getTraitIntensity(state, 'toyObsessed') / 100;
      const food = getTraitIntensity(state, 'foodMotivated') / 100;
      const cling = getTraitIntensity(state, 'clingy') / 100;

      const pref = a.preferences || {};
      const prefW = (k) => clamp(Number(pref[k] ?? 50) / 100, 0.2, 1.2);

      // Habits (local hour) help the dog anticipate routine.
      const hbFeed = habitBias(state, 'feed', now);
      const hbPlay = habitBias(state, 'play', now);
      const hbPotty = habitBias(state, 'potty', now);
      const hbTrain = habitBias(state, 'train', now);

      // Weather context: when it's raining/snowing, the dog is more likely to ask for play/rest.
      const w = String(weather || '').toUpperCase();
      const isBadWeather = ['RAIN', 'STORM', 'SNOW'].some((x) => w.includes(x));

      const scores = {
        feed: (hungerNeed * (1.0 + 0.35 * food) + 0.2 * hbFeed) * prefW('feed'),
        potty: (pottyNeed * 1.1 + 0.15 * hbPotty) * prefW('potty'),
        play:
          (0.6 * sadNeed +
            0.55 * boredNeed +
            0.25 * toy +
            0.15 * hbPlay +
            0.15 * cling) *
          prefW('play') *
          (isBadWeather ? 1.1 : 1.0),
        rest: (0.9 * restNeed + 0.15 * (isBadWeather ? 1 : 0)) * prefW('rest'),
        bathe: dirtyNeed * prefW('bathe'),
        train:
          (0.4 * (1 - sadNeed) + 0.25 * hbTrain) *
          prefW('train') *
          (state.training?.potty?.completedAt ? 1.0 : 0.2),
      };

      const entries = Object.entries(scores).sort((a1, a2) => a2[1] - a1[1]);
      const [topKey, topScore] = entries[0] || ['none', 0];

      a.lastDecisionAt = now;
      a.lastDecision = { desire: topKey, score: Number(topScore || 0) };

      const canPrompt = now >= (a.cooldowns?.promptAt || 0);
      const canEmote = now >= (a.cooldowns?.emoteAt || 0);
      const timeOfDay = getTimeOfDayBucket(now);

      // If nothing is pressing, do a small emote sometimes.
      if (topScore < 0.35) {
        if (canEmote && r < 0.45) {
          const emotes = [
            { kind: 'EMOTE', message: 'Your pup sniffs around the yard.' },
            {
              kind: 'EMOTE',
              message: 'Your pup does a little stretch and settles.',
            },
            {
              kind: 'EMOTE',
              message: 'Your pup trots a small circle, tail wagging.',
            },
          ];
          const pick = emotes[Math.floor(r * emotes.length)] || emotes[0];
          const id = `${now}-emote-${Math.floor(r * 9999)}`;
          a.lastEvent = {
            id,
            ...pick,
            createdAt: now,
            expiresAt: now + 20_000,
          };
          a.cooldowns.emoteAt = now + AUTONOMY.emoteCooldownMs;
        }
        a.nextDecisionAt = now + AUTONOMY.decisionMinIntervalMs;
        return;
      }

      // Prompt if strong desire and cooldown allows.
      if (topScore >= 0.65 && canPrompt) {
        const prompts = {
          feed: {
            id: `ai_feed_${now}`,
            prompt:
              timeOfDay === 'MORNING'
                ? 'Good morning… can I get breakfast?'
                : 'Hooman… I’m getting hungry. Food time?',
            effects: { happiness: 2 },
            action: 'feed',
          },
          potty: {
            id: `ai_potty_${now}`,
            prompt: 'I need to go outside. Like… now.',
            effects: { happiness: 1 },
            action: 'potty',
          },
          play: {
            id: `ai_play_${now}`,
            prompt: isBadWeather
              ? 'It’s yucky outside… can we play inside?'
              : 'Can we play? I’ll bring you my toy!',
            effects: { happiness: 2, energy: -2 },
            action: 'play',
          },
          rest: {
            id: `ai_rest_${now}`,
            prompt: 'Can we chill for a bit? I’m sleepy.',
            effects: { energy: 4, happiness: 1 },
            action: 'rest',
          },
          bathe: {
            id: `ai_bathe_${now}`,
            prompt:
              'I feel kinda gross… bath time? (I will complain a little.)',
            effects: { happiness: -1 },
            action: 'bathe',
          },
          train: {
            id: `ai_train_${now}`,
            prompt: 'Wanna practice a trick? I’m feeling sharp.',
            effects: { happiness: 1 },
            action: 'train',
          },
        };

        const p = prompts[topKey];
        if (p) {
          spawnCustomPoll(state, { ...p, now });
          const id = `${now}-prompt-${topKey}`;
          a.lastEvent = {
            id,
            kind: 'PROMPT',
            message: p.prompt,
            createdAt: now,
            expiresAt: now + AUTONOMY.promptTimeoutMs,
          };
          a.cooldowns.promptAt = now + AUTONOMY.promptCooldownMs;
        }
      } else if (canEmote && r < 0.35) {
        // Mid-urgency: expressive behavior without interrupting.
        const messagesByDesire = {
          feed: 'Your pup sits near the food bowl and looks at you expectantly.',
          potty: 'Your pup wanders toward the door and sniffs around.',
          play: 'Your pup brings a toy over and drops it at your feet.',
          rest: 'Your pup flops down with a dramatic sigh.',
          bathe: 'Your pup scratches and shakes off as if annoyed by dirt.',
          train: 'Your pup sits up straight like they’re ready for commands.',
        };
        const msg = messagesByDesire[topKey] || 'Your pup looks around.';
        const id = `${now}-emote-${topKey}`;
        a.lastEvent = {
          id,
          kind: 'EMOTE',
          message: msg,
          createdAt: now,
          expiresAt: now + 20_000,
        };
        a.cooldowns.emoteAt = now + AUTONOMY.emoteCooldownMs;
      }

      a.nextDecisionAt = now + AUTONOMY.decisionMinIntervalMs;
    },

    tickDogPolls(state, { payload }) {
      const now = payload?.now ?? nowMs();
      const pollState = ensurePollState(state);
      if (pollState.active) {
        if (pollState.active.expiresAt && now >= pollState.active.expiresAt) {
          resolveActivePoll(state, {
            accepted: false,
            reason: 'TIMEOUT',
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
      const reason = payload?.reason || (accepted ? 'ACCEPT' : 'DECLINE');
      resolveActivePoll(state, { accepted, reason, now });
    },

    /* ------------- skills ------------- */

    trainObedience(state, { payload }) {
      const training = ensureTrainingState(state);
      const pottyDone = !!training?.potty?.completedAt;
      if (!pottyDone) {
        state.lastAction = 'trainBlocked';
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

      const trainingMultiplier =
        state.career.perks?.trainingXpMultiplier || 1.0;
      const adjustedXp = Math.round(xp * trainingMultiplier);

      applySkillXp('obedience', commandId, state.skills, adjustedXp);
      state.memory.lastTrainedAt = now;
      state.memory.lastSeenAt = now;
      state.lastAction = 'train';

      recordRoutineAction(state, 'train', now);

      state.stats.happiness = clamp(state.stats.happiness + 8, 0, 100);
      state.stats.energy = clamp(state.stats.energy - 5, 0, 100);

      applyXp(state, 10);
      completeAdultTrainingSession(state, now);
      maybeSampleMood(state, now, 'TRAINING');

      ensureSeasonInitialized(state, now);
      ensureWeeklyChallenges(state, now);
      maybeRollSeason(state, now);
      awardProgressionXp(state, { seasonXp: 14, journeyXp: 6, now });
      bumpWeeklyChallengeProgress(state, 'train', 1, now);

      pushJournalEntry(state, {
        type: 'TRAINING',
        moodTag: 'HAPPY',
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
export const selectDogSkills = (state) => state.dog.skills;
export const selectDogStreak = (state) => state.dog.streak;
export const selectDogLifeStage = (state) => state.dog.lifeStage;
export const selectDogCleanlinessTier = (state) => state.dog.cleanlinessTier;
export const selectDogPolls = (state) => state.dog.polls;
export const selectDogTraining = (state) => state.dog.training;
export const selectDogProgression = (state) => state.dog.progression;
export const selectDogAutonomy = (state) => state.dog.autonomy;

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
  bathe,
  increasePottyLevel,
  goPotty,
  scoopPoop,
  tickDog,
  tickDogAutonomy,
  registerSessionStart,
  tickDogPolls,
  respondToDogPoll,
  trainObedience,
  addJournalEntry,
  toggleDebug,
  resetDogState,
} = dogSlice.actions;

export default dogSlice.reducer;
