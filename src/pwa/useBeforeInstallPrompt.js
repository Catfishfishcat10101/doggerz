import React, { useEffect, useRef, useState } from "react";

/**
 * Cross-platform PWA install UX:
 * - Chromium: handles `beforeinstallprompt` with deferral
 * - iOS Safari: shows "Add to Home Screen" helper
 * - Suppresses if already installed / standalone
 * - Respects a 7-day throttle after dismiss
 */
export default function PWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);
  const deferredRef = useRef(null);

  const STORAGE_KEY = "doggerz:a2hs:dismissedAt";
  const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  const isStandalone = () => {
    const mql = window.matchMedia?.("(display-mode: standalone)")?.matches;
    const ios = typeof navigator !== "undefined" && "standalone" in navigator && navigator.standalone;
    return Boolean(mql || ios);
  };

  const shouldThrottle = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      return Date.now() - Number(raw) < DISMISS_TTL_MS;
    } catch {
      return false;
    }
  };

  const markDismissed = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  };

  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent || navigator.vendor || "");
  const isSafariLike = () => /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|EdgiOS|Firefox|FxiOS/.test(navigator.userAgent);

  // Chromium pathway
  useEffect(() => {
    if (isStandalone() || shouldThrottle()) return;
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredRef.current = e;
      setCanInstall(true);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // iOS fallback pathway
  useEffect(() => {
    if (isStandalone() || shouldThrottle()) return;
    if (isIOS() && isSafariLike()) setIosVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide if app gets installed while banner is open
  useEffect(() => {
    const onInstalled = () => {
      setVisible(false);
      setIosVisible(false);
      markDismissed();
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (isStandalone()) return null;

  return (
    <>
      {/* Chromium install prompt */}
      {canInstall && visible && (
        <div role="dialog" aria-label="Install Doggerz" className="fixed bottom-4 left-0 right-0 px-4 z-50">
          <div className="mx-auto max-w-xl rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg border border-black/5 dark:border-white/10 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Install Doggerz</div>
              <div className="text-xs opacity-80">Add to home screen for faster launches and offline play.</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white shadow hover:shadow-md active:scale-95"
                onClick={async () => {
                  const prompt = deferredRef.current;
                  if (!prompt) return;
                  try {
                    prompt.prompt();
                    await prompt.userChoice;
                  } catch {}
                  setVisible(false);
                  deferredRef.current = null;
                  markDismissed();
                }}
              >
                Install
              </button>
              <button
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:shadow-md active:scale-95"
                onClick={() => {
                  setVisible(false);
                  markDismissed();
                }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS helper */}
      {iosVisible && (
        <div role="dialog" aria-label="Install on iOS" className="fixed bottom-4 left-0 right-0 px-4 z-50">
          <div className="mx-auto max-w-xl rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg border border-black/5 dark:border-white/10 p-4">
            <div className="text-sm">
              <div className="font-semibold mb-1">Install Doggerz</div>
              <p className="opacity-80">
                In Safari, tap <span aria-label="Share">Share</span> ▲, then choose <b>Add to Home Screen</b>.
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-100 text-sm"
                onClick={() => {
                  setIosVisible(false);
                  markDismissed();
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
