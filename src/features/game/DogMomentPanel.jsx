// src/features/game/DogMomentPanel.jsx
// Lightweight micro-story / "dog moment" panel powered by the existing poll system.

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { respondToDogPoll, selectDogPolls } from "@/redux/dogSlice.js";

function formatSecondsLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s <= 0) return "now";
  if (s === 1) return "1s";
  return `${s}s`;
}

export default function DogMomentPanel() {
  const dispatch = useDispatch();
  const polls = useSelector(selectDogPolls);
  const active = polls?.active || null;
  const activeId = active?.id || null;

  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [activeId, active]);

  if (!active) return null;

  const expiresAt = Number(active.expiresAt || 0);
  const msLeft = expiresAt ? expiresAt - now : 0;

  return (
    <section className="dz-moment-card rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/80">
            Micro-story moment
          </div>
          <div className="mt-1 text-sm font-extrabold text-white">
            {active.prompt}
          </div>
          <div className="mt-1 text-[11px] text-zinc-300/80">
            Choose before{" "}
            <span className="font-semibold">{formatSecondsLeft(msLeft)}</span>.
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Mood
          </div>
          <div className="text-xs font-semibold text-zinc-200">Pup vibes</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            dispatch(
              respondToDogPoll({
                accepted: true,
                reason: "ACCEPT",
                now: Date.now(),
              })
            )
          }
          className="rounded-2xl px-3 py-2 text-xs font-extrabold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch(
              respondToDogPoll({
                accepted: false,
                reason: "DECLINE",
                now: Date.now(),
              })
            )
          }
          className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
        >
          Not now
        </button>
      </div>
    </section>
  );
}
