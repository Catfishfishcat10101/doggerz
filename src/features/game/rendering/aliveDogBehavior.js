// src/features/game/rendering/aliveDogBehavior.js
import { DOG_ACTIONS } from "./DogAction.js";
import { DOG_CRITICAL_NEED_RENDER_CLIPS } from "./dogAnimationMap.js";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function weightedPick(options = [], seed = Math.random()) {
  const list = Array.isArray(options) ? options.filter(Boolean) : [];
  const total = list.reduce(
    (sum, option) => sum + Math.max(0, Number(option?.weight || 0)),
    0
  );
  if (!total) return null;

  let cursor = clamp(seed, 0, 0.999999) * total;
  for (const option of list) {
    cursor -= Math.max(0, Number(option?.weight || 0));
    if (cursor <= 0) return option;
  }
  return list[list.length - 1] || null;
}

export const AMBIENT_IDLE_ACTIONS = Object.freeze(
  new Set([
    DOG_ACTIONS.idle,
    "idle_resting",
    "puppy_idle_pack",
    "golden_years_idle",
  ])
);

export const CRITICAL_NEED_ACTIONS = Object.freeze(
  new Set([...DOG_CRITICAL_NEED_RENDER_CLIPS])
);

export function isCriticalNeedAnimation(actionLike) {
  return CRITICAL_NEED_ACTIONS.has(normalizeKey(actionLike));
}

export function canRunAmbientBehavior({
  resolution,
  requestedAction = "",
  dog,
}) {
  if (!resolution || String(requestedAction || "").trim()) return false;
  if (
    resolution.priorityBucket === "one_shot" ||
    resolution.priorityBucket === "critical_need" ||
    resolution.priorityBucket === "locomotion"
  ) {
    return false;
  }
  if (resolution.oneShot || resolution.sleeping || resolution.moving)
    return false;
  if (!AMBIENT_IDLE_ACTIONS.has(normalizeKey(resolution.baseAction)))
    return false;

  const hunger = Number(dog?.stats?.hunger || 0);
  const thirst = Number(dog?.stats?.thirst || 0);
  const energy = Number(dog?.stats?.energy || 0);
  const cleanliness = Number(dog?.stats?.cleanliness || 100);

  if (hunger >= 82 || thirst >= 80 || energy <= 18 || cleanliness <= 18) {
    return false;
  }

  return true;
}

function getTemperamentKey(dog, renderModel) {
  const archetype = normalizeKey(
    dog?.temperament?.archetype ||
      dog?.personalityProfile?.behaviorTendencies?.primary ||
      renderModel?.personalityProfile?.behaviorTendencies?.primary ||
      ""
  );

  if (archetype.includes("shadow") || archetype.includes("cling")) {
    return "clingy";
  }
  if (archetype.includes("misch") || archetype.includes("spicy")) {
    return "spicy";
  }
  if (archetype.includes("independent")) {
    return "lazy";
  }
  if (archetype.includes("athlete")) {
    return "toy_obsessed";
  }
  return "steady";
}

export function getAmbientBehaviorPlan({
  dog,
  renderModel,
  resolution,
  now = Date.now(),
}) {
  const baseAction = normalizeKey(resolution?.baseAction);
  if (!AMBIENT_IDLE_ACTIONS.has(baseAction)) return null;

  const temperament = getTemperamentKey(dog, renderModel);
  const hunger = clamp(Number(dog?.stats?.hunger || 0), 0, 100);
  const energy = clamp(Number(dog?.stats?.energy || 0), 0, 100);
  const cleanliness = clamp(Number(dog?.stats?.cleanliness || 100), 0, 100);
  const happiness = clamp(Number(dog?.stats?.happiness || 50), 0, 100);
  const options = [
    {
      action: "sniff",
      weight: 2 + hunger / 32 + (temperament === "toy_obsessed" ? 0.8 : 0),
      durationMs: 1500,
      cooldownMs: 6200,
      reason: "sniff",
    },
    {
      action: "wag",
      weight: 1.6 + happiness / 45 + (temperament === "clingy" ? 1.2 : 0),
      durationMs: 1300,
      cooldownMs: 5400,
      reason: "wag",
    },
    {
      action: "sit",
      weight: 1.2 + (temperament === "lazy" ? 1.1 : 0),
      durationMs: 1400,
      cooldownMs: 7600,
      reason: "sit",
    },
    {
      action: DOG_ACTIONS.scratch,
      weight: cleanliness < 60 ? 1 + (60 - cleanliness) / 18 : 0.18,
      durationMs: 1200,
      cooldownMs: 9200,
      reason: "scratch",
    },
    {
      action: "idle_resting",
      weight: 1.4 + (energy < 45 ? 1.25 : 0.2),
      durationMs: 1800,
      cooldownMs: 6000,
      reason: "settle",
    },
  ];

  const choice = weightedPick(options);
  if (!choice) return null;

  const spacingBias =
    temperament === "lazy"
      ? 2200
      : temperament === "spicy"
        ? -1200
        : temperament === "clingy"
          ? -600
          : 0;

  return {
    ...choice,
    scheduledAt: now,
    nextDelayMs: clamp(4600 + Math.random() * 5200 + spacingBias, 3200, 9800),
  };
}
