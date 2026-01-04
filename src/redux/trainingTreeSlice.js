/** @format */

// src/redux/trainingTreeSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";
import {
  allSkillNodes,
  getSkillNode,
  skillPrereqsMet,
} from "@/constants/trainingTree.js";
import {
  computeRustDelta,
  applyRustToLevel,
  applyPracticeToLevel,
} from "@/utils/trainingMaintenance.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const initialState = {
  skillPoints: 3,
  skills: {},

  equippedPose: null,

  // timed “show animation” feedback
  previewPose: null,
  previewUntil: 0,

  lastGlobalMaintenanceAt: Date.now(),
};

function ensureSkill(state, skillId) {
  if (!state.skills[skillId]) {
    state.skills[skillId] = {
      unlocked: false,
      level: 0,
      lastPracticedAt: 0,
      lastMaintainedAt: Date.now(),
      history: [],
    };
  }
  return state.skills[skillId];
}

function unlockedSet(state) {
  const s = new Set();
  for (const [id, v] of Object.entries(state.skills))
    if (v?.unlocked) s.add(id);
  return s;
}

export const trainingTreeSlice = createSlice({
  name: "trainingTree",
  initialState,
  reducers: {
    grantSkillPoints(state, action) {
      state.skillPoints += clamp(Number(action.payload || 0), 0, 9999);
    },

    setEquippedPose(state, action) {
      state.equippedPose = action.payload ? String(action.payload) : null;
    },

    // show a pose for N ms (visible animation/pose feedback)
    previewPoseForMs(state, action) {
      const { pose, ms = 2000 } = action.payload || {};
      if (!pose) return;
      state.previewPose = String(pose);
      state.previewUntil = Date.now() + clamp(Number(ms), 250, 10000);
    },

    unlockSkill(state, action) {
      const skillId = String(action.payload || "");
      const node = getSkillNode(skillId);
      if (!node) return;

      const entry = ensureSkill(state, skillId);
      if (entry.unlocked) return;

      const u = unlockedSet(state);
      if (!skillPrereqsMet(skillId, u)) return;

      const cost = clamp(Number(node.cost || 1), 1, 999);
      if (state.skillPoints < cost) return;

      state.skillPoints -= cost;
      entry.unlocked = true;

      // baseline effect immediately
      entry.level = Math.max(entry.level, 15);
      entry.lastPracticedAt = Date.now();
      entry.lastMaintainedAt = Date.now();

      entry.history.push({
        id: nanoid(),
        t: Date.now(),
        type: "unlock",
        note: `Unlocked ${node.label}`,
      });

      // visible feedback
      state.previewPose = node.pose || state.previewPose;
      state.previewUntil = Date.now() + 2000;
    },

    practiceSkill(state, action) {
      const { skillId, amount = 14 } = action.payload || {};
      const id = String(skillId || "");
      const node = getSkillNode(id);
      if (!node) return;

      const entry = ensureSkill(state, id);
      if (!entry.unlocked) return;

      const now = Date.now();
      const amt = clamp(Number(amount), 1, 50);

      entry.level = applyPracticeToLevel(entry.level, amt);
      entry.lastPracticedAt = now;
      entry.lastMaintainedAt = now;

      entry.history.push({
        id: nanoid(),
        t: now,
        type: "practice",
        note: `Practiced ${node.label} (+${amt})`,
      });

      // visible feedback
      state.previewPose = node.pose || state.previewPose;
      state.previewUntil = now + 2000;
    },

    applySkillRust(state, action) {
      const now = action.payload?.now ? Number(action.payload.now) : Date.now();

      for (const node of allSkillNodes()) {
        const entry = ensureSkill(state, node.id);
        if (!entry.unlocked) continue;

        const rust = computeRustDelta({
          skillId: node.id,
          currentLevel: entry.level,
          lastMaintainedAt: entry.lastMaintainedAt,
          now,
        });

        if (rust <= 0) continue;

        const before = entry.level;
        entry.level = applyRustToLevel(entry.level, rust);
        entry.lastMaintainedAt = now;

        if (before - entry.level >= 2) {
          entry.history.push({
            id: nanoid(),
            t: now,
            type: "rust",
            note: `Rust set in on ${node.label} (-${(before - entry.level).toFixed(1)})`,
          });
        }
      }

      state.lastGlobalMaintenanceAt = now;
    },
  },
});

export const {
  grantSkillPoints,
  setEquippedPose,
  previewPoseForMs,
  unlockSkill,
  practiceSkill,
  applySkillRust,
} = trainingTreeSlice.actions;

export default trainingTreeSlice.reducer;

/* selectors */
export const selectTrainingTree = (s) => s.trainingTree;
export const selectSkillPoints = (s) => s.trainingTree.skillPoints;
export const selectEquippedPose = (s) => s.trainingTree.equippedPose;
