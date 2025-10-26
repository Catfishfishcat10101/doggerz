// src/dev/useHotKey.js
import { useEffect } from "react";

export function useHotkey(combo, handler) {
  useEffect(() => {
    function onKey(e) {
      const wantCtrl = combo.ctrl ?? false;
      const wantAlt = combo.alt ?? false;
      const wantMeta = combo.meta ?? false;
      const wantShift = combo.shift ?? false;
      const key = combo.key.toLowerCase();

      if (
        !!e.ctrlKey === wantCtrl &&
        !!e.altKey === wantAlt &&
        !!e.metaKey === wantMeta &&
        !!e.shiftKey === wantShift &&
        e.key.toLowerCase() === key
      ) {
        e.preventDefault();
        handler(e);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combo.ctrl, combo.alt, combo.meta, combo.shift, combo.key, handler]);
}
