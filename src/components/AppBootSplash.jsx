// src/components/AppBootSplash.jsx

import * as React from "react";

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function AppBootSplash({
  progress01 = 0,
  label = "Warming up the yard…",
}) {
  const p = clamp01(progress01);
  const pct = Math.round(p * 100);

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        background: "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))",
        color: "var(--text-main, #e5e7eb)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Doggerz"
    >
      <div className="mx-auto flex h-full w-full max-w-[760px] flex-col items-center justify-center px-5">
        <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-5 shadow-[0_18px_60px_rgba(0,0,0,.55)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div
                className="text-3xl font-extrabold tracking-[0.18em]"
                style={{
                  textShadow: "0 10px 30px rgba(0,0,0,0.55)",
                }}
              >
                DOGGERZ
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.28em] text-white/70">
                Adopt • Train • Thrive
              </div>
            </div>

            <div
              className="h-10 w-10 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(34,197,94,.85), rgba(249,115,22,.75), rgba(2,6,23,.35))",
                boxShadow:
                  "0 10px 24px rgba(249,115,22,.28), 0 10px 24px rgba(34,197,94,.18)",
              }}
              aria-hidden
            />
          </div>

          {/* Skeleton stage */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-40 w-full animate-pulse rounded-lg bg-white/10" />
              <div className="mt-3 h-3 w-40 animate-pulse rounded bg-white/10" />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-white/10" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 animate-pulse rounded-full bg-white/10" />
                <div className="h-8 flex-1 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-white/80">{label}</div>
              <div className="text-xs tabular-nums text-white/60">{pct}%</div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, rgba(34,197,94,.95), rgba(249,115,22,.95))",
                  boxShadow: "0 0 18px rgba(249,115,22,.28)",
                  transition: "width 220ms ease",
                }}
              />
            </div>
            <div className="mt-2 text-[11px] leading-5 text-white/55">
              Tip: first load caches sprites & backgrounds for snappy replays.
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-white/45">
          If loading takes too long, check your connection — we’ll still boot with placeholders.
        </div>
      </div>
    </div>
  );
}
