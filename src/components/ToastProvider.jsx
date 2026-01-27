// src/components/ToastProvider.jsx

import * as React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "@/redux/settingsSlice.js";

const ToastContext = React.createContext(null);

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}
function canVibrate() {
  return (
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
  );
}
function useUserGestureGate() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (ready) return;
    const unlock = () => setReady(true);
    window.addEventListener("pointerdown", unlock, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, {
      once: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [ready]);
  return ready;
}
function vibrate(pattern) {
  try {
    if (!canVibrate()) return;
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
function typeStyles(type) {
  switch (type) {
    case "success":
      return {
        border: "border-emerald-500/25",
        bg: "bg-emerald-500/10",
        text: "text-emerald-100",
        glow: "shadow-[0_0_45px_rgba(16,185,129,0.14)]",
        icon: "✓",
      };
    case "warn":
      return {
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        text: "text-amber-100",
        glow: "shadow-[0_0_45px_rgba(245,158,11,0.14)]",
        icon: "!",
      };
    case "error":
      return {
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
        text: "text-rose-100",
        glow: "shadow-[0_0_45px_rgba(244,63,94,0.14)]",
        icon: "×",
      };
    case "reward":
      return {
        border: "border-orange-500/30",
        bg: "bg-orange-500/10",
        text: "text-orange-100",
        glow: "shadow-[0_0_55px_rgba(249,115,22,0.18)]",
        icon: "★",
      };
    case "info":
    default:
      return {
        border: "border-white/15",
        bg: "bg-black/45",
        text: "text-zinc-100",
        glow: "shadow-[0_0_45px_rgba(0,0,0,0.25)]",
        icon: "i",
      };
  }
}
export function ToastProvider({ children }) {
  const settings = useSelector(selectSettings);
  const hapticsEnabled = Boolean(settings?.hapticsEnabled);
  const hasUserGesture = useUserGestureGate();
  const [toasts, setToasts] = React.useState([]);
  const lastByKeyRef = React.useRef(Object.create(null));
  const remove = React.useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);
  const show = React.useCallback(
    (opts) => {
      const message = String(opts?.message || "").trim();
      if (!message) return null;
      const type = String(opts?.type || "info").toLowerCase();
      const durationMs = clamp(opts?.durationMs ?? 1800, 900, 8000);
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = {
        id,
        type,
        message,
        createdAt: Date.now(),
        durationMs,
        action:
          opts?.action && typeof opts.action === "object"
            ? {
                label: String(opts.action.label || "Action"),
                onClick:
                  typeof opts.action.onClick === "function"
                    ? opts.action.onClick
                    : null,
              }
            : null,
        dismissLabel: String(opts?.dismissLabel || "Dismiss"),
        haptic: opts?.haptic,
      };
      setToasts((curr) => [toast, ...curr].slice(0, 4));
      const shouldHaptic =
        hapticsEnabled &&
        (toast.haptic === true ||
          toast.type === "reward" ||
          toast.type === "success");
      if (shouldHaptic) {
        // Tiny "pop"; keep it short and subtle.
        if (hasUserGesture) vibrate(15);
      }
      window.setTimeout(() => remove(id), durationMs);
      return id;
    },
    [hapticsEnabled, hasUserGesture, remove]
  );
  const once = React.useCallback(
    (key, opts, cooldownMs = 180_000) => {
      const k = String(key || "").trim();
      if (!k) return show(opts);
      const now = Date.now();
      const last = Number(lastByKeyRef.current[k] || 0);
      if (now - last < Math.max(0, Number(cooldownMs) || 0)) return null;
      lastByKeyRef.current[k] = now;
      return show(opts);
    },
    [show]
  );

  const api = React.useMemo(
    () => ({
      show,
      once,
      info: (message, durationMs) =>
        show({ type: "info", message, durationMs }),
      success: (message, durationMs) =>
        show({ type: "success", message, durationMs }),
      warn: (message, durationMs) =>
        show({ type: "warn", message, durationMs }),
      error: (message, durationMs) =>
        show({ type: "error", message, durationMs }),
      reward: (message, durationMs) =>
        show({ type: "reward", message, durationMs, haptic: true }),
    }),
    [once, show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast stack (fixed, non-blocking) */}
      <div className="pointer-events-none fixed right-3 bottom-3 z-[90] flex w-[min(420px,calc(100%-1.5rem))] flex-col gap-2">
        {toasts.map((t) => {
          const s = typeStyles(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border ${s.border} ${s.bg} ${s.glow} backdrop-blur-md`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-xs font-extrabold text-white"
                  aria-hidden
                >
                  {s.icon}
                </div>

                <div className={`min-w-0 flex-1 text-sm ${s.text}`}>
                  {t.message}
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-white/90 hover:bg-black/30"
                  onClick={() => remove(t.id)}
                >
                  {t.dismissLabel}
                </button>
              </div>

              {t.action?.label && t.action.onClick ? (
                <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-2">
                  <button
                    type="button"
                    className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white/15"
                    onClick={() => {
                      try {
                        t.action.onClick?.();
                      } finally {
                        remove(t.id);
                      }
                    }}
                  >
                    {t.action.label}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
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
