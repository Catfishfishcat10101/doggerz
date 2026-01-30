// src/redux/dogTick.js
// Tunable stat decay for Doggerz (Redux tickDog integration).
// Designed to be deterministic and forgiving, with realistic feel.

// ---------- Utilities ----------
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;

function getLifeStageKey(dog) {
  // Adapt to your actual dog state shape.
  // Prefer explicit dog.lifeStage, fallback by ageDays.
  if (dog?.lifeStage) return dog.lifeStage; // "puppy" | "adult" | "senior"
  const ageDays = dog?.ageDays ?? 0;
  if (ageDays < 30) return "puppy";
  if (ageDays < 365 * 7) return "adult";
  return "senior";
}

// Soft-floor stat zones: decay slows as stats get worse, and stops at FLOOR.
const ZONES = {
  GREEN: { min: 70, factor: 1.0 },
  YELLOW: { min: 40, factor: 0.65 },
  RED: { min: 15, factor: 0.4 },
  FLOOR: 15, // natural decay stops here
};

function zoneFactor(value) {
  if (value >= ZONES.GREEN.min) return ZONES.GREEN.factor;
  if (value >= ZONES.YELLOW.min) return ZONES.YELLOW.factor;
  if (value >= ZONES.RED.min) return ZONES.RED.factor;
  return 0.0; // below floor: stop natural decay
}

// Urgency is used to drain wellbeing & build care debt (0..1).
function urgency(value) {
  // 70+ => near 0, 40..70 => ramp to ~0.7, 15..40 => ramp to 1
  if (value >= 70) return 0;
  if (value >= 40) return ((70 - value) / 30) * 0.7; // 0..0.7
  if (value >= 15) return 0.7 + ((40 - value) / 25) * 0.3; // 0.7..1
  return 1;
}

function avg(...nums) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
}

// ---------- Tuning: life-stage constants (edit these to taste) ----------
export const DECAY_TUNING = {
  // Offline simulation behavior
  tick: {
    // Simulate with small steps so thresholds/accidents/naps behave well.
    stepMinutes: 10,

    // Full fidelity offline simulation cap (minutes). Beyond this: gentle tail.
    fullSimMinutes: 24 * 60, // 1440

    // Extra time beyond fullSim uses this multiplier and a higher soft floor.
    extraSimDecayMultiplier: 0.25,
    extraSimFloor: 25, // beyond 24h, stats won't drift below this via passive decay
  },

  wellbeing: {
    // Wellbeing reduces decay severity when high.
    // protectMultiplier = lerp(1.0, protectMin, wellbeing/100)
    protectMin: 0.65, // at wellbeing=100, decay * 0.65; at 0 => decay * 1.0

    // Drain wellbeing under need pressure
    drainPerMinute: 0.12, // * NeedPressure * stepMinutes

    // Small passive regen when things are fine (prevents stuck-at-zero)
    regenPerMinuteWhenFine: 0.03, // when NeedPressure < 0.2

    // Threshold below which the dog becomes "fragile" (debt grows faster)
    fragileThreshold: 10,
  },

  careDebt: {
    // Debt increases when needs are ignored; decreases slowly when stable.
    buildPerMinute: 0.1, // * NeedPressure * stepMinutes
    buildExtraWhenWellbeingEmpty: 0.06, // additional if wellbeing ~ 0
    forgivePerMinuteWhenFine: 0.1, // when NeedPressure < 0.2
    cap: 100,
  },

  accidents: {
    // Bladder urgency handling.
    triggerAtOrBelow: 10, // if bladder <= 10, accident may trigger
    cooldownMinutes: 8 * 60, // max 1 accident per 8 hours simulated
    relieveTo: 80, // after accident, bladder becomes comfortable
    cleanlinessPenalty: 10,
    happinessPenalty: 6,
    careDebtPenalty: 4,
  },

  sleep: {
    // Auto-nap prevents energy collapse.
    enterNapAtOrBelow: 30,
    wakeAtOrAbove: 70,
    maxNapMinutes: 90,

    // Sleep impacts
    hungerDecayMultiplierWhileNapping: 0.65,
    happinessDecayMultiplierWhileNapping: 0.8,
    bladderDecayMultiplierWhileNapping: 0.85,
    cleanlinessDecayMultiplierWhileNapping: 1.0, // no change
  },

  // Base stat decay targets by life stage:
  // hoursTo40 means: roughly how many hours to drift from 100 -> 40
  // under "normal" awake conditions BEFORE wellbeing protection.
  lifeStages: {
    puppy: {
      hoursTo40: {
        hunger: 12,
        energy: 10,
        happiness: 18,
        cleanliness: 40,
        bladder: 4.5,
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
      },
      energyRecoverPerMinuteWhileNapping: 0.35,
      globalDecayMultiplier: 0.95,
    },
  },
};

