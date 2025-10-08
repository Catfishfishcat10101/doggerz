import React from "react";
import { useSelector } from "react-redux";

function CleanlinessBar() {
  const { isDirty, hasFleas, hasMange } = useSelector((s) => s.dog);

  // SIMPLE PCT MAPPING
  const pct = hasMange ? 0 : hasFleas ? 25 : isDirty ? 60 : 100;

  const barColor =
    pct === 100
      ? "bg-green-500"
      : pct >= 60
      ? "bg-yellow-400"
      : pct >= 25
      ? "bg-orange-500"
      : "bg-red-600";

  return (
    <div className="w-64">
      <div
        className="text-xs mb-1 opacity-80"
        aria-live="polite"
      >{`${pct}%`}</div>

      <div
        className="w-full bg-gray-200 rounded h-4 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Dog cleanliness"
      >
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default CleanlinessBar;