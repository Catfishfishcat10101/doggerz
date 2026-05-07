// src/features/dog/personalityProfile.js
/** @format */
// src/logic/personalityProfile.js

import { computeTrainingSuccessChance } from "@/utils/trainingMath.js";

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const normalizeSigned = (v) => clamp(Math.round((Number(v) + 100) / 2), 0, 100);

export const PERSONALITY_MODEL_VERSION = 4;

const TRUST_TIERS = Object.freeze({
  STANDOFF: 20,
  LOW: 40,
  MID: 60,
  HIGH: 80,
});

const FRUSTRATION_WEIGHTS = Object.freeze({
  needPressure: 0.48,
  negativeMoodlets: 0.32,
  lowConfidence: 0.2,
});

const CONFIDENCE_WEIGHTS = Object.freeze({
  obedience: 0.38,
  bond: 0.32,
  lowFrustration: 0.2,
  streak: 0.1,
});

const RELIABILITY_WEIGHTS = Object.freeze({
  trainingChance: 0.7,
  obedience: 0.2,
  houseManners: 0.1,
});

function getTemperamentTraitIntensity(temperament, traitId) {
  const key = String(traitId || "").trim();
  if (!key) return 0;
  const list = Array.isArray(temperament?.traits) ? temperament.traits : [];
  const found = list.find((t) => t && String(t.id || "") === key);
  return clamp(Number(found?.intensity || 0), 0, 100);
}

function getAvgObedienceLevel(obedienceSkills) {
  if (!obedienceSkills || typeof obedienceSkills !== "object") return 0;
  const vals = Object.values(obedienceSkills).map((s) =>
    clamp(Number(s?.level || 0), 0, 100)
  );
  if (!vals.length) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return sum / vals.length;
}

function getPottyTrainingPct(dog) {
  const direct = Number(dog?.potty?.training ?? 0);
  if (Number.isFinite(direct) && direct > 0) return clamp(direct, 0, 100);

  const goal = Number(dog?.training?.potty?.goal || 0);
  const successCount = Number(dog?.training?.potty?.successCount || 0);
  if (goal > 0) {
    return clamp(Math.round((successCount / Math.max(1, goal)) * 100), 0, 100);
  }

  return 0;
}

function computeCoreTemperament(traits = {}) {
  const socialDrive = normalizeSigned(traits.social || 0);
  const energy = normalizeSigned(traits.energetic || 0);
  const inquisitiveness = normalizeSigned(
    Number(traits.adventurous || 0) * 0.7 + Number(traits.playful || 0) * 0.3
  );

  return {
    socialDrive,
    energy,
    energyCeiling: energy,
    inquisitiveness,
  };
}

function computeBigFive(traits = {}, dynamicStates = {}, learnedTraits = {}) {
  const adventurous = normalizeSigned(traits.adventurous || 0);
  const social = normalizeSigned(traits.social || 0);
  const energetic = normalizeSigned(traits.energetic || 0);
  const playful = normalizeSigned(traits.playful || 0);
  const affectionate = normalizeSigned(traits.affectionate || 0);

  const openness = clamp(Math.round(adventurous * 0.7 + playful * 0.3), 0, 100);
  const conscientiousness = clamp(
    Math.round(
      Number(learnedTraits.houseManners || 0) * 0.55 +
        Number(learnedTraits.reliability || 0) * 0.45
    ),
    0,
    100
  );
  const neuroticism = clamp(
    Math.round(
      Number(dynamicStates.frustration || 0) * 0.75 +
        (100 - Number(dynamicStates.confidence || 0)) * 0.25
    ),
    0,
    100
  );
  const agreeableness = clamp(
    Math.round(
      affectionate * 0.45 +
        social * 0.25 +
        Number(dynamicStates.affection || 0) * 0.3
    ),
    0,
    100
  );
  const extroversion = clamp(
    Math.round(social * 0.45 + energetic * 0.35 + playful * 0.2),
    0,
    100
  );

  return {
    openness,
    conscientiousness,
    neuroticism,
    agreeableness,
    extroversion,
  };
}

