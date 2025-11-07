import React, { useEffect, useState } from "react";

/**
 * UpdateToast
 * - If a Service Worker finds an update, shows "Refresh" CTA.
 * - Works with vanilla SW or vite-plugin-pwa (if present). No SW? No toast.
 */
export default function UpdateToast() {
  const [ready, setReady] = useState(false);
  const [waitingSW, setWaitingSW] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // vite-plugin-pwa exposes `window.__WB_MANIFEST` & a ready registration.
    // We also handle raw register("/sw.js") cases.
    const onReg = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const listen = (sw) => {
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingSW(sw);
              setReady(true);
            }
          });
        };
        if (reg.waiting) {
          setWaitingSW(reg.waiting);
          setReady(true);
        } else if (reg.installing) {
          listen(reg.installing);
        }
        reg.addEventListener?.("updatefound", () => reg.installing && listen(reg.installing));
      } catch {}
    };

    onReg();
    const id = setInterval(onReg, 15_000); // poll a bit to be safe
    return () => clearInterval(id);
  }, []);

  if (!ready) return null;

  const reload = async () => {
    try {
      waitingSW?.postMessage?.({ type: "SKIP_WAITING" });
    } catch {}
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-2xl bg-white text-black shadow px-4 py-2 flex items-center gap-3">
        <span className="font-semibold">New version available</span>
        <button onClick={reload} className="px-3 py-1 rounded bg-black text-white hover:bg-black/80">
          Refresh
        </button>
      </div>
    </div>
  );
}