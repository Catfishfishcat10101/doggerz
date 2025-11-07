import React from "react";

/** Generic progress bar (0..100) with label. */
export default function ProgressBar({
  value = 0,
  label,
  className = "",
  trackClass = "bg-white/10",
  fillClass = "bg-emerald-400",
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={className}>
      <div className={`meter ${trackClass}`}>
        <div className={`meter__fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      {label ? (
        <div className="mt-1 text-xs opacity-70">
          {label} — <span className="tabular-nums">{pct}%</span>
        </div>
      ) : null}
    </div>
  );
}