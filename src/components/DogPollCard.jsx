import React from "react";

export default function DogPollCard({
  activePoll,
  pollCountdown,
  onPollResponse,
}) {
  return (
    <div className="bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-3 lg:p-4 shadow-lg shadow-indigo-900/40 space-y-3">
      {activePoll ? (
        <>
          <div className="flex items-center justify-between text-sm font-semibold text-indigo-100">
            <span>Dog poll in progress</span>
            <span className="text-xs text-indigo-200">
              {pollCountdown}s left
            </span>
          </div>
          <p className="text-sm text-indigo-50">{activePoll.prompt}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onPollResponse(true)}
              className="rounded-lg bg-emerald-400/90 text-black font-semibold py-2 hover:bg-emerald-300 transition"
            >
              Yes, do it
            </button>
            <button
              type="button"
              onClick={() => onPollResponse(false)}
              className="rounded-lg bg-indigo-300/80 text-black font-semibold py-2 hover:bg-indigo-200 transition"
            >
              Pass for now
            </button>
          </div>
          <p className="text-[0.65rem] text-indigo-200/80">
            Answering keeps happiness high. Ignoring polls makes the pup a
            little salty.
          </p>
        </>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-indigo-100">
            Dog polls idle
          </p>
          <p className="text-xs text-indigo-200/80">
            No active prompt. Another check-in will appear every few minutes to
            keep you honest.
          </p>
        </div>
      )}
    </div>
  );
}
