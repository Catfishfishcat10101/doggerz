// src/features/game/TrainingPanel.jsx

import { useDispatch } from "react-redux";

import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import { trainObedience } from "@/redux/dogSlice.js";

export default function TrainingPanel({
  pottyComplete,
  trainingInputMode,
  allowButtonTraining,
  allowVoiceTraining,
  commands,
  selectedCommandId,
  onSelectCommand,
}) {
  const dispatch = useDispatch();

  return (
    <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-400">
            Training
          </div>
          <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
            {pottyComplete ? "Commands" : "Locked"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Mode
          </div>
          <div className="text-xs font-semibold text-zinc-200">
            {String(trainingInputMode || "buttons")}
          </div>
        </div>
      </div>

      {!pottyComplete ? (
        <div className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Finish potty training to unlock trick commands.
        </div>
      ) : null}

      {/* Command list */}
      <div className="mt-3 grid grid-cols-1 gap-2">
        {(commands || []).map((c) => {
          const active = c.id === selectedCommandId;
          return (
            <button
              key={c.id}
              type="button"
              disabled={!pottyComplete || !allowButtonTraining}
              onClick={() => onSelectCommand?.(c.id)}
              className={
                active
                  ? "flex items-center justify-between rounded-2xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-left"
                  : "flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-left hover:bg-black/35"
              }
            >
              <div>
                <div
                  className={
                    active
                      ? "text-sm font-extrabold text-emerald-100"
                      : "text-sm font-semibold text-zinc-100"
                  }
                >
                  {c.label}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {allowButtonTraining ? "Tap to select" : "Voice-only"}
                </div>
              </div>
              <div
                className={
                  active
                    ? "grid place-items-center h-10 w-10 rounded-2xl border border-emerald-400/45 bg-emerald-500/15"
                    : "grid place-items-center h-10 w-10 rounded-2xl border border-white/12 bg-black/20"
                }
                aria-hidden
              >
                <span className={active ? "text-emerald-200" : "text-zinc-300"}>
                  {active ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {pottyComplete && allowButtonTraining ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
          <div>
            <div className="text-xs font-semibold text-emerald-100">
              Train selected
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-300/80">
              Click to practice{" "}
              <span className="font-semibold">{selectedCommandId}</span>.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              dispatch(
                trainObedience({
                  commandId: selectedCommandId,
                  success: true,
                  xp: 6,
                  now: Date.now(),
                })
              )
            }
            className="shrink-0 rounded-2xl border border-emerald-400/45 bg-emerald-500/15 px-3 py-2 text-xs font-extrabold text-emerald-100 hover:bg-emerald-500/20 transition"
          >
            Practice
          </button>
        </div>
      ) : null}

      {/* Voice control */}
      {allowVoiceTraining ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/25 px-3 py-3">
          <div>
            <div className="text-xs font-semibold text-zinc-200">
              Hold to train (voice)
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-400">
              Try “sit”, “stay”, “roll over”, “speak”
            </div>
          </div>
          <div className="shrink-0">
            <VoiceCommandButton />
          </div>
        </div>
      ) : null}
    </section>
  );
}
