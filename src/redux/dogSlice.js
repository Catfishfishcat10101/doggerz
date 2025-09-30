import { createSlice } from "@reduxjs/toolkit";

const clamp = (v) => Math.max(0, Math.min(100, v));

// how long to lose 1 point (seconds per point)
const DECAY_S_PER_POINT_IDLE = { hunger: 300, energy: 480, cleanliness: 720 };   // 5m, 8m, 12m
const DECAY_S_PER_POINT_MOVE = { hunger: 180, energy: 120, cleanliness: 480 };   // faster while moving

const initialState = {
  name: "Pupper",
  hunger: 80,
  energy: 80,
  cleanliness: 80,
  happiness: 80,
  x: 200, y: 260,
  moving: false,
};

const perSecond = (isMoving) =>
  isMoving ? DECAY_S_PER_POINT_MOVE : DECAY_S_PER_POINT_IDLE;

export const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setMoving(state, { payload }) { state.moving = !!payload; },
    move(state, { payload }) { state.x += payload.dx || 0; state.y += payload.dy || 0; },
    tick(state, { payload = 1 }) {
      const s = payload; // seconds elapsed
      const rate = perSecond(state.moving);
      state.hunger      = clamp(state.hunger      - s / rate.hunger);
      state.energy      = clamp(state.energy      - s / rate.energy);
      state.cleanliness = clamp(state.cleanliness - s / rate.cleanliness);
      const avg = (state.hunger + state.energy + state.cleanliness) / 3;
      state.happiness = clamp(0.8 * state.happiness + 0.2 * avg);
    },
    feed(state) { state.hunger = clamp(state.hunger + 10); },         // keep for keyboard cheats if you want
    wash(state) { state.cleanliness = clamp(state.cleanliness + 10); },
    rest(state) { state.energy = clamp(state.energy + 10); },
  },
});

export const { setMoving, move, tick, feed, wash, rest } = dogSlice.actions;
export default dogSlice.reducer;