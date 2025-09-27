// src/redux/economySlice.js
import { createSlice } from "@reduxjs/toolkit";

const initial = { coins: 100, gems: 0, lastClaim: 0, streak: 0 };

const economy = createSlice({
  name: "economy",
  initialState: initial,
  reducers: {
    spend: (s, { payload }) => { s.coins = Math.max(0, s.coins - payload); },
    earn: (s, { payload }) => { s.coins += payload; },
    rewardPassive: (s, { payload = 1 }) => { s.coins += payload; },
    grantGems: (s, { payload = 1 }) => { s.gems += payload; },
    dailyClaim: (s) => {
      const today = new Date().toDateString();
      const last = new Date(s.lastClaim || 0).toDateString();
      if (today !== last) {
        s.streak = (last && (Date.now() - s.lastClaim) < 48*60*60*1000) ? s.streak + 1 : 1;
        s.lastClaim = Date.now();
        s.coins += 50 + 10 * s.streak; // escalating daily reward
      }
    }
  }
});

export const { spend, earn, rewardPassive, grantGems, dailyClaim } = economy.actions;
export const selectWallet = (st) => st.economy;
export default economy.reducer;