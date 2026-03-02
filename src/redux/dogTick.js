// src/redux/dogTick.js
// Tunable stat decay wrapper for Doggerz.
// Heavy simulation math lives in src/logic/dogEngine.js.

import {
  computeNeedPressureFromStats,
  simulateDogTime,
} from "@/logic/dogEngine.js";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// ---------- Tuning: life-stage constants (edit these to taste) ----------
export const DECAY_TUNING = {
  tick: {
    stepMinutes: 10,
    fullSimMinutes: 24 * 60,
    extraSimDecayMultiplier: 0.25,
    extraSimFloor: 25,
  },

  wellbeing: {
    protectMin: 0.65,
    drainPerMinute: 0.12,
    regenPerMinuteWhenFine: 0.03,
    fragileThreshold: 10,
  },

  careDebt: {
    buildPerMinute: 0.1,
    buildExtraWhenWellbeingEmpty: 0.06,
    forgivePerMinuteWhenFine: 0.1,
    cap: 100,
  },

  accidents: {
    triggerAtOrBelow: 10,
    cooldownMinutes: 8 * 60,
    relieveTo: 80,
    cleanlinessPenalty: 10,
    happinessPenalty: 6,
    careDebtPenalty: 4,
  },

  sleep: {
    enterNapAtOrBelow: 30,
    wakeAtOrAbove: 70,
    maxNapMinutes: 90,
    hungerDecayMultiplierWhileNapping: 0.65,
    happinessDecayMultiplierWhileNapping: 0.8,
    bladderDecayMultiplierWhileNapping: 0.85,
    cleanlinessDecayMultiplierWhileNapping: 1.0,
  },

  lifeStages: {
    puppy: {
      hoursTo40: {
        hunger: 12,
        energy: 10,
        happiness: 18,
        cleanliness: 40,
        bladder: 4.5,
        affection: 8,
        mentalStimulation: 12,
      },
      energyRecoverPerMinuteWhileNapping: 0.55,
      globalDecayMultiplier: 1.1,
    },

    adult: {
      hoursTo40: {
        hunger: 22,
        energy: 16,
        happiness: 30,
        cleanliness: 55,
        bladder: 7.5,
        affection: 14,
        mentalStimulation: 18,
      },
      energyRecoverPerMinuteWhileNapping: 0.4,
      globalDecayMultiplier: 1.0,
    },

    senior: {
      hoursTo40: {
        hunger: 26,
        energy: 18,
        happiness: 32,
        cleanliness: 50,
        bladder: 9.0,
        affection: 16,
        mentalStimulation: 20,
      },
      energyRecoverPerMinuteWhileNapping: 0.35,
      globalDecayMultiplier: 0.95,
    },
  },
};

export const DOG_TICK_UI = Object.freeze({
  wellbeing: { good: 70, ok: 40, low: 20 },
  careDebt: { low: 20, medium: 50, high: 80 },
  needPressure: { low: 0.2, medium: 0.5, high: 0.8 },
});

// ---------- Main tick function (mutates dog in-place; Immer-friendly) ----------
export function applyDogTick(dog, nowMs) {
  if (!dog) return;

  dog.stats ??= {};
  dog.stats.hunger ??= 90;
  dog.stats.energy ??= 90;
  dog.stats.happiness ??= 90;
  dog.stats.cleanliness ??= 90;
  dog.stats.bladder ??= 90;
  dog.stats.affection ??= 90;
  dog.stats.mentalStimulation ??= 90;

  dog.wellbeing ??= 60;
  dog.careDebt ??= 0;
  dog.sleep ??= { mode: "awake", napMinutesLeft: 0 };
  dog.messCount ??= 0;
  dog.lastTickAt ??= nowMs;
  dog.lastAccidentAt ??= 0;

  const dtMs = nowMs - dog.lastTickAt;
  if (dtMs < 60000) return;

  const result = simulateDogTime(dog, dtMs, nowMs, DECAY_TUNING);
  dog.stats = result.stats;
  dog.wellbeing = result.wellbeing;
  dog.careDebt = result.careDebt;
  dog.sleep = result.sleep;
  dog.messCount = result.messCount;
  dog.lastAccidentAt = result.lastAccidentAt;
  dog.lastTickAt = nowMs;
}

// ---------- Non-mutating helpers (UI / telemetry) ----------
export function computeNeedPressure(stats) {
  return computeNeedPressureFromStats(stats);
}

export function getDogTickSummary(dog) {
  if (!dog) {
    return {
      needPressure: 0,
      wellbeing: 0,
      careDebt: 0,
      sleepMode: "awake",
      moodHint: "ok",
    };
  }

  const needPressure = computeNeedPressure(dog.stats || {});
  const wellbeing = clamp(Number(dog.wellbeing || 0), 0, 100);
  const careDebt = clamp(Number(dog.careDebt || 0), 0, 100);
  const sleepMode = dog.sleep?.mode || "awake";

  let moodHint = "ok";
  if (wellbeing <= DECAY_TUNING.wellbeing.fragileThreshold) {
    moodHint = "fragile";
  } else if (needPressure >= DOG_TICK_UI.needPressure.high) {
    moodHint = "stressed";
  } else if (needPressure <= DOG_TICK_UI.needPressure.low) {
    moodHint = "content";
  }

  return {
    needPressure,
    wellbeing,
    careDebt,
    sleepMode,
    moodHint,
  };
}
