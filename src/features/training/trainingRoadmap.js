// src/features/training/trainingRoadmap.js
const STATUS_META = Object.freeze({
  complete: Object.freeze({
    label: "Complete",
    tone: "emerald",
    badgeClass: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  }),
  active: Object.freeze({
    label: "In progress",
    tone: "sky",
    badgeClass: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  }),
  upcoming: Object.freeze({
    label: "Coming up",
    tone: "amber",
    badgeClass: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  }),
  locked: Object.freeze({
    label: "Locked",
    tone: "zinc",
    badgeClass: "border-white/15 bg-white/5 text-zinc-200",
  }),
});

const POTTY_PHASE_META = Object.freeze({
  locked: Object.freeze({
    label: "Not started",
    shortLabel: "Not started",
    summary: "Potty rhythm has not settled yet.",
  }),
  introduced: Object.freeze({
    label: "Introduced",
    shortLabel: "New routine",
    summary: "Your pup is learning that outside is the right place.",
  }),
  learning: Object.freeze({
    label: "Learning",
    shortLabel: "Learning",
    summary: "Routine exists, but accidents still happen when timing slips.",
  }),
  reliable: Object.freeze({
    label: "Reliable",
    shortLabel: "Dependable",
    summary: "House rules feel dependable and the rhythm is holding.",
  }),
  mastered: Object.freeze({
    label: "Mastered",
    shortLabel: "Mastered",
    summary: "House training is part of everyday life now.",
  }),
});

function clamp(n, lo, hi) {
  const value = Number(n);
  if (!Number.isFinite(value)) return lo;
  return Math.max(lo, Math.min(hi, value));
}

