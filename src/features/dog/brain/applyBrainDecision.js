// src/features/dog/brain/applyBrainDecision.js
import { getDogStateDurationMs } from "@/components/dog/DogAIStateMachine.js";
import { chooseEnvironmentTarget } from "@/components/dog/DogEnvironmentTargets.js";
import { chooseWanderTarget } from "@/components/dog/simulation/DogWanderBehavior.js";

const TARGET_MATCH_RADIUS_PX = 8;
const REST_DISTANCE_THRESHOLD_PX = 28;
const HOLDABLE_STATES = new Set(["idle", "sleep", "beg", "scratch"]);

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function distanceBetween(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dx = Number(a.x || 0) - Number(b.x || 0);
  const dy = Number(a.y || 0) - Number(b.y || 0);
  return Math.hypot(dx, dy);
}

function toWorldTarget(targetLike) {
  if (!targetLike || typeof targetLike !== "object") return null;
  return {
    x: clamp(targetLike.x, 0, 800),
    y: clamp(targetLike.y, 0, 500),
    id: targetLike.id ? String(targetLike.id) : null,
    type: targetLike.type ? String(targetLike.type) : null,
    label: targetLike.label ? String(targetLike.label) : null,
    interaction: targetLike.interaction ? String(targetLike.interaction) : null,
    toyId: targetLike.toyId ? String(targetLike.toyId) : null,
    interactionRadius: clamp(Number(targetLike.interactionRadius || 18), 8, 64),
  };
}

function targetsMatch(a, b) {
  if (!a || !b) return false;
  if (a.id && b.id && String(a.id) === String(b.id)) return true;
  return distanceBetween(a, b) <= TARGET_MATCH_RADIUS_PX;
}

function resolveWalkTarget({ decision, dog, now, currentTarget }) {
  const preferred = toWorldTarget(decision?.desiredTarget);
  if (preferred) return preferred;
  const environmentTarget = toWorldTarget(chooseEnvironmentTarget(dog, now));
  if (environmentTarget) return environmentTarget;
  const wanderTarget = toWorldTarget(chooseWanderTarget());
  if (wanderTarget) return wanderTarget;
  return toWorldTarget(currentTarget);
}

function applyEmergencyState(emergencyState) {
  const key = normalizeAction(emergencyState);
  if (key === "sleep") {
    return {
      aiState: "sleep",
      action: "sleep",
      mood: "tired",
      targetPosition: null,
    };
  }
  if (key === "beg") {
    return {
      aiState: "beg",
      action: "paw",
      mood: "hungry",
      targetPosition: null,
    };
  }
  if (key === "scratch") {
    return {
      aiState: "scratch",
      action: "scratch",
      mood: "dirty",
      targetPosition: null,
    };
  }
  return null;
}

export function applyBrainDecision({
  dog,
  decision,
  now = Date.now(),
  currentAiState = "idle",
  holdUntil = 0,
  currentTarget = null,
  emergencyState = null,
}) {
  const emergency = applyEmergencyState(emergencyState);
  if (emergency) {
    return {
      ...emergency,
      startedWalk: false,
      reason: "emergency_override",
      holdForMs: getDogStateDurationMs(emergency.aiState),
    };
  }

  const stateKey = normalizeAction(currentAiState || "idle");
  if (holdUntil > now && HOLDABLE_STATES.has(stateKey) && !currentTarget) {
    return {
      aiState: stateKey,
      action: null,
      mood: null,
      targetPosition: null,
      startedWalk: false,
      reason: "state_hold",
      holdForMs: Math.max(500, holdUntil - now),
    };
  }

  const desiredAction = normalizeAction(decision?.desiredAction || "idle");

  if (desiredAction === "sleep") {
    return {
      aiState: "sleep",
      action: "sleep",
      mood: "tired",
      targetPosition: null,
      startedWalk: false,
      reason: decision?.reason || "sleeping",
      holdForMs: getDogStateDurationMs("sleep"),
    };
  }

  if (desiredAction === "rest") {
    const restTarget = toWorldTarget(decision?.desiredTarget);
    const position =
      dog?.position && typeof dog.position === "object" ? dog.position : null;
    if (
      restTarget &&
      position &&
      distanceBetween(position, restTarget) > REST_DISTANCE_THRESHOLD_PX
    ) {
      const startedWalk = !targetsMatch(currentTarget, restTarget);
      return {
        aiState: "walk",
        action: "walk",
        mood: "tired",
        targetPosition: restTarget,
        startedWalk,
        reason: decision?.reason || "low_energy",
        holdForMs: getDogStateDurationMs("walk"),
      };
    }

    return {
      aiState: "idle",
      action: null,
      mood: "tired",
      targetPosition: null,
      startedWalk: false,
      reason: decision?.reason || "settling_rest",
      holdForMs: getDogStateDurationMs("idle"),
    };
  }

  if (desiredAction === "walk") {
    const targetPosition = resolveWalkTarget({
      decision,
      dog,
      now,
      currentTarget,
    });
    if (targetPosition) {
      const startedWalk = !targetsMatch(currentTarget, targetPosition);
      return {
        aiState: "walk",
        action: "walk",
        mood: null,
        targetPosition,
        startedWalk,
        reason: decision?.reason || "wander",
        holdForMs: getDogStateDurationMs("walk"),
      };
    }
  }

  if (desiredAction === "sniff") {
    return {
      aiState: "idle",
      action: null,
      mood: "curious",
      targetPosition: null,
      startedWalk: false,
      reason: decision?.reason || "sniffing",
      holdForMs: getDogStateDurationMs("idle"),
    };
  }

  return {
    aiState: "idle",
    action: null,
    mood: "calm",
    targetPosition: null,
    startedWalk: false,
    reason: decision?.reason || "idle",
    holdForMs: getDogStateDurationMs("idle"),
  };
}
