import React from "react";

export default function AdultTrainingCard({
  isPuppy,
  adultTrainingDoneToday,
  adultTrainingStreak,
  adultTrainingMisses,
}) {
  if (isPuppy) return null;

  return (
    <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-3 lg:p-4 shadow-lg shadow-emerald-900/40 space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-emerald-100">
        <span>Adult training cadence</span>
        <span className={adultTrainingDoneToday ? "text-emerald-300" : "text-amber-300"}>
          {adultTrainingDoneToday ? "Done today" : "Needs session"}
        </span>
      </div>
      <p className="text-xs text-emerald-100/80">
        Use Train "Sit" (or any command) once per real day to keep streaks alive.
      </p>
      <div className="flex items-center justify-between text-xs text-emerald-200/80">
        <span>Streak: {adultTrainingStreak}</span>
        <span>Misses: {adultTrainingMisses}</span>
      </div>
      {!adultTrainingDoneToday && (
        <p className="text-[0.65rem] text-amber-200/80">
          Skipping a day chips away at happiness. Log a session via the Train button.
        </p>
      )}
    </div>
  );
}
