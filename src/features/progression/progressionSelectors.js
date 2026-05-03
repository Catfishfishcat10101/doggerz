// src/features/progression/progressionSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectProgression = (state) => state?.progression || null;

export const selectOwnerProgression = createSelector(
  [selectProgression],
  (progression) => progression?.owner || null
);

export const selectBondProgression = createSelector(
  [selectProgression],
  (progression) => progression?.bond || null
);

export const selectLifeStageProgression = createSelector(
  [selectProgression],
  (progression) => progression?.lifeStage || null
);

export const selectTrainingProgression = createSelector(
  [selectProgression],
  (progression) => progression?.training || null
);

export const selectProgressionTracks = createSelector(
  [selectTrainingProgression],
  (training) => training?.tracks || {}
);

export const selectProgressionTrackById = (state, trackId) => {
  const tracks = selectProgressionTracks(state);
  return tracks?.[String(trackId || "").trim()] || null;
};

export const selectProgressionStreaks = createSelector(
  [selectProgression],
  (progression) => progression?.streaks || null
);

export const selectProgressionUnlocks = createSelector(
  [selectProgression],
  (progression) => progression?.unlocks || null
);

export const selectUnlockedFeatures = createSelector(
  [selectProgressionUnlocks],
  (unlocks) => unlocks?.features || []
);

export const selectUnlockedItems = createSelector(
  [selectProgressionUnlocks],
  (unlocks) => unlocks?.items || []
);

export const selectUnlockedInteractions = createSelector(
  [selectProgressionUnlocks],
  (unlocks) => unlocks?.interactions || []
);

export const selectUnlockedMemories = createSelector(
  [selectProgression],
  (progression) => progression?.memories || []
);

export const selectProgressionMilestoneQueue = createSelector(
  [selectProgression],
  (progression) => progression?.milestoneQueue || []
);

export const selectNextProgressionMilestone = createSelector(
  [selectProgressionMilestoneQueue],
  (queue) => queue?.[0] || null
);

export const selectHasProgressionMilestones = createSelector(
  [selectProgressionMilestoneQueue],
  (queue) => Array.isArray(queue) && queue.length > 0
);

export const selectReliableCommandCount = createSelector(
  [selectTrainingProgression],
  (training) => Number(training?.reliableCommandCount || 0)
);

export const selectMasteredCommandCount = createSelector(
  [selectTrainingProgression],
  (training) => Number(training?.masteredCommandCount || 0)
);

export const selectPottyTrainingTrack = (state) =>
  selectProgressionTrackById(state, "potty");
