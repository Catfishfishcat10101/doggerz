// src/pages/Adopt.jsx
// @ts-nocheck

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  resetDogState,
  setDogName,
  setAdoptedAt,
  registerSessionStart,
} from "@/redux/dogSlice.js";

export default function Adopt() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("Pup");
  const [breed, setBreed] = useState("jackrussell");

  const handleAdopt = (e) => {
    e.preventDefault();

    const now = Date.now();
    const finalName = (name || "").trim() || "Pup";

    dispatch(resetDogState());
    dispatch(setDogName(finalName));
    dispatch(setAdoptedAt(now));
    dispatch(registerSessionStart(now));

    navigate("/game");
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl space-y-5">
        {/* smaller Dog polls & cleanliness explainer */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 shadow-lg shadow-black/50">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="space-y-1 md:max-w-md">
              <h2 className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.18em]">
                Dog polls &amp; cleanliness
              </h2>
              <p className="text-[11px] text-zinc-300">
                Timed <span className="italic">dog polls</span> nudge you with
                quick choices. Skip them for too long and your pup will let you
                know how it feels. Cleanliness also shifts between tiers that
                affect happiness, energy, and potty training.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] md:w-60">
              <div className="rounded-xl border border-emerald-500/60 bg-zinc-950/70 px-2 py-1.5">
                <p className="font-semibold text-emerald-300">Fresh</p>
                <p className="text-[10px] text-zinc-300">
                  Regular baths keep stats boosted and the coat shiny.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-600 bg-zinc-950/70 px-2 py-1.5">
                <p className="font-semibold text-zinc-100">Dirty</p>
                <p className="text-[10px] text-zinc-300">
                  Skip a wash and dirt creeps in, lowering happiness.
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/70 bg-zinc-950/70 px-2 py-1.5">
                <p className="font-semibold text-amber-300">Fleas</p>
                <p className="text-[10px] text-zinc-300">
                  Itchy, restless, and burning energy faster until treated.
                </p>
              </div>
              <div className="rounded-xl border border-red-500/70 bg-zinc-950/70 px-2 py-1.5">
                <p className="font-semibold text-red-300">Mange</p>
                <p className="text-[10px] text-zinc-300">
                  Rock-bottom cleanliness. Needs serious care to recover.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Adoption form */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 px-5 py-5 shadow-xl shadow-black/60">
          <header className="mb-4 space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/90">
              Start your story
            </p>
            <h1 className="text-xl font-semibold text-zinc-50">
              Adopt your pup
            </h1>
            <p className="text-xs text-zinc-400 max-w-md">
              Pick a name and breed to begin. Doggerz will track time even when
              the app is closed.
            </p>
          </header>

          <form onSubmit={handleAdopt} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-zinc-200"
              >
                Pup name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/70"
                placeholder="Fireball"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="breed"
                className="block text-xs font-medium text-zinc-200"
              >
                Breed
              </label>
              <select
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/70"
              >
                <option value="jackrussell">Jack Russell mix</option>
                <option value="lab">Lab mix</option>
                <option value="shepherd">Shepherd mix</option>
                <option value="mutt">Mystery mutt</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-6 py-2.5 transition shadow-lg shadow-emerald-500/30"
            >
              Confirm adoption
            </button>

            <p className="text-[11px] text-zinc-500 max-w-md">
              You can always rename or re-adopt later, but every run leaves a
              trail in your pup&apos;s memory journal.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
