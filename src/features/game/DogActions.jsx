/** @format */
// src/features/game/DogActions.jsx

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useToast } from "@/components/toastContext.js";
import {
  feed,
  giveWater,
  petDog,
  play,
  rest,
  selectDog,
  triggerManualAction,
} from "@/redux/dogSlice.js";

const CARE_ACTIONS = [
  {
    id: "feed",
    label: "Feed",
    hint: "Refill hunger",
    action: "eat",
    reducer: feed,
    cooldownMs: 2200,
  },
  {
    id: "water",
    label: "Water",
    hint: "Cool thirst",
    action: "wag",
    reducer: giveWater,
    cooldownMs: 1800,
  },
  {
    id: "pet",
    label: "Pet",
    hint: "Boost bond",
    action: "wag",
    reducer: petDog,
    cooldownMs: 1400,
  },
  {
    id: "play",
    label: "Play",
    hint: "Happiness spike",
    action: "walk",
    reducer: play,
    cooldownMs: 2400,
  },
  {
    id: "sleep",
    label: "Sleep",
    hint: "Restore energy",
    action: "sleep",
    reducer: rest,
    cooldownMs: 3200,
  },
];

const TRICK_ACTIONS = [
  {
    id: "sit",
    label: "Sit",
    hint: "Calm settle",
    anim: "sit",
    energyMin: 8,
    energyCost: 2,
    bondDelta: 0.3,
    cooldownMs: 1400,
  },
  {
    id: "laydown",
    label: "Lay down",
    hint: "Ease to floor",
    anim: "laydown",
    energyMin: 10,
    energyCost: 3,
    bondDelta: 0.4,
    cooldownMs: 1600,
  },
  {
    id: "shake",
    label: "Shake",
    hint: "One-paw hello",
    anim: "shake",
    energyMin: 12,
    energyCost: 3,
    bondDelta: 0.6,
    cooldownMs: 1600,
  },
  {
    id: "beg",
    label: "Beg",
    hint: "Balance up",
    anim: "beg",
    energyMin: 16,
    energyCost: 4,
    bondDelta: 0.8,
    cooldownMs: 1800,
  },
  {
    id: "rollover",
    label: "Rollover",
    hint: "Full spin",
    anim: "rollover",
    energyMin: 24,
    energyCost: 6,
    bondDelta: 1,
    cooldownMs: 2200,
  },
  {
    id: "playdead",
    label: "Play dead",
    hint: "Dramatic drop",
    anim: "playdead",
    energyMin: 20,
    energyCost: 4,
    bondDelta: 0.9,
    cooldownMs: 2200,
    autoReturn: false,
  },
  {
    id: "bark",
    label: "Bark",
    hint: "Voice cue",
    anim: "bark",
    energyMin: 10,
    energyCost: 2,
    bondDelta: 0.2,
    cooldownMs: 1200,
  },
  {
    id: "scratch",
    label: "Scratch",
    hint: "Quick itch",
    anim: "scratch",
    energyMin: 6,
    energyCost: 1,
    bondDelta: 0.2,
    cooldownMs: 1200,
  },
  {
    id: "jump",
    label: "Jump",
    hint: "Pop up",
    anim: "jump",
    energyMin: 28,
    energyCost: 8,
    bondDelta: 1,
    cooldownMs: 2000,
  },
  {
    id: "front_flip",
    label: "Front flip",
    hint: "Big trick",
    anim: "front_flip",
    energyMin: 42,
    energyCost: 14,
    bondDelta: 1.4,
    cooldownMs: 2600,
  },
];

const RESET_AFTER_MS = 2000;

