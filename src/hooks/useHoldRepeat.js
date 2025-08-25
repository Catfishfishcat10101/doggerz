import { useRef } from "react";

/** Press-and-hold to repeat an action (for D-pad buttons). */
export default function useHoldRepeat(fn, { delay = 250, interval = 80 } = {}) {
  const timer = useRef(null);
  const start = () => {
    if (timer.current) return;
    fn();
    timer.current = setTimeout(function tick() {
      fn();
      timer.current = setTimeout(tick, interval);
    }, delay);
  };
  const stop = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onTouchStart: (e) => { e.preventDefault(); start(); },
    onTouchEnd: stop,
  };
}
