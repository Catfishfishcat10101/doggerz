const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const toNumber = (value, fallback = 0) => {
  if (value == null) return fallback;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export function statCurrent(stat, fallback = 0) {
  if (stat == null) return fallback;

  if (typeof stat === "number") return Number.isFinite(stat) ? stat : fallback;

  if (typeof stat === "string") {
    const n = Number(stat);
    return Number.isFinite(n) ? n : fallback;
  }

  if (typeof stat === "object") {
    // Common patterns
    if (typeof stat.current === "number")
      return Number.isFinite(stat.current) ? stat.current : fallback;

    const h = Array.isArray(stat.history) ? stat.history : [];
    const last = h[h.length - 1];

    const v =
      last?.value ?? last?.v ?? last?.val ?? last?.sample ?? last?.amount;

    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
  }

  return fallback;
}

export function statMax(stat, fallback = 100) {
  if (stat == null) return fallback;
  if (typeof stat === "object" && stat && typeof stat.max === "number") {
    return Number.isFinite(stat.max) ? stat.max : fallback;
  }
  return fallback;
}

export function statMin(stat, fallback = 0) {
  if (stat == null) return fallback;
  if (typeof stat === "object" && stat && typeof stat.min === "number") {
    return Number.isFinite(stat.min) ? stat.min : fallback;
  }
  return fallback;
}

export function statPercent(stat, { min = 0, max = 100, fallback = 0 } = {}) {
  const current = statCurrent(stat, fallback);
  const safeMax = Math.max(min + 1, toNumber(max, 100));
  const safeMin = toNumber(min, 0);
  const value = clamp((current - safeMin) / (safeMax - safeMin), 0, 1);
  return Math.round(value * 100);
}

export function statTrend(stat) {
  if (!stat || typeof stat !== "object") return "flat";
  const h = Array.isArray(stat.history) ? stat.history : [];
  if (h.length < 2) return "flat";
  const last = h[h.length - 1];
  const prev = h[h.length - 2];
  const lastValue = toNumber(
    last?.value ?? last?.v ?? last?.val ?? last?.sample ?? last?.amount,
    0
  );
  const prevValue = toNumber(
    prev?.value ?? prev?.v ?? prev?.val ?? prev?.sample ?? prev?.amount,
    0
  );
  if (lastValue > prevValue) return "up";
  if (lastValue < prevValue) return "down";
  return "flat";
}