export default function DogActions({ className = "" }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const dog = useSelector(selectDog);
  const energy = Number(dog?.stats?.energy ?? 0);
  const bond = Number(dog?.bond?.value ?? 0);
  const lastActionAtRef = React.useRef(Object.create(null));
  const resetTimerRef = React.useRef(null);
  const actionIndex = React.useMemo(() => {
    const all = [...CARE_ACTIONS, ...TRICK_ACTIONS];
    return all.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, []);

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const scheduleReturn = React.useCallback(
    (anim) => {
      if (!anim) return;
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        dispatch(triggerManualAction({ now: Date.now(), action: anim }));
      }, RESET_AFTER_MS);
    },
    [dispatch]
  );

  const isCoolingDown = React.useCallback((action) => {
    const last = Number(lastActionAtRef.current[action.id] || 0);
    if (!action.cooldownMs) return false;
    return Date.now() - last < action.cooldownMs;
  }, []);

  const handleAction = React.useCallback(
    (action) => {
      const now = Date.now();
      if (!action) return;

      const last = Number(lastActionAtRef.current[action.id] || 0);
      if (action.cooldownMs && now - last < action.cooldownMs) {
        const remaining = Math.max(
          0,
          Math.ceil((action.cooldownMs - (now - last)) / 1000)
        );
        toast.info(`Hold on ${remaining}s for ${action.label}.`);
        return;
      }

      let resolvedAction = action;
      let followUpAnim = action.autoReturn === false ? null : "wag";
      let bonusBond = 0;

      if (action.id === "front_flip") {
        const bondLevel = Math.max(0, Math.min(100, bond));
        if (bondLevel <= 30) {
          resolvedAction = actionIndex.jump || action;
        } else if (bondLevel <= 70) {
          resolvedAction = actionIndex.jump || action;
        } else {
          resolvedAction = actionIndex.front_flip || action;
          bonusBond = 0.6;
        }

        if (
          resolvedAction.id === "front_flip" &&
          typeof resolvedAction.energyMin === "number" &&
          energy < resolvedAction.energyMin
        ) {
          resolvedAction = actionIndex.jump || action;
        }
      }

      if (
        typeof resolvedAction.energyMin === "number" &&
        energy < resolvedAction.energyMin
      ) {
        toast.warn("Pup is too tired for that. Let them rest.");
        dispatch(rest({ now, action: "sleep" }));
        return;
      }

      lastActionAtRef.current[action.id] = now;

      if (resolvedAction.reducer) {
        dispatch(resolvedAction.reducer({ now, action: resolvedAction.action }));
        if (followUpAnim && resolvedAction.action !== "sleep") {
          scheduleReturn("wag");
        }
        return;
      }

      const stats = {};
      if (typeof resolvedAction.energyCost === "number") {
        stats.energy = -Math.abs(resolvedAction.energyCost);
      }

      dispatch(
        triggerManualAction({
          now,
          action: resolvedAction.anim,
          stats: Object.keys(stats).length ? stats : null,
          bondDelta: Number(resolvedAction.bondDelta || 0) + bonusBond,
        })
      );

      if (followUpAnim) {
        scheduleReturn(followUpAnim);
      }
    },
    [actionIndex, bond, dispatch, energy, scheduleReturn, toast]
  );

  return (
    <section className={["space-y-4", className].join(" ")}>
      <ActionPanel
        title="Care actions"
        subtitle="Keep them happy"
        actions={CARE_ACTIONS}
        energy={energy}
        isCoolingDown={isCoolingDown}
        onAction={handleAction}
      />
      <ActionPanel
        title="Trick actions"
        subtitle="Bond boosters"
        actions={TRICK_ACTIONS}
        energy={energy}
        bond={bond}
        isCoolingDown={isCoolingDown}
        onAction={handleAction}
      />
    </section>
  );
}

function ActionPanel({
  title,
  subtitle,
  actions,
  energy,
  bond,
  isCoolingDown,
  onAction,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-black/75 to-black/50 p-5 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            {title}
          </p>
          <h3 className="text-lg font-semibold text-white">{subtitle}</h3>
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/40">
          tap to act
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {actions.map((action, idx) => {
          const lowEnergy =
            typeof action.energyMin === "number" && energy < action.energyMin;
          const cooling = isCoolingDown(action);
          const disabled = lowEnergy || cooling;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action)}
              disabled={disabled}
              className={[
                "group flex flex-col rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
                idx % 2 === 0
                  ? "sm:col-span-3 sm:col-start-1"
                  : "sm:col-span-3 sm:col-start-4",
                disabled
                  ? "opacity-40"
                  : "hover:border-emerald-400/40 hover:bg-emerald-500/10",
              ].join(" ")}
            >
              <span className="text-sm font-semibold text-white">
                {action.label}
              </span>
              <span className="mt-1 text-[11px] text-white/60">
                {action.hint}
              </span>
              <span className="pointer-events-none mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[11px] text-white/50 transition group-hover:border-emerald-400/60 group-hover:text-emerald-200">
                GO
              </span>
            </button>
          );
        })}
      </div>

      {typeof bond === "number" ? (
        <div className="mt-3 text-[11px] text-white/45">
          Bond {Math.round(bond)}% - Energy {Math.round(energy)}%
        </div>
      ) : null}
    </section>
  );
}
