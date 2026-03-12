// src/components/dog/GrowthCelebration.jsx

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { acknowledgeGrowthMilestone } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import {
  getLifeStageLabel,
  getLifeStageTransitionCopy,
} from "@/utils/lifecycle.js";
import { useYardSfx } from "@/hooks/useYardSfx.js";
import { useDogGrowthMilestone, useDogIdentity } from "@/hooks/useDogState.js";

function formatAgeLabel(ageDays) {
  const days = Number(ageDays);
  if (!Number.isFinite(days)) return null;
  return `${days} dog days`;
}

export default function GrowthCelebration() {
  const dispatch = useDispatch();
  const dog = useDogIdentity();
  const milestone = useDogGrowthMilestone();
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
  const transitionCopy = useMemo(
    () => getLifeStageTransitionCopy(milestone?.toStage, milestone?.fromStage),
    [milestone?.fromStage, milestone?.toStage]
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
      <div className="dz-dog-celebrate-card animate-bounce">
        <div className="text-[11px] uppercase tracking-[0.45em] text-emerald-300/85">
          Growth milestone
        </div>
        <h1 className="mt-3 text-3xl font-black text-emerald-100">
          {transitionCopy?.title || "Growth milestone"}
        </h1>
        <p className="mt-2 text-sm text-zinc-200">
          {transitionCopy?.summary ||
            `${dog?.name || "Your pup"} has grown into a ${toLabel}.`}
        </p>
        {ageLabel ? (
          <p className="mt-1 text-xs text-emerald-200/80">{ageLabel}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          <span>{fromLabel}</span>
          <span className="text-emerald-300">-&gt;</span>
          <span>{toLabel}</span>
        </div>

        <p className="mt-4 text-xs text-zinc-300">
          {transitionCopy?.detail ||
            "New energy, new tricks, and a stronger bond. Thanks for checking in."}
        </p>

        <button
          type="button"
          onClick={() => dispatch(acknowledgeGrowthMilestone())}
          className="dz-neon-btn mt-6 w-full"
        >
          {transitionCopy?.ctaLabel || "Amazing"}
        </button>
      </div>
    </div>
  );
}
