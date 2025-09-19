// src/components/UI/StatsBar.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectHappiness } from "../../redux/dogSlice";

export default function StatsBar() {
  const happiness = useSelector(selectHappiness);

  const barColor = useMemo(
    () =>
      happiness > 66
        ? "bg-green-500"
        : happiness > 33
        ? "bg-yellow-500"
        : "bg-red-500",
    [happiness]
  );

  return (
    <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-emerald-900">Happiness</span>
        <div className="w-48 h-3 bg-emerald-900/10 rounded">
          <div
            className={`h-3 ${barColor} rounded`}
            style={{ width: `${Math.max(0, Math.min(100, happiness))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
