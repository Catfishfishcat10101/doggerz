// src/config/dogConfig.js
export const GROWTH = {
  // Real-world durations for stages (in days). Make these BIG to “take a long time”.
  STAGES: [
    { id: "newborn",   label: "Newborn",   minDays: 0,   maxDays: 7  },
    { id: "puppy",     label: "Puppy",     minDays: 7,   maxDays: 45 },
    { id: "adolescent",label: "Adolescent",minDays: 45,  maxDays: 180},
    { id: "adult",     label: "Adult",     minDays: 180, maxDays: 540},
    { id: "senior",    label: "Senior",    minDays: 540, maxDays: Infinity },
  ],

  // Time multiplier. 1 = real time; 0.5 = slower than real; 5 = 5x faster (for testing).
  // For production: keep this at 1 or <1 to make growth take LONG.
  TIME_MULTIPLIER: Number(import.meta.env.VITE_DOG_TIME_MULTIPLIER ?? 1),

  // Energy/hunger/happiness budgets
  NEEDS: {
    HUNGER_DECAY_PER_HR: 3,
    ENERGY_DECAY_PER_HR: 4,
    HAPPINESS_DECAY_PER_HR: 1,
    TRAIN_ENERGY_COST: 8,
    FEED_HUNGER_GAIN: 25,
    REST_ENERGY_GAIN: 25,
    PET_HAPPINESS_GAIN: 10,
  },

  // Trainable skills
  SKILLS: [
    { id: "sit",     label: "Sit" },
    { id: "stay",    label: "Stay" },
    { id: "fetch",   label: "Fetch" },
    { id: "roll",    label: "Roll Over" },
    { id: "speak",   label: "Speak" },
  ],
};