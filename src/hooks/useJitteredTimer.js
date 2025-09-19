import { useEffect, useRef } from "react";

/**
 * Calls `fn` every `baseMs ± jitterMs`.
 * Good for “alive” feel without synchronized spikes.
 */
export default function useJitteredTimer(fn, baseMs = 1000, jitterMs = 300) {
  const fnRef = useRef(fn); fnRef.current = fn;

  useEffect(() => {
    let killed = false, id;
    const loop = () => {
      const jitter = (Math.random() * 2 - 1) * jitterMs;
      const wait = Math.max(50, baseMs + jitter);
      id = setTimeout(() => {
        if (!killed) fnRef.current?.();
        if (!killed) loop();
      }, wait);
    };
    loop();
    return () => { killed = true; clearTimeout(id); };
  }, [baseMs, jitterMs]);
}
