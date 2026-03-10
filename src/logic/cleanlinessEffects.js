// Shared cleanliness tier tuning for reducers + UI.

export const CLEANLINESS_TIER_EFFECTS = Object.freeze({
  FRESH: {
    label: "Fresh",
    journalSummary: "Feeling squeaky clean and ready to zoom.",
    penalties: { happinessTickPenalty: 0, energyTickPenalty: 0 },
    severity: 0,
    careTip: "All good. Keep the routine going.",
    ui: {
      tone: "fresh",
      chipClass: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
      meterColor: "#34d399",
      glow: "rgba(16,185,129,0.18)",
    },
  },
  DIRTY: {
    label: "Muddy paws",
    journalSummary: "I picked up some mystery grime. Bath time soon?",
    penalties: { happinessTickPenalty: 1, energyTickPenalty: 0 },
    severity: 1,
    careTip: "A quick rinse boosts mood.",
    ui: {
      tone: "dirty",
      chipClass: "border-amber-400/25 bg-amber-500/10 text-amber-100",
      meterColor: "#fbbf24",
      glow: "rgba(251,191,36,0.16)",
    },
  },
  FLEAS: {
    label: "Fleas",
    journalSummary: "I’m itchy… a bath would help a lot.",
    penalties: { happinessTickPenalty: 2, energyTickPenalty: 1 },
    severity: 2,
    careTip: "Bath + rest helps clear the itch.",
    ui: {
      tone: "fleas",
      chipClass: "border-rose-400/25 bg-rose-500/10 text-rose-100",
      meterColor: "#fb7185",
      glow: "rgba(244,63,94,0.18)",
    },
  },
  MANGE: {
    label: "Mange",
    journalSummary: "I feel gross and tired. Please take care of me.",
    penalties: { happinessTickPenalty: 3, energyTickPenalty: 2 },
    severity: 3,
    careTip: "Prioritize care and rest until clean.",
    ui: {
      tone: "mange",
      chipClass: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100",
      meterColor: "#e879f9",
      glow: "rgba(217,70,239,0.18)",
    },
  },
});

export const CLEANLINESS_TIERS = Object.freeze([
  "FRESH",
  "DIRTY",
  "FLEAS",
  "MANGE",
]);

export function getCleanlinessLabel(tier) {
  if (!tier) return "";
  const key = String(tier).toUpperCase();
  return CLEANLINESS_TIER_EFFECTS[key]?.label || key || "";
}

export function getCleanlinessUi(tier) {
  const key = String(tier || "").toUpperCase();
  return (
    CLEANLINESS_TIER_EFFECTS[key]?.ui ||
    CLEANLINESS_TIER_EFFECTS.FRESH?.ui || {
      tone: "fresh",
      chipClass: "border-white/10 bg-white/5 text-zinc-200",
      meterColor: "#94a3b8",
      glow: "rgba(148,163,184,0.12)",
    }
  );
}

export function getCleanlinessSeverity(tier) {
  const key = String(tier || "").toUpperCase();
  const v = CLEANLINESS_TIER_EFFECTS[key]?.severity;
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}
