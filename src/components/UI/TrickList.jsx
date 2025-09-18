import React from "react";

export default function TrickList({ tricks = ["Sit", "Shake", "Roll Over"] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold text-rose-900">Known Tricks</h3>
      <ul className="mt-2 text-sm text-rose-900/80 list-disc pl-5 space-y-1">
        {tricks.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}