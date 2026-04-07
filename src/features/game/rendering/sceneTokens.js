export const SCENE_TOKENS = Object.freeze({
  viewport: {
    minHeight: 420,
    maxWidth: 1180,
    aspectRatio: 16 / 9,
    radius: 30,
    padding: 14,
  },
  horizonY: 0.5,
  fenceY: 0.57,
  groundTopY: 0.62,
  groundLineY: 0.8,
  dog: {
    minX: 0.22,
    maxX: 0.78,
    minY: 0.72,
    maxY: 0.83,
    desktopWidthRatio: 0.23,
    tabletWidthRatio: 0.25,
    mobileWidthRatio: 0.27,
    sleepingWidthRatio: 0.22,
    maxHeightRatio: 0.44,
    shadowWidthFactor: 0.62,
    shadowHeightFactor: 0.16,
    shadowOpacity: 0.24,
  },
  props: {
    tree: {
      xNorm: 0.14,
      yNorm: 0.61,
      widthRatio: 0.18,
      heightRatio: 0.46,
    },
    fence: {
      yNorm: 0.56,
      heightRatio: 0.14,
    },
    doghouse: {
      xNorm: 0.82,
      yNorm: 0.71,
      widthRatio: 0.22,
      heightRatio: 0.24,
    },
    bowl: {
      xNorm: 0.28,
      yNorm: 0.83,
      widthRatio: 0.09,
      heightRatio: 0.05,
    },
  },
  hud: {
    topInset: 14,
    gap: 8,
    pillHeight: 30,
  },
});

export function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

export function toPercent(norm) {
  return `${(clamp(norm, 0, 1) * 100).toFixed(2)}%`;
}
