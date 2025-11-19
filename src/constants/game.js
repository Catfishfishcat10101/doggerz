export const SKILL_LEVEL_STEP = 50;
export const DEFAULT_TICK_INTERVAL = 120; // seconds
export const CLOUD_SAVE_DEBOUNCE = 3000; // milliseconds

// Life stages (in game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" }, // 0-6 months
  ADULT: { min: 181, max: 2555, label: "Adult" }, // 6mo-7yrs
  SENIOR: { min: 2556, max: 5475, label: "Senior" }, // 7-15yrs
};

// Weather API
export const WEATHER_API_KEY = "YOUR_API_KEY_HERE"; // Get free key at openweathermap.org
export const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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
