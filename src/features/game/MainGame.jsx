// src/features/game/MainGame.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDog,
  feed as feedDog,
  play as playDog,
  rest as restDog,
  bathe as batheDog,
  scoopPoop as scoopPoopAction,
} from "@/redux/dogSlice.js";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";

function StatBar({ label, value = 0, color = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Pill({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "danger"
      ? "bg-red-950/40 border-red-900 text-red-300"
      : tone === "warn"
      ? "bg-amber-950/40 border-amber-900 text-amber-200"
      : "bg-zinc-900/70 border-zinc-700 text-zinc-200";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${toneClasses}`}
    >
      <span className="uppercase tracking-wide text-[0.65rem] text-zinc-400">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
        <p className="text-zinc-400 text-sm">Loading pup state…</p>
      </div>
    );
  }

  const {
    name = "Pup",
    level = 1,
    xp = 0,
    coins = 0,
    stats = {},
    poopCount = 0,
    pottyLevel = 0,
    isAsleep = false,
    ageHours = 0,
    condition = "clean",
    health = 100,
    isAlive = true,
  } = dog;

  const {
    hunger = 0,
    happiness = 0,
    energy = 0,
    cleanliness = 0,
  } = stats;

  const fullHours = Math.floor(ageHours || 0);
  const days = Math.floor(fullHours / 24);
  const hours = fullHours % 24;
  const ageLabel =
    days > 0 ? `${days}d ${hours}h` : `${hours}h`;

  let conditionLabel = "Clean";
  let conditionTone = "default";
  if (condition === "dirty") {
    conditionLabel = "Dirty";
    conditionTone = "warn";
  } else if (condition === "fleas") {
    conditionLabel = "Fleas";
    conditionTone = "warn";
  } else if (condition === "mange") {
    conditionLabel = "Mange";
    conditionTone = "danger";
  }

  const healthTone =
    health < 30 ? "danger" : health < 60 ? "warn" : "default";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      <DogAIEngine />

      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Doggerz <span className="text-emerald-400">Main Game</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Keep {name}&apos;s hunger, happiness, energy, and cleanliness up.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-sm">
          <div className="flex gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                Level
              </span>
              <span className="text-lg font-bold">{level}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                XP
              </span>
              <span className="text-lg font-semibold">{xp.toFixed(0)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                Coins
              </span>
              <span className="text-lg font-bold text-amber-300">
                {coins}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <Pill label="Age" value={ageLabel} />
            <Pill label="Condition" value={conditionLabel} tone={conditionTone} />
            <Pill
              label="Health"
              value={`${health.toFixed(0)}%`}
              tone={healthTone}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-6">
        <section className="flex-1 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Pup
              </p>
              <p className="text-xl font-semibold">
                {name}{" "}
                {!isAlive && (
                  <span className="ml-2 text-xs text-red-400 uppercase tracking-wide">
                    Deceased
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end text-xs text-zinc-400">
              <span>Poops on ground: {poopCount}</span>
              <span>Potty level: {pottyLevel}</span>
              <span>Status: {isAsleep ? "Sleeping" : "Awake"}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
              <span className="text-xs text-zinc-400 text-center px-4">
                Dog sprite / yard scene goes here.
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => dispatch(feedDog())}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Feed
            </button>

            <button
              type="button"
              onClick={() => dispatch(playDog())}
              className="rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Play
            </button>

            <button
              type="button"
              onClick={() => dispatch(restDog())}
              className="rounded-xl bg-violet-500 hover:bg-violet-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              {isAsleep ? "Wake Up" : "Rest"}
            </button>

            <button
              type="button"
              onClick={() => dispatch(batheDog())}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Bathe
            </button>

            <button
              type="button"
              onClick={() => dispatch(scoopPoopAction())}
              className="col-span-2 md:col-span-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive || poopCount === 0}
            >
              Scoop Poop
            </button>
          </div>
        </section>

        <section className="w-full lg:w-80 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-3">
              Pup Needs
            </p>
            <div className="space-y-3">
              <StatBar
                label="Hunger"
                value={hunger}
                color="bg-emerald-500"
              />
              <StatBar
                label="Happiness"
                value={happiness}
                color="bg-sky-500"
              />
              <StatBar
                label="Energy"
                value={energy}
                color="bg-violet-500"
              />
              <StatBar
                label="Cleanliness"
                value={cleanliness}
                color="bg-amber-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs text-zinc-400 space-y-1.5">
            <p className="font-semibold text-zinc-200 text-sm">
              Care guidelines
            </p>
            <p>• Feed periodically; don&apos;t let hunger drop too low.</p>
            <p>• Play to keep happiness up, but watch energy.</p>
            <p>• Rest to recover energy; overdoing it can hurt happiness.</p>
            <p>• Bathe before cleanliness falls too low to avoid fleas/mange.</p>
            <p>• Scoop poop to keep the yard clean and bump cleanliness.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
