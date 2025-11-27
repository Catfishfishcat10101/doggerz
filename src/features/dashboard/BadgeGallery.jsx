// src/features/dashboard/BadgeGallery.jsx
// @ts-nocheck
//
// Doggerz: Badges & achievements panel.
// - Derives badges directly from dog state (no config slice required)
// - Uses level, streak, potty training, temperament, cleanliness, etc.
// - Shows both earned and locked badges with subtle styling differences.

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/features/game/redux/dogSlice.js";

function toIsoDate(ms) {
  if (!ms) return null;
  try {
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export default function BadgeGallery() {
  const dog = useSelector(selectDog);

  if (!dog) return null;

  const now = Date.now();
  const todayIso = toIsoDate(now);

  const level = dog.level ?? 1;
  const coins = dog.coins ?? 0;
  const adoptedAt = dog.adoptedAt;
  const lifeStageLabel = dog.lifeStageLabel ?? dog.lifeStage ?? "Puppy";

  const streakCurrent = dog.streak?.current ?? 0;
  const streakBest = dog.streak?.best ?? 0;

  const potty = dog.training?.puppy?.potty ?? {};
  const pottySuccesses = potty.successes ?? 0;
  const pottyTarget = 8;
  const pottyComplete = !!potty.completedAt;

  const temperament = dog.temperament ?? {};
  const temperamentUnlocked =
    !!temperament.revealReady || !!temperament.revealedAt;

  const cleanlinessTier = dog.cleanlinessTier ?? "FRESH";

  const memory = dog.memory ?? {};
  const lastAccidentAt = memory.lastAccidentAt;
  const lastAccidentDay = toIsoDate(lastAccidentAt);
  const accidentFreeToday =
    todayIso && (!lastAccidentDay || lastAccidentDay !== todayIso);

  const ageDays = dog.ageDays ?? 0;

  const badges = [
    {
      id: "first-adoption",
      icon: "🐾",
      label: "Day One Pup",
      description: "You adopted your first Doggerz companion.",
      earned: !!adoptedAt,
    },
    {
      id: "level-5",
      icon: "⭐",
      label: "Rising Star",
      description: "Reach level 5 with your pup.",
      earned: level >= 5,
    },
    {
      id: "level-10",
      icon: "🌟",
      label: "Neighborhood Legend",
      description: "Reach level 10 with your pup.",
      earned: level >= 10,
    },
    {
      id: "streak-3",
      icon: "📅",
      label: "Streak Starter",
      description: "Care for your pup 3 days in a row.",
      earned: streakCurrent >= 3,
      meta: `${streakCurrent}/3 days`,
    },
    {
      id: "streak-7",
      icon: "🔥",
      label: "On a Roll",
      description: "Care for your pup 7 days in a row.",
      earned: streakCurrent >= 7,
      meta: `${streakCurrent}/7 days`,
    },
    {
      id: "potty-trained",
      icon: "🚽",
      label: "Potty Pro",
      description: "Complete puppy potty training (8 successes).",
      earned: pottyComplete,
      meta: pottyComplete
        ? "Training complete"
        : `${pottySuccesses}/${pottyTarget} successes`,
    },
    {
      id: "temperament-revealed",
      icon: "🧠",
      label: "Personality Unlocked",
      description: "Unlock your pup's temperament profile.",
      earned: temperamentUnlocked,
    },
    {
      id: "clean-fresh",
      icon: "🛁",
      label: "Fresh & Fancy",
      description: "Keep your pup at the top cleanliness tier.",
      earned: cleanlinessTier === "FRESH",
    },
    {
      id: "accident-free-day",
      icon: "🧼",
      label: "Floor Is Lava (Free)",
      description: "No accidents recorded today.",
      earned: accidentFreeToday,
    },
    {
      id: "grown-up",
      icon: "🎂",
      label: "All Grown Up",
      description: "Reach the Adult life stage.",
      earned: lifeStageLabel.toLowerCase().includes("adult"),
    },
    {
      id: "silver-muzzle",
      icon: "🧓",
      label: "Silver Muzzle",
      description: "Reach the Senior life stage.",
      earned: lifeStageLabel.toLowerCase().includes("senior"),
    },
    {
      id: "coin-saver",
      icon: "💰",
      label: "Rainy Day Fund",
      description: "Save up 1,000 coins.",
      earned: coins >= 1000,
      meta: `${coins}/1000`,
    },
    {
      id: "long-haul",
      icon: "⏳",
      label: "Long-Term Friend",
      description: "Keep your pup for 90 in-game days or longer.",
      earned: ageDays >= 90,
      meta: `${Math.floor(ageDays)} days`,
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <section className="rounded-xl border border-amber-500/30 bg-zinc-900/80 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-amber-300">
            Badges &amp; Achievements
          </h2>
          <p className="text-xs text-zinc-400">
            {earnedCount > 0
              ? `${earnedCount} of ${badges.length} badges earned`
              : "Start playing and caring for your pup to begin unlocking badges."}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-[0.65rem] text-zinc-400">
          <span>
            Level <span className="font-semibold text-amber-200">{level}</span>{" "}
            · Streak{" "}
            <span className="font-semibold text-amber-200">
              {streakCurrent}d
            </span>
          </span>
          <span>
            Best streak{" "}
            <span className="font-semibold text-amber-200">{streakBest}d</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {badges.map((badge) => {
          const isEarned = badge.earned;
          return (
            <div
              key={badge.id}
              className={
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center " +
                (isEarned
                  ? "bg-zinc-950/80 border-amber-400/40 shadow shadow-amber-900/30"
                  : "bg-zinc-950/40 border-zinc-800 opacity-70")
              }
            >
              <span
                className={
                  "text-3xl " + (isEarned ? "grayscale-0" : "grayscale-[0.6]")
                }
                role="img"
                aria-label={badge.label}
              >
                {badge.icon}
              </span>
              <span
                className={
                  "font-semibold text-xs sm:text-sm " +
                  (isEarned ? "text-amber-200" : "text-zinc-300")
                }
              >
                {badge.label}
              </span>
              <span className="text-[0.7rem] text-zinc-400">
                {badge.description}
              </span>
              {badge.meta && (
                <span className="text-[0.65rem] text-amber-200/80 mt-0.5">
                  {badge.meta}
                </span>
              )}
              {!isEarned && (
                <span className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-zinc-500">
                  Locked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
