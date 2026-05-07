import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import SpriteSheetDog from "@/components/dog/renderers/SpriteSheetDog.jsx";
import { getSpriteForLifeStage } from "@/utils/lifecycle.js";

// `HeroDog` is the preview/promo rendering lane for dog surfaces outside the
// main simulation. Gameplay goes through MainGame -> DogStage -> DogMobileCanvas
// -> AnimatedDog -> DogRenderer. Both paths converge on DogRenderer, but this
// wrapper keeps lightweight UI surfaces decoupled from gameplay orchestration.
// Layout presets tune framing inside the square preview box without changing
// the underlying renderer contract. Keep these small and reusable so UI pages
// can pick intent-driven names instead of hand-tuned ratios.
const HERO_DOG_LAYOUT_PRESETS = Object.freeze({
  default: Object.freeze({}),
  card: Object.freeze({
    groundYNorm: 0.6,
    maxWidthRatio: 0.86,
    maxHeightRatio: 0.86,
  }),
  promo: Object.freeze({
    groundYNorm: 0.7,
    maxWidthRatio: 0.8,
    maxHeightRatio: 0.78,
    scaleBias: 1.02,
  }),
  landing: Object.freeze({
    groundYNorm: 0.76,
    maxWidthRatio: 0.84,
    maxHeightRatio: 0.84,
    scaleBias: 1.08,
  }),
  showcase: Object.freeze({
    groundYNorm: 0.74,
    maxWidthRatio: 0.78,
    maxHeightRatio: 0.72,
    scaleBias: 1.04,
  }),
});

// Variants are the public UI-facing size/framing presets. Pages should prefer
// `variant` over hard-coded size/layout values unless they truly need a one-off.
const HERO_DOG_VARIANTS = Object.freeze({
  default: Object.freeze({
    size: 128,
    layoutPreset: "default",
  }),
  card: Object.freeze({
    size: 80,
    layoutPreset: "card",
  }),
  promo: Object.freeze({
    size: 160,
    layoutPreset: "promo",
  }),
  landing: Object.freeze({
    size: 184,
    layoutPreset: "landing",
  }),
  showcase: Object.freeze({
    size: 360,
    layoutPreset: "showcase",
  }),
});

function normalizeKey(value, fallback = "default") {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return key || fallback;
}

function resolveReduceMotionOverride(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "on" || normalized === "true") return true;
  if (normalized === "off" || normalized === "false") return false;
  return null;
}

function resolveShouldReduceMotion(explicitReduceMotion, settings) {
  const explicit = resolveReduceMotionOverride(explicitReduceMotion);
  if (explicit != null) return explicit;

  const settingsReduceMotion = resolveReduceMotionOverride(
    settings?.reduceMotion
  );
  if (settingsReduceMotion != null) return settingsReduceMotion;

  return settings?.batterySaver === true;
}

function resolveHeroDogVariant(variant) {
  const variantKey = normalizeKey(variant, "default");
  return HERO_DOG_VARIANTS[variantKey] || HERO_DOG_VARIANTS.default;
}

// Animation presets intentionally use calm, readable loops that work well in
// promo cards and hero surfaces. Avoid noisy one-shot spam here; this wrapper
// is for tasteful preview motion, not full gameplay choreography.
function buildAnimationSequence(baseAnim, preset) {
  const normalizedPreset = normalizeKey(preset, "none");
  if (normalizedPreset === "idle_wag") {
    return Object.freeze([
      Object.freeze({ anim: baseAnim, durationMs: 2800 }),
      Object.freeze({ anim: "wag", durationMs: 1400 }),
      Object.freeze({ anim: baseAnim, durationMs: 4200 }),
    ]);
  }

  if (normalizedPreset === "idle_sniff") {
    return Object.freeze([
      Object.freeze({ anim: baseAnim, durationMs: 2400 }),
      Object.freeze({ anim: "sniff", durationMs: 1200 }),
      Object.freeze({ anim: baseAnim, durationMs: 3800 }),
    ]);
  }

  if (normalizedPreset === "idle_paw") {
    return Object.freeze([
      Object.freeze({ anim: baseAnim, durationMs: 3000 }),
      Object.freeze({ anim: "paw", durationMs: 1000 }),
      Object.freeze({ anim: baseAnim, durationMs: 4200 }),
    ]);
  }

  if (normalizedPreset === "idle_beg") {
    return Object.freeze([
      Object.freeze({ anim: baseAnim, durationMs: 3200 }),
      Object.freeze({ anim: "beg", durationMs: 1100 }),
      Object.freeze({ anim: baseAnim, durationMs: 4300 }),
    ]);
  }

  if (normalizedPreset === "idle_rest") {
    return Object.freeze([
      Object.freeze({ anim: baseAnim, durationMs: 2600 }),
      Object.freeze({ anim: "idle_resting", durationMs: 1800 }),
      Object.freeze({ anim: baseAnim, durationMs: 4400 }),
    ]);
  }

  return Object.freeze([]);
}

