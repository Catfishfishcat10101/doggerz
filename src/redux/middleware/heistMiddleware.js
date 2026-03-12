import {
  simulationTick,
  tickDog,
  triggerButtonHeist,
} from "@/redux/dogSlice.js";
import {
  buildHeistMessage,
  HEIST_ROUTE_BY_ACTION,
} from "@/utils/heistRoutes.js";

const HEIST_ROLL_INTERVAL_MS = 60_000;
const HEIST_TRIGGER_ACTIONS = new Set([simulationTick.type, tickDog.type]);
const HEIST_TARGETS = Object.freeze(Object.keys(HEIST_ROUTE_BY_ACTION));

let lastHeistRollAt = 0;

function isDogSleeping(dog) {
  if (!dog || typeof dog !== "object") return false;
  if (dog.isAsleep) return true;
  return String(dog.aiState || "").trim().toLowerCase() === "sleep";
}

export const heistMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (!HEIST_TRIGGER_ACTIONS.has(action?.type)) {
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
