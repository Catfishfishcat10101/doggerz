import { DEFAULT_ANIMATION, INTENDED_DOG_ACTIONS } from "./animationMap.js";

export const SAFE_LOOPING_ACTIONS = Object.freeze(
  new Set([
    INTENDED_DOG_ACTIONS.idle,
    INTENDED_DOG_ACTIONS.idle_resting,
    INTENDED_DOG_ACTIONS.walk,
    INTENDED_DOG_ACTIONS.scratch,
    INTENDED_DOG_ACTIONS.sleep,
  ])
);

export const SAFE_ONE_SHOT_ACTIONS = Object.freeze(
  new Set([
    INTENDED_DOG_ACTIONS.bark,
    INTENDED_DOG_ACTIONS.beg,
    INTENDED_DOG_ACTIONS.dig,
  ])
);

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function isDirtyState(dog, renderModel) {
  return (
    renderModel?.condition === "dirty" ||
    renderModel?.condition === "fleas" ||
    renderModel?.condition === "mange" ||
    dog?.cleanlinessState === "DIRTY" ||
    dog?.cleanlinessState === "FLEAS" ||
    dog?.cleanlinessState === "MANGE" ||
    dog?.mood === "dirty"
  );
}

function isSleepingState(dog, renderModel) {
  return (
    dog?.sleeping === true ||
    dog?.isAsleep === true ||
    dog?.mood === "sleepy" ||
    renderModel?.isSleeping === true
  );
}

function isMovingState(dog, renderModel) {
  return (
    dog?.position?.moving === true ||
    dog?.moving === true ||
    renderModel?.moving === true ||
    (dog?.targetPosition && normalizeAction(dog?.aiState) === "walk") ||
    normalizeAction(dog?.lastAction) === "walk" ||
    normalizeAction(renderModel?.anim) === "walk"
  );
}

function pickSafeDesiredAction({ dog, renderModel }) {
  if (isSleepingState(dog, renderModel)) {
    return INTENDED_DOG_ACTIONS.sleep;
  }

  if (isDirtyState(dog, renderModel)) {
    return INTENDED_DOG_ACTIONS.scratch;
  }

  if (isMovingState(dog, renderModel)) {
    return INTENDED_DOG_ACTIONS.walk;
  }

  const requested =
    normalizeAction(dog?.animation?.desiredAction) ||
    normalizeAction(dog?.animation?.current) ||
    normalizeAction(dog?.desiredAction) ||
    normalizeAction(renderModel?.anim);

  if (requested === INTENDED_DOG_ACTIONS.sleep) {
    return INTENDED_DOG_ACTIONS.sleep;
  }
  if (
    requested === INTENDED_DOG_ACTIONS.scratch &&
    isDirtyState(dog, renderModel)
  ) {
    return INTENDED_DOG_ACTIONS.scratch;
  }
  if (requested === INTENDED_DOG_ACTIONS.walk) {
    return INTENDED_DOG_ACTIONS.walk;
  }
  if (
    requested === INTENDED_DOG_ACTIONS.idle ||
    requested === INTENDED_DOG_ACTIONS.idle_resting
  ) {
    return INTENDED_DOG_ACTIONS.idle_resting;
  }

  return DEFAULT_ANIMATION;
}

function pickSafeOverrideAction(dog) {
  const isOneShotActive = Boolean(dog?.animation?.overrideUntilDone);
  const override = normalizeAction(
    isOneShotActive
      ? dog?.animation?.overrideAction || dog?.animation?.oneShot
      : null
  );

  return SAFE_ONE_SHOT_ACTIONS.has(override) ? override : null;
}

export function resolveDogAnimationPolicy({ dog, renderModel }) {
  const isSleeping = isSleepingState(dog, renderModel);
  const isDirty = isDirtyState(dog, renderModel);

  return {
    desiredAction: pickSafeDesiredAction({ dog, renderModel }),
    overrideAction: pickSafeOverrideAction(dog),
    isSleeping,
    isDirty,
    isBarking: false,
    facing: dog?.facing === "left" ? "left" : "right",
  };
}

export function sanitizeAnimationRequest({
  desiredAction,
  overrideAction,
  isSleeping = false,
  isDirty = false,
  isBarking = false,
}) {
  const normalizedOverride = normalizeAction(overrideAction);
  const normalizedDesired = normalizeAction(desiredAction);

  return {
    desiredAction: SAFE_LOOPING_ACTIONS.has(normalizedDesired)
      ? normalizedDesired
      : DEFAULT_ANIMATION,
    overrideAction: SAFE_ONE_SHOT_ACTIONS.has(normalizedOverride)
      ? normalizedOverride
      : null,
    isSleeping: Boolean(isSleeping),
    isDirty: Boolean(isDirty),
    // Ambient bark is intentionally disabled. Only explicit one-shots survive.
    isBarking:
      Boolean(isBarking) && normalizedOverride === INTENDED_DOG_ACTIONS.bark,
  };
}
