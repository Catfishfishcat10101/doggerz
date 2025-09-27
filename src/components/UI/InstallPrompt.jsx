import React, { useEffect, useState } from "react";

/**
 * “Install App” button using the beforeinstallprompt event.
 * Safe on desktop & iOS (returns null where unsupported).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBIP = (e) => {
      e.preventDefault();       // keep it under our control
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  // If we can’t install (iOS Safari, already installed, etc.), render nothing
  if (!visible || !deferred) return null;

  const onInstall = async () => {
    try {
      const choice = await deferred.prompt();
      // optional: choice.outcome === 'accepted' | 'dismissed'
    } catch {}
    setVisible(false);
    setDeferred(null);
  };

  return (
    <button
      onClick={onInstall}
      className="fixed bottom-4 left-4 rounded-xl bg-emerald-600 text-white px-4 py-2 shadow-lg hover:bg-emerald-500"
      aria-label="Install Doggerz"
    >
      Install Doggerz
    </button>
  );
}