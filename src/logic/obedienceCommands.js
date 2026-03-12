// src/constants/obedienceCommands.js

function freezeCommand(command) {
  return Object.freeze({ ...command });
}

const COMMANDS = [
  {
    id: "sit",
    label: "Sit",
    group: "Foundation",
    difficulty: 1,
    summary: "Plant stillness on cue and hold eye contact.",
    minLevel: 1,
    minBond: 0,
    unlockDelayMinutes: 0,
    animationKey: "sit",
  },
  {
    id: "stay",
    label: "Stay",
    group: "Foundation",
    difficulty: 1,
    summary: "Pause in place until released.",
    minLevel: 2,
    minBond: 5,
    unlockDelayMinutes: 10,
    animationKey: "stay",
  },
  {
    id: "down",
    label: "Down",
    group: "Foundation",
    difficulty: 1,
    summary: "Drop low and settle instead of pacing.",
    minLevel: 3,
    minBond: 8,
    unlockDelayMinutes: 10,
    animationKey: "lay_down",
  },
  {
    id: "come",
    label: "Come",
    group: "Foundation",
    difficulty: 2,
    summary: "Break distractions and return to you.",
    minLevel: 4,
    minBond: 10,
    unlockDelayMinutes: 15,
    animationKey: "walk",
  },
  {
    id: "heel",
    label: "Heel",
    group: "Foundation",
    difficulty: 2,
    summary: "Move in sync at your side without drifting.",
    minLevel: 5,
    minBond: 12,
    unlockDelayMinutes: 20,
    animationKey: "walk",
  },
  {
    id: "rollOver",
    label: "Roll over",
    group: "Dexterity",
    difficulty: 2,
    summary: "Commit to a full body roll without bailing out.",
    minLevel: 6,
    minBond: 16,
    unlockDelayMinutes: 25,
    animationKey: "roll_over",
  },
  {
    id: "speak",
    label: "Speak",
    group: "Special",
    difficulty: 2,
    summary: "Answer the cue with a bark instead of side-eye.",
    minLevel: 7,
    minBond: 18,
    unlockDelayMinutes: 25,
    animationKey: "bark",
  },
  {
    id: "shake",
    label: "Shake",
    group: "Dexterity",
    difficulty: 2,
    summary: "Offer a paw cleanly and hold the pose.",
    minLevel: 8,
    minBond: 20,
    unlockDelayMinutes: 30,
    animationKey: "shake",
  },
  {
    id: "highFive",
    label: "High five",
    group: "Dexterity",
    difficulty: 2,
    summary: "Turn that paw cue into a sharper target touch.",
    minLevel: 9,
    minBond: 22,
    unlockDelayMinutes: 35,
    animationKey: "highfive",
  },
  {
    id: "wave",
    label: "Wave",
    group: "Special",
    difficulty: 2,
    summary: "Flash a quick greeting instead of bolting off.",
    minLevel: 10,
    minBond: 24,
    unlockDelayMinutes: 40,
    animationKey: "wave",
  },
  {
    id: "spin",
    label: "Spin",
    group: "Dexterity",
    difficulty: 3,
    summary: "Turn fast, stay balanced, and finish on target.",
    minLevel: 11,
    minBond: 26,
    unlockDelayMinutes: 45,
    animationKey: "spin",
  },
  {
    id: "jump",
    label: "Jump",
    group: "High Energy",
    difficulty: 3,
    summary: "Channel burst energy into a clean launch.",
    minLevel: 12,
    minBond: 28,
    unlockDelayMinutes: 50,
    animationKey: "jump",
  },
  {
    id: "bow",
    label: "Bow",
    group: "Special",
    difficulty: 3,
    summary: "Drop into a showy stretch on command.",
    minLevel: 13,
    minBond: 30,
    unlockDelayMinutes: 55,
    animationKey: "bow",
  },
  {
    id: "playDead",
    label: "Play dead",
    group: "Special",
    difficulty: 4,
    summary: "Freeze the whole act long enough to sell it.",
    minLevel: 14,
    minBond: 32,
    unlockDelayMinutes: 60,
    animationKey: "play_dead",
  },
  {
    id: "fetch",
    label: "Fetch",
    group: "High Energy",
    difficulty: 4,
    summary: "Sprint out, recover the toy, and actually bring it back.",
    minLevel: 15,
    minBond: 34,
    unlockDelayMinutes: 60,
    animationKey: "fetch",
  },
  {
    id: "dance",
    label: "Dance",
    group: "Special",
    difficulty: 5,
    summary: "Chain multiple cues into a full show-off routine.",
    minLevel: 16,
    minBond: 36,
    unlockDelayMinutes: 60,
    animationKey: "dance",
  },
];

export const OBEDIENCE_COMMANDS = Object.freeze(COMMANDS.map(freezeCommand));
export const OBEDIENCE_ACTIVE_LEARNING_LIMITS = Object.freeze({
  EARLY: 1,
  STEADY: 2,
});

function normalizeCommandToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_-]+/g, "");
}

const COMMAND_ID_ALIASES = Object.freeze({
  rollover: "rollOver",
  highfive: "highFive",
  playdead: "playDead",
});

const OBEDIENCE_COMMAND_BY_ID = (() => {
  const map = new Map();
  for (const cmd of OBEDIENCE_COMMANDS) {
    map.set(cmd.id, cmd);
    map.set(normalizeCommandToken(cmd.id), cmd);
  }
  for (const [alias, canonical] of Object.entries(COMMAND_ID_ALIASES)) {
    const hit = map.get(canonical);
    if (hit) map.set(alias, hit);
  }
  return map;
})();

export function normalizeObedienceCommandId(commandId) {
  const token = normalizeCommandToken(commandId);
  if (!token) return "";
  const hit = OBEDIENCE_COMMAND_BY_ID.get(token);
  return hit?.id || "";
}

export function getObedienceCommand(commandId) {
  const token = normalizeCommandToken(commandId);
  if (!token) return null;
  return OBEDIENCE_COMMAND_BY_ID.get(token) || null;
}

export function hasObedienceCommand(commandId) {
  return Boolean(getObedienceCommand(commandId));
}

export function commandRequirementsMet(context, command) {
  if (!command) return false;
  const level = Number(context?.level || 1);
  const bond = Number(context?.bond || 0);
  const streak = Number(context?.streak || 0);
  const pottyComplete = Boolean(context?.pottyComplete);

  if (!pottyComplete) return false;
  if (Number(command.minLevel || 1) > level) return false;
  if (Number(command.minBond || 0) > bond) return false;
  if (Number(command.minStreak || 0) > streak) return false;
  return true;
}

export function getObedienceActiveLearningLimit(context = {}) {
  const pottyComplete = Boolean(context?.pottyComplete);
  if (!pottyComplete) return 0;

  const level = Math.max(1, Number(context?.level || 1));
  const masteredCount = Math.max(0, Number(context?.masteredCount || 0));
  const stage = String(context?.stage || "")
    .trim()
    .toUpperCase();

  if (stage === "ADULT" || stage === "SENIOR") {
    return OBEDIENCE_ACTIVE_LEARNING_LIMITS.STEADY;
  }

  if (level >= 4 || masteredCount >= 1) {
    return OBEDIENCE_ACTIVE_LEARNING_LIMITS.STEADY;
  }

  return OBEDIENCE_ACTIVE_LEARNING_LIMITS.EARLY;
}