// UI hints for dashboards (non-authoritative; safe to tweak independently).
export const DOG_TICK_UI = Object.freeze({
  wellbeing: { good: 70, ok: 40, low: 20 },
  careDebt: { low: 20, medium: 50, high: 80 },
  needPressure: { low: 0.2, medium: 0.5, high: 0.8 },
});

// Convert hoursTo40 into a baseline points-per-minute loss.
// 100 -> 40 is 60 points over hoursTo40 hours.
function baseLossPerMinuteFromHoursTo40(hoursTo40) {
  const minutes = Math.max(1, hoursTo40 * 60);
  return 60 / minutes; // points per minute in GREEN zone before modifiers
}

// ---------- Main tick function (mutates dog in-place; Immer-friendly) ----------
export function applyDogTick(dog, nowMs) {
  if (!dog) return;

  // Initialize missing fields safely (won't break existing saves)
  dog.stats ??= {};
  dog.stats.hunger ??= 90;
  dog.stats.energy ??= 90;
  dog.stats.happiness ??= 90;
  dog.stats.cleanliness ??= 90;
  dog.stats.bladder ??= 90;

  dog.wellbeing ??= 60;
  dog.careDebt ??= 0;

  dog.sleep ??= { mode: "awake", napMinutesLeft: 0 }; // mode: "awake" | "nap"
  dog.messCount ??= 0;

  dog.lastTickAt ??= nowMs;
  dog.lastAccidentAt ??= 0;

  let dtMs = nowMs - dog.lastTickAt;
  if (dtMs <= 0) return;

  // Convert to minutes, cap to a sane upper bound (e.g., 30 days) to avoid extreme loops
  let dtMinutes = clamp(Math.floor(dtMs / 60000), 0, 30 * 24 * 60);

  // Offline simulation split: full sim + gentle tail
  const fullSim = Math.min(dtMinutes, DECAY_TUNING.tick.fullSimMinutes);
  const extraSim = Math.max(0, dtMinutes - fullSim);

  simulateMinutes(dog, fullSim, nowMs - extraSim * 60000, {
    decayMultiplier: 1.0,
    floorOverride: null,
    allowAccidents: true,
  });

  if (extraSim > 0) {
    simulateMinutes(dog, extraSim, nowMs - extraSim * 60000, {
      decayMultiplier: DECAY_TUNING.tick.extraSimDecayMultiplier,
      floorOverride: DECAY_TUNING.tick.extraSimFloor,
      allowAccidents: false, // avoid “week away = 30 accidents”
    });
  }

  dog.lastTickAt = nowMs;
}

