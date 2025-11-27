// src/features/dashboard/EventBanner.jsx
// @ts-nocheck
//
// Doggerz: Event banner for the dashboard.
// Priority:
//  1) If a config slice exists with an active event (state.config.events), use that.
//  2) Otherwise, derive a "soft event" from dog state (streaks, potty training, life stage).
//
// This way, you don't need a config slice at all for it to be useful,
// but you can still plug one in later if you want seasonal events.

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

/**
 * Creates a derived "event" object from the dog's state if no config events exist.
 * This gives you something interesting on the dashboard without extra slices.
 */
function getDerivedEventFromDog(dog) {
  if (!dog) return null;

  const now = Date.now();
  const todayIso = toIsoDate(now);

  const streakCurrent = dog.streak?.current ?? 0;
  const potty = dog.training?.puppy?.potty ?? {};
  const pottySuccesses = potty.successes ?? 0;
  const pottyTarget = 8;
  const pottyComplete = !!potty.completedAt;
  const lifeStageLabel = dog.lifeStageLabel ?? dog.lifeStage ?? "Puppy";

  // 1) Actively training potty? Focus event.
  if (!pottyComplete && pottySuccesses < pottyTarget) {
    const remaining = pottyTarget - pottySuccesses;
    return {
      id: "potty-training-focus",
      name: "Potty Training Focus",
      banner:
        remaining > 0
          ? `Help your pup nail ${remaining} more perfect potty trips to finish training.`
          : "You’re almost done with potty training. One more clean streak!",
      startDate: "Puppy stage",
      endDate: "Until training completes",
      theme: "sky",
    };
  }

  // 2) Strong streak ongoing
  if (streakCurrent >= 7) {
    return {
      id: "streak-week",
      name: "Streak Week",
      banner: `You’re on a ${streakCurrent}-day care streak. Keep checking in daily to push it higher.`,
      startDate: `Current streak: ${streakCurrent} days`,
      endDate: "Break it and the streak resets",
      theme: "amber",
    };
  }

  if (streakCurrent >= 3) {
    return {
      id: "streak-starter",
      name: "Streak Starter",
      banner: `Nice, you’ve checked in ${streakCurrent} days in a row. Keep it going for bigger rewards later.`,
      startDate: `Current streak: ${streakCurrent} days`,
      endDate: "Aim for 7+ days",
      theme: "amber",
    };
  }

  // 3) Life-stage spotlight as a default
  return {
    id: "life-stage-season",
    name: `${lifeStageLabel} Season`,
    banner: `Your pup is in the ${lifeStageLabel.toLowerCase()} chapter. Needs, decay, and training are tuned for this stage.`,
    startDate: todayIso || "Today",
    endDate: "Ongoing",
    theme: "emerald",
  };
}

export default function EventBanner() {
  const dog = useSelector(selectDog);

  // This is defensive: if you add a config slice later, it just works.
  const configEvents = useSelector((state) => state.config?.events) || [];

  const activeConfigEvent = configEvents.find((e) => e?.active);

  const derivedEvent =
    !activeConfigEvent && dog ? getDerivedEventFromDog(dog) : null;

  const event = activeConfigEvent || derivedEvent;

  if (!event) return null;

  const theme = event.theme || "sky";

  const borderClass =
    theme === "emerald"
      ? "border-emerald-500/30"
      : theme === "amber"
        ? "border-amber-500/30"
        : "border-sky-500/30";

  const bgClass =
    theme === "emerald"
      ? "bg-emerald-900/80"
      : theme === "amber"
        ? "bg-amber-900/80"
        : "bg-sky-900/80";

  const headingClass =
    theme === "emerald"
      ? "text-emerald-300"
      : theme === "amber"
        ? "text-amber-300"
        : "text-sky-300";

  const subtitleClass =
    theme === "emerald"
      ? "text-emerald-100"
      : theme === "amber"
        ? "text-amber-100"
        : "text-sky-100";

  return (
    <div
      className={`rounded-xl ${borderClass} ${bgClass} p-4 mb-4 flex flex-col items-center text-center`}
    >
      <h2 className={`text-lg font-bold ${headingClass}`}>{event.name}</h2>

      {event.banner && (
        <span className={`text-sm ${subtitleClass} mb-2`}>{event.banner}</span>
      )}

      {(event.startDate || event.endDate) && (
        <span className="text-xs text-zinc-200/80">
          {event.startDate}
          {event.endDate ? ` – ${event.endDate}` : null}
        </span>
      )}
    </div>
  );
}
