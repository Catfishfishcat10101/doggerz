// src/hooks/useJitteredTimer.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fires on an interval with jitter (random +/- %) to avoid sync patterns.
 * Useful for idle animations, random barks, wagging, NPC ticks, etc.
 *
 * @param {object} options
 * @param {number} options.baseMs    Base interval in ms (e.g., 2000)
 * @param {number} options.jitter    0..1 (e.g., 0.25 = ±25% jitter)
 * @param {boolean} options.autoStart Start automatically
 */
export default function useJitteredTimer({ baseMs = 2000, jitter = 0.25, autoStart = true } = {}) {
  const [count, setCount] = useState(0);
  const [lastAt, setLastAt] = useState(null);
  const timerRef = useRef(null);
  const runningRef = useRef(false);
  const baseRef = useRef(Math.max(0, baseMs));
  const jitterRef = useRef(Math.max(0, Math.min(1, jitter)));

  const schedule = useCallback(() => {
    const base = baseRef.current;
    const jit = jitterRef.current;
    const delta = base * jit;
    const ms = Math.floor(base + (Math.random() * 2 - 1) * delta); // base ± delta
    timerRef.current = setTimeout(() => {
      setCount((c) => c + 1);
      setLastAt(Date.now());
      if (runningRef.current) schedule();
    }, Math.max(0, ms));
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    schedule();
  }, [schedule]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  useEffect(() => {
    baseRef.current = Math.max(0, baseMs);
    jitterRef.current = Math.max(0, Math.min(1, jitter));
    if (runningRef.current) {
      // reschedule with new settings
      restart();
    }
  }, [baseMs, jitter, restart]);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
  }, [autoStart, start, stop]);

  return { tick: count, lastAt, running: runningRef.current, start, stop, restart };
}
