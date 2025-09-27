// src/redux/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const MIN = 60 * 1000;
const DECAY = { hunger: 1.2, energy: 1.0, fun: 0.9, hygiene: 0.6 }; // per hour
const CLAMP = (n) => Math.max(0, Math.min(100, Math.round(n)));

function applyDecay(stats, elapsedMs) {
  const hrs = elapsedMs / (60 * MIN);
  return {
    hunger:  CLAMP(stats.hunger  - DECAY.hunger  * hrs),
    energy:  CLAMP(stats.energy  - DECAY.energy  * hrs),
    fun:     CLAMP(stats.fun     - DECAY.fun     * hrs),
    hygiene: CLAMP(stats.hygiene - DECAY.hygiene * hrs),
  };
}

function computeMood({ hunger, energy, fun, hygiene }) {
  const avg = (hunger + energy + fun + hygiene) / 4;
  if (avg >= 85) return "ecstatic";
  if (avg >= 70) return "happy";
  if (avg >= 55) return "content";
  if (avg >= 40) return "needy";
  if (avg >= 25) return "grumpy";
  return "miserable";
}

const personalities = ["brave", "goofy", "chill", "clingy", "chaotic"];

const initialState = {
  id: nanoid(),
  name: "Pupper",
  level: 1,
  xp: 0,
  nextXp: 100,
  stats: { hunger: 80, energy: 80, fun: 80, hygiene: 80 },
  mood: "happy",
  poopCount: 0,
  sick: false,
  personality: personalities[Math.floor(Math.random() * personalities.length)],
  lastTick: Date.now(),
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    hydrateFromSave: (s, { payload }) => ({ ...s, ...payload }),
    setName: (s, { payload }) => { s.name = payload?.trim() || "Pupper"; },

    tick: (s) => {
      const now = Date.now();
      const elapsed = now - s.lastTick;
      if (elapsed < 500) { s.lastTick = now; return; }
      s.stats = applyDecay(s.stats, elapsed);
      // ambient poop chance when hygiene is low
      if (s.stats.hygiene < 35 && Math.random() < 0.005) s.poopCount += 1;
      s.mood = computeMood(s.stats);
      s.lastTick = now;
    },

    feed: (s) => {
      s.stats.hunger = CLAMP(s.stats.hunger + 22);
      s.stats.energy = CLAMP(s.stats.energy + 6);
      s.xp += 6;
    },

    play: (s) => {
      s.stats.fun = CLAMP(s.stats.fun + 24);
      s.stats.energy = CLAMP(s.stats.energy - 10);
      s.xp += 8;
    },

    wash: (s) => {
      s.stats.hygiene = CLAMP(s.stats.hygiene + 30);
      s.poopCount = Math.max(0, s.poopCount - 1);
      s.xp += 5;
    },

    rest: (s) => {
      s.stats.energy = CLAMP(s.stats.energy + 28);
      s.stats.fun = CLAMP(s.stats.fun - 6);
      s.xp += 4;
    },

    scoopPoop: (s) => {
      if (s.poopCount > 0) { s.poopCount -= 1; s.xp += 3; }
    },

    levelCheck: (s) => {
      while (s.xp >= s.nextXp) {
        s.xp -= s.nextXp;
        s.level += 1;
        s.nextXp = Math.round(s.nextXp * 1.2);
        // minor stat bump each level
        s.stats.fun = CLAMP(s.stats.fun + 5);
      }
    },
  },
});

export const {
  hydrateFromSave, setName, tick, feed, play, wash, rest, scoopPoop, levelCheck
} = dogSlice.actions;

export const selectDog = (st) => st.dog;
export const selectStats = (st) => st.dog.stats;
export const selectMood = (st) => st.dog.mood;
export default dogSlice.reducer;