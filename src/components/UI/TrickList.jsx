import React, { useMemo } from "react";
const ALL_TRICKS = ["Sit", "Stay", "Roll Over", "High Five", "Speak"];

export default function TrickList({ learnedTricks = [], onLearnTrick = () => {} }) {
  const learnable = useMemo(
    () => ALL_TRICKS.filter((t) => !learnedTricks.includes(t)),
    [learnedTricks]
  );

  return (
    <div className="rounded-xl bg-slate-900/40 p-4">
      <h3 className="font-semibold mb-2">Tricks</h3>
      {learnedTricks.length > 0 && (
        <div className="mb-3 text-sm">
          <span className="opacity-70">Learned:</span>{" "}
          <span className="font-medium">{learnedTricks.join(", ")}</span>
        </div>
      )}
      <ul className="space-y-2">
        {learnable.map((t) => (
          <li key={t} className="flex items-center justify-between">
            <span>{t}</span>
            <button
              className="text-xs rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-700"
              onClick={() => onLearnTrick(t)}
            >
              Train
            </button>
          </li>
        ))}
        {learnable.length === 0 && (
          <li className="text-sm opacity-70">All tricks learned!</li>
        )}
      </ul>
    </div>
  );
}