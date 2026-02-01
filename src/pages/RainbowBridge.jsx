// src/pages/RainbowBridge.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageShell from "@/components/PageShell.jsx";
import {
  selectDog,
  selectDogLifeStage,
  selectDogBond,
  selectDogMemorial,
  startRainbowBridge,
  completeRainbowBridge,
} from "@/redux/dogSlice.js";

export default function RainbowBridge() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const bond = useSelector(selectDogBond);
  const memorial = useSelector(selectDogMemorial);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const modalRef = React.useRef(null);

  const isSenior = String(lifeStage?.stage || "").toUpperCase() === "SENIOR";
  const bondValue = Math.round(bond?.value ?? 0);
  const memorialCompleted = Boolean(memorial?.completedAt);
  const memorialActive = Boolean(memorial?.active);

  const bondTone =
    bondValue >= 80 ? "deep" : bondValue >= 45 ? "steady" : "growing";

  React.useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfirm]);

  return (
    <PageShell mainClassName="px-4 py-10" containerClassName="w-full max-w-4xl">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Rainbow Bridge
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-sky-200 to-violet-200">
              A quiet place to remember
            </h1>
            <p className="mt-3 text-sm text-zinc-200/90 max-w-prose">
              This scene is here as a gentle, cozy space in the world — a place
              for gratitude, reflection, and the bond you built.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
                Bond {bondValue}%
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-zinc-200">
                {bondTone} bond
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-zinc-200">
                Stage {lifeStage?.label || "Pup"}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
              <p className="text-sm text-zinc-200/90 leading-relaxed">
                When you’re ready, take a slow breath. Think of a moment your
                pup made you smile. That’s the kind of magic we’re collecting
                here.
              </p>
              {dog?.name ? (
                <div className="mt-4 text-xs text-zinc-400">
                  Pup:{" "}
                  <span className="font-semibold text-zinc-100">
                    {dog.name}
                  </span>{" "}
                  · Bond:{" "}
                  <span className="font-semibold text-emerald-200">
                    {bondValue}%
                  </span>{" "}
                  · Stage:{" "}
                  <span className="font-semibold text-zinc-200">
                    {lifeStage?.label || "Pup"}
                  </span>
                </div>
              ) : null}
              <div className="mt-4 grid gap-2 text-xs text-zinc-300/80">
                {!isSenior ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    This moment unlocks once your pup reaches the senior stage.
                  </div>
                ) : memorialCompleted ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                    Your memorial is complete. You can revisit this space
                    anytime.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isSenior && !memorialCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!memorialActive) {
                      dispatch(startRainbowBridge({ now: Date.now() }));
                    } else {
                      setShowConfirm(true);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
                >
                  {memorialActive
                    ? "Complete the memorial"
                    : "Begin the memorial"}
                </button>
              ) : null}
              {!isSenior ? (
                <Link
                  to="/game"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
                >
                  Keep raising your pup
                </Link>
              ) : null}
              <Link
                to="/game"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Back to the yard
              </Link>
              <Link
                to="/memories"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Open Memory Reel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showConfirm ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Complete memorial
            </div>
            <h2 className="mt-2 text-xl font-extrabold text-emerald-200">
              Ready to close this chapter?
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              You can revisit this space anytime. Completing the memorial simply
              marks the journey with gratitude and closure.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-2xl border border-white/15 bg-black/40 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-black/55"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(completeRainbowBridge({ now: Date.now() }));
                  setShowConfirm(false);
                }}
                className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
              >
                Complete memorial
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
