/** @format */

// src/utils/lifecycle.js

import { withBaseUrl } from "@/utils/assetUtils.js";

// How many in-game "dog days" pass per real day.
// Tuning: higher => faster aging. Keep this high enough for visible progress,
// but not so high that stages churn too quickly.
export const GAME_DAYS_PER_REAL_DAY = 2;
export const MS_PER_GAME_DAY = (24 * 60 * 60 * 1000) / GAME_DAYS_PER_REAL_DAY;

// Lifecycle / age stages (in-game days)
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 29, label: "Puppy" },
  ADULT: { min: 30, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};

const LIFE_STAGE_UI = Object.freeze({
  PUPPY: Object.freeze({
    headline: "Tiny chaos era",
    summary: "Potty training and routine come first.",
    detail: "Build house manners first. Trick work opens after potty training is done.",
    tone: "fresh",
  }),
  ADULT: Object.freeze({
    headline: "Prime years",
    summary: "This is the long stretch for tricks, streaks, and bonding.",
    detail: "Adult dogs are steady learners. Daily training and check-ins matter most here.",
    tone: "steady",
  }),
  SENIOR: Object.freeze({
    headline: "Golden years",
    summary: "A slower pace, stronger bond, and gentler care loop.",
    detail: "Senior dogs still play, but comfort and consistency matter more than intensity.",
    tone: "warm",
  }),
});

const ALL_STAGES = Object.entries(LIFE_STAGES).map(([id, stage]) => ({
  id,
  ...stage,
}));

/**
 * Given an age in "game days", pick the correct life stage bucket.
 * Returns one of the LIFE_STAGES entries with an added `id` field.
 */
export function getLifeStageForAge(ageInGameDays) {
  if (!Number.isFinite(ageInGameDays) || ageInGameDays < 0) {
    return { id: "PUPPY", ...LIFE_STAGES.PUPPY };
  }

  return (
    ALL_STAGES.find(
      (stage) => ageInGameDays >= stage.min && ageInGameDays <= stage.max
    ) || { id: "SENIOR", ...LIFE_STAGES.SENIOR }
  );
}

/**
 * Convert adoption timestamp -> age info.
 *
 * Compatibility: older code expects { stage, label, days }
 * while newer code may expect { stageId, stageLabel, ageInGameDays }.
 */
export function calculateDogAge(adoptedAtMs, now = Date.now()) {
  if (!adoptedAtMs || !Number.isFinite(adoptedAtMs)) return null;

  const ageInGameDays = Math.max(
    0,
    Math.floor((now - adoptedAtMs) / MS_PER_GAME_DAY)
  );

  const stageInfo = getLifeStageForAge(ageInGameDays);
  const nextStage = getNextLifeStage(stageInfo.id);
  const daysUntilNextStage = nextStage
    ? Math.max(0, nextStage.min - ageInGameDays)
    : null;

  return {
    // numeric
    days: ageInGameDays,
    ageInGameDays,

    // stage identifiers
    stage: stageInfo.id,
    label: stageInfo.label,
    stageId: stageInfo.id,
    stageLabel: stageInfo.label,

    // richer info
    stageInfo,
    daysUntilNextStage,
    nextStage,
  };
}

/**
 * Human-readable label for a life stage ID.
 */
export function getLifeStageLabel(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  return LIFE_STAGES[key]?.label ?? "Puppy";
}

export function getLifeStageUi(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  return LIFE_STAGE_UI[key] || LIFE_STAGE_UI.PUPPY;
}

export function getNextLifeStage(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  if (key === "PUPPY") return { id: "ADULT", ...LIFE_STAGES.ADULT };
  if (key === "ADULT") return { id: "SENIOR", ...LIFE_STAGES.SENIOR };
  return null;
}

