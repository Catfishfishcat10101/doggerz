import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadDogFromCloud } from "@/redux/dogThunks.js";
import { useToast } from "@/components/ToastProvider.jsx";

export default function CloudSyncNotice() {
  const [disabled, setDisabled] = useState(
    () =>
      !!(
        typeof window !== "undefined" &&
        window.localStorage.getItem("doggerz:cloudDisabled")
      ),
  );
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    const onStorage = () => {
      setDisabled(!!window.localStorage.getItem("doggerz:cloudDisabled"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (disabled) {
      try {
        toast?.add("Cloud sync disabled (permission). Running local-only.");
      } catch (e) {}
    }
  }, [disabled, toast]);

  if (!disabled) return null;

  const handleRetry = async () => {
    try {
      window.localStorage.removeItem("doggerz:cloudDisabled");
      setDisabled(false);
      // Attempt a reload from cloud
      try {
        await dispatch(loadDogFromCloud()).unwrap();
        toast?.add("Cloud sync re-enabled.");
      } catch (e) {
        // If it fails, the engine/thunk may set the flag again. Show toast.
        toast?.add("Retry failed: " + (e?.message || "permission denied"));
      }
      // successful load will hydrate state; if it fails again and permission persists, the engine will set the flag again
    } catch (e) {
      // no-op: loadDogFromCloud will surface errors in console
    }
  };

  const handleDismiss = () => {
    try {
      // Mark dismissed for this session only (do not re-enable cloud)
      // keep the persistent flag so behavior remains local-only across reloads
      setDisabled(false);
      toast?.add("Cloud sync notice dismissed.");
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="rounded-md bg-amber-800 text-white px-3 py-2 text-sm shadow-md">
        <div className="flex items-center gap-3">
          <div>Cloud sync disabled (permission)</div>
          <div className="ml-2 flex items-center gap-2">
            <button
              onClick={handleRetry}
              className="underline text-emerald-200 hover:text-emerald-100"
            >
              Retry
            </button>
            <button
              onClick={handleDismiss}
              className="text-zinc-200 bg-zinc-800/40 px-2 py-0.5 rounded hover:bg-zinc-700"
              aria-label="Dismiss cloud sync notice"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
