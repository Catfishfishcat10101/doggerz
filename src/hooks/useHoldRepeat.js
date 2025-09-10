import { useCallback, useRef } from "react";

/**
 * Hold a button to repeat an action.
 * @param {() => void} fn
 * @param {{initialDelay?:number, interval?:number}} opts
 */
export default function useHoldRepeat(fn, { initialDelay = 250, interval = 80 } = {}) {
  const timerRef = useRef(null);
  const intRef = useRef(null);

  const clear = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intRef.current) { clearInterval(intRef.current); intRef.current = null; }
  };

  const start = useCallback(() => {
    clear();
    fn();
    timerRef.current = setTimeout(() => {
      intRef.current = setInterval(fn, interval);
    }, initialDelay);
  }, [fn, initialDelay, interval]);

  const stop = useCallback(() => { clear(); }, []);

  const bind = {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };

  return { bind, start, stop };
}