export function getDogAgeProgress(adoptedAtMs, now = Date.now()) {
  const age = calculateDogAge(adoptedAtMs, now);
  if (!age) return null;

  const { stageInfo } = age;
  const total = Math.max(1, stageInfo.max - stageInfo.min);
  const elapsed = Math.max(0, age.ageInGameDays - stageInfo.min);
  const pct = Math.max(0, Math.min(1, elapsed / total));

  return {
    ...age,
    stageProgress: pct,
    stageProgressPct: Math.round(pct * 100),
  };
}

export function getLifeStageProgressLabel(ageInfo) {
  if (!ageInfo || typeof ageInfo !== "object") return "No age data";

  const stageId = String(ageInfo.stageId || ageInfo.stage || "PUPPY")
    .toUpperCase()
    .trim();
  const nextStageLabel =
    ageInfo?.nextStage?.label || getNextLifeStage(stageId)?.label || null;
  const daysUntilNextStage = Number(ageInfo?.daysUntilNextStage);
  const stageProgressPct = Math.max(
    0,
    Math.min(100, Math.round(Number(ageInfo?.stageProgressPct || 0)))
  );

  if (Number.isFinite(daysUntilNextStage) && daysUntilNextStage > 0 && nextStageLabel) {
    return `${daysUntilNextStage}d to ${nextStageLabel}`;
  }

  if (stageId === "SENIOR") {
    return "Golden years";
  }

  return `${stageProgressPct}% through ${getLifeStageLabel(stageId)}`;
}

export function getLifeStageTransitionCopy(toStage, fromStage) {
  const toKey = String(toStage || "PUPPY")
    .toUpperCase()
    .trim();
  const fromLabel = getLifeStageLabel(fromStage);
  const toLabel = getLifeStageLabel(toKey);

  if (toKey === "ADULT") {
    return {
      title: "Adult stage reached",
      summary: `No longer just a tiny menace. ${toLabel} life starts now.`,
      detail:
        "Trick training, consistency, and long-term routines matter a lot more from here.",
      ctaLabel: "Start training",
      journalBody:
        "Look at me now—faster, taller, and ready for real training sessions together.",
      ribbon: `${fromLabel} -> ${toLabel}`,
    };
  }

  if (toKey === "SENIOR") {
    return {
      title: "Senior stage reached",
      summary: "The golden years begin.",
      detail:
        "Your pup is easing into a gentler rhythm now. Keep the bond strong and the care steady.",
      ctaLabel: "Stay close",
      journalBody:
        "I still want adventures with you, just with a little more comfort and a little less chaos.",
      ribbon: `${fromLabel} -> ${toLabel}`,
    };
  }

  return {
    title: "Puppy stage reached",
    summary: "A brand-new pup is ready to learn your routine.",
    detail:
      "Potty training, attention, and frequent check-ins will shape everything that comes next.",
    ctaLabel: "Meet your pup",
    journalBody:
      "Tiny paws, big feelings, and absolutely no idea what the rules are yet.",
    ribbon: `${fromLabel} -> ${toLabel}`,
  };
}

/**
 * Map a life stage to the static Jack Russell sprite.
 */
export function getSpriteForLifeStage(_stageId) {
  const s = String(_stageId || "PUPPY")
    .trim()
    .toUpperCase();
  const stage = s === "ADULT" ? "adult" : s === "SENIOR" ? "senior" : "pup";
  return withBaseUrl(`/assets/sprites/jr/${stage}_clean.png`);
}

/**
 * Helper: stage + cleanliness tier -> sprite path.
 * For now we only ship clean renders, so condition falls back to stage base.
 */
export function getSpriteForStageAndTier(_stageOrObj, _cleanlinessTier) {
  const stage =
    typeof _stageOrObj === "string"
      ? _stageOrObj
      : _stageOrObj?.stage || _stageOrObj?.stageId || _stageOrObj?.id;
  return getSpriteForLifeStage(stage || "PUPPY");
}

export function getAgeBucketLabel(days) {
  if (!Number.isFinite(days)) return "Unknown";
  if (days < 30) return "New pup";
  if (days < 120) return "Growing";
  if (days < 360) return "Young";
  if (days < 1200) return "Adult";
  if (days < 2500) return "Mature";
  return "Golden";
}
