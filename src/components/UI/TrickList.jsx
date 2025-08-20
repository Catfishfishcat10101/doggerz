// src/components/UI/TrickList.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default function TrickList() {
  // Always fall back to empty array to avoid crashes
  const tricksRaw = useSelector((state) => state.dog.tricksLearned || []);

  // De-dupe, filter empties, and sort for a clean UI
  const tricks = useMemo(
    () =>
      Array.from(new Set((tricksRaw || []).filter(Boolean)))
        .map((t) => (typeof t === "string" ? t : t?.name ?? "")) // supports objects later
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [tricksRaw]
  );

  const empty = tricks.length === 0;

  return (
    <div
      className="bg-white/10 backdrop-blur-md p-4 rounded shadow-md w-full mx-auto text-white"
      aria-live="polite"
      aria-label="Learned tricks"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">🎓 Learned Tricks</h3>
        <span className="text-sm opacity-80">{tricks.length}</span>
      </div>

      {empty ? (
        <p className="text-sm text-white/70">
          No tricks learned yet. Train your dog to unlock tricks!
        </p>
      ) : (
        <ul className="list-disc list-inside text-sm space-y-1">
          {tricks.map((trick) => (
            <li key={trick}>{trick}</li>
          ))}
        </ul>
      )}
    </div>
  );
}