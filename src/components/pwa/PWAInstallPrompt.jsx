// src/components/common/PWAInstallPrompt.jsx
import React, { useEffect, useRef, useState } from "react";

export default function PWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [visible, setVisible] = useState(false);
  const deferredRef = useRef(null);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredRef.current = e;
      setCanInstall(true);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!canInstall || !visible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
      <div className="mx-auto max-w-xl rounded-2xl bg-white shadow-lg border border-black/5 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Install Doggerz</div>
          <div className="text-xs text-black/60">Add the app to your home screen for faster access.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white shadow hover:shadow-md active:scale-95"
            onClick={async () => {
              const prompt = deferredRef.current;
              if (!prompt) return;
              prompt.prompt();
              await prompt.userChoice;
              setVisible(false);
              deferredRef.current = null;
            }}
          >
            Install
          </button>
          <button className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:shadow-md active:scale-95" onClick={() => setVisible(false)}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
