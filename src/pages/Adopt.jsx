// src/pages/Adopt.jsx
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

  const handleSubmit = (e) => {
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
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Adopt your Doggerz pup</h1>
        <p className="text-zinc-300 mb-6">
          Name your pup and lock in their profile. From this moment, their
          stats will start drifting based on real time.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-zinc-900/70 p-6 border border-zinc-800"
        >
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-200"
            >
              Pup name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Fireball"
            />
            <p className="text-xs text-zinc-500">
              You can rename them later in Settings.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="breed"
              className="block text-sm font-medium text-zinc-200"
            >
              Breed
            </label>
            <select
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="jackrussell">Jack Russell / Chi mix</option>
              <option value="lab">Lab (coming soon)</option>
              <option value="shepherd">Shepherd (coming soon)</option>
            </select>
            <p className="text-xs text-zinc-500">
              Right now they share the same sprite. Breeds will diverge later.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 transition"
          >
            Start my run
          </button>
        </form>
      </div>
    </div>
  );
}
