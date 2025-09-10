// src/hooks/useKeyboardShortcuts.js
import { useEffect, useMemo, useRef } from "react";

/**
 * Global keyboard shortcuts with combo parsing (e.g., "ctrl+k", "shift+arrowup", "space").
 *
 * Usage:
 *   useKeyboardShortcuts({
 *     "arrowup": () => move(0, -1),
 *     "arrowdown": () => move(0, +1),
 *     "arrowleft": () => move(-1, 0),
 *     "arrowright": () => move(+1, 0),
 *     "space": () => bark(),
 *     "ctrl+s": () => saveGame(),
 *   }, { enabled: true, preventDefault: true });
 */
export default function useKeyboardShortcuts(
  bindings,
  {
    enabled = true,
    preventDefault = false,
    ignoreWhenTyping = true,
    allowRepeat = false,
    target = typeof window !== "undefined" ? window : null,
  } = {}
) {
  const mapRef = useRef({});
  const optsRef = useRef({ preventDefault, ignoreWhenTyping, allowRepeat });

  // Normalize binding keys to lowercase; store handlers
  const normalized = useMemo(() => {
    const out = {};
    if (Array.isArray(bindings)) {
      for (const { combo, handler } of bindings) {
        if (combo && typeof handler === "function") out[String(combo).toLowerCase()] = handler;
      }
    } else if (bindings && typeof bindings === "object") {
      for (const k of Object.keys(bindings)) {
        out[k.toLowerCase()] = bindings[k];
      }
    }
    return out;
  }, [bindings]);

  useEffect(() => {
    mapRef.current = normalized;
  }, [normalized]);

  useEffect(() => {
    optsRef.current = { preventDefault, ignoreWhenTyping, allowRepeat };
  }, [preventDefault, ignoreWhenTyping, allowRepeat]);

  useEffect(() => {
    if (!enabled || !target) return;

    const isTypingTarget = (el) => {
      const t = el?.tagName;
      const editable = el?.isContentEditable;
      return (
        editable ||
        t === "INPUT" ||
        t === "TEXTAREA" ||
        t === "SELECT" ||
        el?.closest?.("[data-ignore-shortcuts='true']")
      );
    };

    const matchCombo = (e, comboStr) => {
      // combo like "ctrl+shift+k" or "arrowup" or "space"
      const parts = comboStr.split("+").map((p) => p.trim());
      let needCtrl = false, needMeta = false, needAlt = false, needShift = false, keyPart = null;

      for (const p of parts) {
        switch (p) {
          case "ctrl": needCtrl = true; break;
          case "meta": needMeta = true; break;
          case "cmd": needMeta = true; break;
          case "alt": needAlt = true; break;
          case "shift": needShift = true; break;
          default: keyPart = p; break;
        }
      }

      const evKey = (e.key || "").toLowerCase();
      const okMods =
        (!!e.ctrlKey === needCtrl) &&
        (!!e.metaKey === needMeta) &&
        (!!e.altKey === needAlt) &&
        (!!e.shiftKey === needShift);

      if (!okMods) return false;

      if (!keyPart) return false;

      // Normalize some aliases
      const alias = {
        " ": " ",
        "space": " ",
        "escape": "esc",
        "esc": "esc",
        "arrowup": "arrowup",
        "arrowdown": "arrowdown",
        "arrowleft": "arrowleft",
        "arrowright": "arrowright",
        "enter": "enter",
        "return": "enter",
        "backspace": "backspace",
        "tab": "tab",
      };

      const wanted = alias[keyPart] ?? keyPart;

      // Normalize evKey similarly
      const evAlias = {
        " ": " ",
        "escape": "esc",
      };

      const actual = evAlias[evKey] ?? evKey;
      return actual === wanted;
    };

    const onKeyDown = (e) => {
      const { preventDefault, ignoreWhenTyping, allowRepeat } = optsRef.current;

      if (!allowRepeat && e.repeat) return;
      if (ignoreWhenTyping && isTypingTarget(e.target)) return;

      const key = (e.key || "").toLowerCase();

      // Fast path: direct match without modifiers
      let handler = mapRef.current[key];

      // Slow path: check all combos
      if (!handler) {
        for (const combo in mapRef.current) {
          if (matchCombo(e, combo)) {
            handler = mapRef.current[combo];
            break;
          }
        }
      }

      if (typeof handler === "function") {
        if (preventDefault) e.preventDefault();
        handler(e);
      }
    };

    target.addEventListener("keydown", onKeyDown);
    return () => {
      target.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, target]);

  return null; // hook is side-effect only
}
