import { createSlice } from "@reduxjs/toolkit";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Gentle decay (no clicker grind)
const IDLE_DECAY_PER_SEC = { hunger: 0.02, energy: 0.01, cleanliness: 0.01 };
const MOVE_DECAY_PER_SEC = { hunger: 0.06, energy: 0.10, cleanliness: 0.02 };

const initialState = {
  name: null,
  mood: "idle",
  stats: { hunger: 100, energy: 100, cleanliness: 100 },
  pos: { x: 96, y: 300 }, // left-ish start, visible
  speed: 140,             // px/sec
  moving: false,
  lastTickAt: null,       // ms
  needToGo: false,        // toggles over time; “Go Potty” enabled when true
};

const slice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setName(state, action) {
      state.name = String(action.payload || "").slice(0, 24) || null;
    },
    setMoving(state, action) {
      state.moving = !!action.payload;
      if (!state.moving && state.mood === "walking") state.mood = "idle";
      if (state.moving) state.mood = "walking";
    },
    move(state, action) {
      const { dx = 0, dy = 0 } = action.payload || {};
      state.pos.x = clamp(state.pos.x + dx, 0, 1920 - 96);
      state.pos.y = clamp(state.pos.y + dy, 0, 1080 - 96);
    },
    tick(state, action) {
      const now = Date.now();
      const dt =
        typeof action.payload?.dt === "number"
          ? Math.max(0, action.payload.dt)
          : state.lastTickAt
          ? (now - state.lastTickAt) / 1000
          : 0.016;
      state.lastTickAt = now;

      const decay = state.moving ? MOVE_DECAY_PER_SEC : IDLE_DECAY_PER_SEC;
      state.stats.hunger = clamp(state.stats.hunger - decay.hunger * dt, 0, 100);
      state.stats.energy = clamp(state.stats.energy - decay.energy * dt, 0, 100);
      state.stats.cleanliness = clamp(
        state.stats.cleanliness - decay.cleanliness * dt,
        0,
        100
      );

      // “needToGo” builds up slowly when the pup is awake
      if (state.stats.cleanliness > 0) {
        // ~ every 20–40 seconds of active play, flip true
        if (Math.random() < dt / 35) state.needToGo = true;
      }

      // simple mood logic
      if (state.stats.energy < 15) state.mood = "tired";
      else if (state.stats.hunger < 15) state.mood = "hungry";
      else if (!state.moving && state.mood !== "tired" && state.mood !== "hungry") state.mood = "idle";
    },
    takeOutside(state) {
      // Only “works” if in the yard; caller checks x >= 1400
      state.needToGo = false;
      state.stats.cleanliness = clamp(state.stats.cleanliness + 10, 0, 100);
      state.mood = "relieved";
    },
  },
});

export const { setName, setMoving, move, tick, takeOutside } = slice.actions;
export default slice.reducer;

// —— Selectors
export const selectDog = (s) => s.dog;
export const selectDogName = (s) => s.dog.name;