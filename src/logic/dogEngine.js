const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const clampSigned = (n, limit = 100) =>
  Math.max(-limit, Math.min(limit, Number.isFinite(n) ? n : 0));

export const DECAY_SPEED = 0.4;
export const DECAY_PER_HOUR = {
  hunger: 8,
  thirst: 7,
  happiness: 6,
  energy: 8,
  cleanliness: 3,
  health: 2,
  affection: 5,
  mentalStimulation: 4,
};

export function calculateTimeDecay(currentStats, diffHours, modifiers = {}) {
  const nextStats = { ...(currentStats || {}) };
  const {
    stageMultiplier = 1,
    isAsleep = false,
    vacationEnabled = false,
    vacationMultiplier = 1,
  } = modifiers;

  const effectiveHours = vacationEnabled
    ? Number(diffHours || 0) * Number(vacationMultiplier || 1)
    : Number(diffHours || 0);

  Object.entries(nextStats).forEach(([key, rawValue]) => {
    const value = Number(rawValue || 0);
    const rate = DECAY_PER_HOUR[key] || 0;
    let delta =
      rate * DECAY_SPEED * effectiveHours * Number(stageMultiplier || 1);

    if (isAsleep && (key === "hunger" || key === "thirst")) {
      delta *= 0.85;
    }

    if (key === "hunger" || key === "thirst") {
      nextStats[key] = clamp(value + delta, 0, 100);
    } else {
      nextStats[key] = clamp(value - delta, 0, 100);
    }
  });

  return nextStats;
}

export function computeTrainingSuccess(context = {}) {
  const {
    bond = 0,
    energy = 0,
    hunger = 0,
    isSpicy = false,
    foodMotivated = 0,
    fedRecently = false,
  } = context;

  let chance = 0.5 + Number(bond || 0) / 200;
  if (Number(energy || 0) < 30) chance -= 0.15;
  if (Number(hunger || 0) > 70) chance -= 0.1;
  if (isSpicy) chance -= 0.1;
  if (Number(foodMotivated || 0) > 0 && fedRecently) chance += 0.2;

  const bounded = Math.max(0.1, Math.min(0.95, chance));
  return Math.random() <= bounded;
}

export function derivePersonalityAnimationHint(traits = {}) {
  const energetic = Number(traits.energetic || 0);
  const playful = Number(traits.playful || 0);
  const adventurous = Number(traits.adventurous || 0);
  const affectionate = Number(traits.affectionate || 0);
  const social = Number(traits.social || 0);

  if (energetic > 60 && playful > 40) return "zoomies";
  if (affectionate > 65) return "cuddle";
  if (adventurous > 60) return "explore";
  if (social > 60) return "greet";
  if (energetic < -60) return "chill";
  return null;
}

export function applyPersonalityDrift({
  traits = {},
  deltas = {},
  traitKeys,
  smoothing = 0.65,
  limit = 100,
} = {}) {
  const keys =
    Array.isArray(traitKeys) && traitKeys.length
      ? traitKeys
      : Object.keys({ ...traits, ...deltas });

  const nextTraits = { ...traits };
  const appliedDeltas = {};
  let changed = false;

  keys.forEach((key) => {
    const raw = Number(deltas[key] || 0);
    if (!raw) return;
    const prev = Number(nextTraits[key] || 0);
    const next = clampSigned(prev + raw * Number(smoothing || 0), limit);
    if (next === prev) return;
    nextTraits[key] = next;
    appliedDeltas[key] = Math.round((next - prev) * 10) / 10;
    changed = true;
  });

  return { changed, nextTraits, appliedDeltas };
}

export function calculateFeedStats({
  stats = {},
  amount = 100,
  careerHappinessMultiplier = 1,
  feedHappinessBonus = 1,
} = {}) {
  return {
    hunger: clamp(Number(stats.hunger || 0) - Number(amount || 0), 0, 100),
    happiness: clamp(
      Number(stats.happiness || 0) +
        5 *
          Number(careerHappinessMultiplier || 1) *
          Number(feedHappinessBonus || 1),
      0,
      100
    ),
  };
}

