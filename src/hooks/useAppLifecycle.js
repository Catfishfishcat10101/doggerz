// src/hooks/useAppLifecycle.js
import { useEffect, useRef } from "react";

/**
 * useAppLifecycle
 * - onOnline / onOffline: connectivity changes
 * - onHide / onShow: tab visibility changes (pagehide/visibilitychange)
 * - onBeforeUnload: return a string or truthy to show confirm dialog (browser may ignore message)
 */
export default function useAppLifecycle({
  onOnline,
  onOffline,
  onHide,
  onShow,
  onBeforeUnload,
} = {}) {
  const refs = useRef({ onOnline, onOffline, onHide, onShow, onBeforeUnload });
  refs.current = { onOnline, onOffline, onHide, onShow, onBeforeUnload };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Stable handlers that read latest refs
    const handleOnline = () => refs.current.onOnline?.();
    const handleOffline = () => refs.current.onOffline?.();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") refs.current.onHide?.();
      else refs.current.onShow?.();
    };
    const handlePageHide = () => refs.current.onHide?.();
    const handleBeforeUnload = (e) => {
      const wantBlock = refs.current.onBeforeUnload?.();
      if (wantBlock) {
        // Standard pattern: set returnValue to trigger confirm dialog
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
      return undefined;
    };

    // Add
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide); // more reliable on mobile Safari
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial sync (optional)
    if (navigator.onLine) refs.current.onOnline?.();
    else refs.current.onOffline?.();

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
// src/components/common/Skeletons.jsx