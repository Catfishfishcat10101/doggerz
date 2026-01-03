// src/components/PwaStatusBanners.jsx

import * as React from 'react';
import { usePwa } from '@/pwa/PwaProvider.jsx';

export default function PwaStatusBanners() {
  const { offline, updateAvailable, canInstall, applyUpdate, promptInstall } = usePwa();
  const [installDismissed, setInstallDismissed] = React.useState(false);

  // Avoid flashing the offline badge during initial load (network jitters)
  const [showOffline, setShowOffline] = React.useState(false);
  React.useEffect(() => {
    if (!offline) {
      setShowOffline(false);
      return;
    }
    const t = window.setTimeout(() => setShowOffline(true), 400);
    return () => window.clearTimeout(t);
  }, [offline]);

  React.useEffect(() => {
    if (!canInstall) setInstallDismissed(false);
  }, [canInstall]);

  const showInstall = canInstall && !installDismissed;

  if (!showOffline && !updateAvailable && !showInstall) return null;

  return (
    <div className="fixed top-3 left-1/2 z-[9999] w-[min(92vw,720px)] -translate-x-1/2 space-y-2">
      {showInstall && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-950/80 px-4 py-3 text-zinc-100 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-emerald-200">Install Doggerz</div>
            <div className="text-xs text-zinc-400">Get the app on your home screen.</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-200"
              onClick={() => setInstallDismissed(true)}
            >
              Not now
            </button>
            <button
              type="button"
              className="shrink-0 rounded-md bg-emerald-500/20 border border-emerald-500/35 px-3 py-2 text-sm text-emerald-100"
              onClick={() => promptInstall()}
            >
              Install
            </button>
          </div>
        </div>
      )}

      {updateAvailable && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-950/80 px-4 py-3 text-zinc-100 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-emerald-200">New version available</div>
            <div className="text-xs text-zinc-400">Refresh to update (safe).</div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md bg-emerald-500/20 border border-emerald-500/35 px-3 py-2 text-sm text-emerald-100"
            onClick={() => applyUpdate()}
          >
            Refresh
          </button>
        </div>
      )}

      {showOffline && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-100 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold">You’re offline</div>
            <div className="text-xs text-zinc-400">The app should still work for cached content.</div>
          </div>
        </div>
      )}
    </div>
  );
}