export function calculatePlayStats({
  stats = {},
  baseHappiness = 15,
  zoomiesMultiplier = 1,
  careerHappinessMultiplier = 1,
  playHappinessBonus = 1,
  toyObsessedIntensity = 0,
  playEnergyCostMultiplier = 1,
} = {}) {
  const toyBonus =
    1 + (clamp(Number(toyObsessedIntensity || 0), 0, 100) / 100) * 0.25;
  const happinessGain =
    Number(baseHappiness || 0) *
    Number(zoomiesMultiplier || 1) *
    Number(careerHappinessMultiplier || 1) *
    Number(playHappinessBonus || 1) *
    toyBonus;
  const energyCost = Math.max(
    6,
    Math.round(10 * Math.max(0.65, Number(playEnergyCostMultiplier || 1)))
  );

  return {
    happiness: clamp(Number(stats.happiness || 0) + happinessGain, 0, 100),
    energy: clamp(Number(stats.energy || 0) - energyCost, 0, 100),
    thirst: clamp(Number(stats.thirst || 0) + 6, 0, 100),
    happinessGain,
    energyCost,
  };
}

export function buildDreamFromState(state = {}, now = Date.now()) {
  const happiness = Number(state.stats?.happiness || 0);
  const hunger = Number(state.stats?.hunger || 0);
  const energy = Number(state.stats?.energy || 0);
  const cleanliness = Number(state.stats?.cleanliness || 0);
  const neglect = Number(state.memory?.neglectStrikes || 0);

  const isNeglected = neglect > 0 && happiness < 45;
  const isLucid = !isNeglected && happiness > 82 && hunger < 60;
  const kind = isNeglected ? "NIGHTMARE" : isLucid ? "LUCID" : "DREAM";
  const lastAction = String(state.lastAction || "").toLowerCase();

  const withinMs = (t, ms) => typeof t === "number" && now - t <= ms;
  const playedRecently = withinMs(
    state.memory?.lastPlayedAt,
    4 * 60 * 60 * 1000
  );
  const fedRecently = withinMs(state.memory?.lastFedAt, 4 * 60 * 60 * 1000);
  const trainedRecently = withinMs(
    state.memory?.lastTrainedAt,
    24 * 60 * 60 * 1000
  );
  const bathedRecently = withinMs(
    state.memory?.lastBathedAt,
    24 * 60 * 60 * 1000
  );

  let title = "A soft dream";
  let summary = "Floating through a pastel backyard full of squeaky secrets.";
  let motifs = ["clouds", "fireflies", "soft grass"];

  if (kind === "NIGHTMARE") {
    title = "A worried dream";
    summary =
      "The yard feels too big and too quiet. Footsteps echo, and you keep looking for your hooman.";
    motifs = ["empty yard", "distant thunder", "lost leash"];
  } else if (kind === "LUCID") {
    title = "A lucid dream";
    summary =
      "Everything glows. You can jump higher than fences and land on moonbeams like trampoline cushions.";
    motifs = ["moonbeams", "sparkles", "floating tennis balls"];
  }

  if (playedRecently || lastAction === "play") {
    title = kind === "NIGHTMARE" ? "Chasing shadows" : "Chasing squirrels";
    summary =
      kind === "NIGHTMARE"
        ? "You sprint, but the squeak keeps slipping away-like it's hiding behind the wind."
        : "You chase a legendary squirrel wearing a tiny crown. It squeaks like a tennis ball.";
    motifs = ["squirrels", "tennis balls", "zoomies"];
  } else if (fedRecently || lastAction === "feed") {
    title = kind === "NIGHTMARE" ? "Empty bowl" : "Treat buffet";
    summary =
      kind === "NIGHTMARE"
        ? "The bowl is there... but it's just out of reach, like a polite ghost."
        : "Biscuits drift like snowflakes. Every chomp makes a happy little *ding*.";
    motifs = ["biscuits", "bowls", "crunchy stars"];
  } else if (trainedRecently || lastAction === "train") {
    title = kind === "NIGHTMARE" ? "Commands in a maze" : "Graduation day";
    summary =
      kind === "NIGHTMARE"
        ? 'You try to "sit"... but the floor keeps turning into wiggly grass waves.'
        : 'You perform perfect "sit" and "stay" while confetti rains down like kibble.';
    motifs = ["whistles", "ribbons", "confetti"];
  } else if (bathedRecently || lastAction === "bathe") {
    title = kind === "NIGHTMARE" ? "Bubbles everywhere" : "Bubble galaxy";
    summary =
      kind === "NIGHTMARE"
        ? "The bubbles rise and rise-pop, pop-until you can't find your paws."
        : "Bubbles orbit you like tiny planets, and the shampoo smells like comet tails.";
    motifs = ["bubbles", "stardust shampoo", "soft towels"];
  }

  if (energy < 25 && kind === "DREAM") {
    motifs = Array.from(new Set([...motifs, "warm blankets"]));
  }
  if (cleanliness < 25 && kind !== "NIGHTMARE") {
    motifs = Array.from(new Set([...motifs, "mud puddles"]));
  }

  return {
    id: `${now}-dream-${Math.floor(Math.random() * 1e6)}`,
    timestamp: now,
    kind,
    title,
    summary,
    motifs,
  };
}

