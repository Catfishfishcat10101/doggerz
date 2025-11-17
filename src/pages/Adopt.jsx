// src/pages/Adopt.jsx
import React, { useState } from "react"; // <— add default React import
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  resetDogState,
  setDogName,
  setAdoptedAt,
  registerSessionStart,
} from "@/redux/dogSlice.js"; // uses your @ alias
import { PATHS } from "@/routes.js";

export default function Adopt() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("Pup");
  const [breed, setBreed] = useState("jackrussell");

  const handleAdopt = (e) => {
    e.preventDefault();

    const now = Date.now();
    const finalName = (name || "").trim() || "Pup";

    // Reset existing dog state and set up a new run
    dispatch(resetDogState());
    dispatch(setDogName(finalName));
    dispatch(setAdoptedAt(now));
    dispatch(registerSessionStart({ now }));
    // You can later store breed in the slice:
    // dispatch(setBreed(breed))

    // Go to the main game
    navigate(PATHS.GAME); // instead of hardcoded "/play"
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">
              Adopt. Train. Bond.
            </span>
            <span className="text-2xl font-bold tracking-tight">Doggerz</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
          {/* Left: form */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              Choose your new pup.
            </h1>
            <p className="text-sm text-slate-300 mb-6 max-w-xl">
              Give your dog a name, pick a vibe, and start your long-term bond.
              Doggerz runs in real time, so how often you show up actually
              matters.
            </p>

            <form
              onSubmit={handleAdopt}
              className="space-y-6 max-w-md bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              {/* Pup name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Pup name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Pup"
                  maxLength={24}
                />
              </div>

              {/* Breed style */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Breed style
                </label>
                <select
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="jackrussell">Jack Russell (default)</option>
                  <option value="shepherd">Shepherd</option>
                  <option value="corgi">Corgi</option>
                  <option value="mutt">Mystery mutt</option>
                </select>
              </div>

              {/* CTA */}
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold py-2.5 transition"
              >
                Adopt this pup
              </button>
            </form>
          </div>

          {/* Right: info card */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/10 to-sky-500/5 p-6 text-sm">
            <h2 className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold">
              What you’re signing up for
            </h2>
            <ul className="mt-4 space-y-2 text-slate-100 text-xs sm:text-sm">
              <li>• Your dog ages over real days, not sessions.</li>
              <li>• Hunger, boredom, and dirt creep in while you&apos;re away.</li>
              <li>• Neglect gets recorded in your pup&apos;s journal.</li>
              <li>• Consistent care builds streaks and unlocks perks.</li>
            </ul>
            <p className="mt-4 text-[11px] text-slate-400">
              You can always adopt again later, but each pup&apos;s story is unique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
