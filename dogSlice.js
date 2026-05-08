import { createSlice } from "@reduxjs/toolkit";

// --- Constants and Helpers ---
const MAX_STAT = 100;
const MIN_STAT = 0;

const DECAY_RATES_PER_HOUR = {
  hunger: 8, // % per hour
  thirst: 10, // % per hour
  energy: 15, // % per hour
  cleanliness: 5, // % per hour
};

const BOND_GAIN_PER_INTERACTION = 0.5; // % per interaction
const BOND_DECAY_PER_DAY = 1; // % per day if neglected

const LIFE_STAGE_THRESHOLDS_DAYS = {
  PUPPY: 0,
  ADULT: 60, // ~2 months
  SENIOR: 120, // ~4 months
};

const getMoodFromStats = (stats) => {
  if (!stats) return "neutral";

  const { hunger, thirst, energy, cleanliness, bond } = stats;

  if (hunger <= 20 || thirst <= 20) return "hungry/thirsty";
  if (energy <= 20) return "tired";
  if (cleanliness <= 20) return "dirty";
  if (bond <= 20) return "lonely";
  if (
    hunger >= 80 &&
    thirst >= 80 &&
    energy >= 80 &&
    cleanliness >= 80 &&
    bond >= 50
  )
    return "happy";

  return "neutral";
};

const getLifeStage = (ageDays) => {
  if (ageDays >= LIFE_STAGE_THRESHOLDS_DAYS.SENIOR) return "SENIOR";
  if (ageDays >= LIFE_STAGE_THRESHOLDS_DAYS.ADULT) return "ADULT";
  return "PUPPY";
};

// --- Initial State ---
const initialState = {
  // Core Identity
  id: null,
  name: "Fireball",
  adoptedAt: null,
  lastUpdatedAt: null, // Timestamp of the last simulation tick

  // Stats (0-100)
  stats: {
    hunger: MAX_STAT,
    thirst: MAX_STAT,
    energy: MAX_STAT,
    cleanliness: MAX_STAT,
    bond: 20, // Start with some initial bond
    happiness: 50,
  },

  // Lifecycle
  ageDays: 0,
  lifeStage: "PUPPY",
  isSleeping: false,

  // Other game-related states (simplified for Phase 7)
  pottyMastery: 0,
  inventory: {
    kibble: 5,
    premiumKibble: 0,
    toys: [],
  },
  // ... more dog-specific state will go here in later phases
};

