import { getDogEnvironmentTargets } from "@/components/dog/DogEnvironmentTargets.js";
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/simulation/DogWanderBehavior.js";

const LOW_ENERGY_REST_THRESHOLD = 18;
const LOW_STIMULATION_WALK_THRESHOLD = 38;
const PROP_SNIFF_DISTANCE_PX = 76;
const WANDER_TARGET_REFRESH_MS = 20_000;
const WANDER_STEP_MIN_PX = 42;
const WANDER_STEP_MAX_PX = 92;
const WANDER_Y_DRIFT_PX = 18;
const WANDER_X_MARGIN = 72;
const WANDER_Y_MIN = 260;
const WANDER_Y_MAX = DOG_WORLD_HEIGHT - 40;

export const DOG_BRAIN_PRIORITIES = Object.freeze({
  sleep: 100,
  rest: 90,
  walk: 60,
  sniff: 40,
  idle: 10,
});

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function createDecision({
  desiredAction,
  desiredTarget = null,
  reason,
  priority,
}) {
  return {
    desiredAction,
    desiredTarget,
    reason,
    priority,
  };
}

function distanceBetween(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dx = normalizeNumber(a.x) - normalizeNumber(b.x);
  const dy = normalizeNumber(a.y) - normalizeNumber(b.y);
  return Math.hypot(dx, dy);
}

function getCurrentPosition(dog) {
  if (dog?.position && typeof dog.position === "object") {
    return {
      x: clamp(dog.position.x, 0, DOG_WORLD_WIDTH),
      y: clamp(dog.position.y, 0, DOG_WORLD_HEIGHT),
    };
  }

  return {
    x: DOG_WORLD_WIDTH * 0.5,
    y: DOG_WORLD_HEIGHT * 0.74,
  };
}

function findNearestTarget(targets, predicate, origin) {
  const list = Array.isArray(targets) ? targets : [];
  const filtered = list.filter((target) => predicate(target));
  if (!filtered.length) return null;

  return filtered
    .slice()
    .sort(
      (left, right) =>
        distanceBetween(left, origin) - distanceBetween(right, origin)
    )[0];
}

function getRestTarget(dog, origin) {
  return findNearestTarget(
    getDogEnvironmentTargets(dog),
    (target) => String(target?.interaction || "").toLowerCase() === "rest",
    origin
  );
}

function getNearbyInterestingTarget(dog, origin) {
  return findNearestTarget(
    getDogEnvironmentTargets(dog),
    (target) => {
      const interaction = String(target?.interaction || "").toLowerCase();
      if (!interaction) return false;
      return distanceBetween(target, origin) <= PROP_SNIFF_DISTANCE_PX;
    },
    origin
  );
}

