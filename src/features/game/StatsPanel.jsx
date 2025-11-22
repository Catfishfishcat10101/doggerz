import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyCareAction, selectDog } from "@/redux/dogSlice.js";

function Gauge({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    safeValue >= 70
      ? "bg-emerald-500"
      : safeValue >= 40
        ? "bg-amber-400"
        : "bg-rose-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[0.7rem] text-zinc-300">
        <span className="uppercase tracking-[0.2em]">{label}</span>
        <span>{safeValue}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  const hunger = dog?.stats?.hunger ?? 0;
  const happiness = dog?.stats?.happiness ?? 0;
  const energy = dog?.stats?.energy ?? 0;
  const cleanliness = dog?.stats?.cleanliness ?? 0;

  const handle = (type) => {
    dispatch(applyCareAction({ type }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
          Daily care
        </p>
        <Gauge label="Hunger" value={hunger} />
        <Gauge label="Happiness" value={happiness} />
        <Gauge label="Energy" value={energy} />
        <Gauge label="Cleanliness" value={cleanliness} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => handle("feed")}
          className="rounded-full px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition"
        >
          Feed
        </button>
        <button
          type="button"
          onClick={() => handle("play")}
          className="rounded-full px-3 py-2 bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-semibold transition"
        >
          Play
        </button>
        <button
          type="button"
          onClick={() => handle("rest")}
          className="rounded-full px-3 py-2 bg-violet-500/90 hover:bg-violet-400 text-slate-950 font-semibold transition"
        >
          Rest
        </button>
        <button
          type="button"
          onClick={() => handle("clean")}
          className="rounded-full px-3 py-2 bg-zinc-200 hover:bg-zinc-100 text-slate-900 font-semibold transition"
        >
          Clean
        </button>
      </div>

      <p className="text-[0.7rem] text-zinc-400 leading-relaxed">
        Every action you take nudges your pup&apos;s long-term story. Keep those
        bars high to unlock better moods and more coins over time.
      </p>
    </div>
  );
}
