// src/pages/Adopt.jsx
// @ts-nocheck
//
// Doggerz: Adopt screen.
// - Let the user name their pup.
// - Initializes adoption timestamp + session start.
// - Sends them to /game.

import PageContainer from "@/features/game/components/PageContainer.jsx";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDog, setDogName, setAdoptedAt } from "@/redux/dogSlice.js";

export default function Adopt() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dog = useSelector(selectDog);
  const alreadyAdopted = !!dog?.adoptedAt;
  const [name, setName] = useState(dog?.name || "Fireball");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Asset preloading logic
  useEffect(() => {
    let isMounted = true;
    const assets = [
      "/sprites/jack_russell_puppy.png",
      "/sprites/jack_russell_adult.png",
      "/sprites/jack_russell_senior.png",
      // Add more assets as needed
    ];
    let loaded = 0;
    assets.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        loaded++;
        if (isMounted) setProgress(Math.round((loaded / assets.length) * 100));
        if (loaded === assets.length && isMounted) setLoading(false);
      };
      img.onerror = () => {
        loaded++;
        if (isMounted) setProgress(Math.round((loaded / assets.length) * 100));
        if (loaded === assets.length && isMounted) setLoading(false);
      };
      img.src = src;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdopt = (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    // Validation: 2-20 chars, no emoji
    if (
      !trimmed ||
      trimmed.length < 2 ||
      trimmed.length > 20 ||
      /[\p{Emoji}]/u.test(trimmed)
    ) {
      setError("Name must be 2–20 characters, no emoji.");
      return;
    }
    dispatch(setDogName(trimmed));
    if (!alreadyAdopted) {
      dispatch(setAdoptedAt(Date.now()));
    }
    navigate("/game");
  };

  let content;
  if (alreadyAdopted) {
    content = (
      <div className="flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-bold tracking-wide text-emerald-400 drop-shadow-lg">
            Doggerz
          </h1>
          <p className="text-sm text-zinc-300 mt-1">Virtual Pup Simulator</p>
          <Link
            to="/about"
            className="mt-2 text-emerald-400 hover:underline text-xs font-semibold"
          >
            About
          </Link>
        </div>
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-emerald-300">
            You already adopted a pup
          </h2>
          <p className="text-sm text-zinc-300 mb-4">
            Your current dog is{" "}
            <span className="font-semibold">{dog?.name || "your pup"}</span>.
            <br />
            Future versions will support multiple pups and kennels, but right
            now Doggerz is a one-dog show.
          </p>
          <button
            type="button"
            onClick={() => navigate("/game")}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold shadow-lg"
          >
            Go back to your yard
          </button>
          <Link
            to="/about"
            className="mt-3 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-emerald-300 shadow-lg text-center block"
          >
            About Doggerz
          </Link>
        </div>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4"
        >
          <svg
            className="animate-spin h-10 w-10 text-emerald-400"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-lg font-semibold">Loading assets…</span>
          <progress
            value={progress}
            max={100}
            className="w-48 h-2 rounded bg-zinc-800"
            aria-valuenow={progress}
            aria-valuemax={100}
          />
          <span className="text-sm text-zinc-400">{progress}%</span>
        </div>
      </div>
    );
  } else {
    content = (
      <PageContainer className="px-4 py-8">
        <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight text-center mb-4">
            Name your pup
          </h1>
          <Link
            to="/about"
            className="mb-4 text-emerald-400 hover:underline text-xs font-semibold"
          >
            About Doggerz
          </Link>
          <p className="text-zinc-200 text-center max-w-md mb-8">
            Pick a name your pup can grow into. You can change it later in
            Settings, but first impressions matter.
          </p>
          <form
            onSubmit={handleAdopt}
            className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
            aria-label="Adopt pup form"
          >
            <div>
              <label
                htmlFor="pupName"
                className="block text-sm font-medium text-zinc-200 mb-2"
              >
                Pup's name
              </label>
              <input
                id="pupName"
                name="pupName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-2 text-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-zinc-300"
                placeholder="Fireball"
                autoComplete="name"
                aria-invalid={!!error}
                aria-describedby={error ? "name-error" : undefined}
              />
              <p className="mt-1 text-xs text-zinc-400">
                2–20 characters. No emojis, this isn't Instagram.
              </p>
              {error && (
                <p id="name-error" className="text-xs text-red-400 mt-1">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={
                name.trim().length < 2 ||
                name.trim().length > 20 ||
                /[\p{Emoji}]/u.test(name)
              }
              className="mt-4 w-full rounded-xl px-4 py-2 text-lg font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Adopt my pup
            </button>
            <Link
              to="/about"
              className="mt-3 w-full rounded-xl px-4 py-2 text-lg font-semibold bg-zinc-800 text-emerald-300 hover:bg-zinc-700 shadow-lg text-center block"
            >
              About Doggerz
            </Link>
          </form>
          <p className="mt-4 text-xs text-zinc-500">
            Pro tip: Keep the name short. You’ll see it a lot in alerts,
            training, and future story events.
          </p>
        </div>
      </PageContainer>
    );
  }

  return <>{content}</>;
}
