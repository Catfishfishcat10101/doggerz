// @ts-nocheck
// src/routes/AdoptGate.jsx
//
// Simple adoption gate:
// - Lets the player name their dog
// - Marks adoption time
// - Redirects to /game

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";
import { useNavigate } from "react-router-dom";

import {
  selectDog,
  setDogName,
  setAdoptedAt,
} from "@/redux/dogSlice.js";

export default function AdoptGate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dog = useSelector(selectDog);

  const [name, setNameInput] = useState(dog?.name || "Pup");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please give your pup a name.");
      return;
    }

    setError("");

    // Save name + adoption timestamp
    dispatch(setDogName(trimmed));
    dispatch(setAdoptedAt(new Date().toISOString()));

    // Go to main game
    navigate("/game");
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-black/60 border border-emerald-500/50 rounded-2xl p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-extrabold text-emerald-300 mb-1">
          Adopt Your Doggerz Pup
        </h1>
        <p className="text-sm text-slate-200 mb-4">
          Choose a name for your new Jack Russell buddy. You can always
          change it later, but this is how they&apos;ll show up in game.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-100 mb-1">
            Pup Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Fireball, Odin, etc."
            className="w-full rounded-lg bg-black/70 border border-emerald-500/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {error && (
            <div className="text-xs text-red-300 mt-1">{error}</div>
          )}

          <button
            type="submit"
            className="mt-3 w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors"
          >
            Adopt &amp; Start Playing
          </button>
        </form>

        <div className="mt-4 text-[11px] text-slate-300">
          Your adoption is local to this device unless cloud sync is enabled.
        </div>
      </div>
    </div>
  );
}
