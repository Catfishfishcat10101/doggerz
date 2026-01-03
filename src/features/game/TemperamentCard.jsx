// src/features/game/TemperamentCard.jsx
import * as React from "react";
import { useDispatch } from "react-redux";
import { markTemperamentRevealed } from "@/redux/dogSlice.js";

function TraitPill({ label, intensity }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-zinc-900/90 px-3 py-1 text-xs text-zinc-200">
      <span>{label}</span>
      <span className="text-[10px] text-zinc-400">{intensity}%</span>
    </div>
  );
}

export default function TemperamentCard({ temperament }) {
  const dispatch = useDispatch();
  const closeBtnRef = React.useRef(null);

  const handleClose = React.useCallback(() => {
    dispatch(markTemperamentRevealed());
  }, [dispatch]);

  React.useEffect(() => {
    if (!temperament) return;
    // Focus close for keyboard users.
    const t = window.setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => window.clearTimeout(t);
  }, [temperament]);

  React.useEffect(() => {
    if (!temperament) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, temperament]);

  if (!temperament) return null;

  const primary = temperament?.primary;
  const secondary = temperament?.secondary;
  const traits = Array.isArray(temperament?.traits) ? temperament.traits : [];

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full rounded-2xl border border-emerald-500/60 bg-zinc-950/95 shadow-2xl shadow-emerald-500/20 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-50">
              Temperament reveal
            </h2>
            <p className="text-xs text-zinc-400">
              After spending time together, your pup personality is
              showing.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Close
          </button>
        </div>

        <div className="rounded-xl bg-zinc-900/80 px-3 py-2 text-xs text-zinc-200 space-y-0.5">
          <p>
            Primary:{" "}
            <span className="font-semibold text-emerald-400">
              {primary || "Unknown"}
            </span>
          </p>
          {secondary && (
            <p>
              Secondary:{" "}
              <span className="font-semibold text-sky-400">{secondary}</span>
            </p>
          )}
        </div>

        {traits.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              Key traits
            </p>
            <div className="grid grid-cols-2 gap-2">
              {traits.map((t) => (
                <div key={t.id}>
                  <TraitPill label={t.label} intensity={t.intensity} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-400">
          Your pup&apos;s temperament influences idle animations, moods, and how
          quickly they get bored or excited. Keep playing together to discover
          more quirks.
        </p>

        <p className="text-[11px] text-zinc-500">Tip: press Esc to dismiss.</p>
      </div>
    </div>
  );
}
