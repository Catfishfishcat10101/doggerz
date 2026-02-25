// src/constants/obedienceCommands.js

export const OBEDIENCE_COMMANDS = Object.freeze([
  { id: "sit", label: "Sit", minLevel: 1, minBond: 0, unlockDelayMinutes: 0 },
  {
    id: "stay",
    label: "Stay",
    minLevel: 2,
    minBond: 5,
    unlockDelayMinutes: 10,
  },
  {
    id: "down",
    label: "Down",
    minLevel: 3,
    minBond: 8,
    unlockDelayMinutes: 10,
  },
  {
    id: "come",
    label: "Come",
    minLevel: 4,
    minBond: 10,
    unlockDelayMinutes: 15,
  },
  {
    id: "heel",
    label: "Heel",
    minLevel: 5,
    minBond: 12,
    unlockDelayMinutes: 20,
  },
  {
    id: "rollOver",
    label: "Roll over",
    minLevel: 6,
    minBond: 16,
    unlockDelayMinutes: 25,
  },
  {
    id: "speak",
    label: "Speak",
    minLevel: 7,
    minBond: 18,
    unlockDelayMinutes: 25,
  },
  {
    id: "shake",
    label: "Shake",
    minLevel: 8,
    minBond: 20,
    unlockDelayMinutes: 30,
  },
  {
    id: "highFive",
    label: "High five",
    minLevel: 9,
    minBond: 22,
    unlockDelayMinutes: 35,
  },
  {
    id: "wave",
    label: "Wave",
    minLevel: 10,
    minBond: 24,
    unlockDelayMinutes: 40,
  },
  {
    id: "spin",
    label: "Spin",
    minLevel: 11,
    minBond: 26,
    unlockDelayMinutes: 45,
  },
  {
    id: "jump",
    label: "Jump",
    minLevel: 12,
    minBond: 28,
    unlockDelayMinutes: 50,
  },
  {
    id: "bow",
    label: "Bow",
    minLevel: 13,
    minBond: 30,
    unlockDelayMinutes: 55,
  },
  {
    id: "playDead",
    label: "Play dead",
    minLevel: 14,
    minBond: 32,
    unlockDelayMinutes: 60,
  },
  {
    id: "fetch",
    label: "Fetch",
    minLevel: 15,
    minBond: 34,
    unlockDelayMinutes: 60,
  },
  {
    id: "dance",
    label: "Dance",
    minLevel: 16,
    minBond: 36,
    unlockDelayMinutes: 60,
  },
]);

export function getObedienceCommand(commandId) {
  const id = String(commandId || "").trim();
  return OBEDIENCE_COMMANDS.find((c) => c.id === id) || null;
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

export default {
  OBEDIENCE_COMMANDS,
  getObedienceCommand,
  commandRequirementsMet,
};
