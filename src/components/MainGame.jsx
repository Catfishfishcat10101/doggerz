// src/features/game/MainGame.jsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Redux: import only what we know you've used before ---
import {
  selectDog,                 // selector for full dog state
  feed as feedDog,           // action: feed
  play as playDog,           // action: play
  rest as restDog,           // action: rest/sleep
  scoopPoop as scoopPoopAction, // action: scoop poop
} from "@/redux/dogSlice.js";

// HUD that lives in this feature slice
import NeedsHUD from "@/features/game/NeedsHUD.jsx";

// Headless game loop / timers
import DogAIEngine from "@/features/game/DogAIEngine.jsx";

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog) || {};

  // safe fallbacks (don’t crash if slice fields are missing)
  const {
    name = "Your Pup",
    mood = "neutral",
    coins = 0,
    stats = {},
    poopCount = 0,
  } = dog;

  const {
    hunger = 50,
    energy = 50,
    cleanliness = 50,
    happiness = 50,
  } = stats;

  // Handlers are intentionally payload-free (most Doggerz actions didn’t need payloads)
  const onFeed = useCallback(
    () => dispatch(feedDog?.() ?? { type: "dog/feed" }),
    [dispatch]
  );

  const onPlay = useCallback(
    () => dispatch(playDog?.() ?? { type: "dog/play" }),
    [dispatch]
  );

  const onRest = useCallback(
    () => dispatch(restDog?.() ?? { type: "dog/rest" }),
    [dispatch]
  );

  const onScoop = useCallback(
    () => dispatch(scoopPoopAction?.() ?? { type: "dog/scoopPoop" }),
    [dispatch]
  );

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* Headless engine mounts once and runs timers / AI */}
      <DogAIEngine />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / nameplate */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {name}
              <span className="ml-3 text-sm align-middle px-2 py-1 rounded-full bg-zinc-800 border border-white/10">
                {mood}
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Coins: {coins}</p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onFeed}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold"
            >
              Feed
            </button>
            <button
              type="button"
              onClick={onPlay}
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3 py-2 text-sm font-semibold"
            >
              Play
            </button>
            <button
              type="button"
              onClick={onRest}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold"
            >
              Rest
            </button>
            <button
              type="button"
              onClick={onScoop}
              disabled={poopCount <= 0}
              className="rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-3 py-2 text-sm font-semibold"
              title={poopCount > 0 ? `Scoop ${poopCount}` : "No poop to scoop"}
            >
              Scoop {poopCount > 0 ? `(${poopCount})` : ""}
            </button>
          </div>
        </section>

        {/* Playfield */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Dog “stage” */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4">
            {/* Placeholder sprite area: replace with your DogSprite later */}
            <div className="aspect-video w-full rounded-xl border border-white/10 grid place-items-center">
              <div
                aria-label="Dog sprite placeholder"
                className="h-24 w-24 rounded-full border border-white/20 bg-zinc-800 grid place-items-center text-xs text-zinc-300"
              >
                🐶 Sprite
              </div>
            </div>

            {/* Contextual tips */}
            <p className="mt-3 text-sm text-zinc-400">
              Tip: use the buttons above to interact. This stage is intentionally
              minimal so the screen always renders even if other components are missing.
            </p>
          </div>

          {/* Stats/HUD */}
          <aside className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold text-zinc-300">Status</h2>
            <div className="mt-3 space-y-3">
              <NeedsHUD
                hunger={hunger}
                energy={energy}
                cleanliness={cleanliness}
                happiness={happiness}
              />
              <div className="text-xs text-zinc-500">
                Poop on ground: <span className="font-mono">{poopCount}</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