// --- Dog Slice ---
const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setDog(state, action) {
      // Hydrate the entire dog state from persistence
      return { ...initialState, ...action.payload };
    },
    resetDog(state) {
      // Reset to initial state (e.g., after farewell or new game)
      return initialState;
    },
    adoptDog(state, action) {
      const { name, adoptedAt, now } = action.payload;
      state.id = `dog-${adoptedAt}`; // Simple ID for now
      state.name = name;
      state.adoptedAt = adoptedAt;
      state.lastUpdatedAt = now;
      state.stats = {
        hunger: MAX_STAT,
        thirst: MAX_STAT,
        energy: MAX_STAT,
        cleanliness: MAX_STAT,
        bond: 20,
        happiness: 50,
      };
      state.ageDays = 0;
      state.lifeStage = "PUPPY";
      state.isSleeping = false;
      state.pottyMastery = 0;
    },
    updateDogStats(state, action) {
      const { hunger, thirst, energy, cleanliness, bond, happiness } =
        action.payload;
      if (hunger !== undefined)
        state.stats.hunger = Math.max(MIN_STAT, Math.min(MAX_STAT, hunger));
      if (thirst !== undefined)
        state.stats.thirst = Math.max(MIN_STAT, Math.min(MAX_STAT, thirst));
      if (energy !== undefined)
        state.stats.energy = Math.max(MIN_STAT, Math.min(MAX_STAT, energy));
      if (cleanliness !== undefined)
        state.stats.cleanliness = Math.max(
          MIN_STAT,
          Math.min(MAX_STAT, cleanliness)
        );
      if (bond !== undefined)
        state.stats.bond = Math.max(MIN_STAT, Math.min(MAX_STAT, bond));
      if (happiness !== undefined)
        state.stats.happiness = Math.max(
          MIN_STAT,
          Math.min(MAX_STAT, happiness)
        );
    },
    // This is the core simulation tick for time-based progression
    simulationTick(state, action) {
      const now = action.payload.now;
      if (!state.adoptedAt || !state.lastUpdatedAt) {
        state.lastUpdatedAt = now;
        return;
      }

      const elapsedTimeMs = now - state.lastUpdatedAt;
      if (elapsedTimeMs <= 0) return;

      const elapsedHours = elapsedTimeMs / (1000 * 60 * 60);
      const elapsedDays = elapsedTimeMs / (1000 * 60 * 60 * 24);

      // 1. Apply decay to stats
      state.stats.hunger = Math.max(
        MIN_STAT,
        state.stats.hunger - DECAY_RATES_PER_HOUR.hunger * elapsedHours
      );
      state.stats.thirst = Math.max(
        MIN_STAT,
        state.stats.thirst - DECAY_RATES_PER_HOUR.thirst * elapsedHours
      );
      state.stats.cleanliness = Math.max(
        MIN_STAT,
        state.stats.cleanliness -
          DECAY_RATES_PER_HOUR.cleanliness * elapsedHours
      );

      // Energy decay is more complex, influenced by sleep
      if (state.isSleeping) {
        // Recover energy faster while sleeping
        state.stats.energy = Math.min(
          MAX_STAT,
          state.stats.energy + DECAY_RATES_PER_HOUR.energy * elapsedHours * 1.5
        );
      } else {
        state.stats.energy = Math.max(
          MIN_STAT,
          state.stats.energy - DECAY_RATES_PER_HOUR.energy * elapsedHours
        );
      }

      // Bond decay (if neglected)
      // Simplified: if average stats are low, bond decays
      const averageCareStat =
        (state.stats.hunger +
          state.stats.thirst +
          state.stats.cleanliness +
          state.stats.energy) /
        4;
      if (averageCareStat < 50) {
        state.stats.bond = Math.max(
          MIN_STAT,
          state.stats.bond - BOND_DECAY_PER_DAY * elapsedDays
        );
      }

      // 2. Update age and life stage
      state.ageDays += elapsedDays;
      state.lifeStage = getLifeStage(state.ageDays);

      // 3. Handle sleep/wake rhythm
      if (state.stats.energy <= 15 && !state.isSleeping) {
        state.isSleeping = true;
      } else if (state.stats.energy >= 80 && state.isSleeping) {
        state.isSleeping = false;
      }

      // 4. Update mood based on new stats
      state.stats.happiness = Math.max(
        MIN_STAT,
        Math.min(
          MAX_STAT,
          (state.stats.hunger +
            state.stats.thirst +
            state.stats.energy +
            state.stats.cleanliness +
            state.stats.bond) /
            5
        )
      );

      // 5. Update lastUpdatedAt
      state.lastUpdatedAt = now;
    },
    // --- Player-initiated actions (simplified for Phase 7) ---
    feed(state, action) {
      state.stats.hunger = Math.min(MAX_STAT, state.stats.hunger + 30);
      state.stats.bond = Math.min(
        MAX_STAT,
        state.stats.bond + BOND_GAIN_PER_INTERACTION
      );
      state.lastUpdatedAt = action.payload.now;
    },
    giveWater(state, action) {
      state.stats.thirst = Math.min(MAX_STAT, state.stats.thirst + 30);
      state.stats.bond = Math.min(
        MAX_STAT,
        state.stats.bond + BOND_GAIN_PER_INTERACTION
      );
      state.lastUpdatedAt = action.payload.now;
    },
    petDog(state, action) {
      state.stats.happiness = Math.min(MAX_STAT, state.stats.happiness + 15);
      state.stats.bond = Math.min(
        MAX_STAT,
        state.stats.bond + BOND_GAIN_PER_INTERACTION * 2
      ); // Petting gives more bond
      state.lastUpdatedAt = action.payload.now;
    },
    bathe(state, action) {
      state.stats.cleanliness = MAX_STAT;
      state.stats.happiness = Math.min(MAX_STAT, state.stats.happiness + 10);
      state.lastUpdatedAt = action.payload.now;
    },
    goPotty(state, action) {
      state.pottyMastery = Math.min(MAX_STAT, state.pottyMastery + 10);
      state.lastUpdatedAt = action.payload.now;
    },
    rest(state, action) {
      state.isSleeping = true;
      state.lastUpdatedAt = action.payload.now;
    },
    play(state, action) {
      state.stats.energy = Math.max(MIN_STAT, state.stats.energy - 10); // Playing consumes energy
      state.stats.happiness = Math.min(MAX_STAT, state.stats.happiness + 20);
      state.stats.bond = Math.min(
        MAX_STAT,
        state.stats.bond + BOND_GAIN_PER_INTERACTION * 1.5
      );
      state.lastUpdatedAt = action.payload.now;
    },
    // --- Potty training specific actions (simplified for Phase 8) ---
    pottySuccess(state, action) {
      state.pottyMastery = Math.min(MAX_STAT, state.pottyMastery + 5);
      state.lastUpdatedAt = action.payload.now;
    },
    pottyAccident(state, action) {
      state.pottyMastery = Math.max(MIN_STAT, state.pottyMastery - 2);
      state.stats.cleanliness = Math.max(
        MIN_STAT,
        state.stats.cleanliness - 10
      );
      state.stats.happiness = Math.max(MIN_STAT, state.stats.happiness - 5);
      state.lastUpdatedAt = action.payload.now;
    },
    // --- Training specific actions (simplified for Phase 8) ---
    trainObedience(state, action) {
      // This will be expanded in Phase 8
      state.stats.energy = Math.max(MIN_STAT, state.stats.energy - 5); // Training consumes energy
      state.stats.bond = Math.min(
        MAX_STAT,
        state.stats.bond + BOND_GAIN_PER_INTERACTION
      );
      state.lastUpdatedAt = action.payload.now;
    },
  },
});