/* ---------------- dog tick simulation ---------------- */

export const DEFAULT_DECAY_ZONES = Object.freeze({
  GREEN: { min: 70, factor: 1.0 },
  YELLOW: { min: 40, factor: 0.65 },
  RED: { min: 15, factor: 0.4 },
  FLOOR: 15,
});

function avg(...nums) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
}

function getZoneFactor(value, zones = DEFAULT_DECAY_ZONES) {
  const n = Number(value || 0);
  if (n >= zones.GREEN.min) return zones.GREEN.factor;
  if (n >= zones.YELLOW.min) return zones.YELLOW.factor;
  if (n >= zones.RED.min) return zones.RED.factor;
  return 0.0;
}

function urgency(value, zones = DEFAULT_DECAY_ZONES) {
  const n = Number(value || 0);
  if (n >= zones.GREEN.min) return 0;
  if (n >= zones.YELLOW.min) {
    return ((zones.GREEN.min - n) / (zones.GREEN.min - zones.YELLOW.min)) * 0.7;
  }
  if (n >= zones.RED.min) {
    return (
      0.7 + ((zones.YELLOW.min - n) / (zones.YELLOW.min - zones.RED.min)) * 0.3
    );
  }
  return 1;
}

function baseLossPerMinuteFromHoursTo40(hoursTo40) {
  const minutes = Math.max(1, Number(hoursTo40 || 0) * 60);
  return 60 / minutes;
}

function applyDecay(current, baseLossPerMinute, minutes, cfg) {
  const {
    floor,
    zoneFactorFn,
    multiplier,
    allowBelowFloor = false,
    zones = DEFAULT_DECAY_ZONES,
  } = cfg || {};

  const zf = zoneFactorFn(Number(current || 0), zones);
  const loss =
    Number(baseLossPerMinute || 0) *
    zf *
    Number(multiplier || 0) *
    Number(minutes || 0);

  let next = Number(current || 0) - loss;

  if (!allowBelowFloor) {
    next = Math.max(Number(floor ?? zones.FLOOR), next);
  } else {
    next = Math.max(0, next);
  }

  return clamp(next, 0, 100);
}

function getLifeStageKey(dog) {
  const raw = dog?.lifeStage?.stage ?? dog?.lifeStage ?? "";
  const stage = String(raw || "")
    .trim()
    .toLowerCase();
  if (stage.startsWith("pup")) return "puppy";
  if (stage.startsWith("adult")) return "adult";
  if (stage.startsWith("senior")) return "senior";

  const ageDays = Number(dog?.ageDays ?? 0);
  if (ageDays < 30) return "puppy";
  if (ageDays < 365 * 7) return "adult";
  return "senior";
}

function maybeTriggerAccident(
  simState,
  startNowMs,
  minutesTotal,
  remaining,
  stepMin,
  tuning
) {
  const s = simState.stats;
  const triggerAt = Number(tuning?.accidents?.triggerAtOrBelow ?? 10);
  if (Number(s.bladder || 0) > triggerAt) return;

  const minutesSimulatedSoFar = minutesTotal - remaining - stepMin;
  const currentSimMs =
    Number(startNowMs || 0) - (minutesTotal - minutesSimulatedSoFar) * 60000;

  const cooldownMs = Number(tuning?.accidents?.cooldownMinutes || 0) * 60000;
  if (
    Number(simState.lastAccidentAt || 0) &&
    currentSimMs - Number(simState.lastAccidentAt || 0) < cooldownMs
  ) {
    return;
  }

  simState.lastAccidentAt = currentSimMs;
  simState.messCount = Number(simState.messCount || 0) + 1;

  s.bladder = clamp(Number(tuning?.accidents?.relieveTo ?? 80), 0, 100);
  s.cleanliness = clamp(
    Number(s.cleanliness || 0) -
      Number(tuning?.accidents?.cleanlinessPenalty ?? 10),
    0,
    100
  );
  s.happiness = clamp(
    Number(s.happiness || 0) - Number(tuning?.accidents?.happinessPenalty ?? 6),
    0,
    100
  );
  simState.careDebt = clamp(
    Number(simState.careDebt || 0) +
      Number(tuning?.accidents?.careDebtPenalty ?? 4),
    0,
    Number(tuning?.careDebt?.cap ?? 100)
  );
}

