/** @format */

// src/constants/obedienceCommands.js

export const DEFAULT_UNLOCK_DELAY_MINUTES = 30;

export const OBEDIENCE_COMMANDS = Object.freeze([
  {
    id: "sit",
    label: "Sit",
    minLevel: 1,
    minBond: 0,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Foundation cue for calm focus.",
  },
  {
    id: "stay",
    label: "Stay",
    minLevel: 1,
    minBond: 5,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Patience and impulse control.",
  },
  {
    id: "down",
    label: "Down",
    minLevel: 2,
    minBond: 10,
    minStreak: 0,
    unlockDelayMinutes: 0,
    tip: "Settle on cue.",
  },
  {
    id: "come",
    label: "Come",
    minLevel: 2,
    minBond: 12,
    minStreak: 1,
    unlockDelayMinutes: 0,
    tip: "Recall builds trust.",
  },
  {
    id: "heel",
    label: "Heel",
    minLevel: 3,
    minBond: 18,
    minStreak: 1,
    unlockDelayMinutes: 0,
    tip: "Stay close while walking.",
  },
  {
    id: "rollOver",
    label: "Roll over",
    minLevel: 4,
    minBond: 22,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Confidence + body control.",
  },
  {
    id: "shake",
    label: "Shake",
    minLevel: 5,
    minBond: 28,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Polite greetings.",
  },
  {
    id: "speak",
    label: "Speak",
    minLevel: 6,
    minBond: 32,
    minStreak: 2,
    unlockDelayMinutes: 0,
    tip: "Vocal cue for voice training.",
  },
  {
    id: "spin",
    label: "Spin",
    minLevel: 7,
    minBond: 40,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Quick, playful rotation.",
  },
  {
    id: "jump",
    label: "Jump",
    minLevel: 8,
    minBond: 45,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Energy burst (needs rest).",
  },
  {
    id: "highFive",
    label: "High five",
    minLevel: 9,
    minBond: 52,
    minStreak: 3,
    unlockDelayMinutes: 0,
    tip: "Trust and timing.",
  },
  {
    id: "wave",
    label: "Wave",
    minLevel: 10,
    minBond: 56,
    minStreak: 4,
    unlockDelayMinutes: 0,
    tip: "Show off to visitors.",
  },
  {
    id: "bow",
    label: "Bow",
    minLevel: 11,
    minBond: 60,
    minStreak: 4,
    unlockDelayMinutes: 0,
    tip: "Elegant greeting pose.",
  },
  {
    id: "playDead",
    label: "Play dead",
    minLevel: 12,
    minBond: 65,
    minStreak: 5,
    unlockDelayMinutes: 0,
    tip: "Big trust milestone.",
  },
  {
    id: "fetch",
    label: "Fetch",
    minLevel: 13,
    minBond: 70,
    minStreak: 5,
    unlockDelayMinutes: 0,
    tip: "Classic retrieve routine.",
  },
  {
    id: "dance",
    label: "Dance",
    minLevel: 15,
    minBond: 75,
    minStreak: 6,
    unlockDelayMinutes: 0,
    tip: "Advanced coordination.",
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
