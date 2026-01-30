/** @format */

// src/constants/obedienceCommands.js

export const DEFAULT_UNLOCK_DELAY_MINUTES = 30;

export const OBEDIENCE_COMMAND_CATEGORIES = Object.freeze({
  FOUNDATION: "foundation",
  IMPULSE: "impulse",
  TRICK: "trick",
  ADVANCED: "advanced",
});

export const OBEDIENCE_DIFFICULTY = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert",
});

export const OBEDIENCE_COMMANDS = Object.freeze([
  {
    id: "sit",
    label: "Sit",
    minLevel: 1,
    minBond: 0,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Foundation cue for calm focus.",
    category: OBEDIENCE_COMMAND_CATEGORIES.FOUNDATION,
    difficulty: OBEDIENCE_DIFFICULTY.EASY,
    tags: ["calm", "focus"],
    xpHint: 6,
  },
  {
    id: "stay",
    label: "Stay",
    minLevel: 1,
    minBond: 5,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Patience and impulse control.",
    category: OBEDIENCE_COMMAND_CATEGORIES.IMPULSE,
    difficulty: OBEDIENCE_DIFFICULTY.EASY,
    tags: ["patience", "control"],
    xpHint: 6,
  },
  {
    id: "down",
    label: "Down",
    minLevel: 2,
    minBond: 10,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Settle on cue.",
    category: OBEDIENCE_COMMAND_CATEGORIES.FOUNDATION,
    difficulty: OBEDIENCE_DIFFICULTY.EASY,
    tags: ["calm", "settle"],
    xpHint: 6,
  },
  {
    id: "come",
    label: "Come",
    minLevel: 2,
    minBond: 12,
    minStreak: 1,
    unlockDelayMinutes: 0,
    tip: "Recall builds trust.",
    category: OBEDIENCE_COMMAND_CATEGORIES.FOUNDATION,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["recall", "trust"],
    xpHint: 7,
  },
  {
    id: "heel",
    label: "Heel",
    minLevel: 3,
    minBond: 18,
    minStreak: 1,
    unlockDelayMinutes: 0,
    tip: "Stay close while walking.",
    category: OBEDIENCE_COMMAND_CATEGORIES.IMPULSE,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["walk", "control"],
    xpHint: 7,
  },
  {
    id: "rollOver",
    label: "Roll over",
    minLevel: 4,
    minBond: 22,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Confidence + body control.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["confidence", "fun"],
    xpHint: 8,
  },
  {
    id: "shake",
    label: "Shake",
    minLevel: 5,
    minBond: 28,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Polite greetings.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["greeting", "gentle"],
    xpHint: 8,
  },
  {
    id: "speak",
    label: "Speak",
    minLevel: 6,
    minBond: 32,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Vocal cue for voice training.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["voice", "expression"],
    xpHint: 8,
  },
  {
    id: "spin",
    label: "Spin",
    minLevel: 7,
    minBond: 40,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Quick, playful rotation.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.MEDIUM,
    tags: ["play", "coordination"],
    xpHint: 9,
  },
  {
    id: "jump",
    label: "Jump",
    minLevel: 8,
    minBond: 45,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Energy burst (needs rest).",
    category: OBEDIENCE_COMMAND_CATEGORIES.ADVANCED,
    difficulty: OBEDIENCE_DIFFICULTY.HARD,
    tags: ["energy", "athletic"],
    xpHint: 10,
  },
  {
    id: "highFive",
    label: "High five",
    minLevel: 9,
    minBond: 52,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Trust and timing.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.HARD,
    tags: ["trust", "timing"],
    xpHint: 10,
  },
  {
    id: "wave",
    label: "Wave",
    minLevel: 10,
    minBond: 56,
    minStreak: 4,
    unlockDelayMinutes: 0,
    tip: "Show off to visitors.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.HARD,
    tags: ["show", "cute"],
    xpHint: 11,
  },
  {
    id: "bow",
    label: "Bow",
    minLevel: 11,
    minBond: 60,
    minStreak: 4,
    unlockDelayMinutes: 0,
    tip: "Elegant greeting pose.",
    category: OBEDIENCE_COMMAND_CATEGORIES.TRICK,
    difficulty: OBEDIENCE_DIFFICULTY.HARD,
    tags: ["grace", "show"],
    xpHint: 11,
  },
  {
    id: "playDead",
    label: "Play dead",
    minLevel: 12,
    minBond: 65,
    minStreak: 5,
    unlockDelayMinutes: 0,
    tip: "Big trust milestone.",
    category: OBEDIENCE_COMMAND_CATEGORIES.ADVANCED,
    difficulty: OBEDIENCE_DIFFICULTY.EXPERT,
    tags: ["trust", "focus"],
    xpHint: 12,
  },
  {
    id: "fetch",
    label: "Fetch",
    minLevel: 13,
    minBond: 70,
    minStreak: 5,
    unlockDelayMinutes: 0,
    tip: "Classic retrieve routine.",
    category: OBEDIENCE_COMMAND_CATEGORIES.ADVANCED,
    difficulty: OBEDIENCE_DIFFICULTY.EXPERT,
    tags: ["retrieve", "energy"],
    xpHint: 12,
  },
  {
    id: "dance",
    label: "Dance",
    minLevel: 15,
    minBond: 75,
    minStreak: 6,
    unlockDelayMinutes: 0,
    tip: "Advanced coordination.",
    category: OBEDIENCE_COMMAND_CATEGORIES.ADVANCED,
    difficulty: OBEDIENCE_DIFFICULTY.EXPERT,
    tags: ["rhythm", "show"],
    xpHint: 13,
  },
]);

const COMMAND_BY_ID = new Map(
  OBEDIENCE_COMMANDS.map((command) => [command.id, command])
);

export function getObedienceCommand(commandId) {
  return COMMAND_BY_ID.get(String(commandId || "")) || null;
}

export function commandRequirementsMet(
  { level = 1, bond = 0, streak = 0, pottyComplete = false } = {},
  command
) {
  if (!command) return false;
  if (!pottyComplete) return false;
  return (
    Number(level || 0) >= Number(command.minLevel || 0) &&
    Number(bond || 0) >= Number(command.minBond || 0) &&
    Number(streak || 0) >= Number(command.minStreak || 0)
  );
}

export function getCommandRequirements(command) {
  if (!command) return null;
  return {
    level: Number(command.minLevel || 0),
    bond: Number(command.minBond || 0),
    streak: Number(command.minStreak || 0),
  };
}

export function getCommandTags(command) {
  if (!command) return [];
  return Array.isArray(command.tags) ? command.tags.filter(Boolean) : [];
}