function computeDynamicStates(dog) {
  const stats = dog?.stats || {};
  const moodlets = Array.isArray(dog?.moodlets) ? dog.moodlets : [];

  const hunger = clamp(stats.hunger);
  const thirst = clamp(stats.thirst);
  const energyLow = 100 - clamp(stats.energy);
  const cleanlinessLow = 100 - clamp(stats.cleanliness);
  const healthLow = 100 - clamp(stats.health);

  const needPressure =
    (hunger + thirst + energyLow + cleanlinessLow + healthLow) / 5;

  const negativeTypes = new Set([
    "hungry",
    "thirsty",
    "potty",
    "tired",
    "dirty",
    "sick",
    "lonely",
    "bored",
    "stubborn",
    "itchy",
  ]);

  let negativeLoad = 0;
  let positiveLoad = 0;
  moodlets.forEach((m) => {
    const type = String(m?.type || "").toLowerCase();
    const intensity = clamp(Number(m?.intensity || 0), 0, 3);
    if (type === "happy") {
      positiveLoad += intensity;
      return;
    }
    if (negativeTypes.has(type)) {
      negativeLoad += intensity;
    }
  });

  const trainFailedPenalty =
    String(dog?.lastAction || "").toLowerCase() === "trainfailed" ? 12 : 0;

  const negativeMoodletsScore = clamp(negativeLoad * 12.5, 0, 100);

  const bond = clamp(Number(dog?.bond?.value || 0), 0, 100);
  const avgObedienceLevel = getAvgObedienceLevel(dog?.skills?.obedience || {});
  const obedienceScore = clamp(Math.round(avgObedienceLevel * 10), 0, 100);
  const trainingStreak = clamp(
    Number(dog?.training?.adult?.streak || 0),
    0,
    30
  );
  const streakBonus = Math.min(10, trainingStreak * 2);

  const provisionalConfidence = clamp(
    Math.round(obedienceScore * 0.5 + bond * 0.5 + streakBonus),
    0,
    100
  );
  const lowConfidence = 100 - provisionalConfidence;

  const frustration = clamp(
    Math.round(
      needPressure * FRUSTRATION_WEIGHTS.needPressure +
        negativeMoodletsScore * FRUSTRATION_WEIGHTS.negativeMoodlets +
        lowConfidence * FRUSTRATION_WEIGHTS.lowConfidence -
        positiveLoad * 4
    ) + trainFailedPenalty,
    0,
    100
  );

  const confidence = clamp(
    Math.round(
      obedienceScore * CONFIDENCE_WEIGHTS.obedience +
        bond * CONFIDENCE_WEIGHTS.bond +
        (100 - frustration) * CONFIDENCE_WEIGHTS.lowFrustration +
        streakBonus * 5 * CONFIDENCE_WEIGHTS.streak
    ),
    0,
    100
  );

  const affection = clamp(stats.affection ?? 0, 0, 100);
  const anxiety = clamp(
    Math.round(
      frustration * 0.52 +
        needPressure * 0.18 +
        (100 - bond) * 0.14 +
        negativeMoodletsScore * 0.16
    ),
    0,
    100
  );
  const focus = clamp(
    Math.round(
      confidence * 0.38 +
        (100 - frustration) * 0.24 +
        Number(stats.mentalStimulation ?? 50) * 0.22 +
        (100 - anxiety) * 0.16
    ),
    0,
    100
  );

  return {
    frustration,
    confidence,
    affection,
    anxiety,
    focus,
    needPressure: clamp(Math.round(needPressure), 0, 100),
    negativeMoodletsScore,
    positiveMoodletsScore: clamp(Math.round(positiveLoad * 12.5), 0, 100),
  };
}

function computeLearnedTraits(dog, coreTemperament, dynamicStates) {
  const obedienceLevel = getAvgObedienceLevel(dog?.skills?.obedience || {});
  const obedience = clamp(Math.round(obedienceLevel * 10), 0, 100);
  const pottyTraining = clamp(getPottyTrainingPct(dog), 0, 100);
  const houseManners = pottyTraining;

  const temperament = dog?.temperament || {};
  const isSpicy =
    String(temperament.primary || "").toUpperCase() === "SPICY" ||
    String(temperament.secondary || "").toUpperCase() === "SPICY";
  const foodMotivated = getTemperamentTraitIntensity(
    temperament,
    "foodMotivated"
  );
  const lastFedAt = dog?.memory?.lastFedAt;
  const now = Number(dog?.lastUpdatedAt || Date.now());
  const fedRecently =
    typeof lastFedAt === "number" && now - lastFedAt < 2 * 60 * 60 * 1000;

  const stats = dog?.stats || {};
  const reliabilityChance = computeTrainingSuccessChance({
    input: "button",
    bond: Number(dog?.bond?.value || 0),
    energy: stats.energy,
    hunger: stats.hunger,
    thirst: stats.thirst,
    happiness: stats.happiness,
    isSpicy,
    foodMotivated,
    fedRecently,
    focus: dynamicStates?.focus ?? dynamicStates?.confidence ?? 50,
    trust: clamp((Number(dog?.bond?.value || 0) + houseManners) / 2, 0, 100),
    stress: dynamicStates?.frustration ?? 30,
    distraction: coreTemperament?.inquisitiveness ?? 25,
    trainingStreak: Number(dog?.training?.adult?.streak || 0),
    lastTrainingSuccess:
      String(dog?.lastAction || "").toLowerCase() !== "trainfailed",
    environment: "yard",
  });

  const reliability = clamp(
    Math.round(
      reliabilityChance * 100 * RELIABILITY_WEIGHTS.trainingChance +
        obedience * RELIABILITY_WEIGHTS.obedience +
        houseManners * RELIABILITY_WEIGHTS.houseManners
    ),
    0,
    100
  );

  return {
    obedience,
    reliability,
    obedienceReliability: reliability,
    houseManners,
    pottyTraining,
  };
}

