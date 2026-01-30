/** @format */

// src/pages/TrainingTree.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageShell from "@/components/PageShell.jsx";
import { PATHS } from "@/routes.js";

import {
  TRAINING_TREE,
  getSkillNode,
  skillPrereqsMet,
} from "@/constants/trainingTree.js";
import {
  selectTrainingTree,
  selectSkillPoints,
  unlockSkill,
  practiceSkill,
  setEquippedPose,
} from "@/redux/trainingTreeSlice.js";
import { selectDog } from "@/redux/dogSlice.js";
import {
  selectSettings,
  setTrainingCompactCards,
  setTrainingShowDetails,
  setTrainingShowLocked,
  setTrainingSortKey,
} from "@/redux/settingsSlice.js";
import { getSkillMaintenanceStatus } from "@/utils/trainingMaintenance.js";

export default function TrainingTree() {
  const dispatch = useDispatch();
  const tree = useSelector(selectTrainingTree);
  const points = useSelector(selectSkillPoints);
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);

  const [branchKey, setBranchKey] = React.useState("obedience");
  const [search, setSearch] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState("all");
  const [tagFilter, setTagFilter] = React.useState("all");

  const unlockedSet = React.useMemo(() => {
    const s = new Set();
    for (const [id, v] of Object.entries(tree.skills || {}))
      if (v?.unlocked) s.add(id);
    return s;
  }, [tree.skills]);

  const branch = TRAINING_TREE[branchKey];
  const showLocked = settings?.trainingShowLocked !== false;
  const compactCards = Boolean(settings?.trainingCompactCards);
  const showDetails = settings?.trainingShowDetails !== false;
  const sortKey = settings?.trainingSortKey || "status";

  const tags = React.useMemo(() => {
    const set = new Set();
    branch.nodes.forEach((node) => {
      (node.tags || []).forEach((tag) => set.add(tag));
    });
    return ["all", ...Array.from(set)];
  }, [branch]);

  const filteredNodes = React.useMemo(() => {
    const query = String(search || "").toLowerCase().trim();
    const diff = String(difficultyFilter || "all").toLowerCase();
    const tag = String(tagFilter || "all").toLowerCase();

    const withStatus = branch.nodes.map((node) => {
      const entry = tree.skills?.[node.id] || null;
      const unlocked = !!entry?.unlocked;
      const canUnlock = skillPrereqsMet(node.id, unlockedSet);
      const status = unlocked ? "unlocked" : canUnlock ? "available" : "locked";
      return { node, entry, unlocked, canUnlock, status };
    });

    let list = withStatus.filter(({ node, status }) => {
      if (!showLocked && status === "locked") return false;
      if (query) {
        const text = `${node.label} ${node.pose} ${(node.tags || []).join(" ")}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (diff !== "all" && String(node.difficulty || "").toLowerCase() !== diff)
        return false;
      if (tag !== "all") {
        const tags = (node.tags || []).map((t) => String(t).toLowerCase());
        if (!tags.includes(tag)) return false;
      }
      return true;
    });

    if (sortKey === "alpha") {
      list = list.slice().sort((a, b) => a.node.label.localeCompare(b.node.label));
    } else {
      const weight = { unlocked: 0, available: 1, locked: 2 };
      list = list
        .slice()
        .sort((a, b) => weight[a.status] - weight[b.status]);
    }

    return list;
  }, [
    branch,
    difficultyFilter,
    search,
    showLocked,
    sortKey,
    tagFilter,
    tree.skills,
    unlockedSet,
  ]);

  const bondValue = Number(dog?.bond?.value || 0);
  const energyValue = Number(dog?.stats?.energy || 0);
  const trainingStreak = Math.max(
    0,
    Number(dog?.streak?.currentStreakDays || 0)
  );
  const isSpicy =
    String(dog?.temperament?.primary || "").toUpperCase() === "SPICY" ||
    String(dog?.temperament?.secondary || "").toUpperCase() === "SPICY";

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

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
              Filters
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["all", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                    difficultyFilter === d
                      ? "border-emerald-300 bg-emerald-400 text-black"
                      : "border-white/10 bg-black/30 text-white/70 hover:bg-black/50",
                  ].join(" ")}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter(t)}
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                    tagFilter === t
                      ? "border-sky-300 bg-sky-400 text-black"
                      : "border-white/10 bg-black/30 text-white/70 hover:bg-black/50",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
              View
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch(setTrainingCompactCards(!compactCards))}
                className={[
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                  compactCards
                    ? "border-emerald-300 bg-emerald-400 text-black"
                    : "border-white/10 bg-black/30 text-white/70 hover:bg-black/50",
                ].join(" ")}
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => dispatch(setTrainingShowLocked(!showLocked))}
                className={[
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                  showLocked
                    ? "border-emerald-300 bg-emerald-400 text-black"
                    : "border-white/10 bg-black/30 text-white/70 hover:bg-black/50",
                ].join(" ")}
              >
                {showLocked ? "Show locked" : "Hide locked"}
              </button>
              <button
                type="button"
                onClick={() => dispatch(setTrainingShowDetails(!showDetails))}
                className={[
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                  showDetails
                    ? "border-emerald-300 bg-emerald-400 text-black"
                    : "border-white/10 bg-black/30 text-white/70 hover:bg-black/50",
                ].join(" ")}
              >
                {showDetails ? "Details on" : "Details off"}
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    setTrainingSortKey(sortKey === "alpha" ? "status" : "alpha")
                  )
                }
                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:bg-black/50"
              >
                Sort: {sortKey === "alpha" ? "A–Z" : "Status"}
              </button>
            </div>

            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a skill..."
                className="mt-2 w-full rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/80 placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <div
          className={[
            "mt-6 grid gap-3",
            compactCards ? "md:grid-cols-3" : "md:grid-cols-2",
          ].join(" ")}
        >
          {filteredNodes.map(({ node, entry, unlocked, canUnlock, status }) => {
            const hasPoints = points >= node.cost;
            const isBlocked = !unlocked && !canUnlock;
            const level = Math.max(0, Math.min(100, Number(entry?.level || 0)));
            const maintenance = getSkillMaintenanceStatus(level);
            const prereqLabels = (node.prereq || [])
              .map((id) => getSkillNode(id)?.label || id)
              .filter(Boolean);

            return (
              <div
                key={node.id}
                className={[
                  "rounded-2xl border p-4 transition",
                  unlocked
                    ? "border-emerald-400/25 bg-black/30"
                    : "border-white/10 bg-black/20",
                  isBlocked ? "opacity-70" : "",
                  compactCards ? "p-3" : "",
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
                    {showDetails ? (
                      <>
                        <div className="mt-1 text-xs text-white/50">
                          Difficulty:{" "}
                          <span className="text-white/70">
                            {node.difficulty || "easy"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Rust:{" "}
                          <span className="text-white/70">
                            {node.rustPerDay}/day
                          </span>
                        </div>
                        {prereqLabels.length ? (
                          <div className="mt-1 text-[11px] text-white/45">
                            Requires: {prereqLabels.join(", ")}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="text-xs font-bold text-white/70">
                    Cost <span className="text-emerald-200">{node.cost}</span>
                  </div>
                </div>

                {showDetails ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(node.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                      {maintenance}
                    </span>
                  </div>
                ) : null}

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
                      {status === "available" ? "Unlock" : "Locked"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            practiceSkill({
                              skillId: node.id,
                              amount: 14,
                              context: {
                                bond: bondValue,
                                energy: energyValue,
                                isSpicy,
                                trainingStreak,
                                difficulty: node.difficulty,
                              },
                            })
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
