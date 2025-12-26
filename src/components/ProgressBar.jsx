import * as React from "react";

export default function ProgressBar({
  value = 0,
  max = 100,
  label = "",
  color = "emerald", // supported: emerald, amber, red, blue, sky, violet
  tone, // alias for legacy callers
  size = "md", // sm, md, lg
  showPercent = true,
}) {
  const resolvedColor = tone || color;
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  const sizeMap = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };
  const heightClass = sizeMap[size] || sizeMap.md;

  const colorMap = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    red: "bg-red-500",
    blue: "bg-blue-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
  };
  const fillClass = colorMap[resolvedColor] || colorMap.emerald;

  return (
    <div className="w-full">
      {label ? (
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-zinc-800 dark:text-zinc-200 text-sm">{label}</span>
          {showPercent && (
            <span className="text-zinc-600 dark:text-zinc-400 text-xs">{pct}%</span>
          )}
        </div>
      ) : (
        showPercent && (
          <div className="flex justify-end mb-1">
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">{pct}%</span>
          </div>
        )
      )}

      <div
        className={`w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden ${heightClass}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "progress"}
      >
        <div
          className={`${fillClass} h-full transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
