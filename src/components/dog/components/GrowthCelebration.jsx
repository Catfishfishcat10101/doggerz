<<<<<<< HEAD
=======
// src/components/dog/components/GrowthCelebration.jsx
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
// src/components/dog/GrowthCelebration.jsx

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { acknowledgeGrowthMilestone } from "@/store/dogSlice.js";
import { selectSettings } from "@/store/settingsSlice.js";
import { getLifeStageLabel } from "@/utils/lifecycle.js";
import { getLifeStageTransitionCopy } from "@/features/dog/lifecycleContent.js";
import { useYardSfx } from "@/hooks/useYardSfx.js";
import {
  useDog,
  useDogGrowthMilestone,
  useDogIdentity,
} from "@/hooks/useDogState.js";
import {
  buildShareMomentCard,
  shareDoggerzMoment,
} from "@/features/social/shareMomentCards.js";
import { useToast } from "@/state/toastContext.js";
import ShareMomentCard from "@/components/game/ShareMomentCard.jsx";

function formatAgeLabel(ageDays) {
  const days = Number(ageDays);
  if (!Number.isFinite(days)) return null;
  return `${days} dog days`;
}

export default function GrowthCelebration() {
  const dispatch = useDispatch();
  const dogState = useDog();
  const dog = useDogIdentity();
  const milestone = useDogGrowthMilestone();
  const settings = useSelector(selectSettings);
  const { playBark } = useYardSfx(settings);
  const toast = useToast();
  const [shareCardOpen, setShareCardOpen] = useState(false);

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
  const shareContext = useMemo(
    () => ({
      dogName: dog?.name || "My pup",
      stageLabel: toLabel,
      level: dog?.level || 1,
      bondPct: dogState?.bond?.value || 0,
      energyPct: dogState?.stats?.energy || 0,
      personalitySummary: dog?.personalitySummary || "",
      tendencyLabels: Array.isArray(dog?.behaviorTendencies)
        ? dog.behaviorTendencies.map((item) => item?.label).filter(Boolean)
        : [],
      styleSignature: dog?.styleSignature || null,
    }),
    [
      dog?.behaviorTendencies,
      dog?.level,
      dog?.name,
      dog?.personalitySummary,
      dog?.styleSignature,
      dogState?.bond?.value,
      dogState?.stats?.energy,
      toLabel,
    ]
  );

  useEffect(() => {
    if (!milestone) return;
    playBark?.({ throttleMs: 2000, volume: 0.9 });
  }, [milestone, playBark]);

  const handleShareMilestone = async () => {
    if (!milestone) return;
    const shareCard = buildShareMomentCard(
      {
        id: `growth:${milestone?.toStage || "stage"}`,
        type: "growth_milestone",
        fromStage: fromLabel,
        toStage: toLabel,
      },
      shareContext
    );

    try {
      await shareDoggerzMoment(shareCard, {
        onCopied: () => toast.success("Share card copied."),
      });
      toast.success("Milestone shared.");
      setShareCardOpen(false);
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("cancel")) return;
      toast.error("Share unavailable.");
    }
  };

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

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShareCardOpen(true)}
            className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-100 transition hover:bg-black/35"
          >
            Share Moment
          </button>
          <button
            type="button"
            onClick={() => dispatch(acknowledgeGrowthMilestone())}
            className="dz-neon-btn w-full"
          >
            {transitionCopy?.ctaLabel || "Amazing"}
          </button>
        </div>
        {shareCardOpen ? (
          <div className="mt-4">
            <ShareMomentCard
              card={buildShareMomentCard(
                {
                  id: `growth:${milestone?.toStage || "stage"}`,
                  type: "growth_milestone",
                  fromStage: fromLabel,
                  toStage: toLabel,
                },
                shareContext
              )}
              onClose={() => setShareCardOpen(false)}
              onShare={handleShareMilestone}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
