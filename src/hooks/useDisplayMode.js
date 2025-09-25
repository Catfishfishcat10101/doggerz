// src/hooks/useDisplayMode.js
import { useEffect, useState } from "react";

/** Detect standalone / installed display-mode across platforms. */
export default function useDisplayMode() {
  const [isStandalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const check = () => {
      const standaloneMQL = !!mq?.matches;
      // iOS Safari exposes navigator.standalone when launched from A2HS
      const standaloneIOS = typeof navigator !== "undefined" && "standalone" in navigator && navigator.standalone;
      setStandalone(Boolean(standaloneMQL || standaloneIOS));
    };
    check();
    mq?.addEventListener?.("change", check);
    window.addEventListener("visibilitychange", check); // catch returns from background
    return () => {
      mq?.removeEventListener?.("change", check);
      window.removeEventListener("visibilitychange", check);
    };
  }, []);

  return isStandalone;
}
