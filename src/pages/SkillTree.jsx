// src/pages/SkillTree.jsx

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell.jsx";
import { useDog, useDogSkillTreeState } from "@/hooks/useDogState.js";
import { PATHS } from "@/app/routes.js";
import {
  respecSkillTree,
  respecSkillTreeBranch,
  unlockSkillTreePerk,
} from "@/store/dogSlice.js";
import {
  selectSettings,
  setSkillTreeBranch,
  setSkillTreeShowUnlockedOnly,
  setSkillTreeCompactCards,
} from "@/store/settingsSlice.js";
import {
  SKILL_TREE_BRANCHES,
  getSkillTreeBranchIdForPerk,
  getSkillTreePerkCost,
  getSkillTreeRequiredPerkIds,
  getSkillTreeUnlockCheck,
} from "@/features/training/skillTree.js";
import {
  selectMasteredCommandCount,
  selectNextProgressionMilestone,
  selectPottyTrainingTrack,
  selectReliableCommandCount,
  selectUnlockedFeatures,
} from "@/features/progression/progressionSelectors.js";
import { buildTrainingRoadmapModel } from "@/features/training/trainingRoadmap.js";

const BRANCH_STYLES = {
  companion: {
    border: "border-rose-200/80",
    badge: "border-rose-200/70 bg-rose-100/70 text-rose-700",
    line: "bg-rose-300/70",
  },
  guardian: {
    border: "border-amber-200/80",
    badge: "border-amber-200/70 bg-amber-100/70 text-amber-700",
    line: "bg-amber-300/70",
  },
  athlete: {
    border: "border-emerald-200/80",
    badge: "border-emerald-200/70 bg-emerald-100/70 text-emerald-700",
    line: "bg-emerald-300/70",
  },
};

function buildBranchTiers(perks) {
  const grouped = new Map();

  (Array.isArray(perks) ? perks : []).forEach((perk, index) => {
    const tier = Math.max(1, Math.floor(Number(perk?.tier || index + 1)));
    if (!grouped.has(tier)) {
      grouped.set(tier, []);
    }
    grouped.get(tier).push(perk);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tier, tierPerks]) => ({
      tier,
      perks: tierPerks,
    }));
}

