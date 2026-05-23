import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUTONOMOUS_PET_ACTIONS,
  PET_ACTIONS,
  PET_ANIMATIONS,
  getPetAnimation,
  getPetAnimationDurationMs,
  isOneShotPetAction,
} from "@/constants/animations.js";

const DEFAULT_IDLE_MIN_MS = 1600;
const DEFAULT_IDLE_MAX_MS = 4200;

function pickRandomAction(actions, previousAction) {
  const pool = actions.filter((action) => action !== previousAction);
  const candidates = pool.length > 0 ? pool : actions;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getRandomDelay(minMs, maxMs) {
  return Math.round(minMs + Math.random() * (maxMs - minMs));
}

export default function PetContainer({
  spriteUrl = "/assets/sprites/pet-sprite-sheet.png",
  actionOverride = null,
  autonomousActions = AUTONOMOUS_PET_ACTIONS,
  idleMinMs = DEFAULT_IDLE_MIN_MS,
  idleMaxMs = DEFAULT_IDLE_MAX_MS,
  className = "",
  onActionChange,
  onOneShotComplete,
}) {
  const [currentAction, setCurrentAction] = useState(PET_ACTIONS.IDLE);
  const lockRef = useRef(false);
  const loopTimerRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const previousActionRef = useRef(PET_ACTIONS.IDLE);

  const safeAutonomousActions = useMemo(() => {
    const validActions = autonomousActions.filter(
      (action) => PET_ANIMATIONS[action]
    );
    return validActions.length > 0 ? validActions : [PET_ACTIONS.IDLE];
  }, [autonomousActions]);

  const clearTimers = useCallback(() => {
    window.clearTimeout(loopTimerRef.current);
    window.clearTimeout(unlockTimerRef.current);
  }, []);

  const playAction = useCallback(
    (nextAction, source = "autonomous") => {
      const animation = getPetAnimation(nextAction);
      const resolvedAction = animation.name;
      const isOneShot = isOneShotPetAction(resolvedAction);

      if (lockRef.current && source === "autonomous") return false;

      if (isOneShot) {
        lockRef.current = true;
        window.clearTimeout(loopTimerRef.current);
        window.clearTimeout(unlockTimerRef.current);
      }

      previousActionRef.current = resolvedAction;
      setCurrentAction(resolvedAction);
      onActionChange?.({ action: resolvedAction, source, animation });

      if (isOneShot) {
        unlockTimerRef.current = window.setTimeout(() => {
          lockRef.current = false;
          setCurrentAction(PET_ACTIONS.IDLE);
          onOneShotComplete?.({ action: resolvedAction, source, animation });
        }, getPetAnimationDurationMs(resolvedAction));
      }

      return true;
    },
    [onActionChange, onOneShotComplete]
  );

  useEffect(() => {
    if (!actionOverride) return;
    playAction(actionOverride, "override");
  }, [actionOverride, playAction]);

  useEffect(() => {
    function scheduleNextAutonomousAction() {
      if (lockRef.current) return;

      loopTimerRef.current = window.setTimeout(() => {
        if (!lockRef.current) {
          playAction(
            pickRandomAction(safeAutonomousActions, previousActionRef.current),
            "autonomous"
          );
        }
        scheduleNextAutonomousAction();
      }, getRandomDelay(idleMinMs, idleMaxMs));
    }

    scheduleNextAutonomousAction();
    return clearTimers;
  }, [clearTimers, idleMaxMs, idleMinMs, playAction, safeAutonomousActions]);

  const animation = getPetAnimation(currentAction);
  const durationMs = getPetAnimationDurationMs(currentAction);

  return (
    <div
      className={`pet-stage relative grid place-items-center overflow-hidden ${className}`}
    >
      <div
        aria-label={`Pet animation: ${animation.label}`}
        className="pet-sprite h-32 w-32 bg-no-repeat [image-rendering:pixelated]"
        data-action={currentAction}
        role="img"
        style={{
          "--pet-sprite-url": `url("${spriteUrl}")`,
          "--pet-frame-count": animation.frameCount,
          "--pet-animation-duration": `${durationMs}ms`,
        }}
      />
    </div>
  );
}
