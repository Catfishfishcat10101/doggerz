import { useCallback, useEffect, useRef, useState } from "react";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalizePoint(point, fallback) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  return {
    x: Number.isFinite(x) ? x : fallback.x,
    y: Number.isFinite(y) ? y : fallback.y,
  };
}

function clearTimer(ref) {
  if (!ref.current) return;
  window.clearTimeout(ref.current);
  ref.current = null;
}

function currentAnimatedPosition(now, motion, fallback) {
  if (!motion?.active) return fallback;

  const durationMs = Math.max(
    1,
    Math.round(Number(motion.durationSec || 0) * 1000)
  );
  const elapsed = Math.max(0, now - Number(motion.startedAt || 0));
  const t = Math.min(1, elapsed / durationMs);

  return {
    x: lerp(
      Number(motion.start?.x || fallback.x),
      Number(motion.target?.x || fallback.x),
      t
    ),
    y: lerp(
      Number(motion.start?.y || fallback.y),
      Number(motion.target?.y || fallback.y),
      t
    ),
  };
}

/**
 * Distance-based walk controller with tap coalescing.
 * - constant pace: duration = distance / speed
 * - anti-spam: rapid taps collapse to latest destination
 */
export function useWalkToTarget({
  initialPos = { x: 50, y: 80 },
  speed = 25,
  coalesceMs = 140,
  stopEpsilon = 0.05,
} = {}) {
  const safeInitial = normalizePoint(initialPos, { x: 50, y: 80 });

  const [dogPos, setDogPos] = useState(safeInitial);
  const [walkDuration, setWalkDuration] = useState(0);
  const [isWalking, setIsWalking] = useState(false);

  const dogPosRef = useRef(safeInitial);
  const pendingTargetRef = useRef(null);
  const coalesceTimerRef = useRef(null);
  const walkStopTimerRef = useRef(null);
  const motionRef = useRef({
    active: false,
    start: safeInitial,
    target: safeInitial,
    startedAt: 0,
    durationSec: 0,
  });

  useEffect(() => {
    dogPosRef.current = dogPos;
  }, [dogPos]);

  const cancelWalk = useCallback(() => {
    pendingTargetRef.current = null;
    clearTimer(coalesceTimerRef);
    clearTimer(walkStopTimerRef);

    motionRef.current = {
      active: false,
      start: dogPosRef.current,
      target: dogPosRef.current,
      startedAt: 0,
      durationSec: 0,
    };

    setWalkDuration(0);
    setIsWalking(false);
  }, []);

  const commitWalk = useCallback(
    (targetRaw) => {
      const target = normalizePoint(targetRaw, dogPosRef.current);
      const now = performance.now();
      const current = currentAnimatedPosition(
        now,
        motionRef.current,
        dogPosRef.current
      );

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);
      const safeSpeed = Math.max(1, Number(speed) || 25);
      const durationSec = distance <= stopEpsilon ? 0 : distance / safeSpeed;

      clearTimer(walkStopTimerRef);

      if (durationSec <= 0) {
        motionRef.current = {
          active: false,
          start: target,
          target,
          startedAt: now,
          durationSec: 0,
        };
        dogPosRef.current = target;
        setDogPos(target);
        setWalkDuration(0);
        setIsWalking(false);
        return;
      }

      motionRef.current = {
        active: true,
        start: current,
        target,
        startedAt: now,
        durationSec,
      };

      dogPosRef.current = target;
      setDogPos(target);
      setWalkDuration(durationSec);
      setIsWalking(true);

      walkStopTimerRef.current = window.setTimeout(
        () => {
          setIsWalking(false);
          motionRef.current = {
            active: false,
            start: target,
            target,
            startedAt: performance.now(),
            durationSec: 0,
          };
        },
        Math.max(0, Math.round(durationSec * 1000) + 22)
      );
    },
    [speed, stopEpsilon]
  );

  const walkTo = useCallback(
    (x, y) => {
      const target = normalizePoint({ x, y }, dogPosRef.current);

      pendingTargetRef.current = target;
      clearTimer(coalesceTimerRef);

      if (Number(coalesceMs) <= 0) {
        const immediate = pendingTargetRef.current;
        pendingTargetRef.current = null;
        commitWalk(immediate);
        return;
      }

      coalesceTimerRef.current = window.setTimeout(
        () => {
          const latest = pendingTargetRef.current;
          pendingTargetRef.current = null;
          if (!latest) return;
          commitWalk(latest);
        },
        Math.max(0, Math.round(Number(coalesceMs) || 0))
      );
    },
    [coalesceMs, commitWalk]
  );

  useEffect(() => {
    return () => {
      clearTimer(coalesceTimerRef);
      clearTimer(walkStopTimerRef);
    };
  }, []);

  return {
    dogPos,
    walkTo,
    walkDuration,
    isWalking,
    cancelWalk,
  };
}

export default useWalkToTarget;
