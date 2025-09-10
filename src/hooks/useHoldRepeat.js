// src/hooks/useHoldRepeat.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Repeats a callback while the user holds mouse/touch/key.
 * Example:
 *   const { bind, isHolding } = useHoldRepeat(() => doThing(), { initialDelay: 300, interval: 60 });
 *   <button {...bind}>Hold me</button>
 */
export default function useHoldRepeat(
  callback,
  { initialDelay = 300, interval = 60, enabled = true } = {}
) {
  const cbRef = useRef(callback);
  const timerRef = useRef(null);
  const repeatingRef = useRef(false);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    repeatingRef.current = false;
    setIsHolding(false);
    clearTimers();
  }, [clearTimers]);

  const start = useCallback(() => {
    if (!enabled) return;
    setIsHolding(true);
    // fire once after initialDelay, then on fixed interval
    timerRef.current = setTimeout(function tick() {
      if (!repeatingRef.current) return;
      cbRef.current?.();
      timerRef.current = setTimeout(tick, interval);
    }, initialDelay);
    repeatingRef.current = true;
  }, [enabled, initialDelay, interval]);

  // Global cancel on window blur (mouse leaves window)
  useEffect(() => {
    const onBlur = () => stop();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [stop]);

  // Return handy bind props for buttons or divs
  const bind = {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e) => {
      e.preventDefault();
      start();
    },
    onTouchEnd: stop,
    onTouchCancel: stop,
    // Optional: allow keyboard hold on Space/Enter
    onKeyDown: (e) => {
      if (e.repeat) return; // avoid browser auto-repeat double triggering
      if (e.key === " " || e.key === "Enter") start();
    },
    onKeyUp: (e) => {
      if (e.key === " " || e.key === "Enter") stop();
    },
    tabIndex: 0, // makes non-interactive nodes focusable if needed
    role: "button",
  };

  return { bind, isHolding, start, stop };
}
