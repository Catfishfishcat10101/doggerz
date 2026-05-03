const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

const TRUST_SCENES = Object.freeze([
  {
    min: 80,
    max: 100,
    key: "max",
    label: "Paw on glass",
    summary:
      "Runs to the glass and reaches out when the bond is extremely strong.",
  },
  {
    min: 60,
    max: 79,
    key: "high",
    label: "Fence-line welcome",
    summary: "Runs to the fence line and wags when you show up.",
  },
  {
    min: 40,
    max: 59,
    key: "mid",
    label: "Walks to center",
    summary: "Moves to the middle of the yard when the app opens.",
  },
  {
    min: 20,
    max: 39,
    key: "low",
    label: "Stops and watches",
    summary: "Stops, looks at you, then goes back to its task.",
  },
  {
    min: 0,
    max: 19,
    key: "standoff",
    label: "Distant bark",
    summary: "Keeps distance and barks at perceived threats.",
  },
]);

export const MORNING_GLORY_START_HOUR = 6;
export const MORNING_GLORY_END_HOUR = 8;
export const PAW_ON_GLASS_IDLE_MS = 60_000;
export const GHOST_BASE_OPACITY = 0.4;
export const GHOST_BARK_FADE_MS = 4_000;

function getTrustScene(score) {
  return (
    TRUST_SCENES.find((entry) => score >= entry.min && score <= entry.max) ||
    TRUST_SCENES[TRUST_SCENES.length - 1]
  );
}

function isGloomyWeather(weatherKey) {
  const key = String(weatherKey || "").toLowerCase();
  return (
    key.includes("overcast") ||
    key.includes("cloud") ||
    key.includes("mist") ||
    key.includes("fog") ||
    key.includes("haze") ||
    key.includes("drizzle") ||
    key.includes("rain") ||
    key.includes("storm")
  );
}

function getDangerConsequence(dog) {
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  if (lifecycleStatus === "FAREWELL") {
    return {
      key: "rainbow_bridge",
      label: "Rainbow Bridge",
      summary:
        "Farewell letter recorded. This dog has reached the end of the lifecycle.",
    };
  }
  if (lifecycleStatus === "RESCUED") {
    return {
      key: "vet_rescue",
      label: "Vet rescue",
      summary: "Mistreatment or severe neglect triggered rescue intervention.",
    };
  }

  const dangerScore = clamp(dog?.danger?.score, 0, 100);
  if (dangerScore >= 92) {
    return {
      key: "vet_emergency",
      label: "Vet emergency",
      summary:
        "Danger is critically high and the dog is at risk of being taken to care.",
    };
  }
  if (dangerScore >= 72) {
    return {
      key: "care_warning",
      label: "Care warning",
      summary: "Runaway risk is high enough to trigger a serious care warning.",
    };
  }

  return {
    key: "safe",
    label: "Stable",
    summary: "Danger meters are not in a consequence state.",
  };
}

function getAgingBrainProfile(life = {}, dynamicStates = {}) {
  const ageDays = Math.max(0, Math.floor(Number(life?.ageDays || 0)));
  const isSenior = String(life?.stage || "").toUpperCase() === "SENIOR";
  const active = isSenior || ageDays >= 150;
  const confusion = clamp(
    active
      ? 28 +
          Math.max(0, ageDays - 150) * 1.4 +
          clamp(dynamicStates.frustration) * 0.12
      : 8 + clamp(dynamicStates.frustration) * 0.05,
    0,
    100
  );

  return {
    active,
    slowerResponse: active,
    confusionPct: confusion,
    repetitionPct: clamp(confusion * 0.86, 0, 100),
    responseLagMs: active ? 900 : 220,
  };
}

function getGhostProfile(dog, now) {
  const legacy = dog?.legacyJourney || {};
  const unlocked = Boolean(legacy.ghostDogUnlocked);
  const memorySpotActive = Boolean(unlocked && dog?.memorial?.completedAt);
  const lastGhostAction = String(legacy.ghostMimicAction || "").toLowerCase();
  const ghostEventAt = Number(
    legacy.ghostMimicAt || legacy.ghostPlayBowAt || 0
  );
  const barkFadeActive =
    lastGhostAction === "bark" && ghostEventAt > 0 && now >= ghostEventAt;
  const elapsed = barkFadeActive ? now - ghostEventAt : 0;
  const opacity = barkFadeActive
    ? clamp(
        Math.round(
          (1 - elapsed / GHOST_BARK_FADE_MS) * GHOST_BASE_OPACITY * 100
        ) / 100,
        0,
        GHOST_BASE_OPACITY
      )
    : memorySpotActive
      ? GHOST_BASE_OPACITY
      : 0;

  return {
    unlocked,
    memorySpotActive,
    present: memorySpotActive && opacity > 0,
    opacity,
    barkFadeActive,
    usingAdultSpriteSheet: unlocked,
    glowOpacity: opacity > 0 ? clamp(opacity * 0.55, 0, 0.28) : 0,
  };
}

