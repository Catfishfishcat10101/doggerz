// src/features/game/components/PottyTrackerCard.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * PottyTrackerCard - displays potty, cleanliness, and yard status.
 * @param {object} props
 * @param {boolean} props.isPuppy
 * @param {number} props.pottyLevel
 * @param {string} props.pottyStatusLabel
 * @param {boolean} props.pottyTrainingComplete
 * @param {number} props.pottyProgress
 * @param {number} props.pottySuccess
 * @param {number} props.pottyGoal
 * @param {string} props.cleanlinessLabel
 * @param {string} props.cleanlinessSummary
 * @param {string} props.yardStatusLabel
 */
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
  const pottyTrainingPct = Math.max(
    0,
    Math.min(100, Math.round((pottyProgress ?? 0) * 100)),
  );
  const showTraining = isPuppy && pottyGoal > 0;

  return (
    <div
      className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-3 lg:p-4 shadow-lg shadow-amber-900/40 space-y-3"
      role="region"
      aria-label="Potty, cleanliness, and yard status"
    >
      {/* Header */}
      <div className="flex items-center justify-between text-sm font-semibold text-amber-200">
        <span>Potty tracker</span>
        <span className="text-xs text-amber-300">{pottyStatusLabel}</span>
      </div>

      {/* Potty gauge */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-amber-200/80">
          <span>Gauge</span>
          <span>{pottyPct}%</span>
        </div>
        <div
          className="h-2 rounded-full bg-zinc-800 overflow-hidden"
          aria-label="Potty gauge"
        >
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-300"
            style={{ width: `${pottyPct}%` }}
            role="progressbar"
            aria-valuenow={pottyPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Potty gauge ${pottyPct}%`}
            tabIndex={0}
          />
        </div>
        <p className="text-[0.7rem] text-amber-100/80">
          Gauge rises slowly over time and faster after meals. Training slows
          accidents and keeps the meter lower.
        </p>
      </div>

      {/* Puppy potty training progress or badge */}
      {showTraining && (
        <div className="border border-amber-400/30 rounded-xl p-3 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-100 font-semibold">
            <span>Puppy potty training</span>
            {pottyTrainingComplete ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-900/70 px-3 py-1 text-xs text-emerald-300 font-bold"
                role="status"
                aria-label="Potty Trained Badge"
              >
                <span role="img" aria-label="Potty Trained">
                  🚽
                </span>{" "}
                Trained
              </span>
            ) : (
              <span>{`${pottySuccess}/${pottyGoal}`}</span>
            )}
          </div>
          {!pottyTrainingComplete && (
            <>
              <div
                className="h-2 rounded-full bg-amber-900/40 overflow-hidden"
                aria-label="Potty training progress"
              >
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${pottyTrainingPct}%` }}
                  role="progressbar"
                  aria-valuenow={pottyTrainingPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Potty training ${pottyTrainingPct}%`}
                  tabIndex={0}
                />
              </div>
              <p className="text-[0.65rem] text-amber-100/80">
                Complete potty breaks to finish training and slow future
                accidents.
              </p>
            </>
          )}
          {pottyTrainingComplete && (
            <p className="text-[0.65rem] text-emerald-300 font-semibold">
              Your pup now signals before every break. Accidents decay slower.
            </p>
          )}
        </div>
      )}

      {/* Cleanliness tier summary */}
      <div className="border border-emerald-400/30 rounded-xl p-3 bg-emerald-950/20 space-y-1">
        <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
          <span>Cleanliness tier</span>
          <span>{cleanlinessLabel}</span>
        </div>
        <p className="text-[0.65rem] text-emerald-100/80">
          {cleanlinessSummary}
        </p>
      </div>

      {/* Yard status */}
      <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/40 space-y-1">
        <p className="text-xs font-semibold text-lime-200">Yard status</p>
        <p className="text-sm text-lime-100">{yardStatusLabel}</p>
        <p className="text-[0.65rem] text-lime-300/80">
          Scoop the yard whenever piles stack up.
        </p>
      </div>
    </div>
  );
}

PottyTrackerCard.propTypes = {
  isPuppy: PropTypes.bool,
  pottyLevel: PropTypes.number,
  pottyStatusLabel: PropTypes.string,
  pottyTrainingComplete: PropTypes.bool,
  pottyProgress: PropTypes.number,
  pottySuccess: PropTypes.number,
  pottyGoal: PropTypes.number,
  cleanlinessLabel: PropTypes.string,
  cleanlinessSummary: PropTypes.string,
  yardStatusLabel: PropTypes.string,
};
