import { createSlice } from "@reduxjs/toolkit";

export const initialDogState = {
  name: "Fireball",
  level: 1,
  ageDays: 0,
  xp: 0,
  needs: { hunger: 80, energy: 90, potty: 20, hygiene: 90, happiness: 95 },
  milestones: [],
};

const slice = createSlice({
  name: "dog",
  initialState: initialDogState,
  reducers: {
    setName(state, { payload }) { state.name = payload; },
    addXP(state, { payload }) {
      state.xp += payload;
      while (state.xp >= 100) { state.level += 1; state.xp -= 100; }
    },
    tickDay(state) { state.ageDays += 1; },
    updateNeed(state, { payload: { key, delta } }) {
      state.needs[key] = Math.max(0, Math.min(100, state.needs[key] + delta));
    },
  },
});

export const { setName, addXP, tickDay, updateNeed } = slice.actions;
export default slice.reducer;