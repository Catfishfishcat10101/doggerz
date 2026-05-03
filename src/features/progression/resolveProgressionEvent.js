// src/features/progression/resolveProgressionEvent.js
import {
  bathe,
  claimTreasureFind,
  feed,
  giveWater,
  goPotty,
  petDog,
  play,
  quickFeed,
  recordAccident,
  registerSessionStart,
  scoopPoop,
  setAdoptedAt,
  trainObedience,
} from "@/store/dogSlice.js";
import {
  OBEDIENCE_COMMANDS,
  getObedienceCommand,
} from "@/features/training/obedienceCommands.js";
import { getObedienceSkillMasteryPct } from "@/features/training/jrtTrainingController.js";
import {
  PROGRESSION_EVENT_TYPES,
  getProgressionBucketKey,
  getProgressionDayKey,
  toTimestamp,
} from "./progressionConfig.js";

const ACTION_TO_EVENT_TYPE = Object.freeze({
  [feed.type]: PROGRESSION_EVENT_TYPES.CARE_FEED,
  [quickFeed.type]: PROGRESSION_EVENT_TYPES.CARE_FEED,
  [giveWater.type]: PROGRESSION_EVENT_TYPES.CARE_WATER,
  [play.type]: PROGRESSION_EVENT_TYPES.CARE_PLAY,
  [petDog.type]: PROGRESSION_EVENT_TYPES.CARE_PET,
  [bathe.type]: PROGRESSION_EVENT_TYPES.CARE_BATHE,
  [goPotty.type]: PROGRESSION_EVENT_TYPES.POTTY_SUCCESS,
  [recordAccident.type]: PROGRESSION_EVENT_TYPES.POTTY_ACCIDENT,
  [scoopPoop.type]: PROGRESSION_EVENT_TYPES.CARE_CLEANUP,
  [trainObedience.type]: PROGRESSION_EVENT_TYPES.TRAINING_SESSION,
  [claimTreasureFind.type]: PROGRESSION_EVENT_TYPES.TREASURE_FOUND,
  [registerSessionStart.type]: PROGRESSION_EVENT_TYPES.SESSION_STARTED,
  [setAdoptedAt.type]: PROGRESSION_EVENT_TYPES.DOG_ADOPTED,
});

const EVENT_BUCKET_MS = Object.freeze({
  [PROGRESSION_EVENT_TYPES.CARE_FEED]: 6 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.CARE_WATER]: 6 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.CARE_PLAY]: 4 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.CARE_PET]: 3 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.CARE_BATHE]: 24 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.CARE_CLEANUP]: 12 * 60 * 60 * 1000,
  [PROGRESSION_EVENT_TYPES.SESSION_STARTED]: 24 * 60 * 60 * 1000,
});

function normalizeDogId(dog = {}) {
  return (
    String(dog?.identity?.profileId || "").trim() ||
    String(dog?.adoptedAt || "").trim() ||
    String(dog?.name || "dog").trim() ||
    "dog"
  );
}

function getEventTimestamp(action, nextDog = {}) {
  const payload = action?.payload;
  return (
    toTimestamp(payload?.now) ??
    toTimestamp(payload?.timestamp) ??
    toTimestamp(payload?.occurredAt) ??
    toTimestamp(payload) ??
    toTimestamp(nextDog?.lastUpdatedAt) ??
    Date.now()
  );
}

function mapTrainingOutcome(lastAction = "") {
  const token = String(lastAction || "")
    .trim()
    .toLowerCase();
  if (token === "train_perfect") return "perfect";
  if (token === "train_reinterpret") return "reinterpret";
  if (token === "train_doze_off") return "doze_off";
  if (token === "train_zoomies") return "zoomies";
  if (token === "train_ignore") return "ignore";
  if (
    token === "trainblocked" ||
    token === "train_blocked" ||
    token === "trainlocked" ||
    token === "train_locked"
  ) {
    return "blocked";
  }
  if (token === "trainfailed" || token === "train_failed") return "fail";
  if (token === "train") return "success";
  return "default";
}

