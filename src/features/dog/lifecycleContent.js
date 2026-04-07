// src/features/dog/lifecycleContent.js

import { getLifeStageLabel } from "@/utils/lifecycle.js";

export const LIFE_STAGE_UI = Object.freeze({
  PUPPY: Object.freeze({
    headline: "Puppy Stages",
    summary: "Potty training first.",
    detail: "Tricks open after Potty Training is done.",
    tone: "fresh",
  }),
  ADULT: Object.freeze({
    headline: "Prime years",
    summary: "This is the long stretch for tricks, streaks, and bonding.",
    detail:
      "Adult dogs are ready for more complex training and routines. Consistency and attention pay off big time in this stage.",
    tone: "steady",
  }),
  SENIOR: Object.freeze({
    headline: "Golden years",
    summary: "A slower pace, stronger bond, and gentler care loop.",
    detail:
      "Senior dogs still play, but they appreciate a gentler routine. Focus on comfort, consistency, and quality time together.",
    tone: "warm",
  }),
});

export function getLifeStageUi(stageId) {
  const key = String(stageId || "PUPPY")
    .toUpperCase()
    .trim();
  return LIFE_STAGE_UI[key] || LIFE_STAGE_UI.PUPPY;
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
