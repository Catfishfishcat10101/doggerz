// src/pages/Potty.jsx
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch, useStore } from "react-redux";

import { PATHS } from "@/app/routes.js";
import PageShell from "@/components/layout/PageShell.jsx";
import { PageFooter, PageHeader } from "@/components/layout/PageSections.jsx";
import EmptySlate from "@/components/ui/EmptySlate.jsx";
import { useToast } from "@/state/toastContext.js";
import { useDog } from "@/hooks/useDogState.js";
import {
  addXp,
  goPotty,
  recordAccident,
  removeXp,
  simulationTick,
} from "@/store/dogSlice.js";
import {
  selectSettings,
  setPottyAutoReturn,
  setPottyConfirmAccidents,
  setPottyShowXpTools,
  setPottyTipsExpanded,
} from "@/store/settingsSlice.js";
import {
  selectNextProgressionMilestone,
  selectPottyTrainingTrack,
  selectUnlockedFeatures,
} from "@/features/preogression/progressionSelectors.js";
import {
  buildPottyGuidanceModel,
  buildTrainingRoadmapModel,
} from "@/features/training/trainingRoadmap.js";

const URGENCY_STYLES = Object.freeze({
  steady: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  soon: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  urgent: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  critical: "border-rose-400/30 bg-rose-500/10 text-rose-100",
});

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
  const store = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const dog = useDog();
  const settings = useSelector(selectSettings);
  const pottyTrack = useSelector(selectPottyTrainingTrack);
  const unlockedFeatures = useSelector(selectUnlockedFeatures);
  const nextProgressionMilestone = useSelector(selectNextProgressionMilestone);
  const reactionTimeoutsRef = useRef([]);

  useEffect(
    () => () => {
      reactionTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      reactionTimeoutsRef.current = [];
    },
    []
  );

  const guidance = useMemo(
    () => buildPottyGuidanceModel({ dog, pottyTrack }),
    [dog, pottyTrack]
  );

  const roadmap = useMemo(
    () =>
      buildTrainingRoadmapModel({
        dogName: dog?.name || "Your pup",
        pottyTrack,
        unlockedFeatures,
        reliableCommandCount: 0,
        masteredCommandCount: 0,
        unlockedSkillIds:
          dog?.skillTree?.unlockedIds || dog?.skillTree?.unlockedPerkIds || [],
        nextMilestone: nextProgressionMilestone,
      }),
    [
      dog?.name,
      dog?.skillTree?.unlockedIds,
      dog?.skillTree?.unlockedPerkIds,
      pottyTrack,
      unlockedFeatures,
      nextProgressionMilestone,
    ]
  );

  if (!dog) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-lg">
          <EmptySlate
            kicker="Potty Training"
            title="No pup yet"
            description="You’ll need to adopt a Dog before you can start potty training."
            primaryLabel="Adopt your pup"
            onPrimary={() => navigate(PATHS.ADOPT)}
            backTo={PATHS.HOME}
            backLabel="Back to home"
          />
        </div>
      </PageShell>
    );
  }

  const autoReturn = settings?.pottyAutoReturn === true;
  const confirmAccidents = settings?.pottyConfirmAccidents !== false;
  const showXPTools = settings?.pottyShowXpTools === true;
  const expandedTips = settings?.pottyTipsExpanded !== false;

  const lastSuccessAt = dog.potty?.lastSuccessAt
    ? new Date(dog.potty.lastSuccessAt)
    : null;
  const lastAccidentAt = dog.potty?.lastAccidentAt
    ? new Date(dog.potty.lastAccidentAt)
    : null;
  const lastSuccessAgo = lastSuccessAt ? formatRelativeTime(lastSuccessAt) : "";
  const lastAccidentAgo = lastAccidentAt
    ? formatRelativeTime(lastAccidentAt)
    : "";

  const trainingGoal = Number(
    pottyTrack?.goal || dog.training?.potty?.goal || 0
  );
  const trainingCount = Number(
    pottyTrack?.successes || dog.training?.potty?.successCount || 0
  );
  const accidents = Number(
    pottyTrack?.accidents || dog.potty?.totalAccidents || 0
  );
  const progressPct = Math.max(
    0,
    Math.min(100, Number(pottyTrack?.progressPct ?? guidance.progressPct ?? 0))
  );
  const successLabel =
    trainingGoal > 0 ? `${trainingCount}/${trainingGoal}` : `${trainingCount}`;
  const remainingTrips = Math.max(0, trainingGoal - trainingCount);
  const unlockedObedience = roadmap.obedienceUnlocked;
  const urgencyClass =
    URGENCY_STYLES[guidance.urgency] || URGENCY_STYLES.steady;
  const pottyNeedPct = Math.round(Number(guidance.pottyNeedPct || 0));
  const needsImmediateTrip =
    guidance.urgency === "urgent" || guidance.urgency === "critical";

  const onPottyWalk = () => {
    dispatch(goPotty({ now: Date.now(), forceSuccess: true }));
    const latestDog = store.getState()?.dog;
    if (String(latestDog?.lastAction || "") === "potty") {
      reactionTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      reactionTimeoutsRef.current = [
        window.setTimeout(() => {
          dispatch(
            simulationTick({
              now: Date.now(),
              action: "sniff",
              aiState: "idle",
            })
          );
        }, 700),
        window.setTimeout(() => {
          dispatch(
            simulationTick({
              now: Date.now(),
              action: "wag",
              aiState: "idle",
            })
          );
        }, 1550),
      ];
    }
    toast.reward(
      `Potty trip logged (+2 XP) • ${guidance.phaseMeta.shortLabel}`
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
    dispatch(recordAccident({ now: Date.now() }));
    toast.warn("Accident logged. Keep the routine steady.");
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader className="space-y-1" unstyled>
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Potty Training
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            House-training rhythm for {dog.name || "your pup"}
          </h1>
          <p className="max-w-2xl text-sm text-zinc-700 dark:text-zinc-300">
            This lane is intentionally grounded: timing, cleanup, and steady
            repetition matter more than grinding buttons. Potty mastery opens
            the door to focused obedience work.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-200">
              {guidance.phaseMeta.shortLabel}
            </span>
            <span className={`rounded-full border px-3 py-1 ${urgencyClass}`}>
              {guidance.urgencyLabel}
            </span>
            <span className="rounded-full border border-white/15 bg-white/60 px-3 py-1 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
              Potty need {pottyNeedPct}%
            </span>
            {lastSuccessAgo ? (
              <span className="rounded-full border border-white/15 bg-white/60 px-3 py-1 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                Last success {lastSuccessAgo}
              </span>
            ) : null}
          </div>
        </PageHeader>

        <section className="grid gap-4 lg:grid-cols-[1.45fr,1fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-black/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Current training phase
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {guidance.phaseMeta.label}
                </p>
              </div>

              <div className="w-full h-2 overflow-hidden rounded-full bg-zinc-200 sm:w-64 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
              {guidance.phaseMeta.summary}
            </p>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {guidance.recommendation}
            </p>

            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  Successful trips
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                  {successLabel}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                  {remainingTrips > 0
                    ? `${remainingTrips} more steady trip${remainingTrips === 1 ? "" : "s"} until mastery.`
                    : "The potty routine is fully established."}
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  Accidents logged
                </p>
                <p className="text-lg font-semibold text-rose-500 dark:text-rose-300">
                  {accidents}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                  Real but not brutal: accidents slow progress instead of
                  wrecking it.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  What opens next
                </p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {unlockedObedience
                    ? "Obedience is unlocked"
                    : "Obedience waits on mastery"}
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                  {unlockedObedience
                    ? "Now you can build reliable cues without skipping the puppy phase."
                    : "Potty training stays first so the early sim feels believable."}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Right now
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {needsImmediateTrip
                  ? `${dog.name || "Your pup"} is in the potty window now.`
                  : `${dog.name || "Your pup"} is stable, but the next outing should stay predictable.`}
              </p>
            </div>

            <div className="space-y-2">
              {guidance.pressureTags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-xs text-zinc-700 dark:bg-white/5 dark:text-zinc-300"
                >
                  {tag}
                </div>
              ))}
            </div>

            {roadmap.milestoneLabel ? (
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-100">
                <p className="font-semibold">Next milestone</p>
                <p className="mt-1">{roadmap.milestoneLabel}</p>
                {roadmap.milestoneBody ? (
                  <p className="mt-1 text-[11px] opacity-85">
                    {roadmap.milestoneBody}
                  </p>
                ) : null}
              </div>
            ) : null}

            {lastAccidentAgo ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-xs text-rose-900 dark:text-rose-100">
                Last accident {lastAccidentAgo}. Reset the routine; don’t punish
                the dog.
              </div>
            ) : null}
          </aside>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Quick log
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Log a successful outdoor trip or an accident to keep the sim
                honest.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
              <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/60">
                Progress: {successLabel}
              </span>
              <span className={`rounded-full border px-3 py-1 ${urgencyClass}`}>
                {guidance.urgencyLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPottyWalk}
              className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
            >
              Potty Walk (Success) • +2 XP
            </button>

            <button
              type="button"
              onClick={onAccident}
              className="rounded-full border border-rose-400/35 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/15"
            >
              Log accident
            </button>

            <button
              type="button"
              onClick={() => navigate(PATHS.GAME)}
              className="rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-black/35"
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

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Routine snapshots
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Realistic cues that make potty training feel like daily life,
                not a minigame.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(PATHS.SKILL_TREE)}
              className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/15"
            >
              View training roadmap
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {roadmap.steps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    {step.eyebrow}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${step.statusMeta.badgeClass}`}
                  >
                    {step.statusMeta.label}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {step.summary}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, step.progressPct || 0))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Debug XP tools
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
            Current XP:{" "}
            <span className="font-semibold tabular-nums">{dog.xp ?? 0}</span>
          </p>
          {showXPTools ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch(addXp({ amount: 5 }))}
                className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
              >
                XP +5
              </button>
              <button
                type="button"
                onClick={() => dispatch(removeXp({ amount: 5 }))}
                className="rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-black/35"
              >
                XP -5
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Hidden to keep the page focused on real care decisions.
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Training tips
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
            <ul className="list-disc list-inside space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
              <li>
                Take your pup out{" "}
                <span className="font-semibold">right after</span> feeding, play
                sessions, and naps.
              </li>
              <li>
                Log accidents without shame spirals. The sim tracks setbacks,
                but it should still feel survivable.
              </li>
              <li>
                Cleanup matters because routine and cleanliness affect the next
                stretch of behavior too.
              </li>
              <li>
                Potty mastery is the realistic gate before serious obedience
                work begins.
              </li>
            </ul>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Tips are collapsed. Expand to see the full list.
            </p>
          )}
        </section>

        <PageFooter>
          <button
            type="button"
            onClick={() => navigate(PATHS.GAME)}
            className="text-xs text-emerald-700 underline underline-offset-4 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to your yard
          </button>
        </PageFooter>
      </div>
    </PageShell>
  );
}