function buildSnapshot(state, occurredAt) {
  const nextState = state && typeof state === "object" ? state : {};
  const dog = nextState?.dog || {};
  const user = nextState?.user || {};
  const potty = dog?.training?.potty || {};
  const obedienceSkills = dog?.skills?.obedience || {};
  const unlockedIds = Array.isArray(dog?.training?.obedience?.unlockedIds)
    ? dog.training.obedience.unlockedIds.map((id) => String(id || "").trim())
    : [];

  return {
    occurredAt,
    dayKey: getProgressionDayKey(occurredAt),
    dog: {
      id: normalizeDogId(dog),
      name: String(dog?.name || "Pup").trim() || "Pup",
      adoptedAt: toTimestamp(dog?.adoptedAt),
      level: Math.max(1, Math.floor(Number(dog?.level || 1))),
      bondValue: Math.max(0, Math.round(Number(dog?.bond?.value || 0))),
      stage: String(dog?.lifeStage?.stage || "PUPPY")
        .trim()
        .toUpperCase(),
      ageDays: Math.max(0, Math.floor(Number(dog?.lifeStage?.days || 0))),
      potty: {
        successCount: Math.max(0, Math.floor(Number(potty?.successCount || 0))),
        goal: Math.max(1, Math.floor(Number(potty?.goal || 1))),
        completedAt: toTimestamp(potty?.completedAt),
      },
      obedience: OBEDIENCE_COMMANDS.map((command) => {
        const skillNode = obedienceSkills?.[command.id] || {};
        return {
          id: command.id,
          label: command.label,
          unlocked: unlockedIds.includes(command.id),
          masteryPct: getObedienceSkillMasteryPct(skillNode),
        };
      }),
    },
    user: {
      id: String(user?.id || "").trim() || null,
      displayName: String(user?.displayName || "").trim() || null,
      streakDays: Math.max(
        0,
        Math.floor(
          Number(user?.streak?.currentStreakDays || user?.streak?.current || 0)
        )
      ),
    },
  };
}

function getEventDedupeKey(type, occurredAt, dogId, identity = "core") {
  const bucketMs = EVENT_BUCKET_MS[type] || 0;
  if (!bucketMs) return null;
  const bucketKey = getProgressionBucketKey(occurredAt, bucketMs);
  return `${type}:${dogId}:${identity}:${bucketKey}`;
}

function buildPrimaryEvent({ action, nextState, type, occurredAt }) {
  const snapshot = buildSnapshot(nextState, occurredAt);
  const nextDog = nextState?.dog || {};
  const payload =
    action?.payload && typeof action.payload === "object" ? action.payload : {};
  const dogId = snapshot?.dog?.id || "dog";

  if (type === PROGRESSION_EVENT_TYPES.TRAINING_SESSION) {
    const commandId = String(payload?.commandId || "").trim();
    const command = getObedienceCommand(commandId);
    const outcome = mapTrainingOutcome(nextDog?.lastAction);
    return {
      type,
      occurredAt,
      dedupeKey: null,
      snapshot,
      payload: {
        commandId,
        commandLabel: command?.label || commandId || "Training",
        input: String(payload?.input || "button").trim() || "button",
        outcome,
      },
    };
  }

  if (type === PROGRESSION_EVENT_TYPES.TREASURE_FOUND) {
    return {
      type,
      occurredAt,
      dedupeKey: null,
      snapshot,
      payload: {
        rewardId: String(payload?.id || payload?.rewardId || "").trim() || null,
        rewardName:
          String(
            payload?.label || payload?.rewardName || payload?.id || ""
          ).trim() || null,
      },
    };
  }

  if (type === PROGRESSION_EVENT_TYPES.DOG_ADOPTED) {
    return {
      type,
      occurredAt,
      dedupeKey: `dog.adopted:${dogId}`,
      snapshot,
      payload: {
        adoptedAt: occurredAt,
      },
    };
  }

  const identity =
    type === PROGRESSION_EVENT_TYPES.CARE_FEED
      ? String(payload?.foodType || payload?.source || action?.type || "feed")
      : type === PROGRESSION_EVENT_TYPES.SESSION_STARTED
        ? snapshot?.dayKey || "session"
        : "core";

  return {
    type,
    occurredAt,
    dedupeKey: getEventDedupeKey(type, occurredAt, dogId, identity),
    snapshot,
    payload: {
      sourceAction: String(action?.type || "").trim() || null,
      source: String(payload?.source || "").trim() || null,
      input: String(payload?.input || "").trim() || null,
      foodType: String(payload?.foodType || "").trim() || null,
    },
  };
}

export function resolveProgressionEvent({ action, prevState, nextState }) {
  if (!action?.type || action.type.startsWith("progression/")) return [];

  const nextDog = nextState?.dog || {};
  const prevDog = prevState?.dog || {};
  const type = ACTION_TO_EVENT_TYPE[action.type] || null;
  const occurredAt = getEventTimestamp(action, nextDog);
  const events = [];

  if (type) {
    events.push(
      buildPrimaryEvent({
        action,
        nextState,
        type,
        occurredAt,
      })
    );
  }

  const prevStage = String(prevDog?.lifeStage?.stage || "")
    .trim()
    .toUpperCase();
  const nextStage = String(nextDog?.lifeStage?.stage || "")
    .trim()
    .toUpperCase();
  if (prevStage && nextStage && prevStage !== nextStage) {
    const snapshot = buildSnapshot(nextState, occurredAt);
    events.push({
      type: PROGRESSION_EVENT_TYPES.LIFE_STAGE_CHANGED,
      occurredAt,
      dedupeKey: `life-stage:${snapshot?.dog?.id || "dog"}:${nextStage}`,
      snapshot,
      payload: {
        fromStage: prevStage,
        toStage: nextStage,
      },
    });
  }

  return events.filter(Boolean);
}

export default resolveProgressionEvent;
