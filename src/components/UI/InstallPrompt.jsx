// src/components/PWA/InstallPrompt.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * InstallPrompt
 * - Desktop/Android: shows an Install button using beforeinstallprompt.
 * - iOS Safari: shows a small hint (Share → Add to Home Screen).
 * - Hides when the app is already installed (standalone display-mode).
 * - "Not now" snoozes the prompt for N days (localStorage).
 */

const SNOOZE_KEY = "installPrompt:snoozeUntil";
const SNOOZE_DAYS = 7;

export default function InstallPrompt() {
  const [bipEvent, setBipEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  const isStandalone = useMemo(() => {
    // PWA standalone on iOS: window.navigator.standalone === true
    // Cross-platform: CSS media query
    return (
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator?.standalone === true)
    );
  }, []);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIosSafari = isIOS && isSafari;

  // honor snooze
  const snoozed = useMemo(() => {
    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      return until > Date.now();
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (isStandalone || snoozed) return;

    // Desktop/Android flow
    const onBIP = (e) => {
      e.preventDefault();
      setBipEvent(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS fallback (no BIP event)
    if (isIosSafari) {
      setIosHint(true);
      setVisible(true);
    }

    // Hide permanently once installed
    const onInstalled = () => {
      setVisible(false);
      setBipEvent(null);
      setIosHint(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isStandalone, isIosSafari, snoozed]);

  if (!visible) return null;

  const snooze = () => {
    try {
      const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(SNOOZE_KEY, String(until));
    } catch {}
    setVisible(false);
    setBipEvent(null);
    setIosHint(false);
  };

  const onInstall = async () => {
    if (!bipEvent) return;
    try {
      // Show the native prompt
      const res = await bipEvent.prompt();
      // Optional: res.outcome === 'accepted' | 'dismissed'
    } catch {
      // ignore
    } finally {
      setVisible(false);
      setBipEvent(null);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {bipEvent ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 shadow-lg">
          <span className="text-sm">Install Doggerz</span>
          <button
            onClick={onInstall}
            className="rounded-lg bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
            aria-label="Install Doggerz"
          >
            Install
          </button>
          <button
            onClick={snooze}
            className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            aria-label="Not now"
            title={`Remind me later`}
          >
            Not now
          </button>
        </div>
      ) : iosHint ? (
        <div className="rounded-xl bg-slate-900/90 text-slate-100 border border-white/10 px-3 py-2 shadow-lg max-w-xs">
          <div className="text-sm font-medium">Add Doggerz to Home Screen</div>
          <div className="mt-1 text-xs opacity-80">
            Tap the <ShareIcon /> share icon, then <strong>Add to Home Screen</strong>.
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={snooze}
              className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* tiny inline icon to avoid extra deps */
function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className="inline -mt-0.5 align-middle mr-1"
    >
      <path
        d="M12 3l4 4m-4-4l-4 4m4-4v12M6 21h12a2 2 0 002-2v-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export default function InstallPrompt() {
  
}