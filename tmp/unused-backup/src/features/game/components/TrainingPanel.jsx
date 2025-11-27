import React from "react";

export default function TrainingPanel({ pottyComplete = false }) {
  const tricks = [
    { id: "sit", label: "Sit", unlocked: pottyComplete },
    { id: "stay", label: "Stay", unlocked: false },
    { id: "roll", label: "Roll Over", unlocked: false },
    { id: "speak", label: "Speak", unlocked: false },
    { id: "paw", label: "Paw", unlocked: false },
    { id: "spin", label: "Spin", unlocked: false },
    { id: "fetch", label: "Fetch", unlocked: false },
    { id: "jump", label: "Jump", unlocked: false },
  ];

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-white">Training</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tricks.map((t) => (
          <button
            key={t.id}
            disabled={!t.unlocked}
            className={`px-3 py-1 rounded text-sm ${t.unlocked ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 cursor-not-allowed"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!pottyComplete && (
        <div className="mt-2 text-xs text-zinc-400">
          Start with potty training to unlock your pup's first trick.
        </div>
      )}
    </div>
  );
}
