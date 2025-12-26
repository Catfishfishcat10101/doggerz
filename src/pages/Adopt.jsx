// src/pages/Adopt.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import jackRussellPhotoPng from "../Transparent-jack-russell-puppy-dog.png";
import jackRussellPhotoWebp from "../Transparent-jack-russell-puppy-dog.webp";

import {
  selectDog,
  setDogName,
  setAdoptedAt,
} from "@/redux/dogSlice.js";
import PageShell from "@/components/PageShell.jsx";

export default function AdoptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dog = useSelector(selectDog);
  const alreadyAdopted = !!dog?.adoptedAt;
  const [name, setNameValue] = useState(dog?.name || "Fireball");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Your pup needs a name, even if it’s something weird.");
      return;
    }

    // Save name + adoption time
    dispatch(setDogName(trimmed));
    if (!alreadyAdopted) {
      dispatch(setAdoptedAt(Date.now()));
    }

    navigate("/game");
  };

  if (alreadyAdopted) {
    // If we already have a dog, don’t let the user “adopt” another silently.
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
              Adopt
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">
              You already adopted a pup
            </h2>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Your current dog is{" "}
              <span className="font-semibold">{dog?.name || "your pup"}</span>.
              Future versions will support multiple pups and kennels, but right
              now Doggerz is a one-dog show.
            </p>

            <button
              type="button"
              onClick={() => navigate("/game")}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-black shadow-lg"
            >
              Go back to your yard
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Adopt
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">
            Adopt your first pup
          </h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            This is your forever dog in Doggerz. You’ll feed, play, train, and
            keep them alive through your questionable life choices.
          </p>

          <div className="relative mt-5 mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
            <picture>
              <source type="image/webp" srcSet={jackRussellPhotoWebp} />
              <img
                src={jackRussellPhotoPng}
                alt="Jack Russell puppy"
                width={360}
                height={360}
                decoding="async"
                className="relative h-44 w-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.75)]"
              />
            </picture>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="dog-name"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1"
              >
                Pup&apos;s name
              </label>
              <input
                id="dog-name"
                type="text"
                value={name}
                onChange={(e) => setNameValue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Fireball"
                maxLength={24}
                autoComplete="off"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-black shadow-lg"
            >
              Adopt this pup
            </button>
          </form>

          <p className="mt-4 text-xs text-zinc-500">
            Pro tip: Keep the name short. You’ll see it a lot in alerts,
            training, and future story events.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
