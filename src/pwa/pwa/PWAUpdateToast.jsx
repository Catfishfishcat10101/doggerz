/* src/components/common/PWAUpdateToast.jsx */
import React from "react";

/**
 * Simple SW update toast. Pass `visible` and an `onReload` handler
 * that calls the updater returned by registerSW().
 */
export default function PWAUpdateToast({ visible, onReload }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] rounded-2xl bg-amber-500 text-black border border-amber-600 p-3 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold">Update available</div>
          <div className="text-sm">A new Doggerz build is ready. Reload to apply.</div>
        </div>
        <button
          onClick={onReload}
          className="px-3 py-1 rounded-xl bg-black/10 hover:bg-black/20 text-sm"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
