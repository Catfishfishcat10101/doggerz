// src/components/Auth/LogoutButton.jsx
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth } from "@/../firebase";
import { clearUser } from "@/../redux/userSlice";

/**
 * LogoutButton
 * - Signs out from Firebase Auth
 * - Clears Redux user state
 * - Optional deep client cleanup: SW + caches + IndexedDB + Auth storage
 */
export default function LogoutButton({
  className = "",
  children,
  to = "/",                 // where to redirect after logout
  confirm = false,          // ask for confirmation before logging out
  deepClean = false,        // clear SW/caches/IDB/local auth traces
  onLogout,                 // alias of onSuccess for back-compat
  onSuccess,                // ( ) => void
  onError,                  // (err) => void
  busyLabel = "Signing out…",
  label = "Log Out",
  variant = "danger",       // "danger" | "ghost"
}) {
  const [pending, setPending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const doDeepClean = async () => {
    try {
      setStatusMsg("Cleaning local data…");
      // 1) Unregister service workers
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(regs.map((r) => r.unregister()));
      }
      // 2) Clear workbox/runtime caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((k) => caches.delete(k)));
      }
      // 3) Clear IndexedDB (best-effort)
      if ("indexedDB" in window) {
        if (indexedDB.databases) {
          const dbs = await indexedDB.databases();
          await Promise.allSettled(
            (dbs || [])
              .map((d) => d?.name)
              .filter(Boolean)
              .map((name) => new Promise((res) => {
                const req = indexedDB.deleteDatabase(name);
                req.onsuccess = req.onerror = req.onblocked = () => res();
              }))
          );
        } else {
          // Fallback: known Firebase DBs (no-op if missing)
          const names = [
            "firebaseLocalStorageDb",
            "firebase-installations",
            "firebase-heartbeat-database",
            "firebase-messaging-database",
            "keyval-store", // workbox default
          ];
          await Promise.allSettled(names.map((name) => new Promise((res) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = req.onerror = req.onblocked = () => res();
          })));
        }
      }
      // 4) Clear auth artifacts in localStorage (best-effort)
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("firebase:") || k.includes(":authUser:"))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
    } catch {
      // deep clean is best-effort; swallow errors
    } finally {
      setStatusMsg("");
    }
  };

  const handleLogout = async () => {
    if (pending) return;
    if (confirm && !window.confirm("Sign out of Doggerz?")) return;

    setPending(true);
    setStatusMsg("Signing out…");
    try {
      await signOut(auth);
      dispatch(clearUser());

      if (deepClean) {
        await doDeepClean();
      }

      onLogout?.();
      onSuccess?.();

      // Navigate last to avoid tearing down before cleanup completes
      navigate(to, { replace: true });
    } catch (err) {
      const message = err?.message || "Logout failed.";
      onError?.(err);
      // Don’t use alert() in production UIs; surface inline
      setStatusMsg(message);
      // If you keep a toast system, trigger it here.
    } finally {
      setPending(false);
    }
  };

  const base =
    variant === "ghost"
      ? "inline-flex items-center gap-2 px-4 py-2 rounded font-semibold transition border border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
      : "inline-flex items-center gap-2 px-4 py-2 rounded font-semibold transition text-white bg-red-500 hover:bg-red-600 disabled:opacity-60";

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        aria-busy={pending ? "true" : "false"}
        aria-live="polite"
        className={base}
      >
        {pending ? (
          <>
            <Spinner />
            <span>{busyLabel}</span>
          </>
        ) : (
          <span>{children ?? label}</span>
        )}
      </button>
      {/* Inline status (non-blocking, SR-friendly) */}
      {statusMsg && (
        <span className="mt-1 text-xs text-slate-600 dark:text-slate-300" aria-live="polite">
          {statusMsg}
        </span>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}
