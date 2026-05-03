import { useMemo } from "react";

import { deriveBehaviorSceneProfile } from "@/features/dog/behaviorSceneProfile.js";
import { useDogGameView } from "@/hooks/useDogState.js";

const DOG_WORLD_WIDTH = 960;
const DOG_WORLD_HEIGHT = 540;

export function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

export function toPct(value) {
  return clamp(Math.round(Number(value || 0)), 0, 100);
}

export function resolveStatTone(value, { invert = false } = {}) {
  const pct = clamp(Number(value || 0), 0, 100);
  if (invert) {
    if (pct >= 70) return "danger";
    if (pct >= 45) return "pending";
    return "ok";
  }
  if (pct <= 25) return "danger";
  if (pct <= 45) return "pending";
  return "ok";
}

export default function useDogSceneStats() {
  const { dog, vitals, life, renderModel } = useDogGameView();
  const happinessPct = toPct(vitals?.happiness);
  const energyPct = toPct(vitals?.energy);
  const healthPct = toPct(vitals?.health);
  const cleanlinessPct = toPct(vitals?.cleanliness);
  const bondPct = toPct(vitals?.bondValue);
  const pottyNeedPct = toPct(dog?.pottyLevel);
  const moodLabel = String(vitals?.moodLabel || "Content").trim() || "Content";
  const isSleeping = Boolean(
    dog?.isSleeping || dog?.isAsleep || renderModel?.isSleeping
  );
  const weatherKey = String(
    dog?.weather?.condition || dog?.weather?.key || "clear"
  );

  return useMemo(() => {
    const careTone =
      cleanlinessPct <= 25
        ? "neglected"
        : cleanlinessPct <= 45 || energyPct <= 30
          ? "strained"
          : bondPct >= 75 && happinessPct >= 70
            ? "secure"
            : "steady";
    const behavior = deriveBehaviorSceneProfile({
      dog,
      vitals,
      life,
      weatherKey,
      now: Date.now(),
    });

    return {
      dog,
      vitals,
      life,
      renderModel,
      stageLabel: String(
        life?.stageLabel || renderModel?.stageLabel || "Puppy"
      ),
      moodLabel,
      happinessPct,
      energyPct,
      healthPct,
      cleanlinessPct,
      pottyNeedPct,
      bondPct,
      isSleeping,
      careTone,
      behavior,
      dogPositionNorm: {
        xNorm: clamp(
          Number(dog?.position?.x || DOG_WORLD_WIDTH * 0.5) / DOG_WORLD_WIDTH,
          0,
          1
        ),
        yNorm: clamp(
          Number(dog?.position?.y || DOG_WORLD_HEIGHT * 0.74) /
            DOG_WORLD_HEIGHT,
          0,
          1
        ),
        moving: Boolean(dog?.moving || dog?.position?.moving),
      },
    };
  }, [
    bondPct,
    cleanlinessPct,
    dog,
    energyPct,
    happinessPct,
    healthPct,
    isSleeping,
    life,
    moodLabel,
    pottyNeedPct,
    renderModel,
    vitals,
    weatherKey,
  ]);
}
