// src/hooks/usePageVisibility.jsx
import { useEffect, useState } from "react";

/**
 * React hook for Page Visibility API.
 * - Returns `isVisible`
 * - Optional callbacks: onShow, onHide
 *
 * Example:
 *   const isVisible = usePageVisibility({
 *     onHide: () => queueAutoSave(),
 *     onShow: () => flushPending(),
 *   });
 */
export default function usePageVisibility({ onShow, onHide } = {}) {
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState !== "hidden" : true
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onChange = () => {
      const visible = document.visibilityState !== "hidden";
      setIsVisible(visible);
      if (visible) onShow?.();
      else onHide?.();
    };

    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [onShow, onHide]);

  return isVisible;
}
