import { useEffect, useRef, useState } from "react";

/**
 * Returns true while any of the specified keys are down.
 * @param {string|string[]} keys
 */
export default function useKeyPressed(keys) {
  const list = Array.isArray(keys) ? keys.map((k) => k.toLowerCase()) : [String(keys).toLowerCase()];
  const setRef = useRef(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    const down = (e) => { setRef.current.add((e.key || "").toLowerCase()); setTick((t) => t + 1); };
    const up = (e) => { setRef.current.delete((e.key || "").toLowerCase()); setTick((t) => t + 1); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const pressed = list.some((k) => setRef.current.has(k));
  return pressed;
}
