// src/layout/InstallPrompt.jsx
import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onBIP(e) {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="sticky top-0 z-40">
      <div className="m-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 flex items-center justify-between">
        <span>Install Doggerz?</span>
        <div className="flex gap-2">
          <button
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-zinc-900 px-2 py-1"
            onClick={async () => {
              const e = deferred;
              setVisible(false);
              setDeferred(null);
              const choice = await e.prompt();
              console.info("[pwa] install choice:", choice?.outcome);
            }}
          >
            Install
          </button>
          <button
            className="rounded-md border border-zinc-700 hover:border-zinc-500 px-2 py-1"
            onClick={() => setVisible(false)}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
