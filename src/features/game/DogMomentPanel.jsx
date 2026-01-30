// src/features/game/DogMomentPanel.jsx
// Lightweight micro-story / "dog moment" panel powered by the existing poll system.

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { respondToDogPoll, selectDogPolls } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";

function formatSecondsLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s <= 0) return "now";
  if (s === 1) return "1s";
  return `${s}s`;
}

export default function DogMomentPanel() {
  const dispatch = useDispatch();
  const polls = useSelector(selectDogPolls);
  const settings = useSelector(selectSettings);
  const active = polls?.active || null;
  const activeId = active?.id || null;

  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const reduceMotion =
      settings?.reduceMotion === "on" ||
      (settings?.reduceMotion !== "off" &&
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document?.hidden) return;
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeId, active, settings?.reduceMotion]);

  if (!active) return null;

  const expiresAt = Number(active.expiresAt || 0);
  const msLeft = expiresAt ? Math.max(0, expiresAt - now) : null;
  const totalMs = expiresAt && active?.createdAt
    ? Math.max(1, expiresAt - Number(active.createdAt))
    : null;
  const progressPct =
    totalMs && msLeft != null
      ? Math.max(0, Math.min(100, Math.round((msLeft / totalMs) * 100)))
      : null;
  const isUrgent = typeof msLeft === "number" && msLeft <= 5000;
  const isExpired = typeof msLeft === "number" && msLeft <= 0;

  return (
    <section
      className="dz-moment-card rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/80">
            Micro-story moment
          </div>
          <div className="mt-1 text-sm font-extrabold text-white">
            {active.prompt}
          </div>
          {msLeft != null ? (
            <div
              className={`mt-1 text-[11px] ${
                isUrgent ? "text-amber-200" : "text-zinc-300/80"
              }`}
            >
              Choose before{" "}
              <span className="font-semibold">
                {formatSecondsLeft(msLeft)}
              </span>
              .
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-zinc-300/80">
              Pick the response that feels right.
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Mood
          </div>
          <div className="text-xs font-semibold text-zinc-200">Pup vibes</div>
        </div>
      </div>

      {progressPct != null ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/40">
          <div
            className={`h-full rounded-full ${
              isUrgent ? "bg-amber-400/80" : "bg-emerald-400/70"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isExpired}
          onClick={() =>
            dispatch(
              respondToDogPoll({
                accepted: true,
                reason: "ACCEPT",
                now: Date.now(),
              })
            )
          }
          className={`rounded-2xl px-3 py-2 text-xs font-extrabold border transition ${
            isExpired
              ? "border-white/10 bg-white/5 text-zinc-500 cursor-not-allowed"
              : "border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          disabled={isExpired}
          onClick={() =>
            dispatch(
              respondToDogPoll({
                accepted: false,
                reason: "DECLINE",
                now: Date.now(),
              })
            )
          }
          className={`rounded-2xl px-3 py-2 text-xs font-semibold border transition ${
            isExpired
              ? "border-white/10 bg-white/5 text-zinc-500 cursor-not-allowed"
              : "border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35"
          }`}
        >
          Not now
        </button>
      </div>

      {isExpired ? (
        <div className="mt-2 text-[11px] text-zinc-400">
          This moment has passed.
        </div>
      ) : null}
    </section>
  );
}
