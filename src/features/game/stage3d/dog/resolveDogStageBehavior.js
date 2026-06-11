import {
  getDogAnimationResolution,
  resolveDogAnimation,
} from "@/features/game/stage3d/dog/dogAnimationMap.js";

const CALM_BEHAVIOR_SEQUENCE = Object.freeze([
  "idle",
  "lookAround",
  "sniff",
  "idleAlt",
  "sit",
  "happy",
  "idle",
]);

const MOVEMENT_ACTIONS = new Set([
  "walk",
  "wander",
  "moving",
  "move",
  "trot",
  "run",
  "runfast",
  "fetch",
  "chase",
  "come",
  "heel",
]);

function normalize(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function resolveMovementAction(renderModel = {}, dog = {}) {
  const keys = [
    renderModel.behavior,
    renderModel.intent,
    renderModel.state,
    renderModel.action,
    renderModel.anim,
    dog.behavior,
    dog.activity,
    dog.lastAction,
  ].map(normalize);

  if (!keys.some((key) => MOVEMENT_ACTIONS.has(key))) return null;

  if (keys.includes("run") || keys.includes("runfast") || keys.includes("chase")) {
    return "run";
  }

  if (keys.includes("trot") || keys.includes("fetch") || keys.includes("come")) {
    return "trot";
  }

  return "walk";
}

function resolveCalmAction(renderModel = {}, dog = {}) {
  const directAction = normalize(renderModel.action || renderModel.anim);

  if (["sit", "sniff", "lookaround", "happy", "wag", "idlealt"].includes(directAction)) {
    return directAction === "wag" ? "happy" : directAction;
  }

  if (dog?.isSleeping || renderModel?.isSleeping) return "sleepLoop";

  const seed = [
    dog?.id,
    dog?.name,
    dog?.level,
    dog?.xp,
    renderModel?.mood,
    renderModel?.condition,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join(":");
  const hash = [...seed].reduce(
    (total, char) => (total + char.charCodeAt(0)) % 997,
    0
  );
  const bucket = Math.floor(Date.now() / 9000 + hash) % CALM_BEHAVIOR_SEQUENCE.length;

  return CALM_BEHAVIOR_SEQUENCE[bucket];
}

export function resolveDogStageBehavior({ dog = null, renderModel = null } = {}) {
  const movementAction = resolveMovementAction(renderModel || {}, dog || {});
  const action = movementAction || resolveCalmAction(renderModel || {}, dog || {});
  const desiredClip = resolveDogAnimation(action);
  const resolution = getDogAnimationResolution(desiredClip);

  return {
    action,
    desiredClip,
    clip: resolution.clip,
    movementActive: Boolean(movementAction),
    resolution,
  };
}

export default resolveDogStageBehavior;
