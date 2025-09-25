// src/components/PWAInstallPrompt.jsx
import React, { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67+ from showing the mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const handleInstall = async () => {
    setVisible(false);
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (_) {
      // ignore
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => setVisible(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] rounded-2xl bg-slate-900/90 text-slate-100 border border-slate-700 p-3 shadow-xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold">Install Doggerz</div>
          <div className="text-sm opacity-80">
            Add Doggerz to your home screen for faster launches and offline play.
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 px-2"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          onClick={handleDismiss}
          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-sm font-medium"
        >
          Install
        </button>
      </div>
    </div>
  );
}
