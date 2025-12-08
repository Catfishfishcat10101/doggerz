// @ts-nocheck
// src/pages/TemperamentReveal.jsx
//
// Standalone page that shows your dog's temperament profile
// using the TemperamentCard component.

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import TemperamentCard from "@/features/game/TemperamentCard.jsx";

export default function TemperamentRevealPage() {
  const dog = useSelector(selectDog);

  const temperament = dog?.temperament || dog?.temperamentType || null;
  const traits = dog?.temperamentTraits || [];
  const rank = dog?.temperamentRank || null;
  const discoveredAt = dog?.temperamentDiscoveredAt || dog?.temperamentRevealedAt || null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-4">
        {/* Title / intro */}
        <header className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            Your Pup's Temperament
          </h1>
          <p className="mt-1 text-sm text-slate-200 max-w-xl">
            Based on how you've fed, played with, and trained your pup, Doggerz
            builds a temperament profile. This helps you understand how your
            dog is likely to react to different care and training styles.
          </p>
        </header>

        {/* Main card */}
        <TemperamentCard
          temperament={temperament}
          traits={traits}
          rank={rank}
          discoveredAt={discoveredAt}
        />

        {/* Footer hint / navigation hint (optional) */}
        <p className="text-[11px] text-slate-400 mt-3">
          Temperament can evolve slightly over time as you continue to play and
          train. Check back after big milestones or life stages to see how your
          pup grows.
        </p>
      </div>
    </div>
  );
}
