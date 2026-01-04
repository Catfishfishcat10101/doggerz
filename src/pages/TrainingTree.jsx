/** @format */

// src/pages/TrainingTree.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageShell from "@/components/PageShell.jsx";
import { PATHS } from "@/routes.js";

import { TRAINING_TREE, skillPrereqsMet } from "@/constants/trainingTree.js";
import {
  selectTrainingTree,
  selectSkillPoints,
  unlockSkill,
  practiceSkill,
  setEquippedPose,
} from "@/redux/trainingTreeSlice.js";

export default function TrainingTree() {
  const dispatch = useDispatch();
  const tree = useSelector(selectTrainingTree);
  const points = useSelector(selectSkillPoints);

  const [branchKey, setBranchKey] = React.useState("obedience");

  const unlockedSet = React.useMemo(() => {
    const s = new Set();
    for (const [id, v] of Object.entries(tree.skills || {}))
      if (v?.unlocked) s.add(id);
    return s;
  }, [tree.skills]);

  const branch = TRAINING_TREE[branchKey];

  return (
    <PageShell className="relative">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-emerald-300/70">
              Training
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              Skill Tree
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Unlock and practice skills across three branches. Skills get rusty
              if ignored. Practicing triggers a visible pose/animation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                Skill Points
              </div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-200">
                {points}
              </div>
            </div>

            <Link
              to={PATHS.GAME}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-bold text-white/80 hover:bg-black/55"
            >
              Back to yard
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.keys(TRAINING_TREE).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setBranchKey(k)}
              className={[
                "rounded-xl px-3 py-2 text-xs font-bold transition",
                branchKey === k
                  ? "bg-emerald-400 text-black"
                  : "bg-black/35 text-white/75 ring-1 ring-white/10 hover:bg-black/50",
              ].join(" ")}
            >
              {TRAINING_TREE[k].label}
            </button>
          ))}
        </div>

        <div className="mt-2 text-xs text-white/60">{branch.description}</div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {branch.nodes.map((node) => {
            const entry = tree.skills?.[node.id] || null;
            const unlocked = !!entry?.unlocked;

            const canUnlock = skillPrereqsMet(node.id, unlockedSet);
            const hasPoints = points >= node.cost;

            const isBlocked = !unlocked && !canUnlock;
            const level = Math.max(0, Math.min(100, Number(entry?.level || 0)));

            return (
              <div
                key={node.id}
                className={[
                  "rounded-2xl border p-4",
                  unlocked
                    ? "border-emerald-400/25 bg-black/30"
                    : "border-white/10 bg-black/20",
                  isBlocked ? "opacity-70" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-white">
                      {node.label}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Pose:{" "}
                      <span className="text-emerald-200">{node.pose}</span>
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      Rust:{" "}
                      <span className="text-white/70">
                        {node.rustPerDay}/day
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-white/70">
                    Cost <span className="text-emerald-200">{node.cost}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-emerald-400/70"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-white/60">
                    Level:{" "}
                    <span className="text-white/80">{level.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {!unlocked ? (
                    <button
                      type="button"
                      disabled={!canUnlock || !hasPoints}
                      onClick={() => dispatch(unlockSkill(node.id))}
                      className={[
                        "rounded-xl px-3 py-2 text-xs font-extrabold transition",
                        canUnlock && hasPoints
                          ? "bg-emerald-400 text-black hover:bg-emerald-300"
                          : "bg-white/5 text-white/40 cursor-not-allowed",
                      ].join(" ")}
                    >
                      Unlock
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            practiceSkill({ skillId: node.id, amount: 14 })
                          )
                        }
                        className="rounded-xl bg-black/40 px-3 py-2 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/20 hover:bg-black/55"
                      >
                        Practice
                      </button>

                      <button
                        type="button"
                        onClick={() => dispatch(setEquippedPose(node.pose))}
                        className="rounded-xl bg-black/35 px-3 py-2 text-xs font-bold text-white/80 ring-1 ring-white/10 hover:bg-black/50"
                      >
                        Equip Pose
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
