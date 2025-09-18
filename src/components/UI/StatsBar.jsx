import React from "react";

function Bar({ label, value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="space-y-1">
      <div className="text-xs text-rose-900/70">{label}</div>
      <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
        <div className="h-full bg-rose-600" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function StatsBar({ happiness = 50, energy = 50, cleanliness = 50, hunger = 50 }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <Bar label="Happiness" value={happiness} />
      <Bar label="Energy" value={energy} />
      <Bar label="Cleanliness" value={cleanliness} />
      <Bar label="Hunger (lower is better)" value={100 - hunger} />
    </div>
  );
}