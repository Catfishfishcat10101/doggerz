import { useEffect, useRef } from "react";

/**
 * Calls onTick repeatedly with jittered intervals.
 * @param {{baseMs?:number, jitter?:number, autoStart?:boolean, onTick?:(count:number)=>void}} opts
 */
export default function useJitteredTimer({ baseMs = 2000, jitter = 0.3, autoStart = false, onTick } = {}) {
  const countRef = useRef(0);
  const timerRef = useRef(null);

  const schedule = () => {
    const j = Math.max(0, Math.min(1, jitter));
    const dev = baseMs * j;
    const wait = baseMs + (Math.random() * 2 - 1) * dev;
    timerRef.current = setTimeout(() => {
      countRef.current += 1;
      onTick && onTick(countRef.current);
      schedule();
    }, Math.max(50, wait));
  };

  useEffect(() => {
    if (!autoStart) return;
    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMs, jitter, autoStart, onTick]);

  return null;
}
