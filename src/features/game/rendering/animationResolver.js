//src/features/game/rendering/animationResolver.js
import {
  DOG_CRITICAL_NEED_RENDER_CLIPS,
  DEFAULT_DOG_ACTION,
  isKnownDogRenderClip,
  resolveDogAnimationContract,
} from "./dogAnimationMap.js";
import { DOG_ACTIONS } from "./DogAction.js";

const MOVEMENT_TARGET_DISTANCE_PX = 8;

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function hasMeaningfulTargetMovement(dog) {
  const target = dog?.targetPosition;
  const position = dog?.position;
  if (!target || !position) return false;

  const dx = Number(target.x || 0) - Number(position.x || 0);
  const dy = Number(target.y || 0) - Number(position.y || 0);
  const distance = Math.hypot(dx, dy);
  return distance > MOVEMENT_TARGET_DISTANCE_PX;
}

function resolveLoopingAction(value) {
  const normalized = normalizeAction(value);
  if (!normalized || !isKnownDogRenderClip(normalized)) return null;
  const contract = resolveDogAnimationContract(normalized);
  return contract && contract.oneShot !== true ? contract.action : null;
}

function resolveOneShotAction(value) {
  const normalized = normalizeAction(value);
  if (!normalized || !isKnownDogRenderClip(normalized)) return null;
  const contract = resolveDogAnimationContract(normalized);
  return contract && contract.oneShot === true ? contract.action : null;
}

function resolveRequestedFacing(requestedFacing = "") {
  const normalizedFacing = normalizeAction(requestedFacing);
  if (normalizedFacing === "left" || normalizedFacing === "right") {
    return normalizedFacing;
  }
  return null;
}

function isCriticalNeedLoopAction(value) {
  return DOG_CRITICAL_NEED_RENDER_CLIPS.has(normalizeAction(value));
}

function isSleepingState(dog, brainState, renderModel) {
  return (
    dog?.sleeping === true ||
    dog?.isAsleep === true ||
    renderModel?.isSleeping === true ||
    brainState?.isSleeping === true ||
    normalizeAction(dog?.aiState) === DOG_ACTIONS.sleep
  );
}

function isMovingState(dog, brainState) {
  return (
    hasMeaningfulTargetMovement(dog) ||
    dog?.moving === true ||
    dog?.position?.moving === true ||
    brainState?.isMoving === true
  );
}

function resolveBaseLoopAction({
  dog,
  brainState,
  renderModel,
  sleeping,
  moving,
  preferredFacing,
}) {
  if (sleeping) return DOG_ACTIONS.sleep;
  if (moving) {
    if (preferredFacing === "left") return "walk_left";
    if (preferredFacing === "right") return "walk_right";
    return DOG_ACTIONS.walk;
  }

  return (
    resolveLoopingAction(brainState?.desiredAction) ||
    resolveLoopingAction(renderModel?.anim) ||
    resolveLoopingAction(dog?.animation?.desiredAction) ||
    resolveLoopingAction(dog?.aiState) ||
    DEFAULT_DOG_ACTION
  );
}

function resolveRequestedInterrupt(requestedAction) {
  const rawRequested = normalizeAction(requestedAction);
  if (!rawRequested) return null;

  const action = resolveOneShotAction(rawRequested);
  if (!action) return null;

  return {
    action,
    signature: `request:${rawRequested}`,
    source: "requested_interrupt",
  };
}

function resolveStateInterrupt({ dog, brainState }) {
  const rawSignal =
    normalizeAction(dog?.animation?.overrideAction) ||
    normalizeAction(dog?.animation?.oneShot) ||
    normalizeAction(dog?.lastAction) ||
    normalizeAction(brainState?.primarySignal);
  if (!rawSignal) return null;

  const action = resolveOneShotAction(rawSignal);
  if (!action) return null;

  const token =
    Number(dog?.aiStateUntilAt || 0) ||
    Number(dog?.lastUpdatedAt || 0) ||
    Number(dog?.memory?.lastTrainedAt || 0) ||
    0;

  return {
    action,
    signature: `state:${action}:${rawSignal}:${token}`,
    source: "state_interrupt",
  };
}

export function resolveDogAnimationSelection({
  dog,
  brainState,
  renderModel,
  requestedAction = "",
  requestedFacing = "",
}) {
  const sleeping = isSleepingState(dog, brainState, renderModel);
  const moving = isMovingState(dog, brainState);
  const preferredFacing = resolveRequestedFacing(
    requestedFacing ||
      brainState?.facing ||
      dog?.facing ||
      renderModel?.facing ||
      ""
  );
  const requestedLoopAction = resolveLoopingAction(requestedAction);
  const baseAction =
    requestedLoopAction ||
    resolveBaseLoopAction({
      dog,
      brainState,
      renderModel,
      sleeping,
      moving,
      preferredFacing,
    });
  const requestedInterrupt = resolveRequestedInterrupt(requestedAction);
  const stateInterruptAllowed = !sleeping && !requestedInterrupt;
  const stateInterrupt = stateInterruptAllowed
    ? resolveStateInterrupt({ dog, brainState })
    : null;
  const interrupt = requestedInterrupt || stateInterrupt;
  const criticalNeedActive = isCriticalNeedLoopAction(baseAction);
  const finalAction =
    interrupt?.action ||
    requestedLoopAction ||
    baseAction ||
    DEFAULT_DOG_ACTION;
  const contract = resolveDogAnimationContract(finalAction);
  const priorityBucket = interrupt
    ? "one_shot"
    : criticalNeedActive
      ? "critical_need"
      : moving
        ? "locomotion"
        : "base_idle";
  const decisionSource =
    interrupt?.source ||
    (requestedLoopAction
      ? "requested_loop"
      : criticalNeedActive
        ? "critical_need"
        : moving
          ? "locomotion"
          : "base_loop");

  return Object.freeze({
    baseAction: baseAction || DEFAULT_DOG_ACTION,
    finalAction,
    loop: Boolean(contract?.loop !== false),
    oneShot: Boolean(interrupt),
    interruptAction: interrupt?.action || null,
    interruptSignature: interrupt?.signature || null,
    interruptSource: interrupt?.source || null,
    requestedLoopAction: requestedLoopAction || null,
    criticalNeedActive,
    priorityBucket,
    decisionSource,
    preferredFacing,
    sleeping,
    moving,
  });
}

export default resolveDogAnimationSelection;
