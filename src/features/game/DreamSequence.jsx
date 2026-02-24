import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSettings,
  setDreamSequenceAutoDismiss,
  setDreamSequenceBackdropFx,
  setDreamSequenceShowMotifs,
  setDreamSequenceShowTip,
} from "@/redux/settingsSlice.js";

function getPrefersReducedMotion() {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  } catch {
    return false;
  }
}

function kindTone(kind) {
  const k = String(kind || "").toUpperCase();
  if (k === "NIGHTMARE") {
    return {
      border: "border-fuchsia-400/30",
      glow: "shadow-fuchsia-500/20",
      title: "text-fuchsia-100",
      badge: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100",
      bg: "from-fuchsia-950/40 via-zinc-950 to-zinc-950",
    };
  }

  if (k === "LUCID") {
    return {
      border: "border-emerald-400/35",
      glow: "shadow-emerald-500/20",
      title: "text-emerald-100",
      badge: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
      bg: "from-emerald-950/30 via-zinc-950 to-zinc-950",
    };
  }

  return {
    border: "border-sky-400/25",
    glow: "shadow-sky-500/15",
    title: "text-sky-100",
    badge: "border-sky-400/25 bg-sky-500/10 text-sky-100",
    bg: "from-sky-950/25 via-zinc-950 to-zinc-950",
  };
}

const AUTO_DISMISS_MS = 12_000;

export default function DreamSequence({ dream, onDismiss }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const closeBtnRef = useRef(null);
  const menuRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [autoDismissLeft, setAutoDismissLeft] = useState(null);

  const reduceMotionSetting = settings?.reduceMotion || "system";
  const prefersReducedMotion = useMemo(
    () => Boolean(getPrefersReducedMotion()),
    []
  );
  const reduceMotion =
    reduceMotionSetting === "on" ||
    (reduceMotionSetting !== "off" && prefersReducedMotion);

  const showMotifs = settings?.dreamSequenceShowMotifs !== false;
  const showTip = settings?.dreamSequenceShowTip !== false;
  const autoDismiss = Boolean(settings?.dreamSequenceAutoDismiss);
  const backdropFx = settings?.dreamSequenceBackdropFx !== false;

  const tone = useMemo(() => kindTone(dream?.kind), [dream?.kind]);

  useEffect(() => {
    if (!dream) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => window.clearTimeout(t);
  }, [dream]);

  useEffect(() => {
    if (!dream) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (showOptions) {
        setShowOptions(false);
      } else {
        onDismiss?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dream, onDismiss, showOptions]);

  useEffect(() => {
    if (!showOptions) return;
    const onPointerDown = (event) => {
      const el = menuRef.current;
      if (!el || el.contains(event.target)) return;
      setShowOptions(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showOptions]);

  useEffect(() => {
    if (!dream || !autoDismiss) {
      setAutoDismissLeft(null);
      return;
    }
    const startedAt = Date.now();
    setAutoDismissLeft(AUTO_DISMISS_MS);
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, AUTO_DISMISS_MS - elapsed);
      setAutoDismissLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        onDismiss?.();
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [autoDismiss, dream, onDismiss]);

  if (!dream) return null;

  const motifs = Array.isArray(dream?.motifs) ? dream.motifs : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${tone.bg} ${
          backdropFx && !reduceMotion ? "animate-pulse" : ""
        }`}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      {/* Floating watercolor blobs (pure CSS; disabled when reduced motion) */}
      {!reduceMotion && backdropFx ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-10 top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
          <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl animate-[float_12s_ease-in-out_infinite]" />
          <div className="absolute left-1/3 bottom-10 h-64 w-64 rounded-full bg-fuchsia-400/10 blur-3xl animate-[float_11s_ease-in-out_infinite]" />
        </div>
      ) : null}

      {/* Card */}
      <div
        className={`relative w-full max-w-xl rounded-[2rem] border ${tone.border} bg-zinc-950/80 backdrop-blur-md shadow-2xl ${tone.glow} p-5`}
        role="dialog"
        aria-modal="true"
        aria-label="Dream sequence"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Dream
            </div>
            <h2 className={`mt-1 text-lg font-extrabold ${tone.title}`}>
              {String(dream?.title || "A dream")}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.badge}`}
              >
                {String(dream?.kind || "DREAM")}
              </span>
              <span className="text-[11px] text-zinc-400">
                Press Esc to close
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowOptions((v) => !v)}
                className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-expanded={showOptions}
              >
                Options
              </button>

              {showOptions ? (
                <div className="absolute right-0 mt-2 w-56 space-y-2 rounded-2xl border border-white/10 bg-black/90 p-3 text-[11px] text-zinc-200 shadow-[0_16px_45px_rgba(0,0,0,0.45)]">
                  <ToggleRow
                    label="Backdrop FX"
                    checked={backdropFx}
                    onChange={(v) => dispatch(setDreamSequenceBackdropFx(v))}
                  />
                  <ToggleRow
                    label="Show motifs"
                    checked={showMotifs}
                    onChange={(v) => dispatch(setDreamSequenceShowMotifs(v))}
                  />
                  <ToggleRow
                    label="Show tips"
                    checked={showTip}
                    onChange={(v) => dispatch(setDreamSequenceShowTip(v))}
                  />
                  <ToggleRow
                    label="Auto-close"
                    checked={autoDismiss}
                    onChange={(v) => dispatch(setDreamSequenceAutoDismiss(v))}
                  />
                </div>
              ) : null}
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => onDismiss?.()}
              className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Close
            </button>
          </div>
        </div>

        <p className="mt-3 whitespace-pre-line text-sm text-zinc-200/90">
          {String(dream?.summary || "")}
        </p>

        {showMotifs && motifs.length ? (
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Motifs
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {motifs.slice(0, 8).map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-200"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {autoDismiss ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-zinc-300">
            <div className="flex items-center justify-between gap-3">
              <span>Auto-close</span>
              <span className="tabular-nums text-zinc-400">
                {Math.max(0, Math.ceil((autoDismissLeft || 0) / 1000))}s
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400/70 transition-[width]"
                style={{
                  width: `${Math.round(
                    ((autoDismissLeft || 0) / AUTO_DISMISS_MS) * 100
                  )}%`,
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => dispatch(setDreamSequenceAutoDismiss(false))}
              className="mt-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[10px] text-zinc-200 hover:bg-black/55"
            >
              Keep open
            </button>
          </div>
        ) : null}

        {showTip ? (
          <p className="mt-4 text-[11px] text-zinc-500">
            Tip: happy days can trigger lucid dreams; neglect can trigger
            nightmares.
          </p>
        ) : null}
      </div>

      {/* keyframes (scoped-ish via Tailwind arbitrary animation names) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-14px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
        className="h-4 w-4 accent-emerald-400"
      />
    </label>
  );
}