// --- Selectors ---
export const selectDog = (state) => state.dog;
export const selectDogId = (state) => state.dog.id;
export const selectDogName = (state) => state.dog.name;
export const selectDogAdoptedAt = (state) => state.dog.adoptedAt;
export const selectDogStats = (state) => state.dog.stats;
export const selectDogLifeStage = (state) => state.dog.lifeStage;
export const selectDogAgeDays = (state) => state.dog.ageDays;
export const selectDogIsSleeping = (state) => state.dog.isSleeping;
export const selectDogPottyMastery = (state) => state.dog.pottyMastery;

export const selectDogMood = (state) => {
  const stats = selectDogStats(state);
  const isSleeping = selectDogIsSleeping(state);

  if (isSleeping) return "sleeping";

  // Determine mood based on stats
  if (stats.hunger <= 20) return "hungry";
  if (stats.thirst <= 20) return "thirsty";
  if (stats.energy <= 20) return "tired";
  if (stats.cleanliness <= 20) return "dirty";
  if (stats.bond <= 20) return "lonely";
  if (stats.happiness >= 80) return "happy";

  return "neutral";
};

export const selectIsDogAdopted = (state) => Boolean(state.dog.adoptedAt);

// --- Exports ---
export const {
  setDog,
  resetDog,
  adoptDog,
  updateDogStats,
  simulationTick,
  feed,
  giveWater,
  petDog,
  bathe,
  goPotty,
  rest,
  play,
  pottySuccess,
  pottyAccident,
  trainObedience,
} = dogSlice.actions;

export default dogSlice.reducer;
