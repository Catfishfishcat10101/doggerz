// src/components/UI/hooks/usePageVisibility.js
import { useEffect, useState } from "react";

/**
 * True when the tab/app is visible. Falls back to true if API missing.
 */
export default function usePageVisibility() {
  const [visible, setVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );

  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return visible;
}