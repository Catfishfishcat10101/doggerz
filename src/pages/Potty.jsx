// src/pages/Potty.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectDog } from "@/redux/dogSlice.js";

function describePottyTraining(training) {
  const t = Math.round(Number(training ?? 0));

  if (t >= 100) {
    return "Fully potty trained. Indoor accidents are very rare.";
  }
  if (t >= 75) {
    return "Mostly trained with occasional accidents on stressful days.";
  }
  if (t >= 50) {
    return "Getting the hang of it. Keep taking them out after meals and naps.";
  }
  if (t > 0) {
    return "Just starting out. Short, frequent potty breaks work best.";
  }
  return "Not potty trained yet. Expect frequent accidents until a routine forms.";
}

export default function Potty() {
  const navigate = useNavigate();
  const dog = useSelector(selectDog);

  // If there is no dog at all, send them to adopt
  if (!dog) {
    return (
      <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50 flex items-center">
        <div className="container mx-auto px-4 max-w-lg space-y-4">
          <h1 className="text-2xl font-bold">No pup yet</h1>
          <p className="text-sm text-zinc-300">
            You need a Doggerz pup before you can potty train them.
          </p>
          <button
            type="button"
            onClick={() => navigate("/adopt")}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-5 py-2.5 transition"
          >
            Adopt your pup
          </button>
        </div>
      </div>
    );
  }

  const potty = dog.potty || {};
  const training = Math.round(Number(potty.training ?? 0));
  const accidents = potty.accidents ?? 0;
  const lastSuccessAt = potty.lastSuccessAt
    ? new Date(potty.lastSuccessAt)
    : null;
  const lastAccidentAt = potty.lastAccidentAt
    ? new Date(potty.lastAccidentAt)
    : null;

  const summaryText = describePottyTraining(training);

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-400/90">
            Potty Training
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Potty plan for {dog.name || "your pup"}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Doggerz quietly tracks potty-training progress in the background
            every time you take your dog outside after eating, playing, or
            waking up.
          </p>
        </header>

        {/* Status card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4 shadow-lg shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-100">
                Current training level
              </p>
              <p className="text-sm text-zinc-300">
                {training}% potty trained
              </p>
            </div>

            <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, training))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-zinc-400">{summaryText}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-zinc-200">
                Total accidents
              </p>
              <p className="text-lg font-semibold text-rose-300">
                {accidents}
              </p>
              <p className="text-[11px] text-zinc-500">
                Each indoor accident slows training a bit.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-zinc-200">
                Last successful potty
              </p>
              <p className="text-xs text-zinc-300">
                {lastSuccessAt
                  ? lastSuccessAt.toLocaleString()
                  : "No logged potty trips yet."}
              </p>
              <p className="text-[11px] text-zinc-500">
                Logging regular outdoor potty trips speeds training.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-zinc-200">
                Last accident
              </p>
              <p className="text-xs text-zinc-300">
                {lastAccidentAt
                  ? lastAccidentAt.toLocaleString()
                  : "No accidents recorded yet."}
              </p>
              <p className="text-[11px] text-zinc-500">
                Consistent schedule and quick cleanups help prevent repeats.
              </p>
            </div>
          </div>
        </section>

        {/* Tips / guide section */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-100">
            Training routine tips
          </p>
          <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
            <li>
              Take your pup out <span className="font-semibold">right after</span>{" "}
              feeding, play sessions, and naps.
            </li>
            <li>
              Use the <span className="font-semibold">Potty Walk</span> button
              on the main game screen when you successfully go outside.
            </li>
            <li>
              Try to keep a consistent schedule. Irregular times make
              potty-training slower and more confusing.
            </li>
            <li>
              Don&apos;t punish accidents; clean them up and give more chances
              to succeed outside.
            </li>
          </ul>
        </section>

        <button
          type="button"
          onClick={() => navigate("/game")}
          className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          ← Back to your yard
        </button>
      </div>
    </div>
  );
}
