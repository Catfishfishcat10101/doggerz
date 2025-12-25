// src/components/DogPollCard.jsx
import * as React from "react";

export default function DogPollCard({
  activePoll,
  pollCountdown,
  onPollResponse,
}) {
  const countdownLabel =
    typeof pollCountdown === "number" ? `${pollCountdown}s left` : "…";

  return (
    <div className="bg-black/70 border border-emerald-500/30 rounded-2xl p-3 lg:p-4 shadow-[0_0_25px_rgba(34,197,94,0.25)] space-y-3">
      {activePoll ? (
        <>
          <div className="flex items-center justify-between text-sm font-semibold text-emerald-100">
            <span>Dog poll in progress</span>
            <span className="text-[0.7rem] text-emerald-300">
              {countdownLabel}
            </span>
          </div>

          <p className="text-sm text-zinc-100">{activePoll.prompt}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onPollResponse(true)}
              className="rounded-lg bg-emerald-500 text-black font-semibold py-2 hover:bg-emerald-400 transition"
            >
              Yes, do it
            </button>
            <button
              type="button"
              onClick={() => onPollResponse(false)}
              className="rounded-lg bg-zinc-800 text-zinc-100 font-semibold py-2 hover:bg-zinc-700 transition"
            >
              Pass for now
            </button>
          </div>

          <p className="text-[0.65rem] text-zinc-400">
            Answering keeps happiness high. Ignoring polls makes your pup a
            little salty.
          </p>
        </>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-100">Dog polls idle</p>
          <p className="text-xs text-zinc-400">
            No active prompt. Another check-in will appear every few minutes to
            keep you honest.
          </p>
        </div>
      )}
    </div>
  );
}
