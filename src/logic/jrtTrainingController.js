const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const clamp01 = (n) => clamp(n, 0, 1);

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function nextRoll(rng = Math.random) {
  return clamp01(typeof rng === "function" ? rng() : Math.random());
}

function pickWeighted(items, rng = Math.random) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      ...item,
      weight: Math.max(0, Number(item?.weight || 0)),
    }))
    .filter((item) => item.weight > 0);

  if (!normalized.length) return null;

  const total = normalized.reduce((sum, item) => sum + item.weight, 0);
  let target = nextRoll(rng) * total;

  for (const item of normalized) {
    target -= item.weight;
    if (target <= 0) return item;
  }

  return normalized[normalized.length - 1] || null;
}

const SHOWOFF_ACTIONS = Object.freeze([
  "spin",
  "jump",
  "bow",
  "wave",
  "shake",
  "highFive",
  "rollOver",
  "playDead",
  "fetch",
  "dance",
  "speak",
]);

export function getObedienceSkillMasteryPct(skillNode) {
  const xp = Math.max(0, Number(skillNode?.xp || 0));
  const level = Math.max(0, Number(skillNode?.level || 0));

  const xpPct = clamp(xp / 4, 0, 100);
  const levelPct = clamp(level * 10, 0, 100);

  return clamp(Math.round(xpPct * 0.65 + levelPct * 0.35), 0, 100);
}

function pickDistractionAction({
  hunger = 0,
  cleanliness = 100,
  frustration = 0,
  confidence = 50,
  rng = Math.random,
} = {}) {
  const options = [
    {
      id: "sniff",
      action: "sniff",
      weight: 1 + Math.max(0, hunger - 45) * 0.12,
    },
    {
      id: "scratch",
      action: "scratch",
      weight:
        1 +
        Math.max(0, 55 - cleanliness) * 0.08 +
        Math.max(0, frustration - 45) * 0.06,
    },
    {
      id: "blank_stare",
      action: "idle",
      weight: 1 + Math.max(0, 60 - confidence) * 0.08,
    },
  ];

  return pickWeighted(options, rng) || options[0];
}

function pickShowoffAction({
  commandId = "",
  unlockedIds = [],
  rng = Math.random,
} = {}) {
  const requested = normalizeAction(commandId);
  const pool = (Array.isArray(unlockedIds) ? unlockedIds : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .filter((id) => SHOWOFF_ACTIONS.includes(id))
    .filter((id) => normalizeAction(id) !== requested);

  if (!pool.length) return null;
  const picked = pickWeighted(
    pool.map((id) => ({ id, weight: 1 })),
    rng
  );
  return picked?.id || null;
}

export function resolveJrtTrainingReaction({
  commandId = "",
  unlockedIds = [],
  skillNode = null,
  stats = {},
  bond = 0,
  profile = null,
  isSpicy = false,
  rng = Math.random,
} = {}) {
  const energy = clamp(Number(stats?.energy || 0), 0, 100);
  const hunger = clamp(Number(stats?.hunger || 0), 0, 100);
  const happiness = clamp(Number(stats?.happiness || 0), 0, 100);
  const cleanliness = clamp(Number(stats?.cleanliness ?? 100), 0, 100);
  const bondPct = clamp(Number(bond || 0), 0, 100);
  const skillMastery = getObedienceSkillMasteryPct(skillNode);

  const frustration = clamp(
    Number(profile?.dynamicStates?.frustration || 0),
    0,
    100
  );
  const confidence = clamp(
    Number(profile?.dynamicStates?.confidence || 50),
    0,
    100
  );
  const trust = clamp(Number(profile?.trust?.score || bondPct), 0, 100);
  const inquisitiveness = clamp(
    Number(profile?.coreTemperament?.inquisitiveness || 35),
    0,
    100
  );
  const energyCeiling = clamp(
    Number(profile?.coreTemperament?.energyCeiling || energy),
    0,
    100
  );
  const extroversion = clamp(
    Number(profile?.bigFive?.extroversion || 50),
    0,
    100
  );

  const showoffAction = pickShowoffAction({ commandId, unlockedIds, rng });

  const zoomiesChance = clamp(
    (energy >= 85 ? 14 + (energy - 85) * 0.55 : 0) +
      Math.max(0, energyCeiling - 60) * 0.16 +
      Math.max(0, happiness - 65) * 0.08 +
      Math.max(0, confidence - 55) * 0.06 +
      (isSpicy ? 6 : 0) -
      Math.max(0, hunger - 60) * 0.08,
    0,
    28
  );

  const ignoreChance = clamp(
    Math.max(0, 62 - trust) * 0.45 +
      Math.max(0, 55 - confidence) * 0.2 +
      Math.max(0, hunger - 45) * 0.22 +
      frustration * 0.18 +
      inquisitiveness * 0.12 +
      (isSpicy ? 5 : 0) -
      skillMastery * 0.15,
    0,
    52
  );

  const reinterpretChance = showoffAction
    ? clamp(
        Math.max(0, confidence - 55) * 0.18 +
          Math.max(0, trust - 50) * 0.1 +
          Math.max(0, extroversion - 55) * 0.08 +
          Math.max(0, energy - 60) * 0.08 +
          skillMastery * 0.05 +
          (isSpicy ? 3 : 0) -
          frustration * 0.08,
        0,
        18
      )
    : 0;

  const roll = nextRoll(rng) * 100;

  if (zoomiesChance > 0 && roll < zoomiesChance) {
    return {
      kind: "zoomies",
      performedActionId: "zoomies",
      requestedCommandId: commandId,
      reasonId: "zoomies",
      roll,
      thresholds: {
        zoomiesChance,
        ignoreChance,
        reinterpretChance,
      },
    };
  }

  if (roll < zoomiesChance + ignoreChance) {
    const distraction = pickDistractionAction({
      hunger,
      cleanliness,
      frustration,
      confidence,
      rng,
    });

    return {
      kind: "ignore",
      performedActionId: distraction?.action || "idle",
      requestedCommandId: commandId,
      reasonId: distraction?.id || "blank_stare",
      roll,
      thresholds: {
        zoomiesChance,
        ignoreChance,
        reinterpretChance,
      },
    };
  }

  if (reinterpretChance > 0 && roll > 100 - reinterpretChance) {
    return {
      kind: "reinterpret",
      performedActionId: showoffAction,
      performedCommandId: showoffAction,
      requestedCommandId: commandId,
      reasonId: "showoff",
      roll,
      thresholds: {
        zoomiesChance,
        ignoreChance,
        reinterpretChance,
      },
    };
  }

  return {
    kind: "obey",
    performedActionId: normalizeAction(commandId),
    performedCommandId: commandId,
    requestedCommandId: commandId,
    reasonId: "focused",
    roll,
    thresholds: {
      zoomiesChance,
      ignoreChance,
      reinterpretChance,
    },
  };
}
