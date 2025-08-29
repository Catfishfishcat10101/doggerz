import { useEffect } from "react";

export default function useKeyboardShortcuts({
  onPoopScoop,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onReset,
} = {}) {
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key.toLowerCase();
      if (e.repeat) return;

      switch (key) {
        case "p":
          onPoopScoop?.();
          break;
        case "arrowup":
        case "w":
          onMoveUp?.();
          break;
        case "arrowdown":
        case "s":
          onMoveDown?.();
          break;
        case "arrowleft":
        case "a":
          onMoveLeft?.();
          break;
        case "arrowright":
        case "d":
          onMoveRight?.();
          break;
        case "r":
          onReset?.();
          break;
        default:
          return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPoopScoop, onMoveUp, onMoveDown, onMoveLeft, onMoveRight, onReset]);
}
