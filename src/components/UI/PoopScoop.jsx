// src/components/UI/PoopScoop.jsx
import React from "react";

export default function PoopScoop({ poopCount = 0, onScoop = () => {} }) {
  return (
    <div className="rounded-xl bg-slate-900/40 p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Cleanup</h3>
        <p className="text-sm opacity-80">{poopCount} on the floor</p>
      </div>
      <button
        className="text-xs rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-700"
        onClick={onScoop}
        disabled={poopCount === 0}
      >
        🧹 Scoop
      </button>
    </div>
  );
}