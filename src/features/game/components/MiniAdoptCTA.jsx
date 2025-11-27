import React, { useState } from "react";
import AdoptOnlyModal from "@/features/game/components/AdoptOnlyModal.jsx";

export default function MiniAdoptCTA({
  primaryHref = "/adopt",
  primaryLabel = "Adopt a pup",
  onLearnMore = null,
}) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-emerald-400 bg-emerald-400 px-3 py-2 text-sm font-medium uppercase tracking-wide text-slate-950 transition-transform hover:-translate-y-0.5"
      >
        {hover ? "Start Caring" : primaryLabel}
      </button>

      <div
        className={`absolute top-full mt-2 left-0 w-64 rounded-lg bg-zinc-900/90 border border-zinc-800 p-3 text-sm transition transform ${hover ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        aria-hidden={!hover}
        style={{ transformOrigin: "top left" }}
      >
        <div className="font-semibold text-white">Ready to adopt?</div>
        <div className="text-zinc-400 text-xs mt-1">
          One pup per device for now. You keep their story locally.
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1 rounded bg-emerald-500 text-black font-semibold text-sm"
          >
            Adopt now
          </button>
          {onLearnMore ? (
            <button
              onClick={() => onLearnMore()}
              className="px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm"
            >
              Learn more
            </button>
          ) : (
            <a
              href={primaryHref}
              className="px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm"
            >
              Learn more
            </a>
          )}
        </div>
      </div>

      <AdoptOnlyModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
