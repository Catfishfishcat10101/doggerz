// src/pages/Affection.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

function Gauge({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    safeValue >= 70
      ? "bg-emerald-500"
      : safeValue >= 40
        ? "bg-amber-400"
        : "bg-rose-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[0.7rem] text-zinc-300">
        <span className="uppercase tracking-[0.2em]">{label}</span>
        <span>{safeValue}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default function Affection() {
  const dog = useSelector(selectDog);

  const name = dog?.name || "Your pup";
  const happiness = dog?.stats?.happiness ?? 0;
  const energy = dog?.stats?.energy ?? 0;

  // Dumb but intuitive bond score: average of happiness + energy
  const bondScore = Math.round(
    (Number(happiness || 0) + Number(energy || 0)) / 2
  );

  let bondLabel = "Getting to know you";
  if (bondScore >= 80) bondLabel = "Ride-or-die";
  else if (bondScore >= 60) bondLabel = "Pretty tight";
  else if (bondScore >= 40) bondLabel = "A bit unsure";
  else bondLabel = "Keeping distance";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 min-h-[calc(100vh-7rem)]">
      <div className="space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Affection &amp; Bonding
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Long-term, this page will show how often you show up, how you
            respond when needs go red, and how that shapes{" "}
            <span className="font-semibold">{name}</span>&apos;s trust in you.
          </p>
        </header>

        {/* Bond snapshot card */}
        <section className="rounded-2xl border border-emerald-700/70 bg-emerald-950/70 p-5 text-sm text-zinc-100 space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            Current bond snapshot
          </p>
          <p className="text-base">
            <span className="font-semibold">{name}</span> currently feels:{" "}
            <span className="font-semibold text-emerald-300">{bondLabel}</span>
            .
          </p>

          <Gauge label="Happiness" value={happiness} />
          <Gauge label="Energy around you" value={energy} />

          <p className="text-[0.7rem] text-emerald-200/80">
            This is just a rough read based on how topped-up they are when
            you&apos;re around. Later, this will factor in streaks, missed days,
            and how fast you fix red bars.
          </p>
        </section>

        {/* Design doc style blurb */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-sm text-zinc-300 space-y-3">
          <p>
            Affection systems can track favorite toys, reactions to how often
            you visit, and how you respond when needs go unmet. Over time, this
            will give each Doggerz pup its own personality curve.
          </p>
          <p className="text-xs text-zinc-500">
            For now this page is mostly a design stub. The deeper temperament
            and memory systems are under active construction, but the bond
            snapshot above already reacts to your care choices.
          </p>
        </section>
      </div>
    </main>
  );
}
