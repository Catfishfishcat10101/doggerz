import { useEffect, useState } from "react";

/** PWA install banner (for Chromium-based browsers). */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    setVisible(false);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-2xl bg-white text-black shadow px-4 py-2 flex items-center gap-3">
        <span className="font-semibold">Install Doggerz?</span>
        <button
          onClick={install}
          className="px-3 py-1 rounded bg-black text-white hover:bg-black/80"
        >
          Install
        </button>
        <button
          onClick={() => setVisible(false)}
          className="px-3 py-1 rounded bg-black/10 hover:bg-black/20"
        >
          Not now
        </button>
      </div>
    </div>
  );
}