function simulateMinutes(
  simState,
  minutesTotal,
  startNowMs,
  opts,
  tuning,
  zones
) {
  const step = Number(tuning?.tick?.stepMinutes || 10);
  let remaining = Number(minutesTotal || 0);

  const stageKey = getLifeStageKey(simState);
  const stage =
    tuning?.lifeStages?.[stageKey] ?? tuning?.lifeStages?.adult ?? {};
  const hoursTo40 = stage.hoursTo40 || {};

  const baseLoss = {
    hunger: baseLossPerMinuteFromHoursTo40(hoursTo40.hunger),
    energy: baseLossPerMinuteFromHoursTo40(hoursTo40.energy),
    happiness: baseLossPerMinuteFromHoursTo40(hoursTo40.happiness),
    cleanliness: baseLossPerMinuteFromHoursTo40(hoursTo40.cleanliness),
    bladder: baseLossPerMinuteFromHoursTo40(hoursTo40.bladder),
    affection: baseLossPerMinuteFromHoursTo40(hoursTo40.affection),
    mentalStimulation: baseLossPerMinuteFromHoursTo40(
      hoursTo40.mentalStimulation
    ),
  };

  while (remaining > 0) {
    const stepMin = Math.min(step, remaining);
    remaining -= stepMin;
    const s = simState.stats;
    const floor = opts?.floorOverride ?? zones.FLOOR;

    const needPressure = avg(
      urgency(s.hunger, zones),
      urgency(s.energy, zones),
      urgency(s.happiness, zones),
      urgency(s.cleanliness, zones),
      urgency(s.bladder, zones),
      urgency(s.affection, zones),
      urgency(s.mentalStimulation, zones)
    );

    const wb = clamp(Number(simState.wellbeing || 0), 0, 100);
    const protect =
      1.0 + (Number(tuning?.wellbeing?.protectMin ?? 0.65) - 1.0) * (wb / 100);
    const stageMult = Number(stage.globalDecayMultiplier ?? 1.0);
    const simMult = Number(opts?.decayMultiplier ?? 1.0);

    if (
      simState.sleep.mode !== "nap" &&
      Number(s.energy || 0) <= Number(tuning?.sleep?.enterNapAtOrBelow ?? 30)
    ) {
      simState.sleep.mode = "nap";
      simState.sleep.napMinutesLeft = Number(
        tuning?.sleep?.maxNapMinutes ?? 90
      );
    }

    const isNapping =
      simState.sleep.mode === "nap" &&
      Number(simState.sleep.napMinutesLeft || 0) > 0;

    const napMult = {
      hunger: isNapping
        ? Number(tuning?.sleep?.hungerDecayMultiplierWhileNapping ?? 0.65)
        : 1.0,
      happiness: isNapping
        ? Number(tuning?.sleep?.happinessDecayMultiplierWhileNapping ?? 0.8)
        : 1.0,
      bladder: isNapping
        ? Number(tuning?.sleep?.bladderDecayMultiplierWhileNapping ?? 0.85)
        : 1.0,
      cleanliness: isNapping
        ? Number(tuning?.sleep?.cleanlinessDecayMultiplierWhileNapping ?? 1.0)
        : 1.0,
    };

    s.hunger = applyDecay(s.hunger, baseLoss.hunger, stepMin, {
      floor,
      zoneFactorFn: getZoneFactor,
      multiplier: protect * stageMult * simMult * napMult.hunger,
      zones,
    });

    s.happiness = applyDecay(s.happiness, baseLoss.happiness, stepMin, {
      floor,
      zoneFactorFn: getZoneFactor,
      multiplier: protect * stageMult * simMult * napMult.happiness,
      zones,
    });

    s.cleanliness = applyDecay(s.cleanliness, baseLoss.cleanliness, stepMin, {
      floor,
      zoneFactorFn: getZoneFactor,
      multiplier: protect * stageMult * simMult * napMult.cleanliness,
      zones,
    });

    s.affection = applyDecay(s.affection, baseLoss.affection, stepMin, {
      floor,
      zoneFactorFn: getZoneFactor,
      multiplier: protect * stageMult * simMult,
      zones,
    });

    s.mentalStimulation = applyDecay(
      s.mentalStimulation,
      baseLoss.mentalStimulation,
      stepMin,
      {
        floor,
        zoneFactorFn: getZoneFactor,
        multiplier: protect * stageMult * simMult,
        zones,
      }
    );

    s.bladder = applyDecay(s.bladder, baseLoss.bladder, stepMin, {
      floor,
      zoneFactorFn: getZoneFactor,
      multiplier: protect * stageMult * simMult * napMult.bladder,
      allowBelowFloor: true,
      zones,
    });

    if (isNapping) {
      const rec =
        Number(stage.energyRecoverPerMinuteWhileNapping ?? 0.4) * stepMin;
      s.energy = clamp(Number(s.energy || 0) + rec, 0, 100);
      simState.sleep.napMinutesLeft = Math.max(
        0,
        Number(simState.sleep.napMinutesLeft || 0) - stepMin
      );

      if (
        Number(s.energy || 0) >= Number(tuning?.sleep?.wakeAtOrAbove ?? 70) ||
        Number(simState.sleep.napMinutesLeft || 0) <= 0
      ) {
        simState.sleep.mode = "awake";
        simState.sleep.napMinutesLeft = 0;
      }
    } else {
      s.energy = applyDecay(s.energy, baseLoss.energy, stepMin, {
        floor,
        zoneFactorFn: getZoneFactor,
        multiplier: protect * stageMult * simMult,
        zones,
      });
    }

    if (opts?.allowAccidents) {
      maybeTriggerAccident(
        simState,
        startNowMs,
        minutesTotal,
        remaining,
        stepMin,
        tuning
      );
    }

    if (needPressure < 0.2) {
      simState.wellbeing = clamp(
        Number(simState.wellbeing || 0) +
          Number(tuning?.wellbeing?.regenPerMinuteWhenFine ?? 0.03) * stepMin,
        0,
        100
      );
    } else {
      simState.wellbeing = clamp(
        Number(simState.wellbeing || 0) -
          Number(tuning?.wellbeing?.drainPerMinute ?? 0.12) *
            needPressure *
            stepMin,
        0,
        100
      );
    }

    if (needPressure < 0.2) {
      simState.careDebt = clamp(
        Number(simState.careDebt || 0) -
          Number(tuning?.careDebt?.forgivePerMinuteWhenFine ?? 0.1) * stepMin,
        0,
        Number(tuning?.careDebt?.cap ?? 100)
      );
    } else {
      const extra =
        Number(simState.wellbeing || 0) <=
        Number(tuning?.wellbeing?.fragileThreshold ?? 10)
          ? Number(tuning?.careDebt?.buildExtraWhenWellbeingEmpty ?? 0.06)
          : 0;

      simState.careDebt = clamp(
        Number(simState.careDebt || 0) +
          (Number(tuning?.careDebt?.buildPerMinute ?? 0.1) * needPressure +
            extra) *
            stepMin,
        0,
        Number(tuning?.careDebt?.cap ?? 100)
      );
    }
  }
}

