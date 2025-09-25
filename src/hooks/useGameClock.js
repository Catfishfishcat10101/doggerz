// src/hooks/useGameClock.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useGameClock
 * Time-based rAF clock with visibility + reduced-motion hygiene.
 *
 * @param {object} opts
 * @param {boolean} [opts.running=true]          Start running immediately
 * @param {number}  [opts.speed=1]               Time multiplier (0.5=half, 2=double)
 * @param {boolean} [opts.pauseOnHidden=true]    Auto-pause on hidden tabs
 * @param {boolean} [opts.respectReducedMotion=true] Pause if user prefers reduced motion
 * @param {number}  [opts.sampleHz=30]           How often to push state to React (Hz)
 * @param {number}  [opts.maxDelta=0.1]          Clamp dt (seconds) to avoid spikes (default 100ms)
 */
export default function useGameClock({
  running = true,
  speed = 1,
  pauseOnHidden = true,
  respectReducedMotion = true,
  sampleHz = 30,
  maxDelta = 0.1,
} = {}) {
  const [delta, setDelta] = useState(0);     // seconds (throttled to sampleHz)
  const [elapsed, setElapsed] = useState(0); // seconds (throttled)
  const [fps, setFps] = useState(0);         // smoothed FPS (EMA)
  const [mult, setMult] = useState(speed);
  const [isRunning, setIsRunning] = useState(Boolean(running));

  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // refs for loop timing
  const rafRef = useRef(0);
  const prevRef = useRef(0);
  const accumSinceSampleRef = useRef(0);
  const emaFpsRef = useRef(0);
  const visibleRef = useRef(true);

  // imperative controls
  const setSpeed = useCallback((v) => setMult(Number(v) || 0), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const toggle = useCallback(() => setIsRunning((p) => !p), []);

  // reflect prop speed changes
  useEffect(() => { setMult(speed); }, [speed]);

  // visibility listener
  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVis = () => {
      const vis = document.visibilityState !== "hidden";
      visibleRef.current = vis;
      // reset timing when we become visible so we don't "catch up"
      if (vis) {
        prevRef.current = performance.now();
        accumSinceSampleRef.current = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseOnHidden]);

  // main loop
  useEffect(() => {
    if (!isRunning || prefersReduced) return;

    const sampleInterval = 1 / Math.max(1, sampleHz);
    let active = true;

    const tick = (now) => {
      if (!active) return;

      // initialize previous timestamp
      if (!prevRef.current) prevRef.current = now;

      // pause if hidden and configured to do so
      if (pauseOnHidden && !visibleRef.current) {
        prevRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // raw delta (seconds)
      let dt = (now - prevRef.current) / 1000;
      prevRef.current = now;

      // clamp huge jumps, apply speed multiplier
      if (!(dt > 0)) dt = 0;
      if (dt > maxDelta) dt = maxDelta;
      dt *= mult;

      // accumulate for throttled pushes
      accumSinceSampleRef.current += dt;

      // FPS EMA (use unclamped base to get a better feel)
      const instFps = dt > 0 ? 1 / dt : 0;
      const alpha = 0.1; // smoothing factor
      emaFpsRef.current = emaFpsRef.current
        ? (1 - alpha) * emaFpsRef.current + alpha * instFps
        : instFps;

      // only push React state at sampleHz
      if (accumSinceSampleRef.current >= sampleInterval) {
        const pushDt = accumSinceSampleRef.current;
        accumSinceSampleRef.current = 0;
        setDelta(pushDt);
        setElapsed((t) => t + pushDt);
        setFps(emaFpsRef.current | 0);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    prevRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, mult, prefersReduced, sampleHz, maxDelta, pauseOnHidden]);

  return {
    // reactive, throttled values
    delta,    // seconds since last sample push (≈ 1 / sampleHz * speed)
    elapsed,  // total seconds (accumulated from samples)
    fps,      // smoothed frames per second (approximate)

    // controls / state
    running: isRunning,
    setSpeed,
    speed: mult,
    pause,
    resume,
    toggle,
  };
}

/* ---------------------------------------------------------------------- */
/* Optional power-user API: useGameLoop(onUpdate, deps, options)
   Runs your callback every tick with unclamped dt, without re-rendering the
   component every frame. Perfect for animating sprites, physics, etc.      */
/* ---------------------------------------------------------------------- */
export function useGameLoop(onUpdate, deps = [], {
  running = true,
  pauseOnHidden = true,
  respectReducedMotion = true,
  maxDelta = 0.1,
} = {}) {
  const cbRef = useRef(onUpdate);
  cbRef.current = onUpdate;

  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => {
    if (!running || prefersReduced) return;

    let active = true;
    let prev = performance.now();
    const visRef = { visible: true };

    const onVis = () => {
      visRef.visible = document.visibilityState !== "hidden";
      if (visRef.visible) prev = performance.now();
    };
    if (pauseOnHidden) {
      document.addEventListener("visibilitychange", onVis);
      onVis();
    }

    const loop = (now) => {
      if (!active) return;
      let dt = (now - prev) / 1000;
      prev = now;

      if (pauseOnHidden && !visRef.visible) {
        requestAnimationFrame(loop);
        return;
      }
      if (!(dt > 0)) dt = 0;
      if (dt > maxDelta) dt = maxDelta;

      try { cbRef.current?.(dt, now); } catch {}

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => {
      active = false;
      if (pauseOnHidden) document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, pauseOnHidden, prefersReduced, maxDelta, ...deps]);
}