export default function SkillTree() {
  const dispatch = useDispatch();
  const dog = useDog();
  const { level, unlockedIds, points, lastUnlockedId, lastUnlockedAt } =
    useDogSkillTreeState();
  const pottyTrack = useSelector(selectPottyTrainingTrack);
  const unlockedFeatures = useSelector(selectUnlockedFeatures);
  const reliableCommandCount = useSelector(selectReliableCommandCount);
  const masteredCommandCount = useSelector(selectMasteredCommandCount);
  const nextProgressionMilestone = useSelector(selectNextProgressionMilestone);
  const unlockedSet = React.useMemo(() => new Set(unlockedIds), [unlockedIds]);
  const pointsAvailable = points?.pointsAvailable ?? 0;
  const pointsEarned = points?.pointsEarned ?? Math.max(0, level - 1);
  const pointsSpent = points?.pointsSpent ?? unlockedIds.length;
  const settings = useSelector(selectSettings);
  const activeBranchId = settings?.skillTreeBranch || "all";
  const activeBranchUnlocks =
    activeBranchId === "all"
      ? 0
      : unlockedIds.filter(
          (id) => getSkillTreeBranchIdForPerk(id) === activeBranchId
        ).length;
  const showUnlockedOnly = settings?.skillTreeShowUnlockedOnly === true;
  const compactCards = settings?.skillTreeCompactCards === true;
  const hasUnlocked = unlockedIds.length > 0;

  const unlockPerk = (perkId) => {
    dispatch(unlockSkillTreePerk({ perkId }));
  };

  const onRespec = () => {
    const ok = window.confirm(
      "Reset your skill tree? This will refund all spent points."
    );
    if (!ok) return;
    dispatch(respecSkillTree());
  };

  const onRespecBranch = () => {
    if (activeBranchId === "all") return;
    const ok = window.confirm(
      `Reset the ${activeBranchId} branch? This will refund only those perks.`
    );
    if (!ok) return;
    dispatch(respecSkillTreeBranch({ branchId: activeBranchId }));
  };

  const branches = React.useMemo(
    () =>
      SKILL_TREE_BRANCHES.map((b) => ({
        ...b,
        tiers: buildBranchTiers(b.perks),
        ...(BRANCH_STYLES[b.id] || {}),
      })),
    []
  );

  const roadmap = React.useMemo(
    () =>
      buildTrainingRoadmapModel({
        dogName: dog?.name || "Your pup",
        pottyTrack,
        unlockedFeatures,
        reliableCommandCount,
        masteredCommandCount,
        unlockedSkillIds: unlockedIds,
        nextMilestone: nextProgressionMilestone,
      }),
    [
      dog?.name,
      pottyTrack,
      unlockedFeatures,
      reliableCommandCount,
      masteredCommandCount,
      unlockedIds,
      nextProgressionMilestone,
    ]
  );

  const filteredBranches = React.useMemo(() => {
    if (activeBranchId === "all") return branches;
    return branches.filter((b) => b.id === activeBranchId);
  }, [activeBranchId, branches]);

  return (
    <PageShell
      disableBackground
      className="dz-skilltree relative overflow-hidden bg-[#f5ecd9] text-slate-900"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.8),_rgba(255,255,255,0))]" />
      </div>

      <div className="absolute inset-0">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-amber-700/70">
              Training roadmap
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Realistic growth before specialization.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              House manners come first, reliable cues come second, and long-term
              perk branches come after the routine feels real. This page now
              frames the perk tree as temperament shaping, not a replacement for
              daily care.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-amber-200/70 bg-white/70 px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700/70">
                Level
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {level}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200/70 bg-white/70 px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700/70">
                Skill Points
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {pointsAvailable}
              </div>
              <div className="text-xs text-slate-500">
                {pointsEarned} earned, {pointsSpent} spent
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to={PATHS.GAME}
                className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
              >
                Back to yard
              </Link>
              {pointsSpent > 0 ? (
                <button
                  type="button"
                  onClick={onRespec}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
                >
                  Reset perks
                </button>
              ) : null}
              {activeBranchId !== "all" && activeBranchUnlocks > 0 ? (
                <button
                  type="button"
                  onClick={onRespecBranch}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
                >
                  Reset branch
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-[0_20px_80px_rgba(60,35,10,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Skill Points
              </div>
              <p className="mt-1 text-md text-slate-600">
                Spend points earned from leveling up to shape your pup&apos;s
                journey.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => dispatch(setSkillTreeBranch("all"))}
                className={`rounded-full border px-3 py-1 font-semibold transition ${
                  activeBranchId === "all"
                    ? "border-amber-300/80 bg-amber-100/70 text-amber-700"
                    : "border-slate-200/80 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                All branches
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => dispatch(setSkillTreeBranch(b.id))}
                  className={`rounded-full border px-3 py-1 font-semibold transition ${
                    activeBranchId === b.id
                      ? b.badge
                      : "border-slate-200/80 bg-white/70 text-slate-600 hover:bg-white"
                  }`}
                >
                  {b.name}
                </button>
              ))}
              <span className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!hasUnlocked}
                  onClick={() => {
                    if (!hasUnlocked) return;
                    dispatch(setSkillTreeShowUnlockedOnly(!showUnlockedOnly));
                  }}
                  className={`rounded-full border px-3 py-1 text-slate-600 ${
                    hasUnlocked
                      ? "border-slate-200/80 bg-white/70 hover:bg-white"
                      : "border-slate-200/60 bg-white/50 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {showUnlockedOnly ? "All perks" : "Unlocked only"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(setSkillTreeCompactCards(!compactCards))
                  }
                  className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-slate-600 hover:bg-white"
                >
                  {compactCards ? "Roomy cards" : "Compact cards"}
                </button>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white/75 p-5 shadow-[0_20px_80px_rgba(60,35,10,0.1)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700/70">
                Roadmap first
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                Training should read like a believable life arc.
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Potty status:{" "}
              <span className="font-semibold text-slate-800">
                {roadmap.pottyPhaseMeta.shortLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {roadmap.steps.map((step) => (
              <article
                key={step.id}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {step.eyebrow}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${step.statusMeta.badgeClass}`}
                  >
                    {step.statusMeta.label}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.summary}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {step.detail}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-300 to-amber-300"
                    style={{
                      width: `${Math.max(0, Math.min(100, step.progressPct || 0))}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Next focus
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {roadmap.nextFocus.title}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {roadmap.nextFocus.summary}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {roadmap.nextFocus.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={PATHS.POTTY}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-emerald-100/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Potty routine
                </Link>
                <Link
                  to={PATHS.MEMORIES}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                >
                  Memory reel
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Progression signal
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {roadmap.milestoneLabel || "No queued milestone just now"}
              </div>
              {roadmap.milestoneBody ? (
                <p className="mt-2 text-sm text-slate-600">
                  {roadmap.milestoneBody}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Keep routine, bond, and short training sessions rolling. The
                  sim is designed to unlock meaningfully instead of all at once.
                </p>
              )}
              <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs text-amber-800">
                Reliable commands:{" "}
                <span className="font-semibold">{roadmap.reliableCount}</span>
                <br />
                Mastered commands:{" "}
                <span className="font-semibold">{roadmap.masteredCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 bg-white/65 px-5 py-4 text-sm text-slate-600 shadow-[0_12px_40px_rgba(60,35,10,0.08)]">
            The cards below are long-term shaping perks. They complement the
            realistic care loop instead of replacing it — think resilience,
            comfort, and training tempo, not magic obedience buttons.
          </div>
          {filteredBranches.map((branch) => (
            <section
              key={branch.id}
              className={`relative overflow-hidden rounded-3xl border ${branch.border} bg-white/70 p-6 shadow-[0_20px_70px_rgba(60,35,10,0.1)]`}
            >
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${branch.badge}`}
                    >
                      {branch.name}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                      {branch.tagline}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {branch.tiers.map((tierRow, rowIndex) => (
                    <div
                      key={`${branch.id}-tier-${tierRow.tier}`}
                      className="relative"
                    >
                      {rowIndex > 0 ? (
                        <div className="pointer-events-none absolute -top-5 left-1/2 h-5 w-px -translate-x-1/2">
                          <div className={`h-full w-px ${branch.line}`} />
                        </div>
                      ) : null}

                      <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Tier {tierRow.tier}
                      </div>

                      <div className="flex flex-wrap justify-center gap-4">
                        {tierRow.perks.map((perk) => {
                          const requiredIds = getSkillTreeRequiredPerkIds(
                            perk.id
                          );
                          const perkCost = getSkillTreePerkCost(perk.id);
                          const unlockCheck = getSkillTreeUnlockCheck({
                            perkId: perk.id,
                            unlockedIds,
                            pointsAvailable,
                            dogLevel: level,
                          });
                          const isUnlocked = unlockedSet.has(perk.id);
                          const canUnlock = unlockCheck.ok;
                          const isBlocked =
                            !isUnlocked &&
                            unlockCheck.reason ===
                              "Unlock prerequisite perks first.";
                          const isRecentlyUnlocked =
                            perk.id === lastUnlockedId &&
                            Number(lastUnlockedAt || 0) > 0 &&
                            Date.now() - Number(lastUnlockedAt) < 12_000;
                          const requirementsMet =
                            requiredIds.length === 0 ||
                            requiredIds.every((id) => unlockedSet.has(id));
                          const connectorState = isUnlocked
                            ? "unlocked"
                            : requirementsMet
                              ? "active"
                              : "locked";

                          if (showUnlockedOnly && !isUnlocked) return null;

                          const perkState = isUnlocked
                            ? "unlocked"
                            : isBlocked
                              ? "blocked"
                              : canUnlock
                                ? "available"
                                : "locked";

                          const statusLabel = isUnlocked
                            ? "Unlocked"
                            : unlockCheck.reason || "Unavailable";

                          return (
                            <div
                              key={perk.id}
                              className="relative w-full max-w-[17rem] flex-1 basis-[13rem] pt-6"
                            >
                              {rowIndex > 0 ? (
                                <span
                                  aria-hidden
                                  data-state={connectorState}
                                  data-branch={branch.id}
                                  data-recent-unlock={
                                    isRecentlyUnlocked ? "true" : "false"
                                  }
                                  className="dz-skill-link absolute left-1/2 top-0 h-6 w-px -translate-x-1/2"
                                />
                              ) : null}
                              <span
                                data-state={connectorState}
                                data-branch={branch.id}
                                data-recent-unlock={
                                  isRecentlyUnlocked ? "true" : "false"
                                }
                                className={`dz-skill-node absolute left-1/2 top-5 h-3 w-3 -translate-x-1/2 rounded-full border ${
                                  isUnlocked
                                    ? "border-emerald-400/80 bg-emerald-200/70"
                                    : "border-slate-300/80 bg-white"
                                }`}
                              />

                              <div
                                data-branch={branch.id}
                                data-state={perkState}
                                data-recent-unlock={
                                  isRecentlyUnlocked ? "true" : "false"
                                }
                                className={`dz-perk-card rounded-2xl border transform transition hover:-translate-y-0.5 hover:shadow-lg ${
                                  isUnlocked
                                    ? "border-emerald-300/70 bg-emerald-50/70 shadow-md shadow-emerald-200/70"
                                    : "border-slate-200/80 bg-white/80"
                                } ${!isUnlocked && !canUnlock ? "opacity-60 grayscale-[0.2]" : ""} ${
                                  compactCards ? "p-3" : "p-4"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-lg font-semibold text-slate-900">
                                      {perk.name}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">
                                      {perk.effect}
                                    </p>
                                  </div>
                                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                    Cost {perkCost}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                  <span className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1">
                                    {perk.type}
                                  </span>
                                  {perk.unlocks ? (
                                    <span className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1">
                                      Unlocks: {perk.unlocks}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                  <span className="text-xs text-slate-500">
                                    {statusLabel}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => unlockPerk(perk.id)}
                                    disabled={!canUnlock}
                                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                      isUnlocked
                                        ? "border-emerald-300/70 bg-emerald-200/60 text-emerald-800"
                                        : canUnlock
                                          ? "border-slate-300/80 bg-white text-slate-800 hover:bg-slate-50"
                                          : "border-slate-200/80 bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {isUnlocked
                                      ? "Unlocked"
                                      : isBlocked
                                        ? "Locked"
                                        : "Unlock"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
