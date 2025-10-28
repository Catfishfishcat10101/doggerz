import React from "react";
export default function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-4">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" aria-hidden />
      <span className="text-sm text-neutral-300">{label}</span>
    </div>
  );
}