function computeStressSignals(dog, dynamicStates = {}, trust = {}) {
  const frustration = clamp(dynamicStates.frustration, 0, 100);
  const confidence = clamp(dynamicStates.confidence, 0, 100);
  const trustScore = clamp(trust.score, 0, 100);
  const stats = dog?.stats || {};
  const happiness = clamp(stats.happiness, 0, 100);
  const cleanliness = clamp(stats.cleanliness, 0, 100);
  const mentalStimulation = clamp(stats.mentalStimulation, 0, 100);

  const whaleEye =
    frustration >= 70 ||
    (confidence <= 35 && trustScore < 55) ||
    happiness < 30;

  // "Destructive outlets": digging while watched + low stimulation/high frustration.
  const destructiveOutlets =
    (frustration >= 60 && mentalStimulation <= 45) ||
    (cleanliness <= 35 && trust.focusMode === "self_focused");

  // "Stand off": distance + bark + retreat profile when trust is weak and stress is high.
  const standOff = trustScore < TRUST_TIERS.LOW && frustration >= 65;

  return {
    whaleEye,
    destructiveOutlets,
    standOff,
  };
}

function computeTrustProfile(dog, dynamicStates = {}, learnedTraits = {}) {
  const bond = clamp(Number(dog?.bond?.value || 0), 0, 100);
  const reliability = clamp(Number(learnedTraits.reliability || 0), 0, 100);
  const houseManners = clamp(Number(learnedTraits.houseManners || 0), 0, 100);
  const confidence = clamp(Number(dynamicStates.confidence || 0), 0, 100);
  const frustration = clamp(Number(dynamicStates.frustration || 0), 0, 100);

  const score = clamp(
    Math.round(
      bond * 0.45 +
        reliability * 0.2 +
        houseManners * 0.15 +
        confidence * 0.2 -
        frustration * 0.25
    ),
    0,
    100
  );

  const focusMode = score < 55 ? "self_focused" : "user_focused";

  let appOpenBehavior = {
    tier: "standoff",
    label: "Barks, retreats to back of yard, keeps distance",
    trustRange: "0-20",
    arrivalZone: "yard_back",
    animation: "bark_retreat",
    resumeTask: false,
    ignoresDistractions: false,
  };

  if (score >= TRUST_TIERS.HIGH) {
    appOpenBehavior = {
      tier: "max",
      label: "Runs to glass, paws the window, ignores distractions",
      trustRange: "80-100",
      arrivalZone: "glass_front",
      animation: "jump_paw_glass",
      resumeTask: false,
      ignoresDistractions: true,
    };
  } else if (score >= TRUST_TIERS.MID) {
    appOpenBehavior = {
      tier: "high",
      label: "Starts at fence line, runs forward, wags and barks",
      trustRange: "60-80",
      arrivalZone: "fence_to_front",
      animation: "run_wag_bark",
      resumeTask: true,
      ignoresDistractions: false,
    };
  } else if (score >= TRUST_TIERS.LOW) {
    appOpenBehavior = {
      tier: "mid",
      label: "Walks to middle of the yard",
      trustRange: "40-60",
      arrivalZone: "yard_middle",
      animation: "walk_in",
      resumeTask: true,
      ignoresDistractions: false,
    };
  } else if (score >= TRUST_TIERS.STANDOFF) {
    appOpenBehavior = {
      tier: "low",
      label: "Stop, look at user, return to task",
      trustRange: "20-40",
      arrivalZone: "current_task_area",
      animation: "idle_watch",
      resumeTask: true,
      ignoresDistractions: false,
    };
  }

  return {
    score,
    focusMode,
    appOpenBehavior,
  };
}

