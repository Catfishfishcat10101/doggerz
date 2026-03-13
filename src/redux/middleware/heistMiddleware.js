import {
  simulationTick,
  tickDog,
  trainObedience,
  triggerButtonHeist,
} from "@/redux/dogSlice.js";
import { derivePersonalityProfile } from "@/logic/personalityProfile.js";
import {
  buildHeistMessage,
  HEIST_ROUTE_BY_ACTION,
} from "@/utils/heistRoutes.js";

const HEIST_ROLL_INTERVAL_MS = 60_000;
const HEIST_TRIGGER_ACTIONS = new Set([
  simulationTick.type,
  tickDog.type,
  "engine/TICK",
]);
const HEIST_TARGETS = Object.freeze(Object.keys(HEIST_ROUTE_BY_ACTION));
const COMMAND_INTERCEPT_TYPES = new Set([trainObedience.type]);

let lastHeistRollAt = 0;

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function pickAlternateCommand(unlockedIds = [], commandId = "") {
  const requested = normalizeToken(commandId);
  return (Array.isArray(unlockedIds) ? unlockedIds : [])
    .map((id) => String(id || "").trim())
    .find((id) => normalizeToken(id) && normalizeToken(id) !== requested);
}

function getRecentCommandBuffer(dog) {
  return Array.isArray(dog?.memory?.commandBuffer)
    ? dog.memory.commandBuffer.slice(0, 4)
    : [];
}

function buildForcedTrainingReaction(dog, action) {
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  if (!dog?.adoptedAt || lifecycleStatus !== "ACTIVE") return null;

  const commandId = String(action?.payload?.commandId || "").trim();
  if (!commandId) return null;

  const profile =
    dog?.personalityProfile && typeof dog.personalityProfile === "object"
      ? dog.personalityProfile
      : derivePersonalityProfile(dog || {});
  const archetype = String(dog?.temperament?.archetype || "")
    .trim()
    .toUpperCase();
  const bond = clamp(Number(dog?.bond?.value || 0), 0, 100);
  const energy = clamp(Number(dog?.stats?.energy || 0), 0, 100);
  const happiness = clamp(Number(dog?.stats?.happiness || 0), 0, 100);
  const frustration = clamp(
    Number(profile?.dynamicStates?.frustration || 0),
    0,
    100
  );
  const confidence = clamp(
    Number(profile?.dynamicStates?.confidence || 50),
    0,
    100
  );
  const unlockedIds = dog?.training?.obedience?.unlockedIds || [];
  const recentCommands = getRecentCommandBuffer(dog);
  const repeatedCommandCount = recentCommands.filter(
    (entry) => normalizeToken(entry?.commandId) === normalizeToken(commandId)
  ).length;
  const recentIgnoreCount = recentCommands.filter(
    (entry) => normalizeToken(entry?.kind) === "ignore"
  ).length;
  const alternateCommand = pickAlternateCommand(unlockedIds, commandId);

  const zoomiesChance =
    bond >= 95 && energy >= 74 && happiness >= 72
      ? 0.14 + repeatedCommandCount * 0.06
      : 0;
  const mischiefChance =
    archetype === "MISCHIEVOUS"
      ? 0.12 + repeatedCommandCount * 0.08 + frustration * 0.0015
      : archetype === "INDEPENDENT"
        ? 0.05 + repeatedCommandCount * 0.04 + frustration * 0.001
        : 0;
  const reinterpretChance =
    alternateCommand && confidence >= 58 && recentIgnoreCount === 0
      ? archetype === "ATHLETE" || archetype === "SHADOW"
        ? 0.08 + Math.max(0, confidence - 58) * 0.001
        : 0
      : 0;

  const roll = Math.random();

  if (zoomiesChance > 0 && roll < Math.min(0.4, zoomiesChance)) {
    return {
      kind: "zoomies",
      requestedCommandId: commandId,
      performedActionId: "zoomies",
      performedCommandId: null,
      reasonId: "bond_zoomies",
    };
  }

  if (
    mischiefChance > 0 &&
    roll < Math.min(0.58, zoomiesChance + mischiefChance)
  ) {
    return {
      kind: "ignore",
      requestedCommandId: commandId,
      performedActionId:
        archetype === "MISCHIEVOUS" && repeatedCommandCount >= 1
          ? "dig"
          : "bark",
      performedCommandId: null,
      reasonId:
        archetype === "MISCHIEVOUS" && repeatedCommandCount >= 1
          ? "dig"
          : "ghost_bark",
    };
  }

  if (reinterpretChance > 0 && roll > 1 - Math.min(0.22, reinterpretChance)) {
    return {
      kind: "reinterpret",
      requestedCommandId: commandId,
      performedActionId: alternateCommand,
      performedCommandId: alternateCommand,
      reasonId: "showoff",
    };
  }

  return null;
}

function isDogSleeping(dog) {
  if (!dog || typeof dog !== "object") return false;
  if (dog.isAsleep) return true;
  return (
    String(dog.aiState || "")
      .trim()
      .toLowerCase() === "sleep"
  );
}

export const heistMiddleware = (storeApi) => (next) => (action) => {
  let forwardedAction = action;

  if (
    COMMAND_INTERCEPT_TYPES.has(action?.type) &&
    !action?.payload?._intercepted
  ) {
    const dog = storeApi.getState()?.dog;
    const forcedReaction = buildForcedTrainingReaction(dog, action);
    if (forcedReaction) {
      forwardedAction = {
        ...action,
        payload: {
          ...action.payload,
          _intercepted: true,
          forcedReaction,
        },
      };
    }
  }

  const result = next(forwardedAction);

  if (!HEIST_TRIGGER_ACTIONS.has(forwardedAction?.type)) {
    return result;
  }

  const state = storeApi.getState();
  const dog = state?.dog;
  const activeSurprise = dog?.surprise?.active || null;
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  const now = Date.now();

  if (!dog?.adoptedAt || lifecycleStatus !== "ACTIVE") return result;
  if (activeSurprise) return result;
  if (isDogSleeping(dog)) return result;
  if (lastHeistRollAt && now - lastHeistRollAt < HEIST_ROLL_INTERVAL_MS) {
    return result;
  }

  lastHeistRollAt = now;
  if (Math.random() >= 0.1) return result;

  const stolenAction =
    HEIST_TARGETS[Math.floor(Math.random() * HEIST_TARGETS.length)] || "store";

  storeApi.dispatch(
    triggerButtonHeist({
      now,
      silenceMs: 60_000,
      stolenAction,
      message: buildHeistMessage(stolenAction, dog?.name || "Fireball"),
    })
  );

  return result;
};
