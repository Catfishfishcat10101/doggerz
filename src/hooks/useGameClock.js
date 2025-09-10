import { useEffect, useRef, useState } from "react";

/**
 * Game clock with requestAnimationFrame.
 * @param {{running?:boolean, speed?:number, pauseOnHidden?:boolean}} opts
 */
export default function useGameClock({ running = true, speed = 1, pauseOnHidden = true } = {}) {
  const [delta, setDelta] = useState(0); // seconds
  const [mult, setMult] = useState(speed);
  const rafRef = useRef(null);
  const prevRef = useRef(performance.now());

  useEffect(() => { setMult(speed); }, [speed]);

  useEffect(() => {
    let active = true;

    const loop = (t) => {
      if (!active) return;
      const prev = prevRef.current || t;
      const dt = (t - prev) / 1000 * mult;
      prevRef.current = t;
      setDelta(dt > 0 && dt < 1 ? dt : 0);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (pauseOnHidden && document.visibilityState === "hidden") {
        prevRef.current = performance.now();
      }
    };

    if (running) {
      prevRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", onVis);
    }
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [running, mult, pauseOnHidden]);

  return { delta, setSpeed: setMult };
}