function titleCase(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPottyPhaseMeta(phase) {
  const key = String(phase || "locked")
    .trim()
    .toLowerCase();
  return POTTY_PHASE_META[key] || POTTY_PHASE_META.locked;
}

export function getRoadmapStatusMeta(status) {
  const key = String(status || "locked")
    .trim()
    .toLowerCase();
  return STATUS_META[key] || STATUS_META.locked;
}

export function buildPottyGuidanceModel({
  dog = null,
  pottyTrack = null,
} = {}) {
  const pottyNeedPct = clamp(
    Number(dog?.pottyLevel || dog?.potty?.level || 0),
    0,
    100
  );
  const cleanliness = clamp(Number(dog?.stats?.cleanliness || 0), 0, 100);
  const energy = clamp(Number(dog?.stats?.energy || 0), 0, 100);
  const hunger = clamp(Number(dog?.stats?.hunger || 0), 0, 100);
  const thirst = clamp(Number(dog?.stats?.thirst || 0), 0, 100);
  const progressPct = clamp(Number(pottyTrack?.progressPct || 0), 0, 100);
  const phase = String(
    pottyTrack?.phase ||
      (progressPct >= 100
        ? "mastered"
        : progressPct >= 60
          ? "reliable"
          : progressPct > 0
            ? "learning"
            : "introduced")
  )
    .trim()
    .toLowerCase();

  let urgency = "steady";
  let urgencyLabel = "Routine is steady";
  let recommendation = "Keep taking your pup out after meals, play, and naps.";

  if (pottyNeedPct >= 90) {
    urgency = "critical";
    urgencyLabel = "Needs outside now";
    recommendation =
      "Go outside immediately. Waiting now is where accidents usually happen.";
  } else if (pottyNeedPct >= 72) {
    urgency = "urgent";
    urgencyLabel = "Potty window is open";
    recommendation =
      "A quick potty trip would likely prevent an indoor accident.";
  } else if (pottyNeedPct >= 45) {
    urgency = "soon";
    urgencyLabel = "Plan the next trip soon";
    recommendation =
      "You still have some buffer, but the next outing should be on deck.";
  }

  const pressureTags = [];
  if (energy <= 35) pressureTags.push("Nap wake-ups need a fast potty trip.");
  if (hunger >= 70 || thirst >= 70)
    pressureTags.push("Meals and water breaks usually shorten the window.");
  if (cleanliness <= 45)
    pressureTags.push(
      "Cleanup matters: messy days make routines feel shakier."
    );
  if (!pressureTags.length) {
    pressureTags.push(
      "Consistency beats perfection. The routine is the training."
    );
  }

  return {
    phase,
    phaseMeta: getPottyPhaseMeta(phase),
    progressPct,
    pottyNeedPct,
    urgency,
    urgencyLabel,
    recommendation,
    pressureTags,
  };
}

export function buildTrainingRoadmapModel({
  dogName = "Your pup",
  pottyTrack = null,
  unlockedFeatures = [],
  reliableCommandCount = 0,
  masteredCommandCount = 0,
  unlockedSkillIds = [],
  nextMilestone = null,
} = {}) {
  const pottyProgressPct = clamp(Number(pottyTrack?.progressPct || 0), 0, 100);
  const pottyPhase = String(
    pottyTrack?.phase ||
      (pottyProgressPct >= 100
        ? "mastered"
        : pottyProgressPct >= 60
          ? "reliable"
          : pottyProgressPct > 0
            ? "learning"
            : "introduced")
  )
    .trim()
    .toLowerCase();
  const pottyPhaseMeta = getPottyPhaseMeta(pottyPhase);
  const features = new Set(
    Array.isArray(unlockedFeatures)
      ? unlockedFeatures.map((value) => String(value || "").trim())
      : []
  );
  const unlockedPerks = Array.isArray(unlockedSkillIds) ? unlockedSkillIds : [];
  const reliableCount = Math.max(
    0,
    Math.floor(Number(reliableCommandCount || 0))
  );
  const masteredCount = Math.max(
    0,
    Math.floor(Number(masteredCommandCount || 0))
  );
  const obedienceUnlocked = features.has("obedience_training");
  const specializationStarted = unlockedPerks.length > 0;

  const steps = [
    {
      id: "house-routine",
      title: "House routine",
      eyebrow: "Potty first",
      status:
        pottyPhase === "mastered"
          ? "complete"
          : pottyProgressPct > 0
            ? "active"
            : "upcoming",
      progressPct: pottyProgressPct,
      summary: pottyPhaseMeta.summary,
      detail:
        pottyPhase === "mastered"
          ? `${dogName} has a dependable house-training rhythm.`
          : `${dogName} still learns most from consistent trips after meals, naps, and play.`,
    },
    {
      id: "shared-language",
      title: "Shared language",
      eyebrow: "Obedience basics",
      status:
        masteredCount > 0
          ? "complete"
          : obedienceUnlocked || reliableCount > 0
            ? "active"
            : pottyPhase === "mastered"
              ? "upcoming"
              : "locked",
      progressPct:
        masteredCount > 0
          ? 100
          : reliableCount > 0
            ? clamp(reliableCount * 35, 15, 85)
            : obedienceUnlocked
              ? 12
              : 0,
      summary: obedienceUnlocked
        ? reliableCount > 0
          ? `${reliableCount} cue${reliableCount === 1 ? " feels" : "s feel"} reliable already.`
          : "Obedience practice is unlocked and ready for short sessions."
        : "Obedience opens after potty training is fully locked in.",
      detail:
        masteredCount > 0
          ? `${masteredCount} mastered cue${masteredCount === 1 ? " is" : "s are"} now part of daily life.`
          : obedienceUnlocked
            ? "Keep sessions short and end on a win. Reliability matters more than volume."
            : "This lane stays intentionally gated so the sim feels like real early puppy life.",
    },
    {
      id: "lifelong-strengths",
      title: "Lifelong strengths",
      eyebrow: "Temperament shaping",
      status: specializationStarted
        ? "active"
        : obedienceUnlocked
          ? "upcoming"
          : "locked",
      progressPct: specializationStarted
        ? clamp(unlockedPerks.length * 18, 18, 100)
        : 0,
      summary: specializationStarted
        ? `${unlockedPerks.length} long-term perk${unlockedPerks.length === 1 ? " is" : "s are"} shaping your pup.`
        : "Perk branches are for long-term routine shaping, not replacing basic care.",
      detail: specializationStarted
        ? `Current branch choices steer resilience, comfort, and training pace over time.`
        : "Once the basics feel real, you can start shaping how this dog handles life.",
    },
  ].map((step) => ({
    ...step,
    statusMeta: getRoadmapStatusMeta(step.status),
  }));

  const nextFocus =
    steps.find((step) => step.status !== "complete") || steps[2];
  const milestoneLabel = String(
    nextMilestone?.title || nextMilestone?.label || ""
  ).trim();

  return {
    steps,
    nextFocus: {
      title: nextFocus.title,
      summary: nextFocus.summary,
      detail: nextFocus.detail,
      statusMeta: nextFocus.statusMeta,
    },
    pottyPhase,
    pottyPhaseMeta,
    obedienceUnlocked,
    specializationStarted,
    reliableCount,
    masteredCount,
    milestoneLabel,
    milestoneTone: String(nextMilestone?.tone || "emerald")
      .trim()
      .toLowerCase(),
    milestoneBody: String(nextMilestone?.body || "").trim(),
    unlockedFeatureLabels: Array.from(features).map(titleCase),
  };
}
