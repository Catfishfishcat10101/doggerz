// src/features/game/rendering/useDogAnimationController.js
import { useEffect, useMemo, useRef, useState } from "react";
import {
  canRunAmbientBehavior,
  getAmbientBehaviorPlan,
  isCriticalNeedAnimation,
} from "./aliveDogBehavior.js";
import {
  DEFAULT_DOG_ACTION,
  resolveDogAnimationContract,
} from "./dogAnimationMap.js";
import { DOG_ACTIONS } from "./DogAction.js";
import { resolveDogAnimationSelection } from "./animationResolver.js";

const BASE_TRANSITION_HOLD_MS = Object.freeze({
  idle_to_walk: 260,
  walk_to_idle: 260,
  default: 140,
});
const ONE_SHOT_ACTION_COOLDOWN_MS = Object.freeze({
  bark: 1400,
  paw: 1000,
  dig: 1200,
  default: 900,
});

function createClip(actionKey, playToken) {
  const resolvedKey = String(actionKey || DEFAULT_DOG_ACTION)
    .trim()
    .toLowerCase();
  const config = resolveDogAnimationContract(resolvedKey);

  return Object.freeze({
    key: String(config?.action || resolvedKey || DEFAULT_DOG_ACTION),
    playToken,
    loop: Boolean(config?.loop !== false),
    fps: Number(config?.fps || 8) || 8,
    frameCount: Number(config?.frameCount || 1) || 1,
  });
}

function getClipDurationMs(actionKey) {
  const config = resolveDogAnimationContract(actionKey);
  const frameCount = Math.max(1, Number(config?.frameCount || 1));
  const fps = Math.max(1, Number(config?.fps || 8));
  return Math.round((frameCount / fps) * 1000);
}

function getBaseTransitionHoldMs(fromAction, toAction, resolution) {
  if (!fromAction || !toAction || fromAction === toAction) return 0;
  if (resolution?.sleeping) return 0;

  if (fromAction === DOG_ACTIONS.idle && toAction === DOG_ACTIONS.walk) {
    return BASE_TRANSITION_HOLD_MS.idle_to_walk;
  }
  if (fromAction === DOG_ACTIONS.walk && toAction === DOG_ACTIONS.idle) {
    return BASE_TRANSITION_HOLD_MS.walk_to_idle;
  }
  return BASE_TRANSITION_HOLD_MS.default;
}

function getOneShotCooldownMs(action, source) {
  const actionKey = String(action || "")
    .trim()
    .toLowerCase();
  const base =
    ONE_SHOT_ACTION_COOLDOWN_MS[actionKey] ||
    ONE_SHOT_ACTION_COOLDOWN_MS.default;
  if (source === "requested_interrupt") {
    return Math.max(450, Math.round(base * 0.7));
  }
  return base;
}

