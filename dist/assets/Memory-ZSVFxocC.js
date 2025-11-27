const D = 4,
  a = {
    PUPPY: { id: "PUPPY", label: "Puppy", min: 0, max: 180 },
    ADULT: { id: "ADULT", label: "Adult", min: 181, max: 2555 },
    SENIOR: { id: "SENIOR", label: "Senior", min: 2556, max: 5475 },
  };
function u() {
  return (1440 * 60 * 1e3) / 4;
}
function c(n) {
  let t = Number.isFinite(n) ? n : 0;
  return (
    t < 0 && (t = 0),
    t >= a.SENIOR.min ? a.SENIOR : t >= a.ADULT.min ? a.ADULT : a.PUPPY
  );
}
function P(n, t = Date.now()) {
  if (!n || !Number.isFinite(n)) return null;
  const m = u(),
    o = Math.max(0, t - n),
    i = Math.floor(o / m),
    e = c(i),
    r = Math.max(0, i - e.min),
    l = Math.max(1, e.max - e.min),
    s = Math.min(1, r / l);
  return {
    adoptedAt: n,
    days: i,
    stage: e.id,
    label: e.label,
    daysIntoStage: r,
    stageLength: l,
    progressInStage: s,
  };
}
export {
  D as GAME_DAYS_PER_REAL_DAY,
  a as LIFE_STAGES,
  P as calculateDogAge,
  c as getLifeStageForDays,
  u as getMsPerGameDay,
};
