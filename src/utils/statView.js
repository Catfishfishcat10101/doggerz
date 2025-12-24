export function statCurrent(stat, fallback = 0) {
  if (stat == null) return fallback;

  if (typeof stat === "number") return stat;

  if (typeof stat === "string") {
    const n = Number(stat);
    return Number.isFinite(n) ? n : fallback;
  }

  if (typeof stat === "object") {
    // Common patterns
    if (typeof stat.current === "number") return stat.current;

    const h = Array.isArray(stat.history) ? stat.history : [];
    const last = h[h.length - 1];

    const v =
      last?.value ?? last?.v ?? last?.val ?? last?.sample ?? last?.amount;

    return typeof v === "number" ? v : fallback;
  }

  return fallback;
}
