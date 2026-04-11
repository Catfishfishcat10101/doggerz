function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function getDayKey(now = Date.now()) {
  try {
    return new Date(now).toISOString().slice(0, 10);
  } catch {
    return "1970-01-01";
  }
}

function getWeekKey(now = Date.now()) {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const dayOfYear = Math.ceil(
    (Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(year, 0, 1)) /
      86_400_000
  );
  return `${year}-w${Math.max(1, Math.ceil(dayOfYear / 7))}`;
}

function getLocalHour(now = Date.now()) {
  try {
    return new Date(now).getHours();
  } catch {
    return 12;
  }
}

function hashSeed(seed = "") {
  const input = String(seed || "");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function pickDeterministic(list = [], seed = "") {
  const options = Array.isArray(list) ? list : [];
  if (!options.length) return null;
  return options[hashSeed(seed) % options.length];
}

function hoursSince(timestamp, now = Date.now()) {
  const ts = Number(timestamp || 0);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return Math.max(0, (Number(now) - ts) / 3_600_000);
}

function resolveStageKey(dog = {}) {
  return String(dog?.lifeStage?.stage || "PUPPY")
    .trim()
    .toUpperCase();
}

function resolveTimeBucket(now = Date.now(), isNight = false) {
  const hour = getLocalHour(now);
  if (hour < 11 && !isNight) return "morning";
  if (hour < 17 && !isNight) return "day";
  if (hour < 21) return "evening";
  return "night";
}

const ROUTINE_THEMES = Object.freeze([
  Object.freeze({
    id: "calm_week",
    label: "Calm Week",
    summary: "Short, steady check-ins with minimal chaos.",
  }),
  Object.freeze({
    id: "play_week",
    label: "Play Week",
    summary: "A few joyful bursts, followed by a soft landing.",
  }),
  Object.freeze({
    id: "training_week",
    label: "Training Week",
    summary: "Brief practice, then warmth and reassurance.",
  }),
  Object.freeze({
    id: "comfort_week",
    label: "Comfort Week",
    summary: "Rest, routine, and quiet care take the lead.",
  }),
]);

const DAILY_BASE_MOMENTS = Object.freeze({
  morning: Object.freeze([
    Object.freeze({
      id: "morning_greeting",
      title: "Morning hello",
      body: "A quick hello and fresh water sets a calm tone for the day.",
      tone: "emerald",
      windowLabel: "Morning moment",
    }),
    Object.freeze({
      id: "sun_patch",
      title: "Soft start",
      body: "A little affection before the day gets busy helps your dog settle in.",
      tone: "sky",
      windowLabel: "Morning moment",
    }),
  ]),
  day: Object.freeze([
    Object.freeze({
      id: "midday_patrol",
      title: "Gentle check-in",
      body: "A short play burst or tidy-up keeps the day from feeling flat.",
      tone: "sky",
      windowLabel: "Daily moment",
    }),
    Object.freeze({
      id: "yard_reset",
      title: "Yard reset",
      body: "One calm interaction can shift your dog out of a dull patch.",
      tone: "amber",
      windowLabel: "Daily moment",
    }),
  ]),
  evening: Object.freeze([
    Object.freeze({
      id: "evening_wind_down",
      title: "Evening wind-down",
      body: "A calm play session followed by rest makes the whole yard feel softer.",
      tone: "amber",
      windowLabel: "Evening moment",
    }),
    Object.freeze({
      id: "quiet_companion",
      title: "Quiet companion time",
      body: "A few gentle taps can feel better than a full activity burst tonight.",
      tone: "rose",
      windowLabel: "Evening moment",
    }),
  ]),
  night: Object.freeze([
    Object.freeze({
      id: "night_watch",
      title: "Night watch",
      body: "Late-night check-ins should stay warm and brief.",
      tone: "sky",
      windowLabel: "Night moment",
    }),
    Object.freeze({
      id: "cozy_reset",
      title: "Cozy reset",
      body: "Rest and reassurance matter more than intensity this late.",
      tone: "emerald",
      windowLabel: "Night moment",
    }),
  ]),
});

const STAGE_MOMENT_OVERRIDES = Object.freeze({
  PUPPY: Object.freeze([
    Object.freeze({
      id: "puppy_reassurance",
      title: "Puppy reassurance",
      body: "Short check-ins help puppies feel secure without overloading them.",
      tone: "emerald",
      windowLabel: "Puppy moment",
    }),
  ]),
  ADULT: Object.freeze([
    Object.freeze({
      id: "adult_confidence",
      title: "Confident rhythm",
      body: "Your dog responds best to a clear routine and one quality activity.",
      tone: "sky",
      windowLabel: "Adult moment",
    }),
  ]),
  SENIOR: Object.freeze([
    Object.freeze({
      id: "senior_comfort",
      title: "Comfort first",
      body: "Gentle care and calm rest matter more than busy activity right now.",
      tone: "amber",
      windowLabel: "Senior moment",
    }),
  ]),
});

const ROTATING_SMALL_EVENTS = Object.freeze([
  Object.freeze({
    id: "water_refresh",
    label: "Fresh bowl day",
    detail:
      "Refresh water before anything else and let the rest of the day stay easy.",
    tone: "sky",
  }),
  Object.freeze({
    id: "training_touch",
    label: "One-trick touch",
    detail:
      "Run one short trick rep, then end on affection instead of repetition.",
    tone: "emerald",
  }),
  Object.freeze({
    id: "cozy_brush",
    label: "Cozy cleanup",
    detail:
      "A quick tidy-up can feel like a reset when your dog seems a little worn down.",
    tone: "amber",
  }),
  Object.freeze({
    id: "play_loop",
    label: "Play loop",
    detail:
      "One focused play burst is enough. Leave room for the dog to settle again.",
    tone: "rose",
  }),
]);

const OCCASIONAL_SURPRISES = Object.freeze([
  Object.freeze({
    id: "tiny_treasure",
    label: "Tiny treasure chance",
    hint: "A calm check-in later might lead to a small discovery.",
  }),
  Object.freeze({
    id: "nap_keepsake",
    label: "Cozy keepsake chance",
    hint: "A restful stretch can turn into a small memory-worthy moment.",
  }),
  Object.freeze({
    id: "yard_curiosity",
    label: "Curiosity spark",
    hint: "Your dog may investigate something familiar if the yard stays quiet.",
  }),
  Object.freeze({
    id: "night_whim",
    label: "Nighttime whim",
    hint: "Late check-ins sometimes uncover a softer, stranger little moment.",
  }),
]);

function resolveCadenceTone(baseTone = "emerald", isNight = false) {
  const tone = String(baseTone || "emerald")
    .trim()
    .toLowerCase();
  if (isNight && tone === "amber") return "sky";
  if (isNight && tone === "rose") return "emerald";
  return tone;
}

function pickDailyMoment({ dog, now, isNight, profileSeed, dayKey }) {
  const stageKey = resolveStageKey(dog);
  const timeBucket = resolveTimeBucket(now, isNight);
  const lastSeenHours = hoursSince(dog?.memory?.lastSeenAt, now);
  const lastFedHours = hoursSince(dog?.memory?.lastFedAt, now);
  const lastPlayedHours = hoursSince(dog?.memory?.lastPlayedAt, now);

  if (lastSeenHours != null && lastSeenHours >= 18) {
    return {
      id: "return_moment",
      title: "Welcome-back moment",
      body: "A small check-in is enough. Your dog does not need a marathon to feel remembered.",
      tone: "emerald",
      windowLabel: "Return moment",
    };
  }

  if (lastFedHours != null && lastFedHours >= 8) {
    return {
      id: "meal_rhythm",
      title: "Meal rhythm",
      body: "A simple feed-and-water routine can steady the whole day.",
      tone: "amber",
      windowLabel: "Daily moment",
    };
  }

  if (lastPlayedHours != null && lastPlayedHours >= 18) {
    return {
      id: "play_reconnect",
      title: "Reconnect through play",
      body: "One gentle play session is enough to wake the yard back up.",
      tone: "sky",
      windowLabel: "Daily moment",
    };
  }

  const stageOverrides = STAGE_MOMENT_OVERRIDES[stageKey] || [];
  const baseMoments = DAILY_BASE_MOMENTS[timeBucket] || DAILY_BASE_MOMENTS.day;
  const source =
    stageOverrides.length && hashSeed(`${profileSeed}:${dayKey}`) % 4 === 0
      ? stageOverrides
      : baseMoments;

  return (
    pickDeterministic(
      source,
      `${profileSeed}:${dayKey}:${timeBucket}:${stageKey}`
    ) || source[0]
  );
}

function pickRetentionTunedMoment({
  analyticsSnapshot,
  dog,
  now: _now,
  isNight,
}) {
  const snapshot =
    analyticsSnapshot && typeof analyticsSnapshot === "object"
      ? analyticsSnapshot
      : null;
  if (!snapshot) return null;

  const firstSessionSeconds = Math.max(
    0,
    Math.round(Number(snapshot.firstSessionSeconds || 0))
  );
  const firstCare = snapshot.firstSessionCare || {};
  const careCompleted = Math.max(
    0,
    Math.floor(Number(firstCare.completedCount || 0))
  );
  const returnGapHours = Math.max(0, Number(snapshot.returnGapHours || 0));
  const hunger = Number(dog?.stats?.hunger || 0);
  const thirst = Number(dog?.stats?.thirst || 0);
  const missingCarePressure = Math.max(hunger, thirst);

  if (returnGapHours >= 36) {
    return {
      id: "missed_you_long_gap",
      title: "I missed you",
      body: "Your dog is glad you're back. Start with one calm care action, then let the yard settle.",
      tone: "emerald",
      windowLabel: "Welcome-back moment",
      urgency: "soft",
    };
  }

  if (returnGapHours >= 20 && missingCarePressure >= 55) {
    return {
      id: "soft_reconnect_care",
      title: "Gentle reconnect",
      body: "A quick water and feed check will steady the day without turning it into a grind.",
      tone: isNight ? "sky" : "amber",
      windowLabel: "Return moment",
      urgency: "light",
    };
  }

  if (
    firstSessionSeconds > 0 &&
    firstSessionSeconds < 90 &&
    careCompleted <= 1
  ) {
    return {
      id: "first_session_guided_loop",
      title: "Start with the care trio",
      body: "Feed, water, and one play tap is enough for a good first day. Keep it short and warm.",
      tone: "emerald",
      windowLabel: "First-day rhythm",
      urgency: "none",
    };
  }

  return null;
}

function pickRotatingEvent({ dog, now, environment, profileSeed, dayKey }) {
  const stageKey = resolveStageKey(dog);
  const lastTrainedHours = hoursSince(dog?.memory?.lastTrainedAt, now);
  const lastBathHours = hoursSince(dog?.memory?.lastBathedAt, now);
  const lastPlayedHours = hoursSince(dog?.memory?.lastPlayedAt, now);
  const envKey = String(environment || "yard")
    .trim()
    .toLowerCase();

  if (lastBathHours != null && lastBathHours >= 48) {
    return {
      id: "gentle_cleanup",
      label: "Gentle cleanup",
      detail: "A bath or quick tidy-up would land well today.",
      tone: "amber",
    };
  }

  if (lastTrainedHours != null && lastTrainedHours >= 36) {
    return {
      id: "skill_refresh",
      label: "Skill refresh",
      detail:
        "A single short trick session keeps progress feeling alive without pressure.",
      tone: "sky",
    };
  }

  if (lastPlayedHours != null && lastPlayedHours >= 20) {
    return {
      id: "play_refresh",
      label: "Play refresh",
      detail: "This is a good day for one quality play burst and a calm stop.",
      tone: "rose",
    };
  }

  return (
    pickDeterministic(
      ROTATING_SMALL_EVENTS,
      `${profileSeed}:${dayKey}:${envKey}:${stageKey}`
    ) || ROTATING_SMALL_EVENTS[0]
  );
}

function pickOccasionalSurprise({ dog, now, isNight, profileSeed, dayKey }) {
  const lastTreasureHours = hoursSince(dog?.memory?.lastTreasureHuntAt, now);
  const lastZoomiesHours = hoursSince(dog?.memory?.lastZoomiesAt, now);
  const lastDreamHours = hoursSince(dog?.memory?.lastDreamWoofAt, now);

  let readiness = 28;
  if (lastTreasureHours != null) {
    readiness = Math.max(
      readiness,
      Math.round(clamp(lastTreasureHours / 12, 0, 1) * 100)
    );
  }
  if (isNight && lastZoomiesHours != null) {
    readiness = Math.max(
      readiness,
      Math.round(clamp(lastZoomiesHours / 8, 0, 1) * 100)
    );
  }
  if (lastDreamHours != null) {
    readiness = Math.max(
      readiness,
      Math.round(clamp(lastDreamHours / 16, 0, 1) * 100)
    );
  }

  const surprise =
    pickDeterministic(
      OCCASIONAL_SURPRISES,
      `${profileSeed}:${dayKey}:${isNight ? "night" : "day"}:${Math.floor(readiness / 10)}`
    ) || OCCASIONAL_SURPRISES[0];

  return {
    ...surprise,
    readinessPct: clamp(readiness, 0, 100),
    ready: readiness >= 55,
    tone: isNight ? "sky" : "amber",
  };
}

export function getRetentionCadenceModel({
  dog = {},
  now = Date.now(),
  isNight = false,
  environment = "yard",
  analyticsSnapshot = null,
} = {}) {
  const dayKey = getDayKey(now);
  const weekKey = getWeekKey(now);
  const profileSeed =
    String(dog?.identity?.profileId || "").trim() ||
    String(dog?.adoptedAt || "").trim() ||
    "guest";
  const stageSeed = resolveStageKey(dog);
  const streakDays = Math.max(
    0,
    Math.floor(Number(dog?.streak?.currentStreakDays || 0))
  );

  const baseDailyMoment = pickDailyMoment({
    dog,
    now,
    isNight,
    profileSeed,
    dayKey,
  });
  const tunedDailyMoment =
    pickRetentionTunedMoment({
      analyticsSnapshot,
      dog,
      now,
      isNight,
    }) || baseDailyMoment;
  const rotatingEvent = pickRotatingEvent({
    dog,
    now,
    environment,
    profileSeed,
    dayKey,
  });
  const routineTheme =
    pickDeterministic(
      ROUTINE_THEMES,
      `${profileSeed}:${weekKey}:${stageSeed}:${Math.floor(streakDays / 3)}`
    ) || ROUTINE_THEMES[0];
  const surprise = pickOccasionalSurprise({
    dog,
    now,
    isNight,
    profileSeed,
    dayKey,
  });

  const resolvedDailyMoment = {
    ...tunedDailyMoment,
    tone: resolveCadenceTone(tunedDailyMoment.tone, isNight),
  };
  const resolvedRotatingEvent = {
    ...rotatingEvent,
    tone: resolveCadenceTone(rotatingEvent.tone, isNight),
  };

  return {
    dayKey,
    weekKey,
    dailyMoment: resolvedDailyMoment,
    rotatingEvent: resolvedRotatingEvent,
    routineTheme,
    surprise,
    retention: {
      riskBand: String(analyticsSnapshot?.riskBand || "low")
        .trim()
        .toLowerCase(),
      dropOffReasons: Array.isArray(analyticsSnapshot?.dropOffReasons)
        ? [...analyticsSnapshot.dropOffReasons]
        : [],
      firstSessionComplete: Boolean(analyticsSnapshot?.firstSessionComplete),
      firstCareLoopCompleted: Boolean(
        analyticsSnapshot?.firstCareLoopCompleted
      ),
    },
    // Backward-compatible aliases for the existing HUD card.
    microMoment: resolvedDailyMoment,
    rotatingCare: resolvedRotatingEvent,
    surpriseFind: surprise,
  };
}
