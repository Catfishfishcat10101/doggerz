/** @format */

import { createSelector } from "@reduxjs/toolkit";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks.js";
import {
  bathe,
  feed,
  giveWater,
  goPotty,
  petDog,
  play,
  quickFeed,
  selectDog,
  selectDogAgeInfo,
  selectDogBond,
  selectDogCleanlinessMeta,
  selectCosmeticCatalog,
  selectDogDreams,
  selectDogDailyFlavor,
  selectDogGrowthMilestone,
  selectDogIdentityContent,
  selectDogIdentityProfile,
  selectDogJournal,
  selectDogLegacyJourney,
  selectDogLifeStage,
  selectDogMilestoneCardQueue,
  selectDogMemories,
  selectDogMemorial,
  selectDogMoodLabel,
  selectDogNeedsNormalized,
  selectDogPolls,
  selectDogPreferences,
  selectDogPrimaryFavoriteSummary,
  selectDogSkillTree,
  selectDogSkillTreePoints,
  selectDogSkillTreeUnlockedIds,
  selectDogStats,
  selectDogVacation,
  selectNextStreakReward,
  trainObedience,
} from "@/store/dogSlice.js";
import { selectDogRenderModel } from "@/components/dog/redux/dogSelectors.js";
import { scoreRecentMemoryDrives } from "@/components/dog/DogMemoryDrives.js";

const selectDogIdentityModel = createSelector(
  [
    selectDog,
    selectDogIdentityProfile,
    selectDogPrimaryFavoriteSummary,
    selectDogDailyFlavor,
  ],
  (dog, identityProfile, favoriteSummary, dailyFlavor) => ({
    profileId: String(identityProfile?.profileId || "").trim() || null,
    visualIdentity:
      String(identityProfile?.visualIdentity || "").trim() || "jr_canonical_v1",
    name: String(dog?.name || identityProfile?.name || "Pup").trim() || "Pup",
    level: Math.max(1, Math.floor(Number(dog?.level || 1))),
    xp: Math.max(0, Math.floor(Number(dog?.xp || 0))),
    coins: Math.max(0, Math.floor(Number(dog?.coins || 0))),
    favoriteSummary,
    dailyFlavor,
  })
);

const selectDogIdentityContentModel = createSelector(
  [
    selectDogIdentityContent,
    selectDogPreferences,
    selectDogDailyFlavor,
    selectDogMilestoneCardQueue,
    selectDogPrimaryFavoriteSummary,
  ],
  (
    identityContent,
    preferences,
    dailyFlavor,
    milestoneCardQueue,
    favoriteSummary
  ) => ({
    identityContent,
    preferences,
    dailyFlavor,
    milestoneCardQueue,
    favoriteSummary,
  })
);

const selectDogVitalsModel = createSelector(
  [selectDogStats, selectDogBond, selectDogMoodLabel, selectDogNeedsNormalized],
  (stats, bond, moodLabel, needs) => ({
    hunger: Number(stats?.hunger || 0),
    thirst: Number(stats?.thirst || 0),
    energy: Number(stats?.energy || 0),
    happiness: Number(stats?.happiness || 0),
    health: Number(stats?.health || 0),
    cleanliness: Number(stats?.cleanliness || 0),
    bondValue: Number(bond?.value || 0),
    moodLabel,
    needs,
  })
);

const selectDogLifeModel = createSelector(
  [selectDogAgeInfo, selectDogLifeStage, selectDogCleanlinessMeta],
  (ageInfo, lifeStage, cleanliness) => ({
    ageDays: Math.max(
      0,
      Math.floor(Number(ageInfo?.ageInGameDays ?? lifeStage?.days ?? 0))
    ),
    stage: lifeStage?.stage || ageInfo?.stageId || "PUPPY",
    stageLabel: lifeStage?.label || ageInfo?.stageLabel || "Puppy",
    ageBucketLabel: ageInfo?.ageBucketLabel || "Puppy",
    stageProgressPct: Math.max(
      0,
      Math.min(100, Math.round(Number(ageInfo?.stageProgressPct || 0)))
    ),
    daysUntilNextStage: Number.isFinite(Number(ageInfo?.daysUntilNextStage))
      ? Number(ageInfo.daysUntilNextStage)
      : null,
    nextStageLabel: ageInfo?.nextStage?.label || null,
    progressLabel: ageInfo?.progressLabel || null,
    isFinalStretchImmune: Boolean(ageInfo?.isFinalStretchImmune),
    isFarewellReady: Boolean(ageInfo?.isFarewellReady),
    daysUntilFarewell: Number.isFinite(Number(ageInfo?.daysUntilFarewell))
      ? Number(ageInfo.daysUntilFarewell)
      : null,
    headline: ageInfo?.ui?.headline || null,
    summary: ageInfo?.ui?.summary || null,
    detail: ageInfo?.ui?.detail || null,
    tone: ageInfo?.ui?.tone || "fresh",
    cleanliness,
  })
);

