// src/pages/SkillTree.jsx

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SubpageShell from "@/components/layout/SubpageShell.jsx";
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
    border: "border-rose-400/25",
    badge: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    line: "bg-rose-300/70",
  },
  guardian: {
    border: "border-amber-400/25",
    badge: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    line: "bg-amber-300/70",
  },
  athlete: {
    border: "border-emerald-400/25",
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
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
    <SubpageShell
      width="wide"
      className="dz-skilltree relative overflow-hidden text-zinc-100"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-sky-500/10 to-transparent" />
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">
              Training roadmap
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">
              Realistic growth before specialization.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              House manners come first, reliable cues come second, and long-term
              perk branches come after the routine feels real. This page now
              frames the perk tree as temperament shaping, not a replacement for
              daily care.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">
                Level
              </div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {level}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">
                Skill Points
              </div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {pointsAvailable}
              </div>
              <div className="text-xs text-zinc-400">
                {pointsEarned} earned, {pointsSpent} spent
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to={PATHS.GAME}
                className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
              >
                Back to yard
              </Link>
              {pointsSpent > 0 ? (
                <button
                  type="button"
                  onClick={onRespec}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-black/35"
                >
                  Reset perks
                </button>
              ) : null}
              {activeBranchId !== "all" && activeBranchUnlocks > 0 ? (
                <button
                  type="button"
                  onClick={onRespecBranch}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-black/35"
                >
                  Reset branch
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-zinc-100">
                Skill Points
              </div>
              <p className="mt-1 text-sm text-zinc-400">
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
                    ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-100"
                    : "border-white/15 bg-black/25 text-zinc-200 hover:bg-black/35"
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
                      : "border-white/15 bg-black/25 text-zinc-200 hover:bg-black/35"
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
                  className={`rounded-full border px-3 py-1 text-zinc-200 ${
                    hasUnlocked
                      ? "border-white/15 bg-black/25 hover:bg-black/35"
                      : "border-white/10 bg-white/5 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {showUnlockedOnly ? "All perks" : "Unlocked only"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(setSkillTreeCompactCards(!compactCards))
                  }
                  className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-zinc-200 hover:bg-black/35"
                >
                  {compactCards ? "Roomy cards" : "Compact cards"}
                </button>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">
                Roadmap first
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-100">
                Training should read like a believable life arc.
              </div>
            </div>
            <div className="text-xs text-zinc-400">
              Potty status:{" "}
              <span className="font-semibold text-zinc-100">
                {roadmap.pottyPhaseMeta.shortLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {roadmap.steps.map((step) => (
              <article
                key={step.id}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {step.eyebrow}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${step.statusMeta.badgeClass}`}
                  >
                    {step.statusMeta.label}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-zinc-100">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {step.summary}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {step.detail}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
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
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Next focus
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">
                {roadmap.nextFocus.title}
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                {roadmap.nextFocus.summary}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {roadmap.nextFocus.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={PATHS.POTTY}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
                >
                  Potty routine
                </Link>
                <Link
                  to={PATHS.MEMORIES}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition hover:bg-black/35"
                >
                  Memory reel
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Progression signal
              </div>
              <div className="mt-2 text-base font-semibold text-zinc-100">
                {roadmap.milestoneLabel || "No queued milestone just now"}
              </div>
              {roadmap.milestoneBody ? (
                <p className="mt-2 text-sm text-zinc-300">
                  {roadmap.milestoneBody}
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-300">
                  Keep routine, bond, and short training sessions rolling. The
                  sim is designed to unlock meaningfully instead of all at once.
                </p>
              )}
              <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs text-amber-100">
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
          <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-zinc-300">
            The cards below are long-term shaping perks. They complement the
            realistic care loop instead of replacing it — think resilience,
            comfort, and training tempo, not magic obedience buttons.
          </div>
          {filteredBranches.map((branch) => (
            <section
              key={branch.id}
              className={`relative overflow-hidden rounded-3xl border ${branch.border} bg-black/30 p-6`}
            >
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${branch.badge}`}
                    >
                      {branch.name}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-zinc-100">
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

                      <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
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
                                    : "border-zinc-600 bg-zinc-950"
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
                                    ? "border-emerald-400/35 bg-emerald-500/10 shadow-md shadow-emerald-900/20"
                                    : "border-white/10 bg-black/25"
                                } ${!isUnlocked && !canUnlock ? "opacity-60 grayscale-[0.2]" : ""} ${
                                  compactCards ? "p-3" : "p-4"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-lg font-semibold text-zinc-100">
                                      {perk.name}
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-300">
                                      {perk.effect}
                                    </p>
                                  </div>
                                  <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                                    Cost {perkCost}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                    {perk.type}
                                  </span>
                                  {perk.unlocks ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                      Unlocks: {perk.unlocks}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                  <span className="text-xs text-zinc-500">
                                    {statusLabel}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => unlockPerk(perk.id)}
                                    disabled={!canUnlock}
                                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                      isUnlocked
                                        ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                                        : canUnlock
                                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
                                          : "border-white/10 bg-white/5 text-zinc-500"
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
    </SubpageShell>
  );
}
