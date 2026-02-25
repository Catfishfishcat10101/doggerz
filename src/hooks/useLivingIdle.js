import { useEffect, useRef, useState } from "react";

const DEFAULT_BLINK_MIN_MS = 2000;
const DEFAULT_BLINK_MAX_MS = 6000;
const DEFAULT_IDLE_MIN_MS = 5000;
const DEFAULT_IDLE_MAX_MS = 10000;

function randomBetween(min, max) {
  const lo = Number(min) || 0;
  const hi = Number(max) || 0;
  return lo + Math.random() * (hi - lo);
}

function clampEnergy(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(0, n));
}

/**
 * useLivingIdle
 * Ambient lifelike behavior controller for blink, breathing, and micro-actions.
 */
export function useLivingIdle({
  isSleeping = false,
  isMoving = false,
  energy = 100,
} = {}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleAction, setIdleAction] = useState(null);
  const [breathingScaleX, setBreathingScaleX] = useState(1);
  const [breathingScaleY, setBreathingScaleY] = useState(1);

  const blinkTimeoutRef = useRef(null);
  const blinkCloseRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const idleResetRef = useRef(null);

  useEffect(() => {
    if (blinkTimeoutRef.current) window.clearTimeout(blinkTimeoutRef.current);
    if (blinkCloseRef.current) window.clearTimeout(blinkCloseRef.current);

    if (isSleeping) {
      setIsBlinking(false);
      return undefined;
    }

    const scheduleBlink = () => {
      setIsBlinking(true);
      blinkCloseRef.current = window.setTimeout(() => {
        setIsBlinking(false);
      }, 150);

      blinkTimeoutRef.current = window.setTimeout(
        scheduleBlink,
        randomBetween(DEFAULT_BLINK_MIN_MS, DEFAULT_BLINK_MAX_MS)
      );
    };

    blinkTimeoutRef.current = window.setTimeout(scheduleBlink, 2000);

    return () => {
      if (blinkTimeoutRef.current) window.clearTimeout(blinkTimeoutRef.current);
      if (blinkCloseRef.current) window.clearTimeout(blinkCloseRef.current);
    };
  }, [isSleeping]);

  useEffect(() => {
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    if (idleResetRef.current) window.clearTimeout(idleResetRef.current);

    if (isSleeping || isMoving) {
      setIdleAction(null);
      return undefined;
    }

    const scheduleAction = () => {
      const weighted = ["sniff", "ear_twitch", "tail_wag", null, null, null];
      const pick =
        weighted[Math.floor(Math.random() * weighted.length)] || null;

      if (pick) {
        setIdleAction(pick);
        idleResetRef.current = window.setTimeout(() => {
          setIdleAction(null);
        }, 1400);
      }

      idleTimeoutRef.current = window.setTimeout(
        scheduleAction,
        randomBetween(DEFAULT_IDLE_MIN_MS, DEFAULT_IDLE_MAX_MS)
      );
    };

    idleTimeoutRef.current = window.setTimeout(scheduleAction, 4200);

    return () => {
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
      if (idleResetRef.current) window.clearTimeout(idleResetRef.current);
    };
  }, [isMoving, isSleeping]);

  useEffect(() => {
    let rafId = 0;
    let mounted = true;
    let lastCommit = 0;
    const start = performance.now();

    const energyLevel = clampEnergy(energy);
    const isLowEnergy = !isSleeping && energyLevel < 30;

    const amplitude = isSleeping ? 0.018 : isLowEnergy ? 0.01 : 0.015;
    const frequencyHz = isSleeping ? 0.12 : isLowEnergy ? 0.95 : 0.32;
    const commitIntervalMs = 83;

    const tick = (now) => {
      if (!mounted) return;
      const seconds = (now - start) / 1000;
      const phase = Math.sin(seconds * Math.PI * 2 * frequencyHz);
      const y = 1 + amplitude * phase;
      const x = 1 - amplitude * 0.38 * phase;

      if (now - lastCommit >= commitIntervalMs) {
        setBreathingScaleX(x);
        setBreathingScaleY(y);
        lastCommit = now;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [energy, isSleeping]);

  const breathingStyle = isSleeping
    ? "slow-breath"
    : clampEnergy(energy) < 30
      ? "panting"
      : "normal-breath";

  return {
    isBlinking,
    idleAction,
    breathingStyle,
    breathingScaleX,
    breathingScaleY,
  };
}

export default useLivingIdle;
