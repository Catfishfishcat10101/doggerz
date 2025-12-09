import React from "react";

export default function CareActionsPanel() {
  return (
    <div className="space-y-2">
      <button className="px-3 py-1 bg-blue-500 text-white rounded">Feed</button>
      <button className="px-3 py-1 bg-amber-500 text-white rounded">
        Play
      </button>
      <button className="px-3 py-1 bg-slate-500 text-white rounded">
        Groom
      </button>
    </div>
  );
}
