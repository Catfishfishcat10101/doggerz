import { getObedienceSkillMasteryPct } from "@/features/training/jrtTrainingController.js";

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

const RELATIONSHIP_TIERS = Object.freeze([
  {
    id: "new_bond",
    min: 0,
    max: 24,
    label: "New Bond",
    tone: "sky",
    payoff: "Your dog is learning your rhythm and voice.",
  },
  {
    id: "trusted_pair",
    min: 25,
    max: 49,
    label: "Trusted Pair",
    tone: "emerald",
    payoff: "Daily care is turning into steady trust.",
  },
  {
    id: "heart_pack",
    min: 50,
    max: 74,
    label: "Heart Pack",
    tone: "amber",
    payoff: "Your dog now expects comfort and connection from you.",
  },
  {
    id: "soul_pack",
    min: 75,
    max: 100,
    label: "Soul Pack",
    tone: "rose",
    payoff: "This feels like a lifelong bond, not just routine care.",
  },
]);

const CARE_RHYTHM_TIERS = Object.freeze([
  {
    id: "starting",
    min: 0,
    max: 2,
    label: "Starting Rhythm",
    payoff: "Short, consistent sessions matter more than long sessions.",
  },
  {
    id: "steady",
    min: 3,
    max: 6,
    label: "Steady Rhythm",
    payoff: "Your dog now expects a daily check-in cadence.",
  },
  {
    id: "reliable",
    min: 7,
    max: 13,
    label: "Reliable Rhythm",
    payoff: "Routine care is building visible confidence and comfort.",
  },
  {
    id: "signature",
    min: 14,
    max: Number.POSITIVE_INFINITY,
    label: "Signature Rhythm",
    payoff: "Your care pattern now defines your dog’s personality arc.",
  },
]);

function pickTier(value, tiers) {
  const numeric = clamp(value, 0, 10_000);
  return (
    tiers.find((tier) => numeric >= tier.min && numeric <= tier.max) ||
    tiers[tiers.length - 1]
  );
}

function getMasteredTrickCount(dog = {}) {
  const obedience =
    dog?.skills?.obedience && typeof dog.skills.obedience === "object"
      ? dog.skills.obedience
      : {};
  return Object.values(obedience).reduce((count, node) => {
    return getObedienceSkillMasteryPct(node) >= 100 ? count + 1 : count;
  }, 0);
}

function getNextLevelMilestone(level = 1) {
  const current = Math.max(1, Math.floor(Number(level || 1)));
  const nextBand = Math.floor((current - 1) / 5) * 5 + 5;
  return nextBand <= current ? current + 5 : nextBand;
}

function getPrimaryJourneyGoal({
  lifeStage = "PUPPY",
  pottyComplete = false,
  masteredCount = 0,
  streakDays = 0,
} = {}) {
  const stage = String(lifeStage || "PUPPY").toUpperCase();

  if (stage === "PUPPY" && !pottyComplete) {
    return "Build potty confidence with a calm daily routine.";
  }
  if (masteredCount < 1) {
    return "Land your first mastered trick to define your training style.";
  }
  if (streakDays < 7) {
    return "Reach a 7-day care rhythm to unlock steadier growth momentum.";
  }
  if (stage === "SENIOR") {
    return "Prioritize comfort rituals to support the senior chapter.";
  }
  return "Keep your routine steady to deepen long-term trust and mastery.";
}

export function getSoftProgressionModel(dog = {}, ageInfo = null) {
  const level = Math.max(1, Math.floor(Number(dog?.level || 1)));
  const bondValue = clamp(Number(dog?.bond?.value || 0), 0, 100);
  const streakDays = Math.max(
    0,
    Math.floor(Number(dog?.streak?.currentStreakDays || 0))
  );
  const stage = String(
    ageInfo?.stageId || dog?.lifeStage?.stage || "PUPPY"
  ).toUpperCase();
  const pottyGoal = Math.max(
    1,
    Math.floor(Number(dog?.training?.potty?.goal || 1))
  );
  const pottySuccess = clamp(
    Number(dog?.training?.potty?.successCount || 0),
    0,
    pottyGoal
  );
  const pottyComplete = pottySuccess >= pottyGoal;
  const masteredCount = getMasteredTrickCount(dog);

  const relationshipTier = pickTier(bondValue, RELATIONSHIP_TIERS);
  const careRhythmTier = pickTier(streakDays, CARE_RHYTHM_TIERS);
  const nextLevelMilestone = getNextLevelMilestone(level);
  const levelsToMilestone = Math.max(0, nextLevelMilestone - level);
  const journeyGoal = getPrimaryJourneyGoal({
    lifeStage: stage,
    pottyComplete,
    masteredCount,
    streakDays,
  });

  const rhythmSpan = Math.max(1, careRhythmTier.max - careRhythmTier.min || 1);
  const rhythmProgressPct =
    careRhythmTier.max === Number.POSITIVE_INFINITY
      ? 100
      : Math.round(
          ((clamp(streakDays, careRhythmTier.min, careRhythmTier.max) -
            careRhythmTier.min) /
            rhythmSpan) *
            100
        );

  return {
    relationship: {
      id: relationshipTier.id,
      label: relationshipTier.label,
      tone: relationshipTier.tone,
      value: Math.round(bondValue),
      payoff: relationshipTier.payoff,
    },
    careRhythm: {
      id: careRhythmTier.id,
      label: careRhythmTier.label,
      streakDays,
      progressPct: clamp(rhythmProgressPct, 0, 100),
      payoff: careRhythmTier.payoff,
    },
    training: {
      masteredCount,
      pottyComplete,
    },
    milestone: {
      nextLevel: nextLevelMilestone,
      levelsToMilestone,
    },
    journeyGoal,
  };
}
