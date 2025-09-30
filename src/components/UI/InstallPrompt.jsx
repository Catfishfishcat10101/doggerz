// src/components/UI/InstallPrompt.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * InstallPrompt
 * - Captures 'beforeinstallprompt' (Chromium) and exposes a button to trigger A2HS.
 * - Hides if already installed (display-mode: standalone or navigator.standalone on iOS).
 * - iOS: shows instructions (Safari only) since Apple doesn’t fire beforeinstallprompt.
 * - Persists a "dismissed" flag so it won’t nag every page load.
 */

const DISMISS_KEY = "pwaPromptDismissedAt";
const DISMISS_COOLDOWN_HOURS = 24;

function isStandalone() {
  // Android/desktop PWA
  const mq = window.matchMedia?.("(display-mode: standalone)")?.matches;
  // iOS Safari PWA
  const iosStandalone = typeof window.navigator !== "undefined" && "standalone" in window.navigator && window.navigator.standalone;
  return !!(mq || iosStandalone);
}

function isIosSafari() {
  // Very light UA sniff; good enough for an install hint
  const ua = navigator.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && notChrome;
}

function getDismissedAt() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function setDismissedNow() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);

  const allowPromptByCooldown = useMemo(() => {
    const last = getDismissedAt();
    if (!last) return true;
    const hours = (Date.now() - last) / 36e5;
    return hours >= DISMISS_COOLDOWN_HOURS;
  }, []);

  useEffect(() => {
    // Hide entirely if already installed
    if (isStandalone()) {
      setInstalled(true);
      setVisible(false);
      return;
    }

    // Chromium: capture beforeinstallprompt
    function onBIP(e) {
      // Don’t let the browser show its own mini-infobar
      e.preventDefault?.();
      setDeferred(e);
      if (allowPromptByCooldown) setVisible(true);
    }

    // Installed event
    function onInstalled() {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires BIP; show instructions card if allowed
    if (isIosSafari() && allowPromptByCooldown) {
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [allowPromptByCooldown]);

  async function handleInstallClick() {
    if (!deferred) {
      // iOS path or no event captured
      return;
    }
    try {
      setBusy(true);
      const choice = await deferred.prompt?.(); // some browsers expose prompt() on the event
      // Some browsers return { outcome: "accepted" | "dismissed" }
      if (choice && choice.outcome === "accepted") {
        // User accepted; browser will install and fire appinstalled
        setVisible(false);
      } else {
        // User dismissed the native prompt
        setDismissedNow();
        setVisible(false);
      }
    } catch {
      // If anything goes sideways, don’t loop-nag
      setDismissedNow();
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  function handleDismiss() {
    setDismissedNow();
    setVisible(false);
  }

  // Nothing to show
  if (installed || !visible) return null;

  // UI card (high contrast, no color-only state)
  return (
    <div
      ref={cardRef}
      className="fixed bottom-4 inset-x-4 z-40 rounded-2xl border border-zinc-700/80 bg-zinc-900/85 backdrop-blur p-4 shadow-2xl"
      role="region"
      aria-label="Install Doggerz app"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 select-none text-xl" aria-hidden>📲</div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-wide">Install Doggerz</h2>
          {isIosSafari() ? (
            <p className="mt-1 text-xs text-zinc-300">
              Add to Home Screen: tap <span className="inline-block px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] align-[1px]">Share</span> →{" "}
              <span className="inline-block px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] align-[1px]">Add to Home Screen</span>.
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-300">
              Install the app for faster loads, fullscreen play, and offline support.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {!isIosSafari() && (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={!deferred || busy}
                className="rounded-xl px-3 py-1.5 text-sm font-semibold bg-emerald-500 text-zinc-900 disabled:opacity-60 hover:bg-emerald-400 active:translate-y-px"
              >
                {busy ? "Requesting…" : "Install"}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-sm font-medium ring-1 ring-zinc-700 hover:bg-zinc-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
