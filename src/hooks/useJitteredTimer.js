// src/components/UI/hooks/useJitteredTimer.js
import { useEffect, useLayoutEffect, useRef, useCallback } from "react";

/**
 * useJitteredTimer
 * Repeats `fn` forever with base delay +/- jitter. Uses setTimeout, not setInterval.
 *
 * @param {Function} fn              - async or sync function to run each tick
 * @param {number}   baseMs          - base delay in ms (e.g., 2000)
 * @param {object}   options
 *   - enabled        : boolean   start running immediately (default true)
 *   - jitterPct      : number    0..0.95 (default 0.3) => ±30% of baseMs
 *   - minMs          : number    hard floor for delay (default 200)
 *   - maxMs          : number    hard ceiling (default Infinity)
 *   - immediate      : boolean   run once immediately on mount/enable (default false)
 *   - pauseOnHidden  : boolean   auto-pause when document.hidden (default true)
 *   - onError        : (err)=>{} error handler (default console.error)
 *
 * @param {Array} deps - extra deps that should restart the timer when changed
 *
 * @returns {object} controls
 *   - pause()        : void
 *   - resume()       : void
 *   - isRunning()    : boolean
 *   - fireNow()      : Promise<void>  // manually trigger fn once (queued safely)
 */
export default function useJitteredTimer(
  fn,
  baseMs,
  {
    enabled = true,
    jitterPct = 0.3,
    minMs = 200,
    maxMs = Infinity,
    immediate = false,
    pauseOnHidden = true,
    onError = (e) => console.error("[useJitteredTimer]", e),
  } = {},
  deps = []
) {
  const timeoutIdRef = useRef(null);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const busyRef = useRef(false); // prevent overlapping runs
  const latestFnRef = useRef(fn);

  // Always call the latest fn without re-scheduling on every render.
  useLayoutEffect(() => {
    latestFnRef.current = fn;
  }, [fn]);

  const clearTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const isRunning = useCallback(() => runningRef.current, []);

  const scheduleNext = useCallback(() => {
    // compute jittered delay
    const clampedJitter = Math.max(0, Math.min(jitterPct, 0.95));
    const delta = baseMs * clampedJitter;
    const jittered = baseMs + (Math.random() * 2 - 1) * delta; // base ± delta
    const delay = Math.max(minMs, Math.min(jittered, maxMs));

    timeoutIdRef.current = setTimeout(async () => {
      // Guard: hook may have been paused or unmounted
      if (!runningRef.current || cancelledRef.current) return;

      // Ensure single execution at a time
      if (busyRef.current) {
        // If previous run still working, reschedule instead of overlapping
        scheduleNext();
        return;
      }

      busyRef.current = true;
      try {
        await latestFnRef.current?.();
      } catch (err) {
        try {
          onError?.(err);
        } catch (_) {
          // swallow secondary errors from user onError
        }
      } finally {
        busyRef.current = false;
        if (runningRef.current && !cancelledRef.current) {
          scheduleNext();
        }
      }
    }, delay);
  }, [baseMs, jitterPct, minMs, maxMs, onError]);

  const start = useCallback(() => {
    if (runningRef.current || cancelledRef.current) return;
    runningRef.current = true;

    if (immediate) {
      // Fire once immediately; next tick is still jittered
      Promise.resolve()
        .then(() => latestFnRef.current?.())
        .catch((err) => onError?.(err))
        .finally(() => {
          if (runningRef.current && !cancelledRef.current) scheduleNext();
        });
    } else {
      scheduleNext();
    }
  }, [immediate, scheduleNext, onError]);

  const pause = useCallback(() => {
    runningRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!runningRef.current && !cancelledRef.current) {
      start();
    }
  }, [start]);

  // Manually trigger NOW (still respects busyRef to avoid overlap)
  const fireNow = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await latestFnRef.current?.();
    } catch (err) {
      onError?.(err);
    } finally {
      busyRef.current = false;
    }
  }, [onError]);

  // Visibility pause/resume
  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVis = () => {
      if (document.hidden) {
        pause();
      } else if (enabled) {
        resume();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseOnHidden, enabled, pause, resume]);

  // Lifecycle + dependency management
  useEffect(() => {
    cancelledRef.current = false;

    if (enabled && !document.hidden) {
      start();
    }

    return () => {
      cancelledRef.current = true;
      runningRef.current = false;
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, baseMs, jitterPct, minMs, maxMs, immediate, pauseOnHidden, ...deps]);

  return { pause, resume, isRunning, fireNow };
}
