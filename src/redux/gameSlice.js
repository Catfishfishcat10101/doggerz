import { createSlice } from "@reduxjs/toolkit";

/**
 * Minimal sim stats. Units are 0..100. Clamp on every write.
 * Decay is scaled by real elapsed time (so tab sleeps won't nuke the pup).
 */
const clamp = (v) => Math.max(0, Math.min(100, v));

const initialState = {
  // core stats
  hunger: 70,
  energy: 80,
  cleanliness: 85,
  happiness: 75,
  // meta
  lastTickAt: Date.now(),   // ms wall clock
  paused: false,
  // future: mood, stage, traits, etc.
};

const DECAY_PER_HOUR = {
  hunger: 12,       // gets hungry fastest
  energy: 8,
  cleanliness: 5,
  happiness: 3,     // slow drift down; interactions will lift this
};

// compute delta change for a dt in seconds
function step(state, dtSec) {
  const hr = dtSec / 3600;
  state.hunger = clamp(state.hunger - DECAY_PER_HOUR.hunger * hr);
  state.energy = clamp(state.energy - DECAY_PER_HOUR.energy * hr);
  state.cleanliness = clamp(state.cleanliness - DECAY_PER_HOUR.cleanliness * hr);

  // happiness influenced by others
  const hapBase = DECAY_PER_HOUR.happiness * hr;
  const hungerPenalty = (100 - state.hunger) * 0.02 * hr;      // 0–2 per hr
  const dirtyPenalty = (100 - state.cleanliness) * 0.015 * hr; // 0–1.5 per hr
  state.happiness = clamp(state.happiness - (hapBase + hungerPenalty + dirtyPenalty));
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    gameHydrated(state, { payload }) {
      return { ...state, ...payload };
    },
    gamePaused(state, { payload }) {
      state.paused = Boolean(payload);
    },
    // main tick; dt is seconds (fractional)
    gameTick(state, { payload }) {
      const now = Date.now();
      const last = state.lastTickAt ?? now;
      const dtMs = payload?.dtMs ?? (now - last);
      const dtClamped = Math.max(0, Math.min(dtMs, 30_000)); // cap runaway catch-up to 30s per frame
      state.lastTickAt = now;
      if (!state.paused) step(state, dtClamped / 1000);
    },
    // interactions (for later UI use)
    feed(state, { payload = 15 }) {
      state.hunger = clamp(state.hunger + payload);
      state.happiness = clamp(state.happiness + 5);
    },
    rest(state, { payload = 20 }) {
      state.energy = clamp(state.energy + payload);
    },
    wash(state, { payload = 25 }) {
      state.cleanliness = clamp(state.cleanliness + payload);
      state.happiness = clamp(state.happiness + 3);
    },
  },
});

export const {
  gameHydrated, gamePaused, gameTick,
  feed, rest, wash,
} = gameSlice.actions;

export const selectGame = (s) => s.game;
export default gameSlice.reducer;