function computeInstinctEngine(
  dog,
  coreTemperament = {},
  dynamicStates = {},
  learnedTraits = {},
  trust = {},
  bigFive = {}
) {
  const socialDrive = clamp(Number(coreTemperament.socialDrive || 0), 0, 100);
  const energy = clamp(Number(coreTemperament.energy || 0), 0, 100);
  const inquisitiveness = clamp(
    Number(coreTemperament.inquisitiveness || 0),
    0,
    100
  );
  const frustration = clamp(Number(dynamicStates.frustration || 0), 0, 100);
  const confidence = clamp(Number(dynamicStates.confidence || 0), 0, 100);
  const needPressure = clamp(Number(dynamicStates.needPressure || 0), 0, 100);
  const positiveMoodletsScore = clamp(
    Number(dynamicStates.positiveMoodletsScore || 0),
    0,
    100
  );
  const reliability = clamp(Number(learnedTraits.reliability || 0), 0, 100);
  const trustScore = clamp(Number(trust.score || 0), 0, 100);
  const neuroticism = clamp(Number(bigFive.neuroticism || 0), 0, 100);
  const mentalStimulation = clamp(
    Number(dog?.stats?.mentalStimulation || 0),
    0,
    100
  );
  const affection = clamp(Number(dog?.stats?.affection || 0), 0, 100);
  const neglectStrikes = clamp(Number(dog?.memory?.neglectStrikes || 0), 0, 12);

  const separationAnxiety = clamp(
    Math.round(
      socialDrive * 0.22 +
        affection * 0.2 +
        frustration * 0.2 +
        (100 - trustScore) * 0.16 +
        needPressure * 0.12 +
        neglectStrikes * 3
    ),
    0,
    100
  );

  // Multiplier for repetitions required; >1 means slower learning, <1 means faster.
  const trainabilitySpeed = clamp(
    Math.round(
      (1 +
        frustration * 0.005 +
        inquisitiveness * 0.0025 +
        (100 - confidence) * 0.0015 -
        reliability * 0.004 -
        positiveMoodletsScore * 0.001) *
        100
    ) / 100,
    0.6,
    2.2
  );

  const vocalizationThreshold = clamp(
    Math.round(
      52 +
        confidence * 0.18 +
        trustScore * 0.16 -
        frustration * 0.2 -
        neuroticism * 0.14
    ),
    0,
    100
  );

  const chewingUrge = clamp(
    Math.round(
      frustration * 0.36 +
        (100 - mentalStimulation) * 0.34 +
        energy * 0.12 +
        inquisitiveness * 0.1 +
        (100 - trustScore) * 0.08
    ),
    0,
    100
  );

  return {
    separationAnxiety,
    trainabilitySpeed,
    vocalizationThreshold,
    chewingUrge,
  };
}

function computeBehaviorTendencies(
  dog,
  coreTemperament = {},
  dynamicStates = {},
  learnedTraits = {},
  instinctEngine = {},
  trust = {},
  bigFive = {}
) {
  const socialDrive = clamp(Number(coreTemperament.socialDrive || 0), 0, 100);
  const inquisitiveness = clamp(
    Number(coreTemperament.inquisitiveness || 0),
    0,
    100
  );
  const energy = clamp(Number(coreTemperament.energy || 0), 0, 100);
  const houseManners = clamp(Number(learnedTraits.houseManners || 0), 0, 100);
  const trustScore = clamp(Number(trust.score || 0), 0, 100);
  const confidence = clamp(Number(dynamicStates.confidence || 0), 0, 100);
  const frustration = clamp(Number(dynamicStates.frustration || 0), 0, 100);
  const separationAnxiety = clamp(
    Number(instinctEngine.separationAnxiety || 0),
    0,
    100
  );
  const chewingUrge = clamp(Number(instinctEngine.chewingUrge || 0), 0, 100);
  const conscientiousness = clamp(
    Number(bigFive.conscientiousness || 0),
    0,
    100
  );

  const tendencies = [];
  let memoryVoice = "steady";
  let summary = "Settles into warm, steady routines.";

  if (separationAnxiety >= 68 || socialDrive >= 72) {
    tendencies.push({
      id: "clingy",
      label: "Clingy",
      summary: "Leans toward closeness and notices your return quickly.",
    });
    memoryVoice = "clingy";
    summary =
      "Notices your presence fast and wants closeness to feel consistent.";
  } else if (trustScore >= 72 && confidence >= 64) {
    tendencies.push({
      id: "confident",
      label: "Confident",
      summary: "Carries routine with quiet certainty.",
    });
    memoryVoice = "confident";
    summary =
      "Handles the yard with quiet confidence and a clear sense of routine.";
  }

  if (inquisitiveness >= 66 || chewingUrge >= 58) {
    tendencies.push({
      id: "curious",
      label: "Curious",
      summary: "Gets pulled toward details, props, and little discoveries.",
    });
    if (memoryVoice === "steady") memoryVoice = "curious";
  } else if (houseManners >= 70 || conscientiousness >= 66) {
    tendencies.push({
      id: "orderly",
      label: "Orderly",
      summary: "Responds well to dependable structure and repeatable rituals.",
    });
    if (memoryVoice === "steady") memoryVoice = "orderly";
  }

  if (energy >= 70 && frustration < 55) {
    tendencies.push({
      id: "playful",
      label: "Playful",
      summary: "Prefers short, spirited bursts over passive downtime.",
    });
    if (memoryVoice === "steady") memoryVoice = "playful";
  } else if (energy <= 38 || dog?.lifeStage?.stage === "SENIOR") {
    tendencies.push({
      id: "cozy",
      label: "Cozy",
      summary: "Feels most like themself in calmer, comfort-first rhythms.",
    });
    if (memoryVoice === "steady") memoryVoice = "cozy";
  }

  return {
    summary,
    memoryVoice,
    tendencies: tendencies.slice(0, 3),
  };
}

