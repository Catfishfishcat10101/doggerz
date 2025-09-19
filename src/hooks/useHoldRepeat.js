import { useEffect, useRef } from "react";

/**
 * Repeatedly fires `fn` while `active` is true.
 * @param {boolean} active
 * @param {function} fn
 * @param {number} initialDelay ms before first repeat (default 250)
 * @param {number} interval ms between repeats (default 50)
 */
export default function useHoldRepeat(active, fn, initialDelay = 250, interval = 50) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;
    let timer = setTimeout(function tick() {
      fnRef.current?.();
      timer = setTimeout(tick, interval);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [active, initialDelay, interval]);
}
