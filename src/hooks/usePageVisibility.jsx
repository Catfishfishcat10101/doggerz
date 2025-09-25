/* src/hooks/usePageVisibility.jsx */
import { useEffect, useRef, useState } from "react";

/**
 * usePageVisibility
 *
 * Tracks whether the page is currently visible to the user.
 * - SSR-safe (no direct document access during render)
 * - Stable handlers (prevents stale closures)
 * - Listens to: visibilitychange, pagehide/pageshow, focus/blur
 *
 * @param {Object} opts
 * @param {() => void} [opts.onShow]       Called when page becomes visible
 * @param {() => void} [opts.onHide]       Called when page becomes hidden
 * @param {(visible:boolean) => void} [opts.onChange] Called on any change
 * @returns {boolean} visible
 */
export default function usePageVisibility({ onShow, onHide, onChange } = {}) {
  const getInitial = () => {
    if (typeof document === "undefined") return true; // assume visible during SSR
    try {
      return document.visibilityState !== "hidden";
    } catch {
      return true;
    }
  };

  const [visible, setVisible] = useState(getInitial);

  // Keep latest callbacks without re-subscribing listeners
  const cbRef = useRef({ onShow, onHide, onChange });
  cbRef.current = { onShow, onHide, onChange };

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const update = (nextVisible) => {
      setVisible((prev) => {
        if (prev === nextVisible) return prev;
        // fire callbacks after state decision
        queueMicrotask(() => {
          try {
            cbRef.current.onChange?.(nextVisible);
            if (nextVisible) cbRef.current.onShow?.();
            else cbRef.current.onHide?.();
          } catch { /* swallow */ }
        });
        return nextVisible;
      });
    };

    const onVisibility = () => update(document.visibilityState !== "hidden");
    const onPageShow = () => update(true);
    const onPageHide = () => update(false);
    const onFocus = () => update(true);
    const onBlur = () => {
      // Only mark hidden on blur if the doc is actually hidden;
      // prevents false negatives when focusing devtools, etc.
      if (document.visibilityState === "hidden") update(false);
    };

    document.addEventListener("visibilitychange", onVisibility, { passive: true });
    window.addEventListener("pageshow", onPageShow, { passive: true });
    window.addEventListener("pagehide", onPageHide, { passive: true });
    window.addEventListener("focus", onFocus, { passive: true });
    window.addEventListener("blur", onBlur, { passive: true });

    // Sync once on mount
    onVisibility();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return visible;
}
