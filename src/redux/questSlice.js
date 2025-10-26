// src/redux/questSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

function mkQuest(id, label, goal, reward) {
  return { id, label, goal, progress: 0, reward, done: false };
}

const initial = {
  dailies: [
    mkQuest("feed3", "Feed your dog 3×", 3, 40),
    mkQuest("play2", "Play with your dog 2×", 2, 35),
    mkQuest("wash1", "Wash or scoop 1×", 1, 25),
  ],
  refreshedAt: new Date().toDateString(),
};

const quest = createSlice({
  name: "quest",
  initialState: initial,
  reducers: {
    resetForNewDay: (s) => {
      const today = new Date().toDateString();
      if (s.refreshedAt !== today) {
        s.dailies = [
          mkQuest(nanoid(), "Feed your dog 3×", 3, 40),
          mkQuest(nanoid(), "Play with your dog 2×", 2, 35),
          mkQuest(nanoid(), "Wash or scoop 1×", 1, 25),
        ];
        s.refreshedAt = today;
      }
    },
    progress: (s, { payload: key }) => {
      const q = s.dailies.find((q) => q.label.toLowerCase().includes(key));
      if (!q || q.done) return;
      q.progress = Math.min(q.goal, q.progress + 1);
      if (q.progress >= q.goal) q.done = true;
    },
    claim: (s, { payload: id }) => {
      const q = s.dailies.find((x) => x.id === id);
      if (q && q.done) {
        q.rewardClaimed = true;
      }
    },
  },
});

export const { resetForNewDay, progress, claim } = quest.actions;
export const selectDailies = (st) => st.quest.dailies;
export default quest.reducer;
