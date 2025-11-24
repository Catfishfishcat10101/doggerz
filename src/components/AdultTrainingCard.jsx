// src/features/game/components/AdultTrainingCard.jsx
// @ts-nocheck

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDogTraining,
  selectDogLifeStage,
  trainObedience,
} from "@/redux/dogSlice.js";

/**
 * Tiny util to make ISO dates readable.
 */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-300/90">
      <span className="text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-100">{value}</span>
    </div>
  );
}

export default function AdultTrainingCard() {
  const dispatch = useDispatch();

  const lifeStage = useSelector(selectDogLifeStage) || {
    stage: "PUPPY",
    label: "Puppy",
  };

  const training = useSelector(selectDogTraining) || {};
  const adult = training.adult || {
    lastCompletedDate: null,
    streak: 0,
    misses: 0,
    lastPenaltyDate: null,
  };

  const stageKey = (lifeStage.stage || "PUPPY").toUpperCase();
  const isPuppy = stageKey === "PUPPY";

  const handleLogSession = () => {
    // Uses your existing trainObedience reducer,
    // which internally calls completeAdultTrainingSession(...)
    dispatch(
      trainObedience({
        commandId: "routine_session",
        success: true,
        xp: 10,
        now: Date.now(),
      }),
    );
  };

  const streakLabel =
    adult.streak && adult.streak > 0
      ? `${adult.streak} day${adult.streak === 1 ? "" : "s"}`
      : "No streak yet";

  const missesLabel =
    adult.misses && adult.misses > 0
      ? `${adult.misses} missed day${adult.misses === 1 ? "" : "s"}`
      : "Clean";

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4 sm:p-5 shadow-[0_18px_50px_rgba(0,0,0,0.65)] backdrop-blur">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-wide text-emerald-200">
            Adult Training
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs text-zinc-400">
            Log daily obedience sessions to earn coins, keep happiness up, and
            build a long-term streak.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            {lifeStage.label || lifeStage.stage || "Puppy"}
          </span>
          {!isPuppy && adult.streak > 0 && (
            <span className="text-[10px] text-amber-200/80">
              🔥 {adult.streak} day streak
            </span>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="mt-3 sm:mt-4 space-y-2 rounded-xl bg-slate-900/90 p-3 ring-1 ring-slate-800/80">
        <StatRow
          label="Last session"
          value={formatDate(adult.lastCompletedDate)}
        />
        <StatRow label="Streak" value={streakLabel} />
        <StatRow label="Misses" value={missesLabel} />
        <StatRow
          label="Last penalty"
          value={formatDate(adult.lastPenaltyDate)}
        />
      </div>

      {/* Call to action */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleLogSession}
          disabled={isPuppy}
          className={[
            "inline-flex items-center justify-center rounded-full",
            "px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide",
            "transition-transform duration-150",
            "shadow-[0_10px_30px_rgba(16,185,129,0.45)]",
            isPuppy
              ? "opacity-40 cursor-not-allowed bg-emerald-800/60 text-emerald-100/70"
              : "bg-emerald-500 text-slate-950 hover:translate-y-[1px] hover:bg-emerald-400 active:translate-y-[2px]",
          ].join(" ")}
        >
          {!isPuppy
            ? "Log today's training session"
            : "Unlocks when pup grows up"}
        </button>

        <p className="text-[10px] sm:text-[11px] text-zinc-500">
          Each logged session feeds the streak system and gives your pup a small
          mood and coin boost.
        </p>
      </div>
    </section>
  );
}
