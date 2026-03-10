// src/constants/obedienceCommands.js

function freezeCommand(command) {
  return Object.freeze({ ...command });
}

const COMMANDS = [
  {
    id: "sit",
    label: "Sit",
    minLevel: 1,
    minBond: 0,
    unlockDelayMinutes: 0,
    animationKey: "sit",
  },
  {
    id: "stay",
    label: "Stay",
    minLevel: 2,
    minBond: 5,
    unlockDelayMinutes: 10,
    animationKey: "stay",
  },
  {
    id: "down",
    label: "Down",
    minLevel: 3,
    minBond: 8,
    unlockDelayMinutes: 10,
    animationKey: "lay_down",
  },
  {
    id: "come",
    label: "Come",
    minLevel: 4,
    minBond: 10,
    unlockDelayMinutes: 15,
    animationKey: "walk",
  },
  {
    id: "heel",
    label: "Heel",
    minLevel: 5,
    minBond: 12,
    unlockDelayMinutes: 20,
    animationKey: "walk",
  },
  {
    id: "rollOver",
    label: "Roll over",
    minLevel: 6,
    minBond: 16,
    unlockDelayMinutes: 25,
    animationKey: "roll_over",
  },
  {
    id: "speak",
    label: "Speak",
    minLevel: 7,
    minBond: 18,
    unlockDelayMinutes: 25,
    animationKey: "bark",
  },
  {
    id: "shake",
    label: "Shake",
    minLevel: 8,
    minBond: 20,
    unlockDelayMinutes: 30,
    animationKey: "shake",
  },
  {
    id: "highFive",
    label: "High five",
    minLevel: 9,
    minBond: 22,
    unlockDelayMinutes: 35,
    animationKey: "highfive",
  },
  {
    id: "wave",
    label: "Wave",
    minLevel: 10,
    minBond: 24,
    unlockDelayMinutes: 40,
    animationKey: "wave",
  },
  {
    id: "spin",
    label: "Spin",
    minLevel: 11,
    minBond: 26,
    unlockDelayMinutes: 45,
    animationKey: "spin",
  },
  {
    id: "jump",
    label: "Jump",
    minLevel: 12,
    minBond: 28,
    unlockDelayMinutes: 50,
    animationKey: "jump",
  },
  {
    id: "bow",
    label: "Bow",
    minLevel: 13,
    minBond: 30,
    unlockDelayMinutes: 55,
    animationKey: "bow",
  },
  {
    id: "playDead",
    label: "Play dead",
    minLevel: 14,
    minBond: 32,
    unlockDelayMinutes: 60,
    animationKey: "play_dead",
  },
  {
    id: "fetch",
    label: "Fetch",
    minLevel: 15,
    minBond: 34,
    unlockDelayMinutes: 60,
    animationKey: "fetch",
  },
  {
    id: "dance",
    label: "Dance",
    minLevel: 16,
    minBond: 36,
    unlockDelayMinutes: 60,
    animationKey: "dance",
  },
];

export const OBEDIENCE_COMMANDS = Object.freeze(COMMANDS.map(freezeCommand));

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
