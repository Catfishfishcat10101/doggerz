// src/hooks/useGameClock.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Game-time clock driven by requestAnimationFrame.
 * - Scales time with a speed multiplier (e.g., 1 = real-time, 2 = 2x faster).
 * - Pauses when tab is hidden (optional).
 * - Returns elapsed (seconds), delta (seconds), and start/stop controls.
 */
export default function useGameClock({
  running = true,
  speed = 1,
  pauseOnHidden = true,
} = {}) {
  const [elapsed, setElapsed] = useState(0);   // total seconds since start (scaled)
  const [delta, setDelta] = useState(0);       // seconds since last frame (scaled)

  const rafIdRef = useRef(null);
  const lastTsRef = useRef(null);
  const runningRef = useRef(running);
  const speedRef = useRef(Math.max(0, speed));

  const frame = useCallback((ts) => {
    if (!runningRef.current) return;

    if (lastTsRef.current == null) {
      lastTsRef.current = ts;
      rafIdRef.current = requestAnimationFrame(frame);
      return;
    }

    const realDeltaMs = ts - lastTsRef.current;
    lastTsRef.current = ts;

    // Convert ms -> s and scale by speed
    const scaledDelta = (realDeltaMs / 1000) * speedRef.current;

    setElapsed((e) => e + scaledDelta);
    setDelta(scaledDelta);

    rafIdRef.current = requestAnimationFrame(frame);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTsRef.current = null;
    rafIdRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setSpeed = useCallback((next) => {
    speedRef.current = Math.max(0, Number(next) || 0);
  }, []);

  // Start/stop with `running` prop
  useEffect(() => {
    runningRef.current = running;
    if (running) {
      lastTsRef.current = null;
      rafIdRef.current = requestAnimationFrame(frame);
    } else {
      stop();
    }
    return () => stop();
  }, [running, frame, stop]);

  // Update speed prop
  useEffect(() => {
    setSpeed(speed);
  }, [speed, setSpeed]);

  // Optionally pause on page hidden
  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else if (runningRef.current) {
        // restart only if supposed to be running
        lastTsRef.current = null;
        rafIdRef.current = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseOnHidden, frame, stop]);

  return { elapsed, delta, start, stop, setSpeed, running: runningRef.current, speed: speedRef.current };
}