const selectDogGameViewModel = createSelector(
  [selectDog, selectDogVitalsModel, selectDogLifeModel, selectDogRenderModel],
  (dog, vitals, life, renderModel) => ({
    dog,
    vitals,
    life,
    renderModel,
  })
);

const selectDogSkillTreeModel = createSelector(
  [
    selectDogIdentityModel,
    selectDogSkillTreeUnlockedIds,
    selectDogSkillTreePoints,
    selectDogSkillTree,
  ],
  (identity, unlockedIds, points, skillTree) => ({
    level: identity.level,
    unlockedIds,
    points,
    lastUnlockedId: skillTree?.lastUnlockedId || null,
    lastUnlockedAt: Number(skillTree?.lastUnlockedAt || 0) || null,
  })
);

const selectDogLegacyViewModel = createSelector(
  [
    selectDogIdentityModel,
    selectDogLifeStage,
    selectDogBond,
    selectDogMemorial,
    selectDogLegacyJourney,
  ],
  (identity, lifeStage, bond, memorial, legacyJourney) => ({
    name: identity.name,
    lifeStage,
    bond,
    memorial,
    legacyJourney,
  })
);

const selectDogDreamStateModel = createSelector(
  [selectDogIdentityModel, selectDogDreams, selectDogMemories],
  (identity, dreamsState, memories) => ({
    name: identity.name,
    dreamsState,
    memories,
    memoryDrives: scoreRecentMemoryDrives(memories),
  })
);

const selectDogMemoryStateModel = createSelector(
  [selectDogIdentityModel, selectDogJournal, selectDogMemories],
  (identity, journal, memories) => ({
    name: identity.name,
    journal,
    memories,
    memoryDrives: scoreRecentMemoryDrives(memories),
  })
);

const selectDogStoreViewModel = createSelector(
  [selectDog, selectCosmeticCatalog, selectNextStreakReward],
  (dog, catalog, nextRewardInfo) => ({
    dog,
    catalog,
    nextRewardInfo,
  })
);

const selectDogEngineStateModel = createSelector(
  [selectDog, selectDogGrowthMilestone, selectDogRenderModel],
  (dog, growthMilestone, renderModel) => ({
    dog,
    growthMilestone,
    renderModel,
  })
);

const selectDogAppEffectsModel = createSelector(
  [selectDogSkillTree, selectDogPolls],
  (skillTree, polls) => ({
    skillTree,
    polls,
  })
);

export function useDogState(selector, equalityFn = undefined) {
  return useAppSelector(selector, equalityFn);
}

export function useDog() {
  return useDogState(selectDog);
}

export function useDogIdentity() {
  return useDogState(selectDogIdentityModel, shallowEqual);
}

export function useDogIdentityContent() {
  return useDogState(selectDogIdentityContentModel, shallowEqual);
}

export function useDogPreferences() {
  return useDogState(selectDogPreferences, shallowEqual);
}

export function useDogDailyFlavor() {
  return useDogState(selectDogDailyFlavor, shallowEqual);
}

export function useDogVitals() {
  return useDogState(selectDogVitalsModel, shallowEqual);
}

export function useDogLife() {
  return useDogState(selectDogLifeModel, shallowEqual);
}

export function useDogRenderState() {
  return useDogState(selectDogRenderModel, shallowEqual);
}

export function useDogGameView() {
  return useDogState(selectDogGameViewModel, shallowEqual);
}

export function useDogGrowthMilestone() {
  return useDogState(selectDogGrowthMilestone);
}

export function useDogSkillTreeState() {
  return useDogState(selectDogSkillTreeModel, shallowEqual);
}

export function useDogLegacyView() {
  return useDogState(selectDogLegacyViewModel, shallowEqual);
}

export function useDogDreamState() {
  return useDogState(selectDogDreamStateModel, shallowEqual);
}

export function useDogMemoryState() {
  return useDogState(selectDogMemoryStateModel, shallowEqual);
}

export function useDogStoreView() {
  return useDogState(selectDogStoreViewModel, shallowEqual);
}

export function useDogEngineState() {
  return useDogState(selectDogEngineStateModel, shallowEqual);
}

export function useDogAppEffectsState() {
  return useDogState(selectDogAppEffectsModel, shallowEqual);
}

export function useDogVacation() {
  return useDogState(selectDogVacation, shallowEqual);
}

export function useDogActions() {
  const dispatch = useAppDispatch();
  return {
    quickFeed: (payload) => dispatch(quickFeed(payload)),
    feed: (payload) => dispatch(feed(payload)),
    play: (payload) => dispatch(play(payload)),
    petDog: (payload) => dispatch(petDog(payload)),
    bathe: (payload) => dispatch(bathe(payload)),
    goPotty: (payload) => dispatch(goPotty(payload)),
    giveWater: (payload) => dispatch(giveWater(payload)),
    trainObedience: (payload) => dispatch(trainObedience(payload)),
  };
}
