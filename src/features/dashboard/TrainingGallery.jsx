// src/features/dashboard/TrainingGallery.jsx
// @ts-nocheck
//
// TrainingGallery
// Displays a dynamic, accessible gallery of training skills derived from dog state.
// - Uses dog.skills.obedience for per-command level/xp
// - Shows progress toward next level
// - Highlights adult obedience drill streak

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/features/game/redux/dogSlice.js";

const SKILL_XP_STEP = 50; // keep in sync with dogSlice

const COMMAND_META = {
  sit: {
    label: "Sit",
    icon: "🪑",
    description: "Basic sit command. Foundation for everything else.",
    recommendedStage: "Puppy+",
  },
  stay: {
    label: "Stay",
    icon: "⏸️",
    description: "Impulse control. Harder than it looks.",
    recommendedStage: "Puppy+",
  },
  rollOver: {
    label: "Roll Over",
    icon: "🔁",
    description: "Party trick with bonus core workout.",
    recommendedStage: "Adult+",
  },
  speak: {
    label: "Speak",
    icon: "💬",
    description: "Put barking on command instead of chaos mode.",
    recommendedStage: "Adult+",
  },
};

function normalizeSkills(obedience = {}) {
  return Object.entries(obedience).map(([id, data]) => {
    const meta = COMMAND_META[id] || {};
    const level = data?.level ?? 0;
    const xp = data?.xp ?? 0;
    const progress = Math.max(0, Math.min(1, xp / SKILL_XP_STEP));

    return {
      id,
      label: meta.label || id,
      description:
        meta.description ||
        "Obedience command tracked by Doggerz training system.",
      icon: meta.icon || "🎓",
      recommendedStage: meta.recommendedStage || "Any",
      level,
      xp,
      progress,
    };
  });
}

export default function TrainingGallery() {
  const dog = useSelector(selectDog);

  if (!dog) {
    return null;
  }

  const obedienceSkills = normalizeSkills(dog.skills?.obedience || {});
  const lifeStageLabel = dog.lifeStageLabel ?? dog.lifeStage ?? "Puppy";

  const adultDrill = dog.training?.adult?.obedienceDrill || {};
  const adultStreak = adultDrill.streak ?? 0;
  const adultLongest = adultDrill.longestStreak ?? 0;
  const lastDrillDate = adultDrill.lastDrillDate ?? null;

  const hasAnySkills = obedienceSkills.length > 0;

  if (!hasAnySkills) {
    return (
      <section
        aria-label="Training Skills"
        className="rounded-xl border border-emerald-500/30 bg-zinc-900/80 p-4"
      >
        <h2
          className="text-lg font-bold text-emerald-300"
          id="training-gallery-heading"
        >
          Training Skills
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          No training skills tracked yet. Run some obedience drills to start
          filling this out.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="training-gallery-heading"
      role="region"
      className="rounded-xl border border-emerald-500/30 bg-zinc-900/80 p-4 space-y-4"
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2
            className="text-lg font-bold text-emerald-300"
            id="training-gallery-heading"
          >
            Training Skills
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Obedience progression for your{" "}
            <span className="font-semibold text-emerald-200">
              {lifeStageLabel}
            </span>{" "}
            pup.
          </p>
        </div>
        <div className="text-[0.65rem] text-zinc-400 text-right space-y-0.5">
          <p>
            Obedience streak:{" "}
            <span className="font-semibold text-emerald-200">
              {adultStreak}d
            </span>{" "}
            (best{" "}
            <span className="font-semibold text-emerald-200">
              {adultLongest}d
            </span>
            )
          </p>
          {lastDrillDate && (
            <p>
              Last drill:{" "}
              <span className="font-mono text-[0.6rem] text-zinc-300">
                {lastDrillDate}
              </span>
            </p>
          )}
        </div>
      </header>

      <ul
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        role="list"
        aria-label="Skill List"
      >
        {obedienceSkills.map((skill) => (
          <li
            key={skill.id}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-950/60 border border-emerald-400/30 focus-within:ring-2 focus-within:ring-emerald-400"
            tabIndex={0}
            aria-label={`Skill: ${skill.label}, level ${skill.level}, ${Math.round(
              skill.progress * 100,
            )}% to next level`}
            role="listitem"
          >
            {/* Icon */}
            <span className="text-3xl" role="img" aria-hidden="true">
              {skill.icon}
            </span>

            {/* Label + level */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-semibold text-emerald-200 text-sm text-center">
                {skill.label}
              </span>
              <span className="text-[0.7rem] text-zinc-300">
                Lv.{skill.level} · {skill.xp}/{SKILL_XP_STEP} XP
              </span>
            </div>

            {/* Description */}
            <span className="text-xs text-zinc-400 text-center">
              {skill.description}
            </span>

            {/* Progress bar */}
            <div className="w-full mt-1">
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${skill.progress * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-1 flex justify-between text-[0.6rem] text-zinc-500">
                <span>{Math.round(skill.progress * 100)}%</span>
                <span>{skill.recommendedStage}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
// src/pages/Home.jsx