export function computeNeedPressureFromStats(
  stats,
  zones = DEFAULT_DECAY_ZONES
) {
  const s = stats || {};
  return avg(
    urgency(Number(s.hunger || 0), zones),
    urgency(Number(s.energy || 0), zones),
    urgency(Number(s.happiness || 0), zones),
    urgency(Number(s.cleanliness || 0), zones),
    urgency(Number(s.bladder || 0), zones),
    urgency(Number(s.affection || 0), zones),
    urgency(Number(s.mentalStimulation || 0), zones)
  );
}

export function simulateDogTime(
  dog,
  dtMs,
  nowMs,
  tuning,
  { zones = DEFAULT_DECAY_ZONES } = {}
) {
  const simState = {
    lifeStage: dog?.lifeStage,
    ageDays: dog?.ageDays,
    stats: {
      hunger: clamp(Number(dog?.stats?.hunger ?? 90), 0, 100),
      energy: clamp(Number(dog?.stats?.energy ?? 90), 0, 100),
      happiness: clamp(Number(dog?.stats?.happiness ?? 90), 0, 100),
      cleanliness: clamp(Number(dog?.stats?.cleanliness ?? 90), 0, 100),
      bladder: clamp(Number(dog?.stats?.bladder ?? 90), 0, 100),
      affection: clamp(Number(dog?.stats?.affection ?? 90), 0, 100),
      mentalStimulation: clamp(
        Number(dog?.stats?.mentalStimulation ?? 90),
        0,
        100
      ),
    },
    wellbeing: clamp(Number(dog?.wellbeing ?? 60), 0, 100),
    careDebt: clamp(
      Number(dog?.careDebt ?? 0),
      0,
      Number(tuning?.careDebt?.cap ?? 100)
    ),
    sleep: {
      mode: dog?.sleep?.mode === "nap" ? "nap" : "awake",
      napMinutesLeft: Math.max(0, Number(dog?.sleep?.napMinutesLeft ?? 0)),
    },
    messCount: Math.max(0, Number(dog?.messCount ?? 0)),
    lastAccidentAt: Number(dog?.lastAccidentAt ?? 0),
  };

  const dtMinutes = clamp(
    Math.floor(Number(dtMs || 0) / 60000),
    0,
    30 * 24 * 60
  );
  if (dtMinutes <= 0) {
    return {
      stats: simState.stats,
      wellbeing: simState.wellbeing,
      careDebt: simState.careDebt,
      sleep: simState.sleep,
      messCount: simState.messCount,
      lastAccidentAt: simState.lastAccidentAt,
    };
  }

  const fullSim = Math.min(
    dtMinutes,
    Number(tuning?.tick?.fullSimMinutes ?? 24 * 60)
  );
  const extraSim = Math.max(0, dtMinutes - fullSim);

  simulateMinutes(
    simState,
    fullSim,
    nowMs - extraSim * 60000,
    {
      decayMultiplier: 1.0,
      floorOverride: null,
      allowAccidents: true,
    },
    tuning,
    zones
  );

  if (extraSim > 0) {
    simulateMinutes(
      simState,
      extraSim,
      nowMs - extraSim * 60000,
      {
        decayMultiplier: Number(tuning?.tick?.extraSimDecayMultiplier ?? 0.25),
        floorOverride: Number(tuning?.tick?.extraSimFloor ?? zones.FLOOR),
        allowAccidents: false,
      },
      tuning,
      zones
    );
  }

  return {
    stats: simState.stats,
    wellbeing: simState.wellbeing,
    careDebt: simState.careDebt,
    sleep: simState.sleep,
    messCount: simState.messCount,
    lastAccidentAt: simState.lastAccidentAt,
  };
}