export function useDogAnimationController({
  dog,
  brainState,
  renderModel,
  requestedAction = "",
  requestedFacing = "",
}) {
  const oneShotTimeoutRef = useRef(null);
  const ambientStartTimeoutRef = useRef(null);
  const ambientFinishTimeoutRef = useRef(null);
  const latestDogRef = useRef(dog);
  const latestBrainStateRef = useRef(brainState);
  const latestRenderModelRef = useRef(renderModel);
  const latestRequestedActionRef = useRef(requestedAction);
  const latestRequestedFacingRef = useRef(requestedFacing);
  const loopCommittedAtRef = useRef(Date.now());
  const activeOneShotSignatureRef = useRef(null);
  const oneShotLastTriggeredAtRef = useRef({});
  const oneShotActiveRef = useRef(false);
  const ambientActiveRef = useRef(false);
  const [activeClip, setActiveClip] = useState(() =>
    createClip(DEFAULT_DOG_ACTION, `loop:${DEFAULT_DOG_ACTION}`)
  );

  const resolveCurrentBestLoopAction = () => {
    const latestSelection = resolveDogAnimationSelection({
      dog: latestDogRef.current,
      brainState: latestBrainStateRef.current,
      renderModel: latestRenderModelRef.current,
      requestedAction: latestRequestedActionRef.current,
      requestedFacing: latestRequestedFacingRef.current,
    });
    return (
      latestSelection.requestedLoopAction ||
      latestSelection.baseAction ||
      DEFAULT_DOG_ACTION
    );
  };

  const clearOneShotTimer = () => {
    if (oneShotTimeoutRef.current) {
      window.clearTimeout(oneShotTimeoutRef.current);
      oneShotTimeoutRef.current = null;
    }
  };

  const clearAmbientTimers = () => {
    if (ambientStartTimeoutRef.current) {
      window.clearTimeout(ambientStartTimeoutRef.current);
      ambientStartTimeoutRef.current = null;
    }
    if (ambientFinishTimeoutRef.current) {
      window.clearTimeout(ambientFinishTimeoutRef.current);
      ambientFinishTimeoutRef.current = null;
    }
  };

  const resolution = useMemo(
    () =>
      resolveDogAnimationSelection({
        dog,
        brainState,
        renderModel,
        requestedAction,
        requestedFacing,
      }),
    [brainState, dog, renderModel, requestedAction, requestedFacing]
  );

  useEffect(() => {
    latestDogRef.current = dog;
    latestBrainStateRef.current = brainState;
    latestRenderModelRef.current = renderModel;
    latestRequestedActionRef.current = requestedAction;
    latestRequestedFacingRef.current = requestedFacing;
  }, [brainState, dog, renderModel, requestedAction, requestedFacing]);

  useEffect(() => {
    if (String(requestedAction || "").trim()) return;
    if (
      String(activeOneShotSignatureRef.current || "").startsWith("request:")
    ) {
      activeOneShotSignatureRef.current = null;
    }
  }, [requestedAction]);

  useEffect(() => {
    const shouldInterruptAmbient =
      ambientActiveRef.current &&
      (String(requestedAction || "").trim() ||
        isCriticalNeedAnimation(resolution.baseAction) ||
        resolution.baseAction === DOG_ACTIONS.walk ||
        resolution.sleeping ||
        resolution.moving);

    if (shouldInterruptAmbient) {
      clearAmbientTimers();
      ambientActiveRef.current = false;
      loopCommittedAtRef.current = Date.now();
      setActiveClip(
        createClip(
          resolution.baseAction || DEFAULT_DOG_ACTION,
          `loop:${resolution.baseAction || DEFAULT_DOG_ACTION}`
        )
      );
      return;
    }

    if (ambientActiveRef.current) {
      if (
        resolution.baseAction === DOG_ACTIONS.sleep ||
        resolution.baseAction === DOG_ACTIONS.walk
      ) {
        clearAmbientTimers();
        ambientActiveRef.current = false;
        loopCommittedAtRef.current = Date.now();
        setActiveClip(
          createClip(resolution.baseAction, `loop:${resolution.baseAction}`)
        );
      }
      return;
    }

    if (oneShotActiveRef.current) {
      return;
    }

    setActiveClip((current) => {
      const nextLoopKey = resolution.baseAction || DEFAULT_DOG_ACTION;
      const now = Date.now();

      if (
        current?.key === nextLoopKey &&
        String(current?.playToken || "").startsWith("loop:")
      ) {
        return current;
      }

      if (
        String(current?.playToken || "").startsWith("loop:") &&
        current?.key
      ) {
        const holdMs = getBaseTransitionHoldMs(
          current.key,
          nextLoopKey,
          resolution
        );
        const elapsedMs = now - Number(loopCommittedAtRef.current || 0);
        if (elapsedMs < holdMs) {
          return current;
        }
      }

      loopCommittedAtRef.current = now;
      return createClip(nextLoopKey, `loop:${nextLoopKey}`);
    });
  }, [requestedAction, resolution]);

  useEffect(() => {
    const interruptAction = resolution.interruptAction;
    const interruptSignature = resolution.interruptSignature;
    if (!interruptAction || !interruptSignature) return undefined;
    const shouldPreemptActiveOneShot =
      oneShotActiveRef.current &&
      resolution.interruptSource === "requested_interrupt" &&
      activeOneShotSignatureRef.current !== interruptSignature;
    if (oneShotActiveRef.current && !shouldPreemptActiveOneShot) {
      return undefined;
    }
    if (activeOneShotSignatureRef.current === interruptSignature) {
      return undefined;
    }

    if (shouldPreemptActiveOneShot) {
      clearOneShotTimer();
      oneShotActiveRef.current = false;
    }

    clearOneShotTimer();
    clearAmbientTimers();
    ambientActiveRef.current = false;

    const now = Date.now();
    const cooldownMs = getOneShotCooldownMs(
      interruptAction,
      resolution.interruptSource
    );
    const lastAt = Number(
      oneShotLastTriggeredAtRef.current[interruptAction] || 0
    );
    if (now - lastAt < cooldownMs) {
      return undefined;
    }

    oneShotActiveRef.current = true;
    activeOneShotSignatureRef.current = interruptSignature;
    oneShotLastTriggeredAtRef.current[interruptAction] = now;
    setActiveClip(createClip(interruptAction, `shot:${interruptSignature}`));

    const timeoutMs = getClipDurationMs(interruptAction) + 80;
    oneShotTimeoutRef.current = window.setTimeout(() => {
      oneShotActiveRef.current = false;
      const bestLoopAction = resolveCurrentBestLoopAction();
      setActiveClip(createClip(bestLoopAction, `loop:${bestLoopAction}`));
      oneShotTimeoutRef.current = null;
    }, timeoutMs);

    return undefined;
  }, [
    resolution.interruptAction,
    resolution.interruptSignature,
    resolution.interruptSource,
  ]);

  useEffect(() => {
    clearAmbientTimers();

    if (
      !canRunAmbientBehavior({
        resolution,
        requestedAction,
        dog,
      }) ||
      oneShotActiveRef.current ||
      ambientActiveRef.current
    ) {
      return undefined;
    }

    const plan = getAmbientBehaviorPlan({
      dog,
      renderModel,
      resolution,
      now: Date.now(),
    });
    if (!plan) return undefined;

    ambientStartTimeoutRef.current = window.setTimeout(
      () => {
        if (oneShotActiveRef.current || ambientActiveRef.current) return;
        if (
          !canRunAmbientBehavior({
            resolution,
            requestedAction,
            dog,
          })
        ) {
          return;
        }

        ambientActiveRef.current = true;
        setActiveClip(
          createClip(plan.action, `ambient:${plan.action}:${Date.now()}`)
        );

        ambientFinishTimeoutRef.current = window.setTimeout(
          () => {
            ambientActiveRef.current = false;
            const bestLoopAction = resolveCurrentBestLoopAction();
            setActiveClip(createClip(bestLoopAction, `loop:${bestLoopAction}`));
            ambientFinishTimeoutRef.current = null;
          },
          Math.max(600, Number(plan.durationMs || 1200))
        );

        ambientStartTimeoutRef.current = null;
      },
      Math.max(2200, Number(plan.nextDelayMs || 5200))
    );

    return () => {
      clearAmbientTimers();
    };
  }, [dog, renderModel, requestedAction, resolution]);

  useEffect(
    () => () => {
      clearOneShotTimer();
      clearAmbientTimers();
    },
    []
  );

  return useMemo(
    () => ({
      animationClip: activeClip,
      resolvedAction:
        activeClip?.key || resolution.finalAction || resolution.baseAction,
      preferredFacing: resolution.preferredFacing,
      resolution,
    }),
    [activeClip, resolution]
  );
}

export default useDogAnimationController;
