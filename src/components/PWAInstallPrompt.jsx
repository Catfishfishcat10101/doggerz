import React, { useEffect, useState, useCallback } from "react";

/**
 * PWAInstallPrompt
 * - Listens for the 'beforeinstallprompt' event (Chrome/Edge)
 * - Shows a lightweight banner so users can install your PWA
 * - Persists "Later" dismissals for 7 days to avoid nagging
 *
 * Drop-in: import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
 */
const DISMISS_KEY = "pwaPromptDismissedAt";

function daysSince(ts) {
  if (!ts) return Infinity;
  const diffMs = Date.now() - Number(ts);
  return diffMs / (1000 * 60 * 60 * 24);
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  // show only if user didn't dismiss within last 7 days
  useEffect(() => {
    const lastDismiss = localStorage.getItem(DISMISS_KEY);
    if (daysSince(lastDismiss) >= 7) setVisible(false); // start hidden, reveal on event
  }, []);

  // Handle the browser event to allow custom prompt
  useEffect(() => {
    const onBeforeInstall = (e) => {
      // Prevent the mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);

      const lastDismiss = localStorage.getItem(DISMISS_KEY);
      const canShow = daysSince(lastDismiss) >= 7;

      // iOS/Safari doesn't fire this; we won't show a banner there
      if (canShow) setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      console.log("[PWA] App installed");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA] Install choice:", outcome);
      setDeferredPrompt(null);
      setVisible(false);
    } catch (err) {
      console.warn("[PWA] Install prompt failed:", err);
      setVisible(false);
    }
  }, [deferredPrompt]);

  const handleLater = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  }, []);

  // Donâ€™t render if we canâ€™t prompt (iOS/Safari or already installed)
  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="max-w-sm w-[22rem] rounded-2xl shadow-xl border border-slate-200 bg-white/95 backdrop-blur p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <span className="text-sky-600 text-lg">í°¶</span>
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 font-semibold leading-tight">Install Doggerz</h3>
            <p className="text-slate-600 text-sm mt-1">
              Get faster launches, offline play, and a home-screen icon.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstall}
                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 transition"
              >
                Install
              </button>
              <button
                onClick={handleLater}
                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* tiny shadow blob */}
      <div className="mx-auto h-3 w-24 rounded-full bg-slate-300/40 blur-sm mt-2" />
    </div>
  );
}
