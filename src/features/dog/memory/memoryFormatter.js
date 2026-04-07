import { getMemoryMomentMeta, MEMORY_MOMENT_TYPES } from "./memoryEvents.js";

function titleize(value, fallback = "Memory moment") {
  const input = String(value || "").trim();
  if (!input) return fallback;
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatMemoryMoment(moment, { dogName = "Your pup" } = {}) {
  if (!moment || typeof moment !== "object") return null;

  const type = String(moment.type || "")
    .trim()
    .toLowerCase();
  const payload =
    moment.payload && typeof moment.payload === "object" ? moment.payload : {};
  const name = String(dogName || "Your pup").trim() || "Your pup";
  const meta = getMemoryMomentMeta(type);
  const base = {
    id: String(moment.id || `${type}:${Date.now()}`),
    dedupeKey: String(moment.uniqueKey || moment.id || `${type}`),
    durationMs: Number(meta.durationMs || 3200),
    cooldownMs: Number(meta.cooldownMs || 120_000),
    icon: "🐾",
    eyebrow: "Memory Moment",
    title: "A small moment",
    body: `${name} shared a quiet milestone with you.`,
    tone: "emerald",
  };

  if (type === MEMORY_MOMENT_TYPES.FIRST_LEVEL_UP) {
    const level = Math.max(2, Math.floor(Number(payload.level || 2)));
    return {
      ...base,
      icon: "⭐",
      eyebrow: "First Level Up",
      title: `${name} reached Level ${level}`,
      body: "Your routine is working. This is the first big growth milestone together.",
      tone: "amber",
    };
  }

  if (type === MEMORY_MOMENT_TYPES.TRICK_MASTERED) {
    const commandLabel = titleize(payload.commandLabel, "That trick");
    return {
      ...base,
      icon: "🎯",
      eyebrow: "Mastery",
      title: `${commandLabel} mastered`,
      body: `${name} now performs it with confidence.`,
      tone: "sky",
    };
  }

  if (type === MEMORY_MOMENT_TYPES.TREASURE_FOUND) {
    const rewardName = titleize(
      payload.rewardName || payload.rewardId,
      "Hidden treasure"
    );
    return {
      ...base,
      icon: payload.rewardIcon ? String(payload.rewardIcon) : "🦴",
      eyebrow: "Treasure Found",
      title: rewardName,
      body: `${name} followed a scent trail and dug this up.`,
      tone: "amber",
    };
  }

  if (type === MEMORY_MOMENT_TYPES.SLEPT_IN_DOGHOUSE) {
    return {
      ...base,
      icon: "🏠",
      eyebrow: "Cozy Rest",
      title: `${name} settled in the doghouse`,
      body: "A calm, safe rest moment in the yard.",
      tone: "emerald",
    };
  }

  if (type === MEMORY_MOMENT_TYPES.MIDNIGHT_ZOOMIES) {
    return {
      ...base,
      icon: "🌙",
      eyebrow: "Night Spark",
      title: "Midnight zoomies",
      body: `${name} burst into a playful late-night sprint.`,
      tone: "sky",
    };
  }

  return base;
}
