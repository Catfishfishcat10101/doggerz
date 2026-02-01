// src/pages/Potty.jsx
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes.js";
import { useToast } from "@/components/toastContext.js";
import { usePup } from "@/state/PupContext.jsx";
import PageShell from "@/components/PageShell.jsx";
import EmptySlate from "@/components/EmptySlate.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSettings,
  setPottyAutoReturn,
  setPottyConfirmAccidents,
  setPottyShowXpTools,
  setPottyTipsExpanded,
} from "@/redux/settingsSlice.js";

function describePottyTraining(training) {
  const t = Math.round(Number(training ?? 0));

  if (t >= 100) {
    return "Fully Potty Trained!";
  }
  if (t >= 75) {
    return "Mostly trained! Just a few more trips needed.";
  }
  if (t >= 50) {
    return "Well hot dog! Keep taking them out after meals and naps.";
  }
  if (t > 0) {
    return "You got this, Young pups will go often!";
  }
  return "Not potty trained yet... Expect accidents until a routine forms.";
}

function formatRelativeTime(date) {
  if (!date || Number.isNaN(date.getTime?.())) return "";
  const diffMs = Date.now() - date.getTime();
  if (!Number.isFinite(diffMs)) return "";
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function Potty() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { pup, addXP, removeXP, logPottySuccess, logAccident } = usePup();
  const dog = pup;
  const settings = useSelector(selectSettings);

  // If there is no dog at all, send them to adopt
  if (!dog) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-lg">
          <EmptySlate
            kicker="Potty Training"
            title="No pup yet"
            description="You’ll need to adopt a Doggerz pup before you can start potty training."
            primaryLabel="Adopt your pup"
            onPrimary={() => navigate(PATHS.ADOPT)}
            backTo={PATHS.HOME}
            backLabel="Back to home"
          />
        </div>
      </PageShell>
    );
  }

  const trainingGoal = Number(dog.pottyGoal || 0);
  const trainingCount = Number(dog.pottySuccesses || 0);
  const training = Number(dog.pottyTrainingPct || 0);
  const accidents = Number(dog.accidents || 0);
  const lastSuccessAt = dog.lastPottySuccessAt
    ? new Date(dog.lastPottySuccessAt)
    : null;
  const lastAccidentAt = dog.lastPottyAccidentAt
    ? new Date(dog.lastPottyAccidentAt)
    : null;
  const autoReturn = settings?.pottyAutoReturn === true;
  const confirmAccidents = settings?.pottyConfirmAccidents !== false;
  const showXPTools = settings?.pottyShowXpTools === true;
  const expandedTips = settings?.pottyTipsExpanded !== false;

  const summaryText = describePottyTraining(training);
  const remainingTrips = Math.max(0, trainingGoal - trainingCount);
  const hasGoal = trainingGoal > 0;
  const successLabel = hasGoal
    ? `${trainingCount}/${trainingGoal}`
    : `${trainingCount}`;
  const progressPct = Math.max(0, Math.min(100, training));
  const lastSuccessAgo = lastSuccessAt ? formatRelativeTime(lastSuccessAt) : "";
  const lastAccidentAgo = lastAccidentAt
    ? formatRelativeTime(lastAccidentAt)
    : "";

  const onPottyWalk = () => {
    const nextCount = trainingGoal
      ? Math.min(trainingGoal, trainingCount + 1)
      : trainingCount + 1;
    const nextPct = trainingGoal
      ? Math.round((nextCount / Math.max(1, trainingGoal)) * 100)
      : null;

    logPottySuccess();
    toast.reward(
      `Potty trip logged (+2 XP)${
        typeof nextPct === "number" ? ` • Training ${nextPct}%` : ""
      }`
    );
    if (autoReturn) {
      window.setTimeout(() => navigate(PATHS.GAME), 900);
    }
  };

  const onAccident = () => {
    if (confirmAccidents) {
      const ok = window.confirm(
        "Log an indoor accident? This will slow training progress."
      );
      if (!ok) return;
    }
    logAccident();
    toast.warn("Accident logged. Keep the routine steady.");
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Potty Training
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Potty plan for {dog.name || "your pup"}
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-xl">
            Doggerz quietly tracks potty-training progress in the background
            every time you take your dog outside after eating, playing, or
            waking up.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-200">
              Training {progressPct}%
            </span>
            <span className="rounded-full border border-white/15 bg-white/60 px-3 py-1 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
              Accidents {accidents}
            </span>
            {lastSuccessAgo ? (
              <span className="rounded-full border border-white/15 bg-white/60 px-3 py-1 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                Last success {lastSuccessAgo}
              </span>
            ) : null}
          </div>
        </header>

        {/* Status card */}
        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-4 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Current training level
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {training}% potty trained
              </p>
            </div>

            <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {summaryText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Total accidents
              </p>
              <p className="text-lg font-semibold text-rose-300">{accidents}</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Each indoor accident slows training.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Successful trips
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {lastSuccessAt
                  ? lastSuccessAt.toLocaleString()
                  : "No logged potty trips yet."}
              </p>
              {lastSuccessAgo ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
                  {lastSuccessAgo}
                </p>
              ) : null}
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Regular outdoor trips help build a routine.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Last accident:
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {lastAccidentAt
                  ? lastAccidentAt.toLocaleString()
                  : "No accidents recorded yet."}
              </p>
              {lastAccidentAgo ? (
                <p className="text-[11px] text-rose-300">{lastAccidentAgo}</p>
              ) : null}
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Consistent & quick cleanups helps training progress.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Quick log
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Log a successful outdoor trip or an accident to keep stats
                accurate.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
              <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/60">
                Progress: {successLabel}
              </span>
              {hasGoal ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-200">
                  {remainingTrips === 0
                    ? "Training complete"
                    : `${remainingTrips} trips left`}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPottyWalk}
              className="rounded-full px-4 py-2 text-xs font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
            >
              Potty Walk (Success) • +2 XP
            </button>

            <button
              type="button"
              onClick={onAccident}
              className="rounded-full px-4 py-2 text-xs font-semibold border border-rose-400/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15 transition"
            >
              Log accident
            </button>

            <button
              type="button"
              onClick={() => navigate(PATHS.GAME)}
              className="rounded-full px-4 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Back to yard
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoReturn}
                onChange={(e) => dispatch(setPottyAutoReturn(e.target.checked))}
              />
              Auto-return to yard after success
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirmAccidents}
                onChange={(e) =>
                  dispatch(setPottyConfirmAccidents(e.target.checked))
                }
              />
              Confirm accident logging
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              XP controls
            </p>
            <button
              type="button"
              onClick={() => dispatch(setPottyShowXpTools(!showXPTools))}
              className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/30"
            >
              {showXPTools ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Current XP: <span className="font-semibold">{dog.xp ?? 0}</span>
          </p>
          {showXPTools ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addXP(5)}
                className="rounded-full px-4 py-2 text-xs font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
              >
                XP +5
              </button>
              <button
                type="button"
                onClick={() => removeXP(5)}
                className="rounded-full px-4 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
              >
                XP -5
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Hidden to keep the page focused.
            </p>
          )}
        </section>

        {/* Tips / guide section */}
        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Training Tips
            </p>
            <button
              type="button"
              onClick={() => dispatch(setPottyTipsExpanded(!expandedTips))}
              className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/30"
            >
              {expandedTips ? "Collapse" : "Expand"}
            </button>
          </div>
          {expandedTips ? (
            <ul className="list-disc list-inside text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <li>
                Take your pup out{" "}
                <span className="font-semibold">right after</span> feeding, play
                sessions, and naps.
              </li>
              <li>
                Use the <span className="font-semibold">Potty Walk</span> button
                on the main game screen when you successfully go outside.
              </li>
              <li>
                Try to keep a consistent schedule. Irregular times make
                potty-training slower and more confusing.
              </li>
              <li>
                Don&apos;t punish accidents; clean them up and give more chances
                to succeed outside.
              </li>
            </ul>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Tips are collapsed. Expand to see the full list.
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate(PATHS.GAME)}
          className="text-xs text-emerald-700 hover:text-emerald-600 underline underline-offset-4 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          ← Back to your yard
        </button>
      </div>
    </PageShell>
  );
}
