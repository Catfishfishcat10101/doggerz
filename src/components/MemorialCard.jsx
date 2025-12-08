// src/components/MemorialCard.jsx
import React from "react";

export default function MemorialCard({ memorial, onRestore, onDelete }) {
  const title = memorial.title || memorial.name || "A beloved pup";
  const savedAt = memorial.savedAt
    ? new Date(memorial.savedAt).toLocaleString()
    : "Unknown";

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-emerald-300">{title}</h3>
          <p className="text-xs text-zinc-400 mt-1">Saved: {savedAt}</p>
        </div>
        <div className="flex gap-2">
          {onRestore && (
            <button
              className="btn btn--small bg-emerald-600 hover:bg-emerald-500 text-black"
              onClick={() => onRestore(memorial)}
              aria-label={`Restore ${title}`}
            >
              Adopt from memory
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn--small btn--ghost"
              onClick={() => onDelete(memorial.id)}
              aria-label={`Delete ${title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {memorial.summary && (
        <p className="text-sm text-zinc-300 mt-3">{memorial.summary}</p>
      )}
    </article>
  );
}
