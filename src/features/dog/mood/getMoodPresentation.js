const MOOD_PRESENTATION_BY_KEY = Object.freeze({
  calm: {
    label: "Calm",
    tone: "emerald",
    hint: "Relaxed and settled.",
    accent: "Easygoing",
  },
  content: {
    label: "Content",
    tone: "emerald",
    hint: "Comfortable right now.",
    accent: "Steady",
  },
  happy: {
    label: "Happy",
    tone: "emerald",
    hint: "Enjoying the moment.",
    accent: "Bright",
  },
  playful: {
    label: "Playful",
    tone: "sky",
    hint: "Ready for a little fun.",
    accent: "Light energy",
  },
  proud: {
    label: "Proud",
    tone: "sky",
    hint: "Feeling good after progress.",
    accent: "Confident",
  },
  curious: {
    label: "Curious",
    tone: "sky",
    hint: "Watching something interesting.",
    accent: "Alert",
  },
  focused: {
    label: "Focused",
    tone: "sky",
    hint: "Dialed in and attentive.",
    accent: "Locked in",
  },
  energized: {
    label: "Energized",
    tone: "sky",
    hint: "Could use a gentle outlet.",
    accent: "Ready to move",
  },
  restless: {
    label: "Restless",
    tone: "warning",
    hint: "Needs a little activity soon.",
    accent: "Needs motion",
  },
  uneasy: {
    label: "Uneasy",
    tone: "warning",
    hint: "Could use reassurance.",
    accent: "Needs closeness",
  },
  lonely: {
    label: "Lonely",
    tone: "warning",
    hint: "Missing some attention.",
    accent: "Needs company",
  },
  hungry: {
    label: "Hungry",
    tone: "warning",
    hint: "Meal time is due.",
    accent: "Food soon",
  },
  thirsty: {
    label: "Thirsty",
    tone: "warning",
    hint: "Water would help.",
    accent: "Needs water",
  },
  dirty: {
    label: "Dirty",
    tone: "warning",
    hint: "A bath would help.",
    accent: "Needs cleanup",
  },
  sleepy: {
    label: "Sleepy",
    tone: "danger",
    hint: "Needs proper rest.",
    accent: "Low energy",
  },
  wild: {
    label: "Wild",
    tone: "warning",
    hint: "A little overstimulated.",
    accent: "Too wound up",
  },
  spicy: {
    label: "Spicy",
    tone: "warning",
    hint: "Feeling mischievous.",
    accent: "Mischief",
  },
  sassy: {
    label: "Sassy",
    tone: "sky",
    hint: "Showing attitude.",
    accent: "Personality",
  },
});

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeMoodKey(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "_")
    .replace(/[^\w]/g, "");
}

export function getMoodPresentation({
  moodLabel = "",
  hungerPct = 0,
  thirstPct = 0,
  energyPct = 0,
  cleanlinessPct = 0,
  happinessPct = 0,
  ambientType = "",
} = {}) {
  const ambientKey = normalizeMoodKey(ambientType);
  if (ambientKey === "owl") {
    return MOOD_PRESENTATION_BY_KEY.curious;
  }

  const moodKey = normalizeMoodKey(moodLabel);
  const directMood = MOOD_PRESENTATION_BY_KEY[moodKey];
  if (directMood) return directMood;

  if (clamp(energyPct, 0, 100) <= 20) {
    return MOOD_PRESENTATION_BY_KEY.sleepy;
  }
  if (clamp(hungerPct, 0, 100) >= 72) {
    return MOOD_PRESENTATION_BY_KEY.hungry;
  }
  if (clamp(thirstPct, 0, 100) >= 72) {
    return MOOD_PRESENTATION_BY_KEY.thirsty;
  }
  if (clamp(cleanlinessPct, 0, 100) <= 32) {
    return MOOD_PRESENTATION_BY_KEY.dirty;
  }
  if (clamp(happinessPct, 0, 100) >= 78) {
    return MOOD_PRESENTATION_BY_KEY.happy;
  }

  return MOOD_PRESENTATION_BY_KEY.calm;
}
