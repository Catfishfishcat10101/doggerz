// src/components/AppBootGate.jsx

import * as React from "react";
import AppBootSplash from "./AppBootSplash.jsx";
import {
  getDoggerzShellPreloadUrls,
  preloadImages,
} from "@/utils/preloadAssets.js";

export default function AppBootGate({ children }) {
  const [progress, setProgress] = React.useState({
    progress01: 0,
    loaded: 0,
    total: 0,
    okCount: 0,
  });
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const hideHtmlSplash = () => {
      try {
        if (typeof window !== "undefined" && typeof window.__DOGGERZ_HIDE_SPLASH__ === "function") {
          window.__DOGGERZ_HIDE_SPLASH__();
        }
      } catch {
        // ignore
      }
    };

    const run = async () => {
      const urls = getDoggerzShellPreloadUrls();

      // Safety: ensure we never hang forever.
      const safetyTimer = window.setTimeout(() => {
        if (cancelled) return;
        setDone(true);
        hideHtmlSplash();
      }, 8_500);

      try {
        await preloadImages(urls, {
          timeoutMs: 2_500,
          onProgress: ({ total, loaded, okCount, progress01 }) => {
            if (cancelled) return;
            setProgress({ total, loaded, okCount, progress01 });
          },
        });
      } finally {
        window.clearTimeout(safetyTimer);
        if (cancelled) return;
        setDone(true);
        hideHtmlSplash();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {children}
      {!done && (
        <AppBootSplash
          progress01={progress.progress01}
          label={
            progress.total > 0
              ? `Loading sprites & backgrounds (${progress.okCount}/${progress.total})…`
              : "Loading…"
          }
        />
      )}
    </>
  );
}
