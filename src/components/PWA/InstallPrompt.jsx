import React, { useEffect, useMemo, useState } from "react";

const SNOOZE_KEY = "installPrompt:snoozeUntil";
const SNOOZE_DAYS = 7;

export default function InstallPrompt() {
  const [bipEvent, setBipEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  const isStandalone = useMemo(() => (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  ), []);

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIosSafari = isIOS && isSafari;

  const snoozed = useMemo(() => {
    try { return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now(); }
    catch { return false; }
  }, []);

  useEffect(() => {
    if (isStandalone || snoozed) return;

    const onBIP = (e) => { e.preventDefault(); setBipEvent(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", onBIP);

    if (isIosSafari) { setIosHint(true); setVisible(true); }

    const onInstalled = () => { setVisible(false); setBipEvent(null); setIosHint(false); };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isStandalone, isIosSafari, snoozed]);

  if (!visible) return null;

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 864e5)); } catch {}
    setVisible(false); setBipEvent(null); setIosHint(false);
  };

  const onInstall = async () => {
    if (!bipEvent) return;
    try { await bipEvent.prompt(); } catch {}
    setVisible(false); setBipEvent(null);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {bipEvent ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 shadow-lg">
          <span className="text-sm">Install Doggerz</span>
          <button onClick={onInstall} className="rounded-lg bg-white/15 px-3 py-1 text-sm hover:bg-white/25">Install</button>
          <button onClick={snooze} className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Not now</button>
        </div>
      ) : iosHint ? (
        <div className="rounded-xl bg-slate-900/90 text-slate-100 border border-white/10 px-3 py-2 shadow-lg max-w-xs">
          <div className="text-sm font-medium">Add Doggerz to Home Screen</div>
          <div className="mt-1 text-xs opacity-80">Tap the share icon, then <strong>Add to Home Screen</strong>.</div>
          <div className="mt-2 text-right">
            <button onClick={snooze} className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Dismiss</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
