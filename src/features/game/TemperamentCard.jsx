// src/features/game/TemperamentCard.jsx
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { markTemperamentRevealed } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useYardSfx } from "@/components/useYardSfx.js";

function TraitPill({ label, intensity }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-zinc-900/90 px-3 py-1 text-xs text-zinc-200">
      <span>{label}</span>
      <span className="text-[10px] text-zinc-400">{intensity}%</span>
    </div>
  );
}

function getFocusableNodes(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll(
    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (el) =>
      !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export default function TemperamentCard({ temperament, onClose }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const { playBark } = useYardSfx(settings);

  const closeBtnRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const sfxPlayedRef = React.useRef(false);

  const handleClose = React.useCallback(() => {
    dispatch(markTemperamentRevealed());
    if (typeof onClose === "function") onClose();
  }, [dispatch, onClose]);

  React.useEffect(() => {
    if (!temperament) return;
    sfxPlayedRef.current = false;
  }, [temperament]);

  React.useEffect(() => {
    if (!temperament || sfxPlayedRef.current) return;
    sfxPlayedRef.current = true;
    playBark?.({ throttleMs: 500 });
  }, [playBark, temperament]);

  React.useEffect(() => {
    if (!temperament) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => window.clearTimeout(t);
  }, [temperament]);

  React.useEffect(() => {
    if (!temperament) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = getFocusableNodes(panelRef.current);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, temperament]);

  if (!temperament) return null;

  const primary = temperament?.primary;
  const secondary = temperament?.secondary;
  const traits = Array.isArray(temperament?.traits) ? temperament.traits : [];

  return (
    <div className="fixed inset-0 z-40">
      <style>{`
        @keyframes dg-temperament-in {
          0% { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.98); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes dg-temperament-overlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes dg-confetti {
          0% { opacity: 0; transform: translate3d(0,0,0) scale(0.6); }
          15% { opacity: 0.9; }
          100% { opacity: 0; transform: translate3d(var(--x), var(--y), 0) scale(1); }
        }
        .dg-temperament-card {
          animation: dg-temperament-in 240ms ease-out;
        }
        .dg-temperament-overlay {
          animation: dg-temperament-overlay 220ms ease-out;
        }
        .dg-confetti {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(251, 191, 36, 0.9);
          animation: dg-confetti 900ms ease-out forwards;
          animation-delay: var(--delay);
        }
        .dg-pawprint {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(226, 232, 240, 0.75);
          box-shadow:
            -7px -8px 0 -2px rgba(226, 232, 240, 0.6),
            7px -8px 0 -2px rgba(226, 232, 240, 0.6),
            0 -12px 0 -2px rgba(226, 232, 240, 0.6);
          animation: dg-confetti 900ms ease-out forwards;
          animation-delay: 40ms;
        }
        @media (prefers-reduced-motion: reduce) {
          .dg-temperament-card,
          .dg-temperament-overlay,
          .dg-confetti,
          .dg-pawprint {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] dg-temperament-overlay"
        onPointerDown={handleClose}
      />

      <div className="relative z-10 flex h-full items-end justify-center px-4 pb-6 pointer-events-none">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="temperament-title"
          className="pointer-events-auto relative max-w-md w-full rounded-2xl border border-emerald-500/60 bg-zinc-950/95 shadow-2xl shadow-emerald-500/20 p-4 space-y-3 dg-temperament-card"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute -right-2 -top-2 h-12 w-12">
            <span
              className="dg-confetti"
              style={{ "--x": "16px", "--y": "-18px", "--delay": "0ms" }}
            />
            <span
              className="dg-confetti"
              style={{ "--x": "8px", "--y": "-28px", "--delay": "40ms" }}
            />
            <span
              className="dg-confetti"
              style={{ "--x": "-12px", "--y": "-22px", "--delay": "20ms" }}
            />
            <span
              className="dg-confetti"
              style={{ "--x": "-18px", "--y": "-8px", "--delay": "60ms" }}
            />
            <span
              className="dg-confetti"
              style={{ "--x": "14px", "--y": "-6px", "--delay": "80ms" }}
            />
            <span
              className="dg-pawprint"
              style={{ "--x": "-6px", "--y": "-18px" }}
            />
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h2
                id="temperament-title"
                className="text-sm font-semibold text-zinc-50"
              >
                Temperament reveal
              </h2>
              <p className="text-xs text-zinc-400">
                After spending time together, your pup personality is showing.
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
            Your pup&apos;s temperament influences idle animations, moods, and
            how quickly they get bored or excited. Keep playing together to
            discover more quirks.
          </p>

          <p className="text-[11px] text-zinc-500">
            Tip: press Esc to dismiss.
          </p>
        </div>
      </div>
    </div>
  );
}
