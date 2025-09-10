import { useEffect } from "react";

/**
 * Global keyboard shortcuts.
 * @param {Record<string, (e:KeyboardEvent)=>void>} handlers e.g. { "shift+.": fn, "arrowleft": fn }
 * @param {{enabled?:boolean, preventDefault?:boolean, allowRepeat?:boolean}} opts
 */
export default function useKeyboardShortcuts(handlers = {}, { enabled = true, preventDefault = false, allowRepeat = false } = {}) {
  useEffect(() => {
    if (!enabled) return;
    const normalize = (e) => {
      const k = (e.key || "").toLowerCase();
      const parts = [];
      if (e.ctrlKey) parts.push("ctrl");
      if (e.metaKey) parts.push("meta");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");
      parts.push(k);
      return parts.join("+");
    };
    const onDown = (e) => {
      if (!allowRepeat && e.repeat) return;
      const combo = normalize(e);
      const h = handlers[combo] || handlers[(e.key || "").toLowerCase()];
      if (h) {
        if (preventDefault) e.preventDefault();
        h(e);
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [handlers, enabled, preventDefault, allowRepeat]);
}
