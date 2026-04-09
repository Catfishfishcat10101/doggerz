import { DOG_ACTIONS, resolveDogAction } from "./DogAction.js";

const BARK_SIGNALS = new Set(["bark", "speak", "territorial_bark"]);
const DIG_SIGNALS = new Set(["dig", "digging"]);
const SLEEP_SIGNALS = new Set([
  "sleep",
  "sleeping",
  "sleepy",
  "light_sleep",
  "deep_rem_sleep",
  "dream",
]);
const PAW_SIGNALS = new Set(["paw", "shake", "highfive", "high_five"]);
const EAT_SIGNALS = new Set(["eat", "feed", "quick_feed"]);
const DRINK_SIGNALS = new Set(["drink", "water"]);
const SCRATCH_SIGNALS = new Set(["scratch", "dirty", "fleas", "mange"]);

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getPrimarySignal(dog, renderModel) {
  return (
    normalizeAction(dog?.animation?.overrideAction) ||
    normalizeAction(dog?.animation?.oneShot) ||
    normalizeAction(dog?.animation?.desiredAction) ||
    normalizeAction(dog?.animation?.current) ||
    normalizeAction(dog?.desiredAction) ||
    normalizeAction(renderModel?.anim) ||
    normalizeAction(dog?.lastAction) ||
    normalizeAction(dog?.mood)
  );
}

function isSleepingState(dog, renderModel, signal) {
  return (
    dog?.sleeping === true ||
    dog?.isAsleep === true ||
    renderModel?.isSleeping === true ||
    SLEEP_SIGNALS.has(signal)
  );
}

function isMovingState(dog, renderModel, signal) {
  return (
    dog?.position?.moving === true ||
    dog?.moving === true ||
    renderModel?.moving === true ||
    Boolean(dog?.targetPosition) ||
    signal === DOG_ACTIONS.walk ||
    signal === "walk_left" ||
    signal === "walk_right" ||
    signal === "turn_walk_left" ||
    signal === "turn_walk_right"
  );
}

function isBarkingState(signal) {
  return BARK_SIGNALS.has(signal);
}

function isDiggingState(dog, renderModel, signal) {
  return (
    DIG_SIGNALS.has(signal) ||
    dog?.lastAction === DOG_ACTIONS.dig ||
    renderModel?.anim === DOG_ACTIONS.dig
  );
}

function isPawState(signal) {
  return PAW_SIGNALS.has(signal);
}

function isEatingState(signal) {
  return EAT_SIGNALS.has(signal);
}

function isDrinkingState(signal) {
  return DRINK_SIGNALS.has(signal);
}

function isScratchingState(dog, renderModel, signal) {
  return (
    SCRATCH_SIGNALS.has(signal) ||
    renderModel?.condition === "dirty" ||
    renderModel?.condition === "fleas" ||
    renderModel?.condition === "mange" ||
    dog?.cleanlinessState === "DIRTY" ||
    dog?.cleanlinessState === "FLEAS" ||
    dog?.cleanlinessState === "MANGE"
  );
}

export const DOG_BRAIN_STATE = DOG_ACTIONS;

export function resolveDogBrain({ dog, renderModel }) {
  const primarySignal = getPrimarySignal(dog, renderModel);
  const isSleeping = isSleepingState(dog, renderModel, primarySignal);
  const isMoving = isMovingState(dog, renderModel, primarySignal);
  const isBarking = isBarkingState(primarySignal);
  const isDigging = isDiggingState(dog, renderModel, primarySignal);
  const isPawing = isPawState(primarySignal);
  const isEating = isEatingState(primarySignal);
  const isDrinking = isDrinkingState(primarySignal);
  const isScratching = isScratchingState(dog, renderModel, primarySignal);

  let desiredAction = DOG_ACTIONS.idle;
  if (isSleeping) {
    desiredAction = DOG_ACTIONS.sleep;
  } else if (isMoving) {
    desiredAction = DOG_ACTIONS.walk;
  } else if (isEating) {
    desiredAction = DOG_ACTIONS.eat;
  } else if (isDrinking) {
    desiredAction = DOG_ACTIONS.drink;
  } else if (isScratching) {
    desiredAction = DOG_ACTIONS.scratch;
  } else if (isBarking) {
    desiredAction = DOG_ACTIONS.bark;
  } else if (isDigging) {
    desiredAction = DOG_ACTIONS.dig;
  } else if (isPawing) {
    desiredAction = DOG_ACTIONS.paw;
  }

  return Object.freeze({
    desiredAction: resolveDogAction(desiredAction),
    facing: dog?.facing === "left" ? "left" : "right",
    simulationState: resolveDogAction(desiredAction),
    primarySignal,
    isSleeping,
    isMoving,
    isBarking,
    isDigging,
    isPawing,
    isEating,
    isDrinking,
    isScratching,
  });
}
