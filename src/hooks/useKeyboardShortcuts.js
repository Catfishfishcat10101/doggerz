import { useEffect } from "react";

/**
 * Map of key => handler. Example:
 * useKeyboardShortcuts({ ' ': onJump, ArrowLeft: onLeft, ArrowRight: onRight })
 */
export default function useKeyboardShortcuts(map, deps = []) {
  useEffect(() => {
    const onKey = (e) => {
      const fn = map[e.key];
      if (typeof fn === "function") {
        fn(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // caller controls rebinds
}
