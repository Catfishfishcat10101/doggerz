// src/constants/obedienceCommands.js

function freezeCommand(command) {
  return Object.freeze({ ...command });
}

const COMMANDS = [
  {
    id: "sit",
    label: "Sit",
    group: "Tier 1 · Basics",
    difficulty: 1,
    summary:
      "The absolute foundation. Classic sit posture, looking at you for the next cue.",
    minLevel: 1,
    minBond: 0,
    unlockDelayMinutes: 0,
    animationKey: "sit",
  },
  {
    id: "speak",
    label: "Speak",
    group: "Tier 1 · Basics",
    difficulty: 1,
    summary: "Quick sharp bark. Head tilts up and the mouth pops open on cue.",
    minLevel: 1,
    minBond: 0,
    unlockDelayMinutes: 0,
    animationKey: "speak",
  },
  {
    id: "shake",
    label: "Shake",
    group: "Tier 1 · Basics",
    difficulty: 1,
    summary:
      "Polite paw greeting. Sits and lifts a front paw to meet your hand.",
    minLevel: 2,
    minBond: 10,
    unlockDelayMinutes: 10,
    animationKey: "shake",
  },
  {
    id: "sitPretty",
    label: "Sit Pretty",
    group: "Tier 2 · Intermediate",
    difficulty: 2,
    summary: "Balance upright on hind legs with paws tucked to the chest.",
    minLevel: 4,
    minBond: 18,
    unlockDelayMinutes: 15,
    animationKey: "sit_pretty",
  },
  {
    id: "rollOver",
    label: "Roll Over",
    group: "Tier 2 · Intermediate",
    difficulty: 2,
    summary: "A full horizontal rotation: flop, roll 360°, then pop back up.",
    minLevel: 5,
    minBond: 22,
    unlockDelayMinutes: 20,
    animationKey: "roll_over",
  },
  {
    id: "spin",
    label: "Spin",
    group: "Tier 2 · Intermediate",
    difficulty: 2,
    summary: "The Tornado. Fast circular rotation on the spot.",
    minLevel: 6,
    minBond: 24,
    unlockDelayMinutes: 25,
    animationKey: "spin",
  },
  {
    id: "crawl",
    label: "Army Crawl",
    group: "Tier 3 · Advanced",
    difficulty: 3,
    summary:
      "Stealthy movement with the belly low and the paws pulling forward.",
    minLevel: 8,
    minBond: 28,
    unlockDelayMinutes: 30,
    animationKey: "crawl",
  },
  {
    id: "playDead",
    label: "Play Dead",
    group: "Tier 3 · Advanced",
    difficulty: 3,
    summary: "Dramatic finish. Flops onto the side and freezes the pose.",
    minLevel: 9,
    minBond: 32,
    unlockDelayMinutes: 35,
    animationKey: "play_dead",
  },
  {
    id: "backflip",
    label: "Backflip",
    group: "Tier 3 · Advanced",
    difficulty: 4,
    summary: "The JRT signature. Vertical leap with a full back rotation.",
    minLevel: 10,
    minBond: 36,
    unlockDelayMinutes: 60,
    animationKey: "backflip",
  },
];

export const MASTER_TRICKS = Object.freeze(
  COMMANDS.map((command, index) =>
    freezeCommand({
      ...command,
      order: index,
      tier: index <= 2 ? 1 : index <= 5 ? 2 : 3,
    })
  )
);

export const OBEDIENCE_COMMANDS = MASTER_TRICKS;
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
  playdead: "playDead",
  sitpretty: "sitPretty",
  backflip: "backflip",
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
