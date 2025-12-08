// src/components/ToastContainer.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  // Simple dedupe: remember last message and timestamp to avoid rapid duplicates
  const lastRef = React.useRef({ msg: null, at: 0 });

  useEffect(() => {
    function onAnnounce(e) {
      const detail = e?.detail || {};
      const message = String(detail.message || "");
      const type = String(detail.type || "info");
      const actions = Array.isArray(detail.actions) ? detail.actions : [];
      if (!message) return;

      const now = Date.now();
      const last = lastRef.current;
      // If identical message received within 3s, ignore
      if (last.msg === message && now - last.at < 3000) return;
      lastRef.current = { msg: message, at: now };

      const id = now + Math.random();
      setToasts((t) => [...t, { id, message, type, actions }]);
      // auto-remove after 5s
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 5000);
    }

    window.addEventListener("app-announce", onAnnounce);
    return () => window.removeEventListener("app-announce", onAnnounce);
  }, []);

  if (!toasts.length) return null;

  const Icon = ({ type }) => {
    // small inline SVG set
    if (type === "success")
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    if (type === "warn")
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="currentColor"
            strokeWidth="0"
            fill="currentColor"
          />
          <path
            d="M12 9v4"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 17h.01"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    if (type === "error")
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M18.36 6.64L6.64 18.36M6.64 6.64l11.72 11.72"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    // default info
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8v.01M12 12v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div aria-hidden className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const bg =
            t.type === "success"
              ? "bg-emerald-700 text-white"
              : t.type === "warn" || t.type === "warning"
                ? "bg-amber-600 text-black"
                : t.type === "error"
                  ? "bg-rose-700 text-white"
                  : t.type === "heart"
                    ? "bg-pink-600 text-white"
                    : t.type === "star"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-white";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${bg} max-w-xs w-full px-4 py-3 rounded-lg shadow-lg flex items-start gap-3`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon type={t.type} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{t.message}</div>
                {t.actions && t.actions.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {t.actions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          try {
                            window.dispatchEvent(
                              new CustomEvent("app-toast-action", {
                                detail: { action: a, toastId: t.id },
                              }),
                            );
                          } catch (e) {}
                        }}
                        className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/30"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
