// src/pages/SkillTree.jsx

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell.jsx";
import { PATHS } from "@/routes.js";
import {
  respecSkillTree,
  selectDog,
  selectDogSkillTreePoints,
  selectDogSkillTreeUnlockedIds,
  unlockSkillTreePerk,
} from "@/redux/dogSlice.js";
import { SKILL_TREE_BRANCHES } from "@/constants/skillTree.js";

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

export default function SkillTree() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const level = dog?.level ?? 1;
  const unlockedIds = useSelector(selectDogSkillTreeUnlockedIds);
  const unlocked = React.useMemo(() => new Set(unlockedIds), [unlockedIds]);
  const points = useSelector(selectDogSkillTreePoints);
  const pointsAvailable = points?.pointsAvailable ?? 0;
  const pointsEarned = points?.pointsEarned ?? Math.max(0, level - 1);
  const pointsSpent = points?.pointsSpent ?? unlockedIds.length;

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

  const branches = React.useMemo(
    () =>
      SKILL_TREE_BRANCHES.map((b) => ({
        ...b,
        ...(BRANCH_STYLES[b.id] || {}),
      })),
    []
  );

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
              Skill Tree
            </div>
            <p className="mt-3 text-sm text-slate-600"></p>
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
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {branches.map((branch) => (
            <section
              key={branch.id}
              className={`relative overflow-hidden rounded-3xl border ${branch.border} bg-white/70 p-6 shadow-[0_20px_70px_rgba(60,35,10,0.1)]`}
            >
              <div className="absolute left-7 top-24 bottom-8 w-px" aria-hidden>
                <div className={`h-full w-px ${branch.line}`} />
              </div>
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

                <div className="mt-6 space-y-4">
                  {branch.perks.map((perk, index) => {
                    const requiredId = branch.perks[index - 1]?.id || null;
                    const isUnlocked = unlocked.has(perk.id);
                    const isBlocked = requiredId && !unlocked.has(requiredId);
                    const canUnlock =
                      pointsAvailable > 0 && !isUnlocked && !isBlocked;

                    const perkState = isUnlocked
                      ? "unlocked"
                      : isBlocked
                        ? "blocked"
                        : canUnlock
                          ? "available"
                          : "locked";

                    const statusLabel = isUnlocked
                      ? "Unlocked"
                      : isBlocked
                        ? "Unlock the perk above first"
                        : pointsAvailable > 0
                          ? "Spend 1 point to unlock"
                          : "Need a skill point";

                    return (
                      <div key={perk.id} className="relative pl-6">
                        <span
                          className={`absolute left-0 top-5 h-3 w-3 rounded-full border ${
                            isUnlocked
                              ? "border-emerald-400/80 bg-emerald-200/70"
                              : "border-slate-300/80 bg-white"
                          }`}
                        />

                        <div
                          data-branch={branch.id}
                          data-state={perkState}
                          className={`dz-perk-card rounded-2xl border p-4 transition ${
                            isUnlocked
                              ? "border-emerald-300/70 bg-emerald-50/70"
                              : "border-slate-200/80 bg-white/80"
                          } ${isBlocked ? "opacity-70" : ""}`}
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
                              Cost 1
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
                              {isUnlocked ? "Active" : "Unlock"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
