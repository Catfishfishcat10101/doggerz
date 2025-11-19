export const SKILL_LEVEL_STEP = 50;
export const DEFAULT_TICK_INTERVAL = 120; // seconds
export const CLOUD_SAVE_DEBOUNCE = 3000; // milliseconds
export const GAME_DAYS_PER_REAL_DAY = 4;

// Life stages (in game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" }, // 0-6 months
  ADULT: { min: 181, max: 2555, label: "Adult" }, // 6mo-7yrs
  SENIOR: { min: 2556, max: 5475, label: "Senior" }, // 7-15yrs
};

export const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: {
    hunger: 1.15,
    happiness: 1,
    energy: 0.85,
    cleanliness: 0.95,
  },
  ADULT: {
    hunger: 1,
    happiness: 1,
    energy: 1,
    cleanliness: 1,
  },
  SENIOR: {
    hunger: 0.9,
    happiness: 1.05,
    energy: 1.2,
    cleanliness: 1.15,
  },
};

export const CLEANLINESS_THRESHOLDS = {
  FRESH: 75,
  DIRTY: 50,
  FLEAS: 25,
  MANGE: 0,
};

export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: "Fresh",
    pottyGainMultiplier: 1,
  },
  DIRTY: {
    label: "Dirty",
    happinessTickPenalty: 1,
    pottyGainMultiplier: 1.1,
    journalSummary: "Needs bath soon.",
  },
  FLEAS: {
    label: "Fleas",
    happinessTickPenalty: 2,
    energyTickPenalty: 1,
    pottyGainMultiplier: 1.25,
    journalSummary: "Scratching nonstop!",
  },
  MANGE: {
    label: "Mange",
    happinessTickPenalty: 3,
    energyTickPenalty: 2,
    pottyGainMultiplier: 1.5,
    journalSummary: "Health is declining!",
  },
};

export const DOG_POLL_CONFIG = {
  intervalMs: 5 * 60 * 1000,
  timeoutMs: 90 * 1000,
  prompts: [
    {
      id: "snack",
      prompt: "Offer a crunchy snack?",
      effects: { hunger: -12, happiness: 6 },
    },
    {
      id: "play",
      prompt: "Start a quick fetch session?",
      effects: { happiness: 10, energy: -8 },
    },
    {
      id: "nap",
      prompt: "Guide them into a power nap?",
      effects: { energy: 15, happiness: -3 },
    },
    {
      id: "bath",
      prompt: "Give a rinse before dirt gets worse?",
      effects: { cleanliness: 18, happiness: -4 },
    },
  ],
};

// Weather API
export const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";
export const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
export const DEFAULT_WEATHER_ZIP =
  import.meta.env.VITE_WEATHER_DEFAULT_ZIP || "10001";

// Time of day thresholds (hours)
export const TIME_PERIODS = {
  DAWN: { start: 5, end: 7, label: "Dawn" },
  MORNING: { start: 7, end: 12, label: "Morning" },
  AFTERNOON: { start: 12, end: 17, label: "Afternoon" },
  DUSK: { start: 17, end: 19, label: "Dusk" },
  EVENING: { start: 19, end: 22, label: "Evening" },
  NIGHT: { start: 22, end: 5, label: "Night" },
};

// Monetization
export const PREMIUM_FEATURES = {
  MULTI_DOGS: { price: 4.99, coins: 0 },
  RARE_BREEDS: { price: 2.99, coins: 5000 },
  CUSTOM_ACCESSORIES: { price: 1.99, coins: 2000 },
  LIFETIME_PREMIUM: { price: 19.99, coins: 0 },
};

export const AD_PLACEMENT = {
  INTERSTITIAL_COOLDOWN: 5 * 60 * 1000, // 5 minutes
  REWARDED_COIN_BONUS: 100,
  REWARDED_XP_BOOST: 1.5,
};
