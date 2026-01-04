/* eslint-disable react-refresh/only-export-components */

// src/pwa/PwaProvider.jsx

import * as React from "react";

import { withBaseUrl } from "@/utils/assetUrl.js";

const PwaContext = React.createContext({
  offline: false,
  updateAvailable: false,
  canInstall: false,
  applyUpdate: async () => {},
  promptInstall: async () => ({ outcome: "dismissed" }),
});

function getOffline() {
  if (typeof navigator === "undefined") return false;
  return navigator.onLine === false;
}

export function usePwa() {
  return React.useContext(PwaContext);
}

export default function PwaProvider({ children }) {
  const [offline, setOffline] = React.useState(getOffline());
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [canInstall, setCanInstall] = React.useState(false);
  const registrationRef = React.useRef(null);
  const deferredPromptRef = React.useRef(null);

  // DEV safety: if a service worker was previously registered on localhost,
  // it can keep serving stale cached assets even when we stop registering in dev.
  // That can look like "the dog won't render" or old pages never updating.
  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!("serviceWorker" in navigator)) return;

    const host = String(window.location?.hostname || "");
    const isLocalhost =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (!isLocalhost) return;

    // Escape hatch for debugging PWA behavior in dev.
    try {
      if (localStorage.getItem("DG_KEEP_SW_DEV") === "1") return;
    } catch {
      // ignore
    }

    let cancelled = false;
    const run = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch {
        // ignore
      }

      // Best-effort cache cleanup for old SW versions.
      try {
        const keys = await caches.keys();
        const targets = keys.filter((k) => String(k).startsWith("doggerz-v"));
        await Promise.all(targets.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }

      if (cancelled) return;
      // If we actually had a controller, a refresh ensures we aren't running mixed caches.
      try {
        if (navigator.serviceWorker.controller) {
          window.location.reload();
        }
      } catch {
        // ignore
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Online/offline badge state
  React.useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // SW registration + update detection (prod only)
  React.useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const onControllerChange = () => {
      // New SW took control – safest is a hard reload so we don't run mixed bundles.
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(
          withBaseUrl("/sw.js")
        );
        registrationRef.current = reg;

        // If there's already a waiting worker, we can prompt immediately.
        if (reg.waiting && !cancelled) {
          setUpdateAvailable(true);
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            // "installed" with an existing controller => update is ready and waiting.
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              if (!cancelled) setUpdateAvailable(true);
            }
          });
        });

        // Proactively check for updates when the tab regains focus.
        const onVisible = () => {
          if (document.hidden) return;
          try {
            reg.update();
          } catch {
            // ignore
          }
        };
        window.addEventListener("visibilitychange", onVisible);

        return () => {
          window.removeEventListener("visibilitychange", onVisible);
        };
      } catch {
        // ignore (offline first load etc)
      }
    };

    let cleanupVisible = null;
    register().then((cleanup) => {
      cleanupVisible = cleanup;
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
      if (cleanupVisible) cleanupVisible();
    };
  }, []);

  // Capture install prompt so we can trigger it from UI.
  React.useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanInstall(true);
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const applyUpdate = React.useCallback(async () => {
    const reg = registrationRef.current;
    if (!reg?.waiting) return;

    try {
      // Tell the waiting SW to activate now.
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    } catch {
      // ignore
    }
  }, []);

  const promptInstall = React.useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return { outcome: "unavailable" };

    try {
      prompt.prompt();
      const choice = await prompt.userChoice;
      return choice;
    } finally {
      deferredPromptRef.current = null;
      setCanInstall(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      offline,
      updateAvailable,
      canInstall,
      applyUpdate,
      promptInstall,
    }),
    [offline, updateAvailable, canInstall, applyUpdate, promptInstall]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}
