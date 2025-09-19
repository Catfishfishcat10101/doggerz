import React, { useEffect, useState } from "react";

export default function UpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    let dispose;
    (async () => {
      try {
        // Prevent Vite from resolving at build time when plugin isn't installed
        const mod = await import(/* @vite-ignore */ "virtual:pwa-register");
        const updateSW = mod.registerSW({
          immediate: true,
          onOfflineReady() { setOfflineReady(true); },
          onNeedRefresh() { setNeedRefresh(true); },
        });
        dispose = () => updateSW && updateSW(true);
      } catch {
        // Plugin not present — silently skip
      }
    })();
    return () => { try { dispose?.(); } catch {} };
  }, []);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg ring-1 ring-black/5 rounded-xl p-3 flex items-center gap-3">
      <span className="text-sm">
        {needRefresh ? "New version available." : "Ready to work offline."}
      </span>
      {needRefresh && (
        <button
          onClick={() => location.reload()}
          className="text-sm px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Refresh
        </button>
      )}
      <button
        onClick={() => { setNeedRefresh(false); setOfflineReady(false); }}
        className="text-sm px-2 py-1 rounded-lg border"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
// src/components/Shell/UpdateToast.jsx