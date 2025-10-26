// src/components/Features/SettingsModal.jsx
import React, { useEffect, useRef } from "react";

/* ---------------------- minimal persistent state hooks ---------------------- */
function useLocalStorageState(key, initialValue) {
  const read = () => {
    try {
      const v = localStorage.getItem(key);
      return v == null ? initialValue : JSON.parse(v);
    } catch {
      return initialValue;
    }
  };
  const [value, setValue] = React.useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // cross-tab sync
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: JSON.stringify(value) }),
      );
    } catch {}
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue != null ? JSON.parse(e.newValue) : initialValue);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initialValue]);

  return [value, setValue];
}

function useSessionStorageState(key, initialValue) {
  const read = () => {
    try {
      const v = sessionStorage.getItem(key);
      return v == null ? initialValue : JSON.parse(v);
    } catch {
      return initialValue;
    }
  };
  const [value, setValue] = React.useState(read);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: JSON.stringify(value) }),
      );
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

/* --------------------------------- modal ---------------------------------- */
export default function SettingsModal({ onClose }) {
  // settings
  const [soundOn, setSoundOn] = useLocalStorageState("doggerz_sound_on", true);
  const [themeDark, setThemeDark] = useLocalStorageState(
    "doggerz_theme_dark",
    false,
  );
  const [, setBuff] = useSessionStorageState("buff", null);
  const [, setYardSkin] = useSessionStorageState("yardSkin", "default");

  // apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (themeDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [themeDark]);

  // focus trap + ESC and backdrop close
  const containerRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    firstFocusRef.current?.focus?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab") {
        // basic trap
        const focusables = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables?.length) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      window.dispatchEvent(
        new CustomEvent("doggerz:soundchange", { detail: { enabled: next } }),
      );
    } catch {}
  };

  const clearSession = () => {
    setBuff(null);
    setYardSkin("default");
    // tiny haptic nudge if available
    navigator?.vibrate?.(15);
  };

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center p-4 z-50"
      onMouseDown={onBackdrop}
      aria-labelledby="settings-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={containerRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 w-full max-w-md px-safe py-safe p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            id="settings-title"
            className="text-lg font-semibold text-rose-900 dark:text-rose-100"
          >
            Settings
          </h3>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className="icon-btn"
            ref={firstFocusRef}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-slate-900 dark:text-slate-100">
          <button className="w-full btn" onClick={toggleSound}>
            Sound: {soundOn ? "On 🔊" : "Off 🔇"}
          </button>

          <button
            className="w-full btn"
            onClick={() => setThemeDark((v) => !v)}
            title="Toggle dark theme"
          >
            Theme: {themeDark ? "Dark 🌙" : "Light ☀️"}
          </button>

          <button
            className="w-full btn"
            onClick={clearSession}
            title="Reset temporary session settings"
          >
            Clear Session Buffs / Yard Skin
          </button>

          {/* Optional: clear all local data including memory log */}
          <button
            className="w-full btn"
            onClick={() => {
              if (
                confirm(
                  "Clear local data (sounds/theme/memory log)? This cannot be undone.",
                )
              ) {
                try {
                  localStorage.removeItem("doggerz_sound_on");
                  localStorage.removeItem("doggerz_theme_dark");
                  localStorage.removeItem("doggerz:memoryLog");
                  setBuff(null);
                  setYardSkin("default");
                  navigator?.vibrate?.(20);
                } catch {}
              }
            }}
          >
            Clear Local Data
          </button>
        </div>

        <div className="mt-6 text-right">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
/* ----------------------------------------------------------------------- */
