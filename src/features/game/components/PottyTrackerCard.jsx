import React from "react";

export default function PottyTrackerCard({
  isPuppy,
  pottyLevel,
  pottyStatusLabel,
  pottyTrainingComplete,
  pottyProgress,
  pottySuccess,
  pottyGoal,
  cleanlinessLabel,
  cleanlinessSummary,
  yardStatusLabel,
}) {
  const pottyPct = Math.max(0, Math.min(100, Math.round(pottyLevel ?? 0)));
  const pottyTrainingPct = Math.max(0, Math.min(100, Math.round((pottyProgress ?? 0) * 100)));
  const showTraining = isPuppy && pottyGoal > 0;

  return (
    <div className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-3 lg:p-4 shadow-lg shadow-amber-900/40 space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold text-amber-200">
        <span>Potty tracker</span>
        <span className="text-xs text-amber-300">{pottyStatusLabel}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-amber-200/80">
          <span>Gauge</span>
          <span>{pottyPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pottyPct}%` }} />
        </div>
        <p className="text-[0.7rem] text-amber-100/80">
          Go potty unlocks at 25% and prevents emergency accidents.
        </p>
      </div>
      {showTraining && (
        <div className="border border-amber-400/30 rounded-xl p-3 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-100 font-semibold">
            <span>Puppy potty training</span>
            <span>{pottyTrainingComplete ? "Completed" : `${pottySuccess}/${pottyGoal}`}</span>
          </div>
          <div className="h-2 rounded-full bg-amber-900/40">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${pottyTrainingPct}%` }}
            />
          </div>
          <p className="text-[0.65rem] text-amber-100/80">
            {pottyTrainingComplete
              ? "Your pup now signals before every break. Accidents decay slower."
              : "Complete potty breaks to finish training and slow future accidents."}
          </p>
        </div>
      )}
      <div className="border border-emerald-400/30 rounded-xl p-3 bg-emerald-950/20 space-y-1">
        <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
          <span>Cleanliness tier</span>
          <span>{cleanlinessLabel}</span>
        </div>
        <p className="text-[0.65rem] text-emerald-100/80">{cleanlinessSummary}</p>
      </div>
      <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/40">
        <p className="text-xs font-semibold text-lime-200">Yard status</p>
        <p className="text-sm text-lime-100">{yardStatusLabel}</p>
        <p className="text-[0.65rem] text-lime-300/80">
          Scoop the yard whenever piles stack up to keep cleanliness high.
        </p>
      </div>
    </div>
  );
}
