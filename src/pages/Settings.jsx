// src/pages/Settings.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadState } from "../redux/dogSlice"; // used for import
import { selectUid } from "../redux/userSlice"; // optional; falls back if missing
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

/**
 * Settings
 * Enterprise-grade toggles with real side effects:
 * - Theme: light/dark/system (writes to <html data-theme>)
 * - Audio: mute + volume (persists, emits custom event)
 * - Motion: follow system or force reduced motion
 * - Notifications: request permission + status surface
 * - PWA: install prompt handler
 * - Data: export/import dog state, clear cache, reset local storage
 * - Account: show uid/email, sign out
 */

export default function Settings() {
  const dispatch = useDispatch();
  const uid = useSelector((s) => s.user?.uid ?? s.user?.id ?? s.user?.currentUser?.uid ?? null);
  const userEmail = useSelector((s) => s.user?.email ?? s.user?.currentUser?.email ?? null);
  const dogState = useSelector((s) => s.dog ?? {});

  /* ── Theme ─────────────────────────────────────────────────────────────── */
  const [theme, setTheme] = useLocalStorage("theme", "system"); // "light" | "dark" | "system"
  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const next = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    root.setAttribute("data-theme", next); // pair with your CSS: :root[data-theme="dark"] { ... }
  }, [theme]);

  /* ── Audio ─────────────────────────────────────────────────────────────── */
  const [audioEnabled, setAudioEnabled] = useLocalStorage("audio.enabled", true);
  const [volume, setVolume] = useLocalStorage("audio.volume", 0.65); // 0..1
  // Broadcast to app
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("settings:audio", { detail: { enabled: audioEnabled, volume } }));
  }, [audioEnabled, volume]);

  /* ── Motion ────────────────────────────────────────────────────────────── */
  const [motion, setMotion] = useLocalStorage("motion", "system"); // "system" | "reduce" | "allow"
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-motion", motion);
  }, [motion]);

  /* ── Notifications ─────────────────────────────────────────────────────── */
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const requestNotifications = async () => {
    try {
      if (!("Notification" in window)) {
        setNotifStatus("unsupported");
        return;
      }
      const res = await Notification.requestPermission();
      setNotifStatus(res);
    } catch {
      // no-op
    }
  };

  /* ── PWA install (beforeinstallprompt) ─────────────────────────────────── */
  const deferredPromptRef = useRef(null);
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  const handleInstall = async () => {
    const p = deferredPromptRef.current;
    if (p?.prompt) {
      await p.prompt();
      deferredPromptRef.current = null;
      setCanInstall(false);
    }
  };

  /* ── Data: Export / Import / Clear ─────────────────────────────────────── */
  const exportData = useCallback(() => {
    try {
      const payload = { version: 1, exportedAt: new Date().toISOString(), state: dogState };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doggerz-save-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  }, [dogState]);

  const importRef = useRef(null);
  const importData = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const next = json?.state ?? json;
      if (!next || typeof next !== "object") throw new Error("Invalid save");
      dispatch(loadState(next));
    } catch (e) {
      alert("Failed to import save. Make sure the file is a Doggerz export.");
    }
  };

  const clearCaches = async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Also clear SW cache by asking SW to skip waiting next activation if relevant
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
      alert("Cache cleared. Reload recommended.");
    } catch {
      alert("Could not clear caches in this environment.");
    }
  };

  const resetLocal = () => {
    try {
      // Keep auth/session but clear app-local keys
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("audio.") || k === "theme" || k === "motion" || k.startsWith("doggerz_")) {
          localStorage.removeItem(k);
        }
      });
      alert("Local settings reset. Reload to apply everywhere.");
    } catch {}
  };

  /* ── Account ───────────────────────────────────────────────────────────── */
  const onLogout = async () => {
    try { await signOut(auth); } catch {}
  };

  /* ── Derived labels ────────────────────────────────────────────────────── */
  const notifLabel = useMemo(() => {
    if (notifStatus === "unsupported") return "Notifications unsupported";
    if (notifStatus === "granted") return "Notifications enabled";
    if (notifStatus === "denied") return "Notifications blocked (browser)";
    return "Notifications not requested";
  }, [notifStatus]);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-emerald-900">Settings</h1>

      {/* THEME */}
      <Section title="Appearance" desc="Deterministic theming for consistent brand expression.">
        <RadioRow
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
        <Hint>Uses <code>data-theme</code> on <code>&lt;html&gt;</code>. Add CSS for <code>[data-theme="dark"]</code>.</Hint>
      </Section>

      {/* AUDIO */}
      <Section title="Audio" desc="Operationalize audible feedback and haptics parity.">
        <Toggle
          label="Enable sound effects"
          checked={audioEnabled}
          onChange={setAudioEnabled}
        />
        <Slider
          label="Master volume"
          min={0}
          max={100}
          step={1}
          value={Math.round((volume ?? 0) * 100)}
          onChange={(v) => setVolume(Number(v) / 100)}
          disabled={!audioEnabled}
        />
        <Hint>We broadcast <code>settings:audio</code> events so game systems can adapt in real time.</Hint>
      </Section>

      {/* MOTION */}
      <Section title="Motion" desc="Accessibility guardrails for animation density.">
        <RadioRow
          label="Motion preference"
          value={motion}
          onChange={setMotion}
          options={[
            { value: "system", label: "Follow system" },
            { value: "reduce", label: "Force reduced motion" },
            { value: "allow", label: "Allow animation" },
          ]}
        />
        <Hint>We set <code>data-motion</code> for your CSS to switch animations.</Hint>
      </Section>

      {/* NOTIFICATIONS */}
      <Section title="Notifications" desc="Surface value at the right time without spamming.">
        <div className="flex items-center justify-between rounded-xl border bg-white p-3">
          <div>
            <div className="font-medium text-emerald-900">Browser notifications</div>
            <div className="text-xs text-emerald-900/70">{notifLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            {notifStatus !== "unsupported" && notifStatus !== "granted" && (
              <button
                className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 active:scale-95"
                onClick={requestNotifications}
              >
                Request permission
              </button>
            )}
          </div>
        </div>
        <Hint>No push subscription yet—this toggles the permission plumbing only.</Hint>
      </Section>

      {/* PWA */}
      <Section title="Install" desc="Make it launch like a native app.">
        <div className="flex items-center justify-between rounded-xl border bg-white p-3">
          <div>
            <div className="font-medium text-emerald-900">Install Doggerz</div>
            <div className="text-xs text-emerald-900/70">
              {canInstall ? "Ready to install via browser prompt." : "Install prompt becomes available when the app is eligible."}
            </div>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            onClick={handleInstall}
            disabled={!canInstall}
          >
            Install
          </button>
        </div>
      </Section>

      {/* DATA */}
      <Section title="Data" desc="Customer-grade portability and recovery.">
        <div className="grid sm:grid-cols-2 gap-2">
          <button
            className="px-3 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
            onClick={exportData}
          >
            ⬇ Export save
          </button>
          <div className="flex items-stretch gap-2">
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="flex-1 rounded-xl border bg-white text-sm p-2 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:bg-white hover:file:bg-slate-50"
              onChange={(e) => importData(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          <button
            className="px-3 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
            onClick={clearCaches}
          >
            ♻ Clear cache (SW)
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
            onClick={resetLocal}
          >
            🧹 Reset local settings
          </button>
        </div>
        <Hint>Import expects a Doggerz export JSON. We only overwrite the dog state, not account info.</Hint>
      </Section>

      {/* ACCOUNT */}
      <Section title="Account" desc="Identity & session controls.">
        <div className="rounded-xl border bg-white p-3 space-y-1">
          <div className="text-sm">
            <span className="text-emerald-900/70">User ID:</span>{" "}
            <code className="font-mono">{uid || "guest"}</code>
          </div>
          <div className="text-sm">
            <span className="text-emerald-900/70">Email:</span>{" "}
            <span>{userEmail || "—"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {uid ? (
            <button
              className="px-3 py-2 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
              onClick={onLogout}
            >
              ⎋ Sign out
            </button>
          ) : (
            <a
              href="/login"
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 text-center"
            >
              🔐 Sign in
            </a>
          )}
        </div>
      </Section>
    </main>
  );
}

/* ────────────────────── UI primitives ────────────────────── */

function Section({ title, desc, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-emerald-900">{title}</h2>
        {desc && <p className="text-sm text-emerald-900/70">{desc}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border bg-white p-3">
      <span className="font-medium text-emerald-900">{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-emerald-600"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  );
}

function RadioRow({ label, value, onChange, options }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-sm font-medium text-emerald-900 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange?.(opt.value)}
              className={[
                "px-3 py-1.5 rounded-lg border",
                active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-slate-50",
              ].join(" ")}
              type="button"
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Slider({ label, min = 0, max = 100, step = 1, value, onChange, disabled }) {
  return (
    <label className="block rounded-xl border bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-emerald-900">{label}</span>
        <span className="text-sm text-emerald-900/70 font-mono">{value}</span>
      </div>
      <input
        type="range"
        className="w-full accent-emerald-600 mt-2"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value)}
      />
    </label>
  );
}

function Hint({ children }) {
  return <p className="text-xs text-emerald-900/60">{children}</p>;
}

/* ────────────────────── hooks ────────────────────── */

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}
// EOF