// ---------- Non-mutating helpers (UI / telemetry) ----------
export function computeNeedPressure(stats) {
  const s = stats || {};
  return avg(
    urgency(Number(s.hunger || 0)),
    urgency(Number(s.energy || 0)),
    urgency(Number(s.happiness || 0)),
    urgency(Number(s.cleanliness || 0)),
    urgency(Number(s.bladder || 0))
  );
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

  const s = dog.stats || {};
  const needPressure = computeNeedPressure(s);
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

// ---------- Simulation core ----------
function simulateMinutes(dog, minutesTotal, startNowMs, opts) {
  const step = DECAY_TUNING.tick.stepMinutes;
  let remaining = minutesTotal;

  const stageKey = getLifeStageKey(dog);
  const stage =
    DECAY_TUNING.lifeStages[stageKey] ?? DECAY_TUNING.lifeStages.adult;

  // Precompute baseline losses
  const baseLoss = {
    hunger: baseLossPerMinuteFromHoursTo40(stage.hoursTo40.hunger),
    energy: baseLossPerMinuteFromHoursTo40(stage.hoursTo40.energy),
    happiness: baseLossPerMinuteFromHoursTo40(stage.hoursTo40.happiness),
    cleanliness: baseLossPerMinuteFromHoursTo40(stage.hoursTo40.cleanliness),
    bladder: baseLossPerMinuteFromHoursTo40(stage.hoursTo40.bladder),
  };

  // Simulate in steps so naps/accidents can trigger predictably
  while (remaining > 0) {
    const stepMin = Math.min(step, remaining);
    remaining -= stepMin;

    const s = dog.stats;

    // Determine effective floor (soft stop) for this sim mode
    const floor = opts.floorOverride ?? ZONES.FLOOR;

    // Need pressure drives wellbeing drain and debt build
    const needPressure = avg(
      urgency(s.hunger),
      urgency(s.energy),
      urgency(s.happiness),
      urgency(s.cleanliness),
      urgency(s.bladder)
    );

    // Wellbeing protection multiplier
    const wb = clamp(dog.wellbeing, 0, 100);
    const protect = lerp(1.0, DECAY_TUNING.wellbeing.protectMin, wb / 100);

    // Global multipliers
    const stageMult = stage.globalDecayMultiplier ?? 1.0;
    const simMult = opts.decayMultiplier ?? 1.0;

    // Auto-nap logic (only when not already napping)
    if (
      dog.sleep.mode !== "nap" &&
      s.energy <= DECAY_TUNING.sleep.enterNapAtOrBelow
    ) {
      dog.sleep.mode = "nap";
      dog.sleep.napMinutesLeft = DECAY_TUNING.sleep.maxNapMinutes;
    }

    const isNapping =
      dog.sleep.mode === "nap" && (dog.sleep.napMinutesLeft ?? 0) > 0;

    // Stat decay multipliers while napping
    const napMult = {
      hunger: isNapping
        ? DECAY_TUNING.sleep.hungerDecayMultiplierWhileNapping
        : 1.0,
      happiness: isNapping
        ? DECAY_TUNING.sleep.happinessDecayMultiplierWhileNapping
        : 1.0,
      bladder: isNapping
        ? DECAY_TUNING.sleep.bladderDecayMultiplierWhileNapping
        : 1.0,
      cleanliness: isNapping
        ? DECAY_TUNING.sleep.cleanlinessDecayMultiplierWhileNapping
        : 1.0,
      energy: 1.0, // energy handled separately
    };

    // Apply decay for non-energy stats
    s.hunger = applyDecay(s.hunger, baseLoss.hunger, stepMin, {
      floor,
      zoneFactorFn: zoneFactor,
      multiplier: protect * stageMult * simMult * napMult.hunger,
    });

    s.happiness = applyDecay(s.happiness, baseLoss.happiness, stepMin, {
      floor,
      zoneFactorFn: zoneFactor,
      multiplier: protect * stageMult * simMult * napMult.happiness,
    });

    s.cleanliness = applyDecay(s.cleanliness, baseLoss.cleanliness, stepMin, {
      floor,
      zoneFactorFn: zoneFactor,
      multiplier: protect * stageMult * simMult * napMult.cleanliness,
    });

    s.bladder = applyDecay(s.bladder, baseLoss.bladder, stepMin, {
      floor,
      zoneFactorFn: zoneFactor,
      multiplier: protect * stageMult * simMult * napMult.bladder,
      // bladder is allowed to go lower than floor in full sim (so accidents can occur),
      // but we still clamp at 0 later.
      allowBelowFloor: true,
    });

    s.bladder = clamp(s.bladder, 0, 100);

    // Energy: if napping, recover; else decay
    if (isNapping) {
      const rec = (stage.energyRecoverPerMinuteWhileNapping ?? 0.4) * stepMin;
      s.energy = clamp(s.energy + rec, 0, 100);
      dog.sleep.napMinutesLeft = Math.max(
        0,
        (dog.sleep.napMinutesLeft ?? 0) - stepMin
      );

      // Wake conditions
      if (
        s.energy >= DECAY_TUNING.sleep.wakeAtOrAbove ||
        dog.sleep.napMinutesLeft <= 0
      ) {
        dog.sleep.mode = "awake";
        dog.sleep.napMinutesLeft = 0;
      }
    } else {
      s.energy = applyDecay(s.energy, baseLoss.energy, stepMin, {
        floor,
        zoneFactorFn: zoneFactor,
        multiplier: protect * stageMult * simMult,
      });
    }

    // Accidents (full sim only; gentle tail skips)
    if (opts.allowAccidents) {
      maybeTriggerAccident(dog, startNowMs, minutesTotal, remaining, stepMin);
    }

    // Wellbeing updates
    if (needPressure < 0.2) {
      dog.wellbeing = clamp(
        dog.wellbeing + DECAY_TUNING.wellbeing.regenPerMinuteWhenFine * stepMin,
        0,
        100
      );
    } else {
      dog.wellbeing = clamp(
        dog.wellbeing -
          DECAY_TUNING.wellbeing.drainPerMinute * needPressure * stepMin,
        0,
        100
      );
    }

    // Care debt updates
    if (needPressure < 0.2) {
      dog.careDebt = clamp(
        dog.careDebt - DECAY_TUNING.careDebt.forgivePerMinuteWhenFine * stepMin,
        0,
        DECAY_TUNING.careDebt.cap
      );
    } else {
      const extra =
        dog.wellbeing <= DECAY_TUNING.wellbeing.fragileThreshold
          ? DECAY_TUNING.careDebt.buildExtraWhenWellbeingEmpty
          : 0;

      dog.careDebt = clamp(
        dog.careDebt +
          (DECAY_TUNING.careDebt.buildPerMinute * needPressure + extra) *
            stepMin,
        0,
        DECAY_TUNING.careDebt.cap
      );
    }
  }
}

function applyDecay(current, baseLossPerMinute, minutes, cfg) {
  const { floor, zoneFactorFn, multiplier, allowBelowFloor = false } = cfg;

  const zf = zoneFactorFn(current);
  const loss = baseLossPerMinute * zf * multiplier * minutes;

  let next = current - loss;

  if (!allowBelowFloor) {
    next = Math.max(floor, next);
  } else {
    // For bladder (accidents): allow going below floor, but not below 0
    next = Math.max(0, next);
  }

  return clamp(next, 0, 100);
}

function maybeTriggerAccident(
  dog,
  startNowMs,
  minutesTotal,
  remaining,
  stepMin
) {
  const s = dog.stats;

  const triggerAt = DECAY_TUNING.accidents.triggerAtOrBelow;
  if (s.bladder > triggerAt) return;

  // Determine "current simulated time" (approx) in ms.
  // We are simulating from (startNowMs - minutesTotal) to startNowMs,
  // but for reducer logic, we just need monotonic time for cooldown.
  const minutesSimulatedSoFar = minutesTotal - remaining - stepMin;
  const currentSimMs =
    startNowMs - (minutesTotal - minutesSimulatedSoFar) * 60000;

  const cooldownMs = DECAY_TUNING.accidents.cooldownMinutes * 60000;
  if (dog.lastAccidentAt && currentSimMs - dog.lastAccidentAt < cooldownMs)
    return;

  // Trigger accident: relieve bladder, spawn mess, small penalties (not catastrophic)
  dog.lastAccidentAt = currentSimMs;
  dog.messCount = (dog.messCount ?? 0) + 1;

  s.bladder = clamp(DECAY_TUNING.accidents.relieveTo, 0, 100);
  s.cleanliness = clamp(
    s.cleanliness - DECAY_TUNING.accidents.cleanlinessPenalty,
    0,
    100
  );
  s.happiness = clamp(
    s.happiness - DECAY_TUNING.accidents.happinessPenalty,
    0,
    100
  );
  dog.careDebt = clamp(
    (dog.careDebt ?? 0) + DECAY_TUNING.accidents.careDebtPenalty,
    0,
    DECAY_TUNING.careDebt.cap
  );
}