function hashSeed(seed) {
  let value = Number(seed) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

function seedUnit(seed) {
  return hashSeed(seed) / 0xffffffff;
}

function createStableWanderTarget(dog, now, origin) {
  if (dog?.targetPosition && typeof dog.targetPosition === "object") {
    return {
      x: clamp(dog.targetPosition.x, 0, DOG_WORLD_WIDTH),
      y: clamp(dog.targetPosition.y, 0, DOG_WORLD_HEIGHT),
      id: dog.targetPosition.id ? String(dog.targetPosition.id) : null,
      type: dog.targetPosition.type ? String(dog.targetPosition.type) : null,
      label: dog.targetPosition.label ? String(dog.targetPosition.label) : null,
    };
  }

  const bucket = Math.floor(
    normalizeNumber(now, Date.now()) / WANDER_TARGET_REFRESH_MS
  );
  const baseSeed =
    hashSeed(normalizeNumber(dog?.adoptedAt, 1)) ^
    hashSeed(bucket + 17) ^
    hashSeed(Math.round(origin.x * 11)) ^
    hashSeed(Math.round(origin.y * 7));
  const angle = seedUnit(baseSeed + 1) * Math.PI * 2;
  const distance =
    WANDER_STEP_MIN_PX +
    seedUnit(baseSeed + 2) * (WANDER_STEP_MAX_PX - WANDER_STEP_MIN_PX);
  const driftY = (seedUnit(baseSeed + 3) * 2 - 1) * WANDER_Y_DRIFT_PX;

  return {
    x: clamp(
      origin.x + Math.cos(angle) * distance,
      WANDER_X_MARGIN,
      DOG_WORLD_WIDTH - WANDER_X_MARGIN
    ),
    y: clamp(
      origin.y + Math.sin(angle) * distance + driftY,
      WANDER_Y_MIN,
      WANDER_Y_MAX
    ),
    id: `brain_wander_${bucket}`,
    type: "brain_wander",
    label: "yard stroll",
  };
}

export function buildDogBrainState(dog) {
  const stats = dog?.stats && typeof dog.stats === "object" ? dog.stats : {};

  return {
    adoptedAt: normalizeNumber(dog?.adoptedAt, 0),
    isAsleep: dog?.isAsleep === true || dog?.sleeping === true,
    aiState: normalizeAction(dog?.aiState || "idle"),
    aiStateUntilAt: normalizeNumber(dog?.aiStateUntilAt, 0),
    position: getCurrentPosition(dog),
    targetPosition:
      dog?.targetPosition && typeof dog.targetPosition === "object"
        ? {
            x: clamp(dog.targetPosition.x, 0, DOG_WORLD_WIDTH),
            y: clamp(dog.targetPosition.y, 0, DOG_WORLD_HEIGHT),
            id: dog.targetPosition.id ? String(dog.targetPosition.id) : null,
            type: dog.targetPosition.type
              ? String(dog.targetPosition.type)
              : null,
            label: dog.targetPosition.label
              ? String(dog.targetPosition.label)
              : null,
          }
        : null,
    stats: {
      energy: clamp(stats.energy, 0, 100),
      mentalStimulation: clamp(stats.mentalStimulation, 0, 100),
    },
    yard: dog?.yard && typeof dog.yard === "object" ? dog.yard : {},
    rawDog: dog || null,
  };
}

export function evaluateDogBrain(input, { now = Date.now() } = {}) {
  const dog = input?.rawDog || input || {};
  const position = input?.position || getCurrentPosition(dog);
  const aiState = normalizeAction(input?.aiState || dog?.aiState || "idle");
  const aiStateUntilAt = normalizeNumber(
    input?.aiStateUntilAt ?? dog?.aiStateUntilAt,
    0
  );
  const isAsleep = Boolean(
    input?.isAsleep ?? (dog?.isAsleep === true || dog?.sleeping === true)
  );
  const targetPosition =
    input?.targetPosition && typeof input.targetPosition === "object"
      ? input.targetPosition
      : dog?.targetPosition && typeof dog.targetPosition === "object"
        ? dog.targetPosition
        : null;
  const stats =
    input?.stats && typeof input.stats === "object"
      ? input.stats
      : dog?.stats && typeof dog.stats === "object"
        ? dog.stats
        : {};
  const energy = clamp(stats.energy, 0, 100);
  const mentalStimulation = clamp(stats.mentalStimulation, 0, 100);

  if (isAsleep || aiState === "sleep") {
    return createDecision({
      desiredAction: "sleep",
      desiredTarget: getRestTarget(dog, position),
      reason: "sleeping",
      priority: DOG_BRAIN_PRIORITIES.sleep,
    });
  }

  if (energy <= LOW_ENERGY_REST_THRESHOLD) {
    return createDecision({
      desiredAction: "rest",
      desiredTarget: getRestTarget(dog, position),
      reason: "low_energy",
      priority: DOG_BRAIN_PRIORITIES.rest,
    });
  }

  if (targetPosition && aiState === "walk") {
    return createDecision({
      desiredAction: "walk",
      desiredTarget: {
        x: clamp(targetPosition.x, 0, DOG_WORLD_WIDTH),
        y: clamp(targetPosition.y, 0, DOG_WORLD_HEIGHT),
        id: targetPosition.id ? String(targetPosition.id) : null,
        type: targetPosition.type ? String(targetPosition.type) : null,
        label: targetPosition.label ? String(targetPosition.label) : null,
      },
      reason: "continuing_target",
      priority: DOG_BRAIN_PRIORITIES.walk,
    });
  }

  if (
    aiStateUntilAt > now &&
    !targetPosition &&
    (aiState === "idle" || aiState === "rest")
  ) {
    return createDecision({
      desiredAction: "idle",
      desiredTarget: null,
      reason: "settling",
      priority: DOG_BRAIN_PRIORITIES.idle,
    });
  }

  if (mentalStimulation <= LOW_STIMULATION_WALK_THRESHOLD) {
    return createDecision({
      desiredAction: "walk",
      desiredTarget: createStableWanderTarget(dog, now, position),
      reason: "low_stimulation",
      priority: DOG_BRAIN_PRIORITIES.walk,
    });
  }

  const interestingTarget = getNearbyInterestingTarget(dog, position);
  if (interestingTarget) {
    return createDecision({
      desiredAction: "sniff",
      desiredTarget: {
        x: clamp(interestingTarget.x, 0, DOG_WORLD_WIDTH),
        y: clamp(interestingTarget.y, 0, DOG_WORLD_HEIGHT),
        id: interestingTarget.id ? String(interestingTarget.id) : null,
        type: interestingTarget.type ? String(interestingTarget.type) : null,
        label: interestingTarget.label ? String(interestingTarget.label) : null,
      },
      reason: "near_interesting_prop",
      priority: DOG_BRAIN_PRIORITIES.sniff,
    });
  }

  return createDecision({
    desiredAction: "idle",
    desiredTarget: null,
    reason: "settled",
    priority: DOG_BRAIN_PRIORITIES.idle,
  });
}
