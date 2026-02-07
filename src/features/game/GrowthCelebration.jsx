// src/features/game/GrowthCelebration.jsx

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  acknowledgeGrowthMilestone,
  selectDog,
  selectDogGrowthMilestone,
} from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { getLifeStageLabel } from "@/constants/game.js";
import { useYardSfx } from "@/components/useYardSfx.js";

function formatAgeLabel(ageDays) {
  const days = Number(ageDays);
  if (!Number.isFinite(days)) return null;
  return `${days} dog days`;
}

export default function GrowthCelebration() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const milestone = useSelector(selectDogGrowthMilestone);
  const settings = useSelector(selectSettings);
  const { playBark } = useYardSfx(settings);

  const fromLabel = useMemo(
    () => getLifeStageLabel(milestone?.fromStage) || "Puppy",
    [milestone?.fromStage]
  );
  const toLabel = useMemo(
    () => getLifeStageLabel(milestone?.toStage) || "Adult",
    [milestone?.toStage]
  );
  const ageLabel = useMemo(
    () => formatAgeLabel(milestone?.ageDays),
    [milestone?.ageDays]
  );

  useEffect(() => {
    if (!milestone) return;
    playBark?.({ throttleMs: 2000, volume: 0.9 });
  }, [milestone, playBark]);

  if (!milestone) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-white/15 bg-gradient-to-b from-amber-50 via-white to-amber-100 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] animate-bounce">
        <div className="text-[11px] uppercase tracking-[0.45em] text-amber-500">
          Growth milestone
        </div>
        <h1 className="mt-3 text-3xl font-black text-amber-700">Level up</h1>
        <p className="mt-2 text-sm text-zinc-700">
          {dog?.name || "Your pup"} has grown into a {toLabel}.
        </p>
        {ageLabel ? (
          <p className="mt-1 text-xs text-amber-700">{ageLabel}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-semibold text-amber-800">
          <span>{fromLabel}</span>
          <span className="text-amber-500">-&gt;</span>
          <span>{toLabel}</span>
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          New energy, new tricks, and a stronger bond. Thanks for checking in.
        </p>

        <button
          type="button"
          onClick={() => dispatch(acknowledgeGrowthMilestone())}
          className="mt-6 w-full rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        >
          Amazing
        </button>
      </div>
    </div>
  );
}
