// src/components/PwaStatusBanners.jsx

import * as React from "react";

import { usePwa } from "@/pwa/PwaProvider.jsx";

function Banner({ tone, children }) {
  const toneClass =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-50"
      : tone === "danger"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-50"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-50";

  return (
    <div
      className={`fixed left-3 right-3 bottom-3 z-[1000] rounded-xl border px-3 py-2 backdrop-blur ${toneClass}`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export default function PwaStatusBanners() {
  const { offline, updateAvailable, canInstall, applyUpdate, promptInstall } =
    usePwa();
  const [hidden, setHidden] = React.useState(false);
  const [installing, setInstalling] = React.useState(false);

  if (hidden) return null;

  if (updateAvailable) {
    return (
      <Banner tone="ok">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Update available</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 text-xs"
              onClick={() => applyUpdate()}
            >
              Update
            </button>
            <button
              type="button"
              className="rounded-md bg-transparent border border-white/15 px-2.5 py-1.5 text-xs"
              onClick={() => setHidden(true)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </Banner>
    );
  }

  if (offline) {
    return (
      <Banner tone="warn">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">You’re offline</div>
          <div className="ml-auto">
            <button
              type="button"
              className="rounded-md bg-transparent border border-white/15 px-2.5 py-1.5 text-xs"
              onClick={() => setHidden(true)}
            >
              Hide
            </button>
          </div>
        </div>
      </Banner>
    );
  }

  // Optional install affordance (quiet unless the browser signals installability).
  if (canInstall) {
    return (
      <Banner tone="ok">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Install Doggerz</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 text-xs disabled:opacity-50"
              disabled={installing}
              onClick={async () => {
                setInstalling(true);
                try {
                  await promptInstall();
                } finally {
                  setInstalling(false);
                }
              }}
            >
              {installing ? "Opening…" : "Install"}
            </button>
            <button
              type="button"
              className="rounded-md bg-transparent border border-white/15 px-2.5 py-1.5 text-xs"
              onClick={() => setHidden(true)}
            >
              Not now
            </button>
          </div>
        </div>
      </Banner>
    );
  }

  return null;
}