export function getMorningGloryLiveOp(now = Date.now()) {
  const date = now instanceof Date ? now : new Date(now);
  const hour = Number(date.getHours());
  const active =
    Number.isFinite(hour) &&
    hour >= MORNING_GLORY_START_HOUR &&
    hour < MORNING_GLORY_END_HOUR;

  return {
    active,
    id: "morning_glory_treat",
    label: "Morning Glory Treats",
    windowLabel: "6am-8am",
  };
}

export function deriveBehaviorSceneProfile({
  dog = null,
  vitals = null,
  life = null,
  weatherKey = "clear",
  now = Date.now(),
} = {}) {
  const profile =
    dog?.personalityProfile && typeof dog.personalityProfile === "object"
      ? dog.personalityProfile
      : {};
  const dynamicStates = profile?.dynamicState || profile?.dynamicStates || {};
  const learnedTraits = profile?.learnedHabits || profile?.learnedTraits || {};
  const stressSignals = profile?.stressSignals || {};
  const trust = profile?.trust || {};
  const instinctEngine = profile?.instinctEngine || {};
  const bigFive = profile?.corePersonality || profile?.bigFive || {};
  const trustScore = clamp(
    trust?.score ?? vitals?.bondValue ?? dog?.bond?.value,
    0,
    100
  );
  const energyPct = clamp(vitals?.energy ?? dog?.stats?.energy, 0, 100);
  const lastSeenAt = Number(dog?.memory?.lastSeenAt || dog?.lastUpdatedAt || 0);
  const idleTimeMs = lastSeenAt > 0 ? Math.max(0, now - lastSeenAt) : 0;
  const trustScene = getTrustScene(trustScore);
  const gloomy = isGloomyWeather(weatherKey);
  const agingBrain = getAgingBrainProfile(life, dynamicStates);
  const ghost = getGhostProfile(dog, now);
  const liveOps = getMorningGloryLiveOp(now);

  return {
    dynamicStates: {
      frustration: clamp(dynamicStates.frustration, 0, 100),
      confidence: clamp(dynamicStates.confidence, 0, 100),
      affection: clamp(dynamicStates.affection, 0, 100),
    },
    learnedTraits: {
      obedienceReliability: clamp(
        learnedTraits.reliability ?? dog?.personality?.obedienceReliability,
        0,
        100
      ),
      houseManners: clamp(learnedTraits.houseManners, 0, 100),
    },
    trust: {
      score: trustScore,
      tier: trustScene.key,
      label: trustScene.label,
      summary: trustScene.summary,
      focusMode: trust?.focusMode || "self_focused",
      appOpenBehavior: trust?.appOpenBehavior || null,
      pawOnGlassEligible:
        trustScore > 90 && energyPct > 40 && idleTimeMs >= PAW_ON_GLASS_IDLE_MS,
      idleTimeMs,
    },
    stressSignals: {
      whaleEye: Boolean(stressSignals.whaleEye),
      destructiveOutlets: Boolean(stressSignals.destructiveOutlets),
      standOff: Boolean(stressSignals.standOff),
    },
    instinctEngine: {
      chewingUrge: clamp(instinctEngine.chewingUrge, 0, 100),
      vocalizationThreshold: clamp(
        instinctEngine.vocalizationThreshold,
        0,
        100
      ),
    },
    bigFive: {
      openness: clamp(bigFive.openness, 0, 100),
      conscientiousness: clamp(bigFive.conscientiousness, 0, 100),
      extroversion: clamp(bigFive.extroversion, 0, 100),
      neuroticism: clamp(bigFive.neuroticism, 0, 100),
      agreeableness: clamp(bigFive.agreeableness, 0, 100),
    },
    agingBrain,
    weather: {
      gloomy,
      shelterSeeking:
        gloomy &&
        (energyPct < 65 ||
          agingBrain.active ||
          Boolean(stressSignals.whaleEye) ||
          clamp(dynamicStates.confidence, 0, 100) < 45),
    },
    danger: getDangerConsequence(dog),
    ghost,
    liveOps,
  };
}
