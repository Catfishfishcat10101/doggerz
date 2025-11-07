import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

/**
 * DogAIEngine.jsx
 * Background system that drives automatic events:
 *  - Emits tick and longTick cycles
 *  - Dispatches safe Redux actions for timed decay
 *  - No UI; headless logic component
 */
export default function DogAIEngine() {
  const dispatch = useDispatch();
  const mounted = useRef(false);
  const lastLong = useRef(Date.now());

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const TICK_MS = 2000; // 2s
    const LONG_MS = 10000; // 10s
    const timer = setInterval(() => {
      const now = Date.now();
      dispatch({ type: "dog/tick", payload: { at: now } });

      if (now - lastLong.current >= LONG_MS) {
        lastLong.current = now;
        dispatch({ type: "dog/longTick", payload: { at: now } });
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [dispatch]);

  return null;
}