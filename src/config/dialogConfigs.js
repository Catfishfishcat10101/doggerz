// src/config/dialogConfigs.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

/* ------------------------------------------------------------------ */
/* DIALOG PRESET REGISTRY                                             */
/* ------------------------------------------------------------------ */

// All your dialog presets live here.
// You can add/rename keys as you grow the app.
const DIALOG_PRESETS = {
  // Example: confirm resetting dog progress
  RESET_DOG_PROGRESS: {
    title: "Reset Dog?",
    body: "This will clear your current Dogger and start from scratch. Coins, stats, and progress may be lost.",
    confirmLabel: "Reset",
    cancelLabel: "Cancel",
    variant: "danger",
  },

  // Example: confirm logout
  LOG_OUT: {
    title: "Sign out?",
    body: "You can sign back in later and your Doggerz data will still be here.",
    confirmLabel: "Sign out",
    cancelLabel: "Stay",
    variant: "primary",
  },

  // Add more presets as needed:
  // DELETE_ACCOUNT: { ... },
  // ADOPT_DOG_CONFIRM: { ... },
};

export function getDialog(key) {
  return DIALOG_PRESETS[key] || null;
}

/* ------------------------------------------------------------------ */
/* CONTEXT + PROVIDER                                                 */
/* ------------------------------------------------------------------ */

const DialogCtx = createContext(null);

export function DialogProvider({ children }) {
  const [stack, setStack] = useState([]); // [{key, preset, resolve, reject, opts}]
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = useCallback((key, opts = {}) => {
    const preset = getDialog(key);
    if (!preset) {
      return Promise.reject(new Error(`Unknown dialog key: ${key}`));
    }

    return new Promise((resolve, reject) => {
      setStack((s) => [...s, { key, preset, resolve, reject, opts }]);
    });
  }, []);

  const closeTop = useCallback((result) => {
    setStack((s) => {
      if (!s.length) return s;
      const top = s[s.length - 1];
      top.resolve(result);
      return s.slice(0, -1);
    });
  }, []);

  const dismissTop = useCallback(() => {
    setStack((s) => {
      if (!s.length) return s;
      const top = s[s.length - 1];
      top.resolve(false);
      return s.slice(0, -1);
    });
  }, []);

  const value = useMemo(
    () => ({ open, dismissTop }),
    [open, dismissTop],
  );

  return (
    <DialogCtx.Provider value={value}>
      {children}
      {mounted &&
        stack.map((item, idx) => (
          <DialogPortal key={`${item.key}-${idx}`}>
            <ConfirmDialog
              {...item.preset}
              {...item.opts}
              onConfirm={() => closeTop(true)}
              onCancel={dismissTop}
            />
          </DialogPortal>
        ))}
    </DialogCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useDialog() {
  const ctx = useContext(DialogCtx);
  if (!ctx) {
    throw new Error("useDialog must be used within <DialogProvider/>");
  }
  return ctx.open;
}

/* ------------------------------------------------------------------ */
/* PORTAL + PRESENTATION                                              */
/* ------------------------------------------------------------------ */

function DialogPortal({ children }) {
  return createPortal(children, document.body);
}

function ConfirmDialog({
  title = "Confirm",
  body = "",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}) {
  // trap focus: keep it minimal
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onCancel]);

  const confirmClass =
    variant === "danger"
      ? "bg-rose-500 hover:bg-rose-400 text-white"
      : "bg-amber-400 hover:bg-amber-300 text-slate-900";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] grid place-items-center p-4"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        {body && (
          <p className="mt-2 text-sm text-white/80">
            {body}
          </p>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 font-semibold ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
