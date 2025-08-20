// src/components/UI/StatsBar.jsx
import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

/**
 * Reusable, accessible, animated progress bar.
 * - Keyboard/screen-reader friendly via role="progressbar" and aria-*.
 * - Smooth width tween on value changes.
 * - Optional `compact` prop to tighten spacing for mobile.
 */
function Bar({ label, value, gradient, compact = false }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const height = compact ? "h-3" : "h-4";

  return (
    <div className={compact ? "my-1" : "my-2"}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-semibold text-gray-800 ${compact ? "text-[10px]" : "text-xs"}`}>
          {label}
        </span>
        <span
          className={`font-mono text-gray-600 ${compact ? "text-[10px]" : "text-xs"}`}
          title={`${Math.round(clamped)}%`}
        >
          {Math.round(clamped)}%
        </span>
      </div>

      <div
        className={`w-full bg-gray-200 rounded overflow-hidden ${height}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
      >
        <motion.div
          className={`${height} ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "tween", duration: 0.35 }}
        />
      </div>
    </div>
  );
}

/**
 * StatsBar
 * Pulls dog stats from Redux and renders three bars: Happiness, Energy, XP.
 * - `compact` (boolean): tighter layout for small screens or header usage.
 * - `className` (string): additional container classes.
 */
export default function StatsBar({ compact = false, className = "" }) {
  const { happiness = 0, energy = 0, xp = 0 } = useSelector((state) => state.dog || {});

  return (
    <div
      className={[
        "w-full max-w-sm px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow ring-1 ring-black/5",
        compact ? "max-w-[18rem] py-1" : "",
        className,
      ].join(" ")}
      data-testid="stats-bar"
    >
      <Bar
        label="Happiness"
        value={happiness}
        gradient="bg-gradient-to-r from-yellow-400 to-yellow-500"
        compact={compact}
      />
      <Bar
        label="Energy"
        value={energy}
        gradient="bg-gradient-to-r from-green-400 to-green-600"
        compact={compact}
      />
      <Bar
        label="XP"
        value={Math.min(xp, 100)}
        gradient="bg-gradient-to-r from-blue-400 to-blue-600"
        compact={compact}
      />
    </div>
  );
}