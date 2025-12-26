import * as React from "react";

const ToastContext = React.createContext(null);

function toneClasses(tone) {
  switch (tone) {
    case "success":
      return {
        shell:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
        dot: "bg-emerald-400",
      };
    case "warning":
      return {
        shell:
          "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200",
        dot: "bg-amber-400",
      };
    case "error":
      return {
        shell:
          "border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-200",
        dot: "bg-red-400",
      };
    default:
      return {
        shell:
          "border-sky-500/25 bg-sky-500/10 text-sky-950 dark:text-sky-200",
        dot: "bg-sky-400",
      };
  }
}

function ToastItem({ toast, onDismiss }) {
  const { shell, dot } = toneClasses(toast.tone);

  return (
    <div
      className={`pointer-events-auto w-full max-w-md rounded-2xl border px-3 py-2 shadow-lg shadow-black/15 backdrop-blur ${shell} dark:shadow-black/40`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full">
          <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title ? (
            <div className="text-sm font-semibold leading-5">
              {toast.title}
            </div>
          ) : null}
          <div className="text-xs opacity-90 leading-4">{toast.message}</div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg px-2 py-1 text-xs opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-3 sm:bottom-6">
      <div className="pointer-events-none flex w-full flex-col items-center gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

/**
 * @typedef {Object} ToastInput
 * @property {string} [title]
 * @property {string} message
 * @property {"info"|"success"|"warning"|"error"} [tone]
 * @property {number} [durationMs]
 */

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const timersRef = React.useRef(new Map());

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timers = timersRef.current;
    const handle = timers.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.delete(id);
    }
  }, []);

  const clear = React.useCallback(() => {
    setToasts([]);
    for (const handle of timersRef.current.values()) {
      clearTimeout(handle);
    }
    timersRef.current.clear();
  }, []);

  const push = React.useCallback(
    /** @param {ToastInput|string} input */
    (input, options = {}) => {
      const t =
        typeof input === "string"
          ? { message: input, ...options }
          : { ...input, ...options };

      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const durationMs =
        typeof t.durationMs === "number" ? t.durationMs : 1600;
      const toast = {
        id,
        title: t.title || "",
        message: String(t.message || ""),
        tone: t.tone || "info",
        durationMs,
        createdAt: Date.now(),
      };

      setToasts((prev) => [toast, ...prev].slice(0, 3));

      if (durationMs > 0) {
        const handle = setTimeout(() => dismiss(id), durationMs);
        timersRef.current.set(id, handle);
      }

      return id;
    },
    [dismiss]
  );

  const api = React.useMemo(
    () => ({
      push,
      dismiss,
      clear,
      info: (message, opts) => push({ message, tone: "info" }, opts),
      success: (message, opts) => push({ message, tone: "success" }, opts),
      warning: (message, opts) => push({ message, tone: "warning" }, opts),
      error: (message, opts) => push({ message, tone: "error" }, opts),
    }),
    [push, dismiss, clear]
  );

  React.useEffect(() => {
    return () => {
      for (const handle of timersRef.current.values()) {
        clearTimeout(handle);
      }
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
