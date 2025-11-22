// src/pages/Potty.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import { selectPotty } from "@/redux/dogSlice.js";

export default function Potty() {
  const potty = useSelector(selectPotty);

  const training = Math.round(potty.training ?? 0);
  const successCount = potty.totalSuccesses ?? 0;
  const accidentCount = potty.totalAccidents ?? 0;

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50">
      <div className="container mx-auto px-4 py-10 max-w-xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Potty training</h1>
          <p className="text-sm text-zinc-300">
            Every successful potty walk outside builds your pup&apos;s potty
            training meter. Accidents inside slow progress down.
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-100">
              Training progress
            </span>
            <span className="text-zinc-300">{training}%</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400"
              style={{ width: `${training}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            At 100%, your pup is considered fully potty trained and accidents
            become rare.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-400 text-xs mb-1">Outdoor successes</p>
            <p className="text-lg font-semibold text-emerald-300">
              {successCount}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs mb-1">Indoor accidents</p>
            <p className="text-lg font-semibold text-rose-300">
              {accidentCount}
            </p>
          </div>
        </section>

        <p className="text-xs text-zinc-500">
          Tip: Use the <span className="font-semibold">Potty Walk</span> button
          in the main game screen regularly after feeding or long play sessions
          to build a consistent routine.
        </p>
      </div>
    </div>
  );
}
