import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Optional: if you have a dogSlice action, wire it here.
// import { useDispatch } from "react-redux";
// import { setDogName } from "@/redux/dogSlice";

const LS_KEY = "dogName";

export default function NewPup() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  // const dispatch = useDispatch();

  // If a name already exists (returning users), short-circuit to /game.
  useEffect(() => {
    const existing = localStorage.getItem(LS_KEY);
    if (existing && existing.trim().length >= 2) {
      nav("/game", { replace: true });
    }
  }, [nav]);

  function validate(n) {
    if (!n || n.trim().length < 2) return "Name must be at least 2 characters.";
    if (n.length > 24) return "Keep it under 24 characters.";
    return "";
  }

  function onSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    const msg = validate(trimmed);
    if (msg) return setError(msg);

    localStorage.setItem(LS_KEY, trimmed);
    // dispatch(setDogName(trimmed)); // if you’ve got Redux wired
    const next = (loc.state && loc.state.from) ? loc.state.from.pathname : "/game";
    nav(next, { replace: true });
  }

  function randomize() {
    const pool = ["Odin", "Pixel", "Fireball", "Scout", "Ziggy", "Rogue", "Mocha", "Turbo"];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setName(pick);
    setError("");
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-zinc-900 to-zinc-800 text-zinc-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-zinc-900/60 shadow-xl ring-1 ring-zinc-700 p-6 space-y-4"
        aria-labelledby="newpup-title"
      >
        <h1 id="newpup-title" className="text-2xl font-bold tracking-tight">
          Name your pup
        </h1>

        <label className="block text-sm font-medium text-zinc-300" htmlFor="pupname">
          Pup name
        </label>
        <input
          id="pupname"
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          placeholder="e.g., Fireball"
          className="w-full rounded-xl bg-zinc-800 px-4 py-2 outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-emerald-400"
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400 active:translate-y-px"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={randomize}
            className="rounded-xl px-4 py-2 ring-1 ring-zinc-700 hover:bg-zinc-800"
            title="Surprise me"
          >
            🎲
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Pro tip: you can change this later in Settings.
        </p>
      </form>
    </div>
  );
}