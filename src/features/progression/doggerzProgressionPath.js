const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

function phaseStatus(complete, active, available = true) {
  if (complete) return "complete";
  if (!available) return "locked";
  return active ? "active" : "upcoming";
}

function statusLabel(status) {
  if (status === "complete") return "Complete";
  if (status === "active") return "Now";
  if (status === "locked") return "Locked";
  return "Next";
}

function statusTone(status) {
  if (status === "complete") return "emerald";
  if (status === "active") return "sky";
  if (status === "locked") return "muted";
  return "amber";
}

export function buildDoggerzProgressionPath({
  dog = null,
  progression = null,
  pottyTrack = null,
  reliableCommandCount = 0,
  masteredCommandCount = 0,
} = {}) {
  const stage = String(dog?.lifeStage?.stage || "PUPPY").toUpperCase();
  const ageDays = Math.max(0, Math.floor(Number(dog?.lifeStage?.days || 0)));
  const bond = clamp(dog?.bond?.value, 0, 100);
  const careStreak = Math.max(
    0,
    Math.floor(
      Number(
        progression?.streaks?.care?.current ||
          dog?.streak?.currentStreakDays ||
          0
      )
    )
  );
  const pottyPct = clamp(
    pottyTrack?.progressPct ??
      (Number(dog?.training?.potty?.successCount || 0) /
        Math.max(1, Number(dog?.training?.potty?.goal || 1))) *
        100,
    0,
    100
  );
  const pottyComplete =
    String(pottyTrack?.phase || "").toLowerCase() === "mastered" ||
    Boolean(dog?.training?.potty?.completedAt) ||
    pottyPct >= 100;
  const obedienceUnlocked = Boolean(
    progression?.unlocks?.features?.includes("obedience_training") ||
    pottyComplete
  );
  const reliableCount = Math.max(0, Number(reliableCommandCount || 0));
  const masteredCount = Math.max(0, Number(masteredCommandCount || 0));
  const yardConfidencePct = clamp(
    bond * 0.55 + careStreak * 7 + reliableCount * 10,
    0,
    100
  );

  const phases = [
    {
      id: "potty_training",
      title: "Potty training phase",
      summary: pottyComplete
        ? "House rhythm is reliable enough for obedience to begin."
        : "Trips after meals, naps, water, and play build the first foundation.",
      progressPct: pottyPct,
      status: phaseStatus(pottyComplete, true),
    },
    {
      id: "basic_trust",
      title: "Basic trust phase",
      summary:
        bond >= 25
          ? "Your puppy is starting to believe the routine will hold."
          : "Food, water, calm attention, and clean timing create trust.",
      progressPct: clamp((bond / 25) * 100, 0, 100),
      status: phaseStatus(bond >= 25, Boolean(dog?.adoptedAt)),
    },
    {
      id: "obedience_foundation",
      title: "Obedience foundation",
      summary: obedienceUnlocked
        ? "Short, clean sessions can start now. Reliability matters more than volume."
        : "Locked until potty training is mastered.",
      progressPct: obedienceUnlocked ? clamp(reliableCount * 50, 12, 100) : 0,
      status: phaseStatus(
        reliableCount >= 1,
        obedienceUnlocked,
        obedienceUnlocked
      ),
    },
    {
      id: "trick_learning",
      title: "Trick learning phase",
      summary:
        masteredCount > 0
          ? "Some tricks are becoming part of your shared language."
          : "Tricks open slowly after basic obedience starts to feel reliable.",
      progressPct: clamp(masteredCount * 34, reliableCount > 0 ? 18 : 0, 100),
      status: phaseStatus(
        masteredCount >= 2,
        reliableCount > 0,
        reliableCount > 0
      ),
    },
    {
      id: "yard_confidence",
      title: "Yard confidence phase",
      summary:
        yardConfidencePct >= 70
          ? "The yard feels like their place now: safer, bolder, more curious."
          : "Bond and consistent care make wandering, greeting, and weather responses calmer.",
      progressPct: yardConfidencePct,
      status: phaseStatus(yardConfidencePct >= 70, bond >= 25, bond >= 25),
    },
    {
      id: "adult_transition",
      title: "Adult dog transition",
      summary:
        stage === "ADULT" || stage === "SENIOR"
          ? "The puppy chapter has turned into adult routine and confidence."
          : `Adult transition begins around day 30. Current age: day ${ageDays}.`,
      progressPct:
        stage === "ADULT" || stage === "SENIOR"
          ? 100
          : clamp((ageDays / 30) * 100, 0, 100),
      status: phaseStatus(
        stage === "ADULT" || stage === "SENIOR",
        ageDays >= 24
      ),
    },
    {
      id: "senior_transition",
      title: "Senior dog transition",
      summary:
        stage === "SENIOR"
          ? "The senior chapter is slower, softer, and more comfort-led."
          : "Senior transition stays far later so puppy and adult life have room to matter.",
      progressPct:
        stage === "SENIOR" ? 100 : clamp((ageDays / 150) * 100, 0, 100),
      status: phaseStatus(stage === "SENIOR", ageDays >= 135),
    },
  ].map((phase) => ({
    ...phase,
    statusLabel: statusLabel(phase.status),
    tone: statusTone(phase.status),
  }));

  const current =
    phases.find((phase) => phase.status === "active") ||
    phases.find((phase) => phase.status === "upcoming") ||
    phases[phases.length - 1];
  const nextLockedOrUpcoming =
    phases.find((phase) => phase.status === "locked") ||
    phases.find((phase) => phase.status === "upcoming") ||
    null;

  return {
    phases,
    current,
    next: nextLockedOrUpcoming,
    completedCount: phases.filter((phase) => phase.status === "complete")
      .length,
  };
}