/**
 * Shared UI-friendly dog preview wrapper.
 *
 * Use this component for marketing cards, onboarding heroes, store previews,
 * and other non-gameplay dog surfaces.
 *
 * Preferred props:
 * - `variant`: named size + framing preset (`card`, `promo`, `landing`, `showcase`)
 * - `animationPreset`: named motion loop (`idle-wag`, `idle-sniff`, `idle-paw`, `idle-beg`, `idle-rest`)
 *
 * Recommended defaults:
 * - `idle-sniff` for most new informational or low-pressure surfaces
 * - `idle-wag` for welcoming hero and CTA moments
 *
 * Escape hatches still exist (`size`, `layoutPreset`, `groundYNorm`, etc.) for
 * rare one-off tuning, but pages should reach for the shared presets first.
 */
export default function HeroDog({
  stage = "PUPPY",
  anim = "idle",
  variant = "default",
  animationPreset = "none",
  layoutPreset,
  visualPreset,
  size,
  facing = 1,
  className = "",
  fallbackSrc,
  reduceMotion,
  groundYNorm,
  maxWidthRatio,
  maxHeightRatio,
  scaleBias,
  xNorm,
  onDebug,
}) {
  const settings = useSelector((state) => state.settings || {});
  const resolvedStage = String(stage || "PUPPY")
    .trim()
    .toUpperCase();
  const resolvedReduceMotion = useMemo(
    () => resolveShouldReduceMotion(reduceMotion, settings),
    [reduceMotion, settings]
  );
  const resolvedFallbackSrc = useMemo(
    () => fallbackSrc || getSpriteForLifeStage(resolvedStage),
    [fallbackSrc, resolvedStage]
  );
  const resolvedVariant = useMemo(
    () => resolveHeroDogVariant(variant),
    [variant]
  );
  const resolvedLayoutPreset = useMemo(() => {
    const presetKey = normalizeKey(
      layoutPreset || visualPreset || resolvedVariant.layoutPreset,
      "default"
    );
    return (
      HERO_DOG_LAYOUT_PRESETS[presetKey] || HERO_DOG_LAYOUT_PRESETS.default
    );
  }, [layoutPreset, resolvedVariant.layoutPreset, visualPreset]);
  const animationSequence = useMemo(
    () => buildAnimationSequence(anim, animationPreset),
    [anim, animationPreset]
  );
  const shouldPreferFallbackSrc =
    Boolean(fallbackSrc) &&
    resolvedReduceMotion &&
    normalizeKey(animationPreset, "none") === "none";
  const [resolvedAnim, setResolvedAnim] = useState(anim);
  const resolvedSize = useMemo(
    () =>
      Number.isFinite(Number(size)) && Number(size) > 0
        ? Number(size)
        : resolvedVariant.size,
    [resolvedVariant.size, size]
  );

  useEffect(() => {
    setResolvedAnim(anim);
  }, [anim]);

  useEffect(() => {
    if (resolvedReduceMotion || animationSequence.length === 0) {
      setResolvedAnim(anim);
      return undefined;
    }

    let cancelled = false;
    let timeoutId = 0;

    const queueStep = (index) => {
      const step = animationSequence[index % animationSequence.length];
      setResolvedAnim(step?.anim || anim);
      timeoutId = window.setTimeout(
        () => {
          if (cancelled) return;
          queueStep(index + 1);
        },
        Math.max(250, Number(step?.durationMs || 0))
      );
    };

    queueStep(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [anim, animationSequence, resolvedReduceMotion]);

  return (
    <SpriteSheetDog
      stage={resolvedStage}
      anim={resolvedAnim}
      facing={facing}
      size={resolvedSize}
      reduceMotion={resolvedReduceMotion}
      fallbackSrc={resolvedFallbackSrc}
      preferFallbackSrc={shouldPreferFallbackSrc}
      groundYNorm={
        Number.isFinite(Number(groundYNorm))
          ? Number(groundYNorm)
          : resolvedLayoutPreset.groundYNorm
      }
      maxWidthRatio={
        Number.isFinite(Number(maxWidthRatio))
          ? Number(maxWidthRatio)
          : resolvedLayoutPreset.maxWidthRatio
      }
      maxHeightRatio={
        Number.isFinite(Number(maxHeightRatio))
          ? Number(maxHeightRatio)
          : resolvedLayoutPreset.maxHeightRatio
      }
      scaleBias={
        Number.isFinite(Number(scaleBias))
          ? Number(scaleBias)
          : resolvedLayoutPreset.scaleBias
      }
      xNorm={xNorm}
      onDebug={onDebug}
      className={className}
    />
  );
}
