// src/store/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeGameTab: "main",
    trainingBadgeNew: false,
  },
  reducers: {
    setActiveGameTab(state, action) {
      state.activeGameTab = action.payload;
      if (action.payload === "training") state.trainingBadgeNew = false;
    },
    setTrainingBadgeNew(state, action) {
      state.trainingBadgeNew = action.payload;
    },
  },
});

export const { setActiveGameTab, setTrainingBadgeNew } = uiSlice.actions;
export default uiSlice.reducer;
