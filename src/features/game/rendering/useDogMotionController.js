import { useMemo } from "react";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizePosition(value, size, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric >= 0 && numeric <= 1) return clamp(numeric, min, max);
  return clamp(numeric / Math.max(1, Number(size || 1)), min, max);
}

export function useDogMotionController({
  brainState,
  sceneLayout,
  dogScaleBias = 0.95,
  dogSleepingInDoghouse = false,
  facing = "",
  x = undefined,
  y = undefined,
  scale = undefined,
}) {
  return useMemo(() => {
    const layoutDog = sceneLayout?.dog || {};
    const layoutShadow = layoutDog?.shadow || {};
    const resolvedXNorm =
      normalizePosition(x, 960, 0.02, 0.98) ??
      clamp(Number(layoutDog?.xNorm || 0.5), 0.02, 0.98);
    const resolvedGroundYNorm =
      normalizePosition(y, 540, 0.55, 0.95) ??
      clamp(Number(layoutDog?.groundYNorm || 0.8), 0.55, 0.95);
    const resolvedScaleBias = Number.isFinite(Number(scale))
      ? clamp(Number(scale), 0.5, 1.5)
      : dogSleepingInDoghouse
        ? Math.max(0.8, Math.min(1.08, Number(dogScaleBias || 0.95) * 0.92))
        : Math.max(0.82, Math.min(1.12, Number(dogScaleBias || 0.95)));
    const resolvedFacing =
      String(facing || brainState?.facing || "right")
        .trim()
        .toLowerCase() === "left"
        ? "left"
        : "right";

    return {
      facing: resolvedFacing,
      orientation: resolvedFacing,
      xNorm: resolvedXNorm,
      groundYNorm: resolvedGroundYNorm,
      shadowXNorm: clamp(
        Number(layoutShadow?.xNorm ?? resolvedXNorm),
        0.02,
        0.98
      ),
      shadowYNorm: clamp(
        Number(layoutShadow?.yNorm ?? resolvedGroundYNorm + 0.012),
        0.05,
        0.98
      ),
      shadowWidthPx: Math.max(24, Number(layoutShadow?.widthPx || 140)),
      shadowHeightPx: Math.max(10, Number(layoutShadow?.heightPx || 26)),
      shadowOpacity: clamp(Number(layoutShadow?.opacity || 0.24), 0.08, 0.4),
      maxWidthRatio: clamp(Number(layoutDog?.widthRatio || 0.26), 0.12, 0.4),
      maxHeightRatio: clamp(Number(layoutDog?.heightRatio || 0.44), 0.18, 0.7),
      scaleBias: resolvedScaleBias,
    };
  }, [
    brainState?.facing,
    dogScaleBias,
    dogSleepingInDoghouse,
    facing,
    scale,
    sceneLayout,
    x,
    y,
  ]);
}

export default useDogMotionController;
