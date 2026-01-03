// src/pages/Adopt.jsx
// @ts-nocheck

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { withBaseUrl } from "@/utils/assetUrl.js";

import {
  selectDog,
  setDogName,
  setAdoptedAt,
} from "@/redux/dogSlice.js";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

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
      <>
        <Header />
        <div className="flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
          <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-2 text-emerald-300">
              You already adopted a pup
            </h2>
            <p className="text-sm text-zinc-300 mb-4">
              Your current dog is{" "}
              <span className="font-semibold">{dog?.name || "your pup"}</span>.
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
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
        {/* Card */}
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="relative mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
            <img
              src={withBaseUrl("/sprites/jack_russell_puppy.webp")}
              alt="Your new puppy"
              width={360}
              height={360}
              decoding="async"
              className="relative h-44 w-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.75)]"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">Adopt your first pup</h2>
          <p className="text-sm text-zinc-400 mb-4">
            This is your forever dog in Doggerz. You’ll feed, play, train, and
            keep them alive through your questionable life choices.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="dog-name"
                className="block text-sm font-medium text-zinc-200 mb-1"
              >
                Pup&apos;s name
              </label>
              <input
                id="dog-name"
                type="text"
                value={name}
                onChange={(e) => setNameValue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="Fireball"
                maxLength={24}
                autoComplete="off"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 mt-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold shadow-lg"
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

      <Footer />
    </>
  );
}
