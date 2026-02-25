// src/components/PwaStatusBanners.jsx

import * as React from "react";
import { usePwa } from "@/pwa/PwaProvider.jsx";

export default function PwaStatusBanners() {
  const {
    offline,
    updateAvailable,
    applyUpdate,
    canInstall,
    promptInstall,
    swStatus,
  } = usePwa();

  const [dismissed, setDismissed] = React.useState(false);

  const showUpdate = updateAvailable && !dismissed;
  const showOffline = offline && !dismissed;
  const showInstall = canInstall && !dismissed;

  if (!showUpdate && !showOffline && !showInstall) return null;

  const onApplyUpdate = async () => {
    await applyUpdate();
  };

  const onInstall = async () => {
    await promptInstall();
  };

  const statusLabel = swStatus === "error" ? "Update unavailable" : "";

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 space-y-2">
      {showUpdate ? (
        <div className="rounded-2xl border border-emerald-400/35 bg-black/80 px-4 py-3 text-xs text-zinc-100 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-emerald-200">
                Update available
              </div>
              <div className="text-zinc-400">
                Refresh to get the latest yard improvements.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApplyUpdate}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-xl border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold text-zinc-100"
              >
                Later
              </button>
            </div>
          </div>
          {statusLabel ? (
            <div className="mt-2 text-[11px] text-zinc-500">{statusLabel}</div>
          ) : null}
        </div>
      ) : null}

      {showOffline ? (
        <div className="rounded-2xl border border-amber-400/35 bg-black/80 px-4 py-3 text-xs text-zinc-100 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-amber-200">Offline</div>
              <div className="text-zinc-400">
                You are offline. Cached features still work.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold text-zinc-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {showInstall ? (
        <div className="rounded-2xl border border-sky-400/35 bg-black/80 px-4 py-3 text-xs text-zinc-100 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-sky-200">Install Doggerz</div>
              <div className="text-zinc-400">
                Add Doggerz to your home screen for faster access.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onInstall}
                className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-[11px] font-semibold text-sky-100"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-xl border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold text-zinc-100"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
