import React, { useEffect, useState } from "react";

/**
 * Lightweight update toast.
 * Works with or without vite-plugin-pwa.
 * If a service worker is waiting, shows “Update available”.
 * Clicking refresh reloads the page to activate the new SW.
 */
export default function UpdateToast() {
  const [waiting, setWaiting] = useState(false);
  const [registration, setRegistration] = useState(null);

  // Detect an already-registered waiting SW (manual and plugin cases)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready
      .then((reg) => {
        setRegistration(reg);
        if (reg.waiting) setWaiting(true);

        // Listen for a new SW that moves to waiting
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && reg.waiting) {
              setWaiting(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  // Some SWs send a postMessage when they’re ready to activate
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = (e) => {
      if (e?.data === "SW_WAITING") setWaiting(true);
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  if (!waiting) return null;

  const refreshNow = () => {
    try {
      registration?.waiting?.postMessage?.({ type: "SKIP_WAITING" });
    } finally {
      // hard refresh to pick up the new assets
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm rounded-xl bg-amber-500 text-zinc-900 shadow-lg ring-1 ring-amber-600/40">
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="font-semibold">Update available</span>
        <button
          onClick={refreshNow}
          className="ml-auto rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-sm hover:opacity-90"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
