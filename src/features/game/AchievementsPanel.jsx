// src/features/game/AchievementsPanel.jsx
import React from "react";
import PropTypes from "prop-types";
// import BadgeIcon from "../components/BadgeIcon";
import BadgeIcon from "@/components/BadgeIcon";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice";

/**
 * AchievementsPanel displays all earned badges, highlighting rare and premium ones.
 */

export default function AchievementsPanel() {
  const dog = useSelector(selectDog);
  // Example: badges array could be expanded with real logic
  const badges = [
    {
      type: "potty",
      label: "Potty Trained",
      earned: dog?.training?.potty?.completedAt,
      rare: false,
      premium: false,
      icon: "🚽",
    },
    {
      type: "streak",
      label: "7-Day Streak",
      earned: dog?.streak?.currentStreakDays >= 7,
      rare: true,
      premium: false,
      icon: "🔥",
    },
    {
      type: "premium",
      label: "Premium Pup",
      earned: dog?.isPremium,
      rare: false,
      premium: true,
      icon: "💎",
    },
    // Add more badges as needed
  ];

  return (
    <section className="rounded-2xl border border-emerald-700 bg-zinc-950/90 p-4 space-y-3 mt-4">
      <h2 className="text-lg font-bold text-emerald-300 mb-2">Achievements</h2>
      <div className="flex flex-wrap gap-3">
        {badges.filter((b) => b.earned).length === 0 && (
          <span className="text-zinc-500 text-sm">
            No badges earned yet. Keep playing!
          </span>
        )}
        {badges
          .filter((b) => b.earned)
          .map((badge) => (
            <BadgeIcon key={badge.type} {...badge} />
          ))}
      </div>
    </section>
  );
}

/* AchievementsPanel uses redux selectors; no external props */