export function derivePersonalityProfile(dog) {
  const traits = dog?.personality?.traits || {};
  const coreTemperament = computeCoreTemperament(traits);
  const dynamicStates = computeDynamicStates(dog);
  const learnedTraits = computeLearnedTraits(
    dog,
    coreTemperament,
    dynamicStates
  );
  const bigFive = computeBigFive(traits, dynamicStates, learnedTraits);
  const trust = computeTrustProfile(dog, dynamicStates, learnedTraits);
  const instinctEngine = computeInstinctEngine(
    dog,
    coreTemperament,
    dynamicStates,
    learnedTraits,
    trust,
    bigFive
  );
  const stressSignals = computeStressSignals(dog, dynamicStates, trust);
  const behaviorTendencies = computeBehaviorTendencies(
    dog,
    coreTemperament,
    dynamicStates,
    learnedTraits,
    instinctEngine,
    trust,
    bigFive
  );

  return {
    modelVersion: PERSONALITY_MODEL_VERSION,
    temperament: {
      socialDrive: coreTemperament.socialDrive,
      energy: coreTemperament.energy,
      inquisitiveness: coreTemperament.inquisitiveness,
    },
    corePersonality: {
      openness: bigFive.openness,
      conscientiousness: bigFive.conscientiousness,
      neuroticism: bigFive.neuroticism,
      agreeableness: bigFive.agreeableness,
      extroversion: bigFive.extroversion,
    },
    personalityBias: {
      openness: bigFive.openness,
      conscientiousness: bigFive.conscientiousness,
      neuroticism: bigFive.neuroticism,
      agreeableness: bigFive.agreeableness,
      extroversion: bigFive.extroversion,
    },
    dynamicState: {
      frustration: dynamicStates.frustration,
      confidence: dynamicStates.confidence,
      affection: dynamicStates.affection,
      anxiety: dynamicStates.anxiety,
      focus: dynamicStates.focus,
    },
    learnedTraits: {
      obedienceReliability:
        learnedTraits.obedienceReliability ?? learnedTraits.reliability,
      houseManners: learnedTraits.houseManners,
      pottyTraining: learnedTraits.pottyTraining,
      obedience: learnedTraits.obedience,
      reliability: learnedTraits.reliability,
    },
    coreTemperament,
    bigFive,
    dynamicStates: {
      frustration: dynamicStates.frustration,
      confidence: dynamicStates.confidence,
      affection: dynamicStates.affection,
      anxiety: dynamicStates.anxiety,
      focus: dynamicStates.focus,
    },
    currentState: {
      frustration: dynamicStates.frustration,
      confidence: dynamicStates.confidence,
      affection: dynamicStates.affection,
      anxiety: dynamicStates.anxiety,
      focus: dynamicStates.focus,
    },
    learnedHabits: {
      obedienceReliability:
        learnedTraits.obedienceReliability ?? learnedTraits.reliability,
      houseManners: learnedTraits.houseManners,
      pottyTraining: learnedTraits.pottyTraining,
    },
    instinctEngine,
    trust,
    stressSignals,
    behaviorTendencies,
    memoryVoice: behaviorTendencies.memoryVoice,
  };
}
