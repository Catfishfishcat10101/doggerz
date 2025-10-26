// src/components/Features/PoopRenderer.jsx
import React from "react";

/** Simple renderer to show current poop items in yard.
 *  Controlled by parent (e.g., PottyTrainer) via props.
 */
export default function PoopRenderer({ poops = [], onScoop }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {poops.length === 0 && (
        <div className="col-span-6 text-center text-rose-900/60">
          No poop in the yard. Nice! ✨
        </div>
      )}
      {poops.map((p) => (
        <button
          key={p.id}
          onClick={() => onScoop?.(p.id)}
          className="bg-white rounded-xl shadow px-3 py-2 hover:shadow-md active:scale-95"
          title="Scoop"
        >
          💩
        </button>
      ))}
    </div>
  );
}
