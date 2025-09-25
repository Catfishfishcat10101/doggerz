// Lightweight SW register with hooks for update UI
export function registerSW({ onNeedRefresh, onOfflineReady, onRegistered } = {}) {
  if (!("serviceWorker" in navigator)) return () => {};
  let waiting;
  const update = () => {
    if (waiting) { waiting.postMessage({ type: "SKIP_WAITING" }); }
    setTimeout(() => location.reload(), 100);
  };

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      onRegistered?.(reg);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed") {
            if (navigator.serviceWorker.controller) {
              waiting = reg.waiting || sw;
              onNeedRefresh?.(update);
            } else {
              onOfflineReady?.();
            }
          }
        });
      });
    } catch (e) {
      // ignore
    }
  });

  // Return imperative updater
  return update;
}
