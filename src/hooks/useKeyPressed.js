// src/hooks/useKeyPressed.js
import { useEffect, useRef, useState } from "react";

/**
 * Track whether a specific key (or any of a list) is currently pressed.
 *
 * Usage:
 *   const isLeft = useKeyPressed("arrowleft");
 *   const isMove = useKeyPressed(["arrowleft", "arrowright", "arrowup", "arrowdown"]);
 */
export default function useKeyPressed(targetKeys, { target = typeof window !== "undefined" ? window : null } = {}) {
  const [pressed, setPressed] = useState(false);
  const keysRef = useRef(new Set());

  useEffect(() => {
    const wanted = new Set(
      (Array.isArray(targetKeys) ? targetKeys : [targetKeys])
        .filter(Boolean)
        .map((k) => String(k).toLowerCase())
    );

    if (!target) return;

    const down = (e) => {
      const key = (e.key || "").toLowerCase();
      keysRef.current.add(key);
      // If any target key is in set, mark pressed true
      for (const w of wanted) {
        if (keysRef.current.has(w)) {
          setPressed(true);
          return;
        }
      }
    };

    const up = (e) => {
      const key = (e.key || "").toLowerCase();
      keysRef.current.delete(key);
      // If none of the targets are down, pressed -> false
      for (const w of wanted) {
        if (keysRef.current.has(w)) {
          setPressed(true);
          return;
        }
      }
      setPressed(false);
    };

    const blur = () => {
      keysRef.current.clear();
      setPressed(false);
    };

    target.addEventListener("keydown", down);
    target.addEventListener("keyup", up);
    target.addEventListener?.("blur", blur);

    return () => {
      target.removeEventListener("keydown", down);
      target.removeEventListener("keyup", up);
      target.removeEventListener?.("blur", blur);
    };
  }, [targetKeys, target]);

  return pressed;
}
