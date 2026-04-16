// src/components/game/MainGame.jsx
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  BottomMenuDock,
  InteractionSheet,
  PottyTrainingCard,
  RunawayLetterPanel,
  StatBarCard,
  TemperamentRevealCard,
  TrainingLogOverlay,
  TricksOverlay,
} from "@/components/game/MainGamePanels.jsx";
import DogToy from "@/components/dog/components/DogToy.jsx";
import GameTopBar from "@/components/layout/GameTopBar.jsx";
import DogStage from "@/features/game/DogStage.jsx";
import MoodBadge from "@/components/game/MoodBadge.jsx";
import MemoryMomentToast from "@/components/game/MemoryMomentToast.jsx";
import ShareMomentCard from "@/components/game/ShareMomentCard.jsx";
import {
  createAnimatedEventRoute,
  getAnimatedEventMeta,
  rollAmbientAnimatedEvent,
  shouldResolveEventByDistance,
  stepAnimatedEventRoute,
} from "@/components/game/animatedEvents.js";
import { useToast } from "@/state/toastContext.js";
import { selectSettings } from "@/store/settingsSlice.js";
import { selectCloudSyncState, selectIsLoggedIn } from "@/store/userSlice.js";
import {
  bathe,
  beginRunawayStrike,
  claimTreasureFind,
  dropFoodBowl,
  feed,
  quickFeed,
  giveWater,
  goPotty,
  ackTemperamentReveal,
  petDog,
  rewardSocialShare,
  resolveRunawayStrike,
  play,
  rest,
  simulationTick,
  trainObedience,
  tryConsumeFoodBowl,
} from "@/store/dogSlice.js";
import { PATHS } from "@/app/routes.js";
import {
  selectWeatherCondition,
  selectWeatherDetails,
} from "@/store/weatherSlice.js";
import { getRunawayStrikeState } from "@/features/dog/OfflineProgressCalculator.js";
import { auth as firebaseAuth, initFirebase } from "@/lib/firebase/index.js";
import {
  OBEDIENCE_COMMANDS,
  getObedienceActiveLearningLimit,
  getObedienceCommand,
} from "@/features/training/obedienceCommands.js";
import { getObedienceSkillMasteryPct } from "@/features/training/jrtTrainingController.js";
import { createSwipeGestureRecognizer } from "@/utils/SwipeGestureRecognizer.js";
import { createDragAndDropManager } from "@/features/inventory/DragAndDropManager.js";
import { createVoiceCommandHandler } from "@/features/training/VoiceCommandHandler.js";
import { useDogGameView, useDogIdentity } from "@/hooks/useDogState.js";
import {
  startDogSimulation,
  stopDogSimulation,
} from "@/components/dog/simulation/DogSimulationEngine.js";
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/simulation/DogWanderBehavior.js";
import { getDogEnvironmentTargets } from "@/components/dog/DogEnvironmentTargets.js";
import { withBaseUrl } from "@/utils/assetUtils.js";
import { resolveBackdropLayers } from "@/utils/backgroundLayers.js";
import { getMoodPresentation } from "@/features/dog/mood/getMoodPresentation.js";
import {
  buildDoghouseSleepMomentKey,
  createMemoryMomentEvent,
  MEMORY_MOMENT_TYPES,
} from "@/features/dog/memory/memoryEvents.js";
import { formatMemoryMoment } from "@/features/dog/memory/memoryFormatter.js";
import { getLevelProgress } from "@/features/dog/ExperienceAndLeveling.js";
import {
  getRetentionAnalyticsSnapshot,
  trackFeedDog,
  trackGiveWater,
  trackLevelUp,
  trackPlayWithDog,
  trackTrainTrick,
} from "@/lib/analytics/gameAnalytics.js";
import { getRetentionCadenceModel } from "@/features/dog/cadence/retentionCadence.js";
import {
  getDefaultGameExperimentConfig,
  resolveGameExperimentConfig,
} from "@/features/experiments/gameExperimentConfig.js";
import {
  buildGenericPupShareCard,
  buildShareMomentCard,
  isShareableMemoryMoment,
  shareDoggerzMoment,
} from "@/features/social/shareMomentCards.js";
import { getLiveContentSnapshot } from "@/features/live/liveContentEngine.js";
import {
  selectMasteredCommandCount as selectProgressionMasteredCommandCount,
  selectNextProgressionMilestone,
  selectPottyTrainingTrack,
  selectReliableCommandCount as selectProgressionReliableCommandCount,
  selectUnlockedFeatures,
} from "@/features/progression/progressionSelectors.js";
import { dequeueProgressionMilestone } from "@/features/progression/progressionSlice.js";

const SHARE_REWARD_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const BOTTOM_MENU_TABS = Object.freeze([
  { id: "interact", label: "Interact", icon: "✨" },
  { id: "train", label: "Train", icon: "🎯" },
  { id: "journey", label: "Journey", icon: "🐾" },
  { id: "settings", label: "Settings", icon: "⚙️" },
]);

const STAGE_FEEDBACK_META = Object.freeze({
  "quick-feed": {
    label: "Quick Feed",
    message: "Food is on the way.",
    icon: "🍖",
    tone: "amber",
  },
  water: {
    label: "Water",
    message: "Hydration queued.",
    icon: "💧",
    tone: "sky",
  },
  play: {
    label: "Play",
    message: "Play session starting.",
    icon: "🎾",
    tone: "emerald",
  },
  pet: {
    label: "Pet",
    message: "Affection landed.",
    icon: "🖐️",
    tone: "rose",
  },
  bath: {
    label: "Bath",
    message: "Bath routine started.",
    icon: "🧼",
    tone: "sky",
  },
  potty: {
    label: "Potty",
    message: "Potty break queued.",
    icon: "🌿",
    tone: "emerald",
  },
  interact: {
    label: "Interactions",
    message: "Care menu ready.",
    icon: "✨",
    tone: "amber",
  },
  tricks: {
    label: "Tricks",
    message: "Training menu ready.",
    icon: "🎯",
    tone: "amber",
  },
  "voice-train": {
    label: "Voice Train",
    message: "Voice training warming up.",
    icon: "🎙️",
    tone: "sky",
  },
  "share-pup": {
    label: "Share Pup",
    message: "Preparing your share card.",
    icon: "📤",
    tone: "rose",
  },
  train: {
    label: "Training",
    message: "Training systems ready.",
    icon: "🎯",
    tone: "amber",
  },
  journey: {
    label: "Journey",
    message: "Story and progress pages ready.",
    icon: "🐾",
    tone: "emerald",
  },
  settings: {
    label: "Settings",
    message: "Preferences and support ready.",
    icon: "⚙️",
    tone: "sky",
  },
});

function resolveStageFeedbackTone(tone = "neutral") {
  const key = String(tone || "neutral")
    .trim()
    .toLowerCase();
  if (["success", "ok", "emerald"].includes(key)) return "emerald";
  if (["warning", "warn", "pending", "amber", "gold"].includes(key)) {
    return "amber";
  }
  if (["danger", "error", "rose"].includes(key)) return "rose";
  if (["info", "sky"].includes(key)) return "sky";
  return "neutral";
}

function buildStageFeedbackPayload(key, overrides = {}) {
  const normalizedKey = String(key || overrides?.key || "")
    .trim()
    .toLowerCase();
  const meta = STAGE_FEEDBACK_META[normalizedKey] || null;
  const message = String(overrides?.message || meta?.message || "").trim();
  if (!message) return null;

  return {
    key:
      normalizedKey ||
      String(overrides?.label || meta?.label || "feedback")
        .trim()
        .toLowerCase(),
    label: String(overrides?.label || meta?.label || "").trim(),
    message,
    icon: String(overrides?.icon || meta?.icon || "✨").trim() || "✨",
    tone: resolveStageFeedbackTone(overrides?.tone || meta?.tone || "neutral"),
  };
}

function isActionDrivenDockItemKey(key) {
  return [
    "feed",
    "water",
    "play",
    "pet",
    "bath",
    "potty",
    "care-sheet",
    "tricks",
    "voice",
    "share",
  ].includes(
    String(key || "")
      .trim()
      .toLowerCase()
  );
}

function formatProgressionPhaseLabel(phase = "introduced") {
  const key = String(phase || "introduced")
    .trim()
    .toLowerCase();

  if (key === "mastered") return "Mastered";
  if (key === "reliable") return "Reliable";
  if (key === "learning") return "Learning";
  if (key === "locked") return "Locked";
  return "Introduced";
}

const NEED_BADGE_META = Object.freeze({
  hungry: { icon: "🍖", label: "Hunger" },
  thirsty: { icon: "💧", label: "Thirst" },
  potty: { icon: "🌿", label: "Potty" },
  tired: { icon: "😴", label: "Energy" },
  dirty: { icon: "🧼", label: "Clean" },
  itchy: { icon: "🪳", label: "Itchy" },
  lonely: { icon: "🫶", label: "Affection" },
  bored: { icon: "🧠", label: "Focus" },
  sick: { icon: "🤒", label: "Health" },
  sore: { icon: "🦴", label: "Sore" },
  uneasy: { icon: "⚠️", label: "Pressure" },
});

function getNeedBadgeMeta(type = "") {
  const key = String(type || "")
    .trim()
    .toLowerCase();
  return NEED_BADGE_META[key] || { icon: "✨", label: toTitle(key, "Mood") };
}

const PAW_PRINT_TTL_MS = 8000;
const PAW_PRINT_COLORS = Object.freeze({
  DIRTY: "rgba(92, 64, 42, 0.5)",
  FLEAS: "rgba(82, 56, 38, 0.6)",
  MANGE: "rgba(70, 46, 30, 0.7)",
});
const YARD_INVESTIGATION_PROPS = Object.freeze([
  {
    id: "bone",
    label: "glow bone",
    icon: "🦴",
    xNorm: 0.76,
    yNorm: 0.78,
    action: "sniff",
    triggerChance: 0.3,
    cooldownMs: 5 * 60_000,
  },
  {
    id: "flower",
    label: "night-bloom flower",
    icon: "🌼",
    xNorm: 0.22,
    yNorm: 0.75,
    action: "sniff",
    triggerChance: 0.26,
    cooldownMs: 60_000,
  },
]);

const APARTMENT_INVESTIGATION_PROPS = Object.freeze([
  {
    id: "table",
    label: "low table",
    icon: "🍗",
    xNorm: 0.69,
    yNorm: 0.53,
    action: "sniff",
    triggerChance: 0.42,
    cooldownMs: 45_000,
    theme: "amber",
  },
  {
    id: "couch",
    label: "couch cushion",
    icon: "🛋️",
    xNorm: 0.22,
    yNorm: 0.66,
    action: "sniff",
    triggerChance: 0.24,
    cooldownMs: 70_000,
    theme: "rose",
  },
  {
    id: "shoe",
    label: "shoe pile",
    icon: "👟",
    xNorm: 0.84,
    yNorm: 0.83,
    action: "sniff",
    triggerChance: 0.36,
    cooldownMs: 55_000,
    theme: "slate",
  },
]);

const TREASURE_HUNT_CHECK_INTERVAL_MS = 5 * 60_000;
const TREASURE_HUNT_MIN_COOLDOWN_MS = 4 * 60 * 60_000;
const TREASURE_HUNT_FULL_CHANCE_MS = 12 * 60 * 60_000;
const TREASURE_HUNT_TRIGGER_CHANCE_FLOOR = 0.12;
const TREASURE_HUNT_TRIGGER_CHANCE_CEILING = 0.32;
const TREASURE_HUNT_RESPONSE_MS = 10_000;
const TREASURE_HUNT_DIG_REVEAL_MS = 1800;
const TREASURE_REWARDS = Object.freeze([
  { id: "old_bone", name: "Fossilized Bone", icon: "🦴", weight: 0.4 },
  { id: "tennis_ball", name: "Muddy Tennis Ball", icon: "🎾", weight: 0.5 },
]);
const LOW_ENERGY_SLEEP_THRESHOLD = 15;
const LOW_ENERGY_AUTO_SLEEP_TRIGGER = 15;
const LOW_ENERGY_AUTO_SLEEP_COOLDOWN_MS = 45_000;
const LOW_ENERGY_WARNING_MIN_OFFSET = 1;
const LOW_ENERGY_WARNING_MAX_OFFSET = 10;
const SLEEP_SPOT_ARRIVAL_DISTANCE = 28;
const SLEEP_SPOT_WALK_TIMEOUT_MS = 12_000;
const DOGHOUSE_SLEEP_X_NORM = 0.78;
const DOGHOUSE_SLEEP_Y_NORM = 0.65;
const YARD_TAP_MIN_Y_NORM = 0.68;
const YARD_TAP_MAX_Y_NORM = 0.92;
function formatDogAgePill(ageDays) {
  const totalDays = Math.max(0, Math.floor(Number(ageDays || 0)));
  const DAYS_PER_WEEK = 7;
  const DAYS_PER_YEAR = 365;

  if (totalDays < DAYS_PER_YEAR) {
    const weeks = Math.floor(totalDays / DAYS_PER_WEEK);
    const days = totalDays % DAYS_PER_WEEK;
    if (!weeks) {
      return `${days}d`;
    }
    if (!days) {
      return `${weeks}w`;
    }
    return `${weeks}w ${days}d`;
  }

  const years = Math.floor(totalDays / DAYS_PER_YEAR);
  const remainderDays = totalDays % DAYS_PER_YEAR;
  const weeks = Math.floor(remainderDays / DAYS_PER_WEEK);
  if (!weeks) {
    return `${years}y`;
  }
  return `${years}y ${weeks}w`;
}

function formatStageCountdown(daysUntilNextStage, nextStageLabel) {
  if (!nextStageLabel || !Number.isFinite(Number(daysUntilNextStage))) {
    return "Current life stage";
  }

  const days = Math.max(0, Math.floor(Number(daysUntilNextStage || 0)));
  if (days < 7) {
    return `${days}d until ${nextStageLabel}`;
  }

  const weeks = Math.max(1, Math.floor(days / 7));
  return `${weeks}w until ${nextStageLabel}`;
}

function getIdentityFlavorToneClass(tone) {
  const key = String(tone || "calm")
    .trim()
    .toLowerCase();
  if (key === "bright") return "border-sky-300/35 bg-sky-400/10 text-sky-50";
  if (key === "warm")
    return "border-amber-300/35 bg-amber-400/10 text-amber-50";
  if (key === "steady") return "border-cyan-300/35 bg-cyan-300/10 text-cyan-50";
  return "border-emerald-300/30 bg-emerald-400/10 text-emerald-50";
}

function getCadenceToneClass(tone) {
  const key = String(tone || "emerald")
    .trim()
    .toLowerCase();
  if (key === "amber")
    return "border-amber-300/35 bg-amber-400/10 text-amber-50";
  if (key === "sky") return "border-sky-300/35 bg-sky-400/10 text-sky-50";
  if (key === "rose") return "border-rose-300/35 bg-rose-400/10 text-rose-50";
  return "border-emerald-300/30 bg-emerald-400/10 text-emerald-50";
}

const SLEEP_SPOT_RETARGET_COOLDOWN_MS = 1400;

function rollTreasureReward() {
  const roll = Math.random();
  let cumulative = 0;
  for (const reward of TREASURE_REWARDS) {
    cumulative += Number(reward.weight || 0);
    if (roll <= cumulative) return reward;
  }
  return TREASURE_REWARDS[TREASURE_REWARDS.length - 1];
}

function createTreasureHuntTarget(environment = "yard") {
  const indoor = String(environment || "").toLowerCase() === "apartment";
  return {
    xNorm: indoor
      ? clamp(0.18 + Math.random() * 0.64, 0.12, 0.88)
      : clamp(0.14 + Math.random() * 0.72, 0.08, 0.92),
    yNorm: indoor
      ? clamp(0.72 + Math.random() * 0.1, 0.68, 0.86)
      : clamp(0.7 + Math.random() * 0.12, 0.66, 0.88),
  };
}

function getTreasureHuntTriggerChance(lastTreasureAt, now = Date.now()) {
  const lastAt = Number(lastTreasureAt || 0);
  if (!lastAt) return 0.18;
  const elapsed = Math.max(0, now - lastAt);
  if (elapsed < TREASURE_HUNT_MIN_COOLDOWN_MS) return 0;
  const ramp = clamp(
    (elapsed - TREASURE_HUNT_MIN_COOLDOWN_MS) /
      (TREASURE_HUNT_FULL_CHANCE_MS - TREASURE_HUNT_MIN_COOLDOWN_MS),
    0,
    1
  );
  return (
    TREASURE_HUNT_TRIGGER_CHANCE_FLOOR +
    (TREASURE_HUNT_TRIGGER_CHANCE_CEILING -
      TREASURE_HUNT_TRIGGER_CHANCE_FLOOR) *
      ramp
  );
}

function formatCloudSyncLabel(cloudSync, isLoggedIn, now = Date.now()) {
  if (!isLoggedIn) {
    return {
      tone: "muted",
      label: "Local save",
      detail: "Saved on this device",
      reassurance: "Progress is being stored locally on this device.",
    };
  }

  const status = String(cloudSync?.status || "").toLowerCase();
  const lastSuccessAt = Number(cloudSync?.lastSuccessAt || 0);
  if (status === "syncing") {
    return {
      tone: "pending",
      label: "Saving",
      detail: "Syncing to cloud",
      reassurance: "Changes are queued and will finish syncing automatically.",
    };
  }
  if (status === "error") {
    return {
      tone: "warning",
      label: "Cloud retry",
      detail: "Using local save",
      reassurance: "Your local progress is safe. Cloud backup will retry.",
    };
  }
  if (lastSuccessAt > 0) {
    const ageSeconds = Math.max(0, Math.round((now - lastSuccessAt) / 1000));
    const detail =
      ageSeconds < 60
        ? "Just now"
        : ageSeconds < 3600
          ? `${Math.round(ageSeconds / 60)}m ago`
          : `${Math.round(ageSeconds / 3600)}h ago`;
    return {
      tone: "ok",
      label: "Cloud backed up",
      detail:
        detail === "Just now" ? "Backed up just now" : `Backed up ${detail}`,
      reassurance: "Local and cloud copies are both active.",
    };
  }
  return {
    tone: "pending",
    label: "Cloud linked",
    detail: "First backup pending",
    reassurance:
      "Local progress is safe while the first cloud backup completes.",
  };
}

function isSummerMonth(ms = Date.now()) {
  const month = new Date(ms).getMonth();
  return month >= 5 && month <= 7;
}

function getLocalDayKey(now = Date.now()) {
  try {
    const date = new Date(now);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  } catch {
    return "1970-1-1";
  }
}

function isSameLocalDay(timestamp, now = Date.now()) {
  const ts = Number(timestamp || 0);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  return getLocalDayKey(ts) === getLocalDayKey(now);
}

function getHabitLoopModel(dog = {}, cadenceModel = null, now = Date.now()) {
  const streakDays = Math.max(
    0,
    Math.floor(
      Number(dog?.streak?.currentStreakDays || dog?.consecutiveDays || 0)
    )
  );
  const fedToday = isSameLocalDay(dog?.memory?.lastFedAt, now);
  const playedToday = isSameLocalDay(dog?.memory?.lastPlayedAt, now);
  const wateredToday = isSameLocalDay(dog?.memory?.lastDrankAt, now);
  const completedCount =
    (fedToday ? 1 : 0) + (playedToday ? 1 : 0) + (wateredToday ? 1 : 0);
  const surpriseReady = Boolean(cadenceModel?.surprise?.ready);
  const surprisePct = Math.max(
    0,
    Math.round(Number(cadenceModel?.surprise?.readinessPct || 0))
  );

  if (fedToday && playedToday) {
    return {
      label: "Daily rhythm active",
      detail:
        "You already landed the warm essentials today. Anything extra is a bonus.",
      tone: "emerald",
      completedCount,
      streakDays,
      surpriseReady,
      surprisePct,
    };
  }

  if (fedToday || playedToday) {
    return {
      label: "One more warm check-in",
      detail:
        fedToday && !playedToday
          ? "A short play burst will round out today without turning it into a chore."
          : "A calm feed keeps the loop feeling complete.",
      tone: "sky",
      completedCount,
      streakDays,
      surpriseReady,
      surprisePct,
    };
  }

  return {
    label: "Start small today",
    detail:
      "A feed or play tap is enough to wake the routine back up. No marathon needed.",
    tone: "amber",
    completedCount,
    streakDays,
    surpriseReady,
    surprisePct,
  };
}

function createInvestigationProps(environment = "yard") {
  const source =
    String(environment || "").toLowerCase() === "apartment"
      ? APARTMENT_INVESTIGATION_PROPS
      : YARD_INVESTIGATION_PROPS;
  return source.map((prop) => ({
    ...prop,
    interactedUntil: 0,
  }));
}

function toPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function toWorldPosition(xNorm = 0.5, yNorm = 0.74) {
  return {
    x: clamp(Number(xNorm || 0.5) * DOG_WORLD_WIDTH, 0, DOG_WORLD_WIDTH),
    y: clamp(Number(yNorm || 0.74) * DOG_WORLD_HEIGHT, 0, DOG_WORLD_HEIGHT),
  };
}

function clampYardTapYNorm(value) {
  return clamp(Number(value || 0.74), YARD_TAP_MIN_Y_NORM, YARD_TAP_MAX_Y_NORM);
}

function toTitle(input, fallback = "Calm") {
  const raw = String(input || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase();
  if (!raw) return fallback;
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCommandLabel(commandId, fallback = "That trick") {
  const command = getObedienceCommand(commandId);
  if (command?.label) return command.label;
  return toTitle(commandId, fallback);
}

function getDifficultyStars(difficulty = 1) {
  const count = clamp(Number(difficulty || 1), 1, 5);
  return "★".repeat(count);
}

function getMasteryRankMeta(masteryPct = 0) {
  const pct = clamp(Number(masteryPct || 0), 0, 100);
  if (pct >= 100) {
    return {
      id: "master",
      label: "Master",
      perk: "Bond gain boosted on mastered reps.",
    };
  }
  if (pct >= 71) {
    return {
      id: "expert",
      label: "Expert",
      perk: "Training costs less energy.",
    };
  }
  if (pct >= 31) {
    return {
      id: "adept",
      label: "Adept",
      perk: "Cleaner follow-through and better odds.",
    };
  }
  return {
    id: "novice",
    label: "Novice",
    perk: "Learning the basics.",
  };
}

function formatTreasureName(rewardId, fallback = "Hidden treasure") {
  const match = TREASURE_REWARDS.find(
    (item) =>
      String(item?.id || "")
        .trim()
        .toLowerCase() ===
      String(rewardId || "")
        .trim()
        .toLowerCase()
  );
  if (match?.name) return String(match.name);
  const raw = String(rewardId || "").trim();
  if (!raw) return fallback;
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function _PawPrintSvg({ className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        <circle cx="20" cy="16" r="6" />
        <circle cx="44" cy="16" r="6" />
        <circle cx="12" cy="34" r="6" />
        <circle cx="52" cy="34" r="6" />
        <path d="M32 36c-9 0-16 7-16 16 0 7 6 12 16 12s16-5 16-12c0-9-7-16-16-16z" />
      </g>
    </svg>
  );
}

export default function MainGame({ scene, dogInteractive = true }) {
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { dog, life, renderModel, vitals } = useDogGameView();
  const identity = useDogIdentity();
  const settings = useSelector(selectSettings);
  const cloudSync = useSelector(selectCloudSyncState);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const weatherCondition = useSelector(selectWeatherCondition);
  const weatherDetails = useSelector(selectWeatherDetails);
  const pottyProgressionTrack = useSelector(selectPottyTrainingTrack);
  const progressionUnlockedFeatures = useSelector(selectUnlockedFeatures);
  const progressionReliableCommandCount = useSelector(
    selectProgressionReliableCommandCount
  );
  const progressionMasteredCommandCount = useSelector(
    selectProgressionMasteredCommandCount
  );
  const nextProgressionMilestone = useSelector(selectNextProgressionMilestone);
  const lastToySqueakAtRef = useRef(0);
  const lastPlayTapAtRef = useRef(Date.now());
  const lastAnticipationAtRef = useRef(0);
  const quickFeedResetRef = useRef(0);
  const investigationResetRef = useRef(0);
  const treasureHuntTimeoutRef = useRef(0);
  const midnightZoomiesResetRef = useRef(0);
  const lastDepthSyncRef = useRef({ at: 0, norm: 0.5 });
  const lastParallaxSyncRef = useRef({ at: 0, xNorm: 0.5, yNorm: 0.74 });
  const pawPrintIdRef = useRef(0);
  const lastPawPrintRef = useRef({ x: 0, y: 0, at: 0 });
  const propGateRef = useRef({});
  const lowEnergyAutoSleepAtRef = useRef(0);
  const sleepWalkRetargetAtRef = useRef(0);
  const dogViewportRef = useRef(null);
  const swipeRecognizerRef = useRef(null);
  const dragDropManagerRef = useRef(null);
  const voiceCommandHandlerRef = useRef(null);
  const dogPositionNormRef = useRef({ xNorm: 0.5, yNorm: 0.74 });
  const voiceCommandDispatchRef = useRef(() => false);
  const actionFeedbackTimeoutRef = useRef(0);
  const stageFeedbackTimeoutRef = useRef(0);
  const uiAnimResetTimeoutRef = useRef(0);
  const trickAnimationTokenRef = useRef(0);
  const statFeedbackTimeoutsRef = useRef({});
  const previousVitalSnapshotRef = useRef({ energy: null, health: null });
  const trackedLevelRef = useRef(null);
  const memoryMomentLevelRef = useRef(null);
  const firstCareLoopMomentRef = useRef(0);
  const memoryMomentShownAtRef = useRef(new Map());
  const memoryMomentQueueRef = useRef([]);
  const memoryMomentDismissRef = useRef(0);
  const handledProgressionMilestoneIdRef = useRef("");
  const lastMidnightZoomiesMomentRef = useRef(0);
  const lastTreasureMomentRef = useRef(0);
  const lastMasteredMomentRef = useRef("");
  const doghouseSleepActiveRef = useRef(false);
  const [, setAttentionTarget] = useState(null);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [placingBowl, setPlacingBowl] = useState(false);
  const [liveNow, setLiveNow] = useState(Date.now());
  const [temperamentCardDismissed, setTemperamentCardDismissed] =
    useState(false);
  const [pawPrints, setPawPrints] = useState([]);
  const [ambientEvent, setAmbientEvent] = useState(null);
  const [ambientEventRoute, setAmbientEventRoute] = useState(null);
  const [ambientAnimOverride, setAmbientAnimOverride] = useState("");
  const [ambientSpeedBoost, setAmbientSpeedBoost] = useState(1);
  const [uiAnimOverride, setUiAnimOverride] = useState("");
  const [uiSpeedBoost, setUiSpeedBoost] = useState(1);
  const [activeHudAnimationId, setActiveHudAnimationId] = useState("");
  const [trickAnimationBusy, setTrickAnimationBusy] = useState(false);
  const [fireflySnapAt, setFireflySnapAt] = useState(0);
  const [dogDepthNorm, setDogDepthNorm] = useState(0.5);
  const [dogPositionNorm, setDogPositionNorm] = useState({
    xNorm: 0.5,
    yNorm: 0.74,
    moving: false,
  });
  const [investigationProps, setInvestigationProps] = useState(() =>
    createInvestigationProps(dog?.yard?.environment || "yard")
  );
  const [activeInvestigationId, setActiveInvestigationId] = useState("");
  const [treasureHunt, setTreasureHunt] = useState(null);
  const [movementLocked, setMovementLocked] = useState(false);
  const [midnightZoomiesBoost, setMidnightZoomiesBoost] = useState(1);
  const [midnightZoomiesAt, setMidnightZoomiesAt] = useState(0);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [sleepLocation, setSleepLocation] = useState(null);
  const [pendingSleepWalk, setPendingSleepWalk] = useState(null);
  const [bottomMenuCategory, setBottomMenuCategory] = useState("");
  const [tricksOpen, setTricksOpen] = useState(false);
  const [trainingLogOpen, setTrainingLogOpen] = useState(false);
  const [masteryCelebration, setMasteryCelebration] = useState(null);
  const [memoryMoment, setMemoryMoment] = useState(null);
  const [shareMomentCard, setShareMomentCard] = useState(null);
  const [activeActionFeedbackKey, setActiveActionFeedbackKey] = useState("");
  const [stageFeedback, setStageFeedback] = useState(null);
  const [poppedStats, setPoppedStats] = useState({
    energy: false,
    health: false,
  });
  const [gameExperimentConfig, setGameExperimentConfig] = useState(() =>
    getDefaultGameExperimentConfig()
  );
  const wasSleepingRef = useRef(false);
  const masteryCelebrationTimeoutRef = useRef(0);
  const [butterflyNoticeAt, setButterflyNoticeAt] = useState(0);

  const _seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const _reduceTransparency = settings?.reduceTransparency === true;

  useEffect(() => {
    let active = true;
    resolveGameExperimentConfig()
      .then((nextConfig) => {
        if (!active || !nextConfig) return;
        setGameExperimentConfig(nextConfig);
      })
      .catch(() => {
        if (!active) return;
        setGameExperimentConfig(getDefaultGameExperimentConfig());
      });

    return () => {
      active = false;
    };
  }, []);

  const cleanlinessTier = String(dog?.cleanlinessTier || "").toUpperCase();
  const pawPrintsEnabled = ["DIRTY", "FLEAS", "MANGE"].includes(
    cleanlinessTier
  );
  const environmentMode = String(dog?.yard?.environment || "yard")
    .trim()
    .toLowerCase();
  const equippedBackdropId = String(dog?.cosmetics?.equipped?.backdrop || "")
    .trim()
    .toLowerCase();
  const isApartmentEnvironment = environmentMode === "apartment";
  const _environmentTargets = useMemo(
    () => getDogEnvironmentTargets(dog || {}),
    [dog]
  );

  const activeAnim = renderModel?.anim || "idle";
  const resolvedTimeBucket = String(
    scene?.timeOfDayBucket || scene?.timeOfDay || "day"
  )
    .trim()
    .toLowerCase();
  const sceneWeather = String(
    scene?.weatherKey || scene?.weather || ""
  ).toLowerCase();
  const weatherKey = `${sceneWeather} ${String(weatherCondition || "").toLowerCase()}`;
  const isNightScene =
    scene?.isNight === true ||
    resolvedTimeBucket === "night" ||
    resolvedTimeBucket === "evening";
  const sunriseBlend = clamp(Number(scene?.sunriseProgress || 0), 0, 1);
  const visualNight = isNightScene || sunriseBlend > 0;
  const isRainScene =
    !isApartmentEnvironment &&
    (weatherKey.includes("rain") || weatherKey.includes("storm"));
  const _isSnowScene =
    !isApartmentEnvironment &&
    (weatherKey.includes("snow") || weatherKey.includes("sleet"));
  const isSummerNight =
    !isApartmentEnvironment && isNightScene && isSummerMonth(liveNow);
  const _backdropLayers = useMemo(
    () =>
      resolveBackdropLayers({
        backdropId: equippedBackdropId,
        environment: environmentMode,
        isNight: visualNight,
        sunriseProgress: sunriseBlend,
        weather: sceneWeather,
      }),
    [
      equippedBackdropId,
      environmentMode,
      sceneWeather,
      sunriseBlend,
      visualNight,
    ]
  );
  const sceneAnim = activeAnim;
  const effectiveAnim = uiAnimOverride || ambientAnimOverride || sceneAnim;
  const effectiveDogSleeping = Boolean(renderModel?.isSleeping);
  const _nightOwlActive = visualNight && !effectiveDogSleeping;
  const currentEnergy = Number(dog?.stats?.energy || 0);
  const lowEnergySleep = currentEnergy <= LOW_ENERGY_SLEEP_THRESHOLD;
  const sleepyWarningFloor =
    LOW_ENERGY_AUTO_SLEEP_TRIGGER + LOW_ENERGY_WARNING_MIN_OFFSET;
  const sleepyWarningCeil =
    LOW_ENERGY_AUTO_SLEEP_TRIGGER + LOW_ENERGY_WARNING_MAX_OFFSET;
  const _showGettingSleepyWarning =
    !effectiveDogSleeping &&
    currentEnergy >= sleepyWarningFloor &&
    currentEnergy <= sleepyWarningCeil;
  const sleepLocationMode =
    !isApartmentEnvironment && effectiveDogSleeping
      ? sleepLocation?.mode || (lowEnergySleep ? "doghouse" : null)
      : null;
  const sleepInDogHouse = sleepLocationMode === "doghouse";
  const _sleepInYard = sleepLocationMode === "yard";
  const sleepPositionOverride =
    effectiveDogSleeping && sleepLocation?.position
      ? sleepLocation.position
      : null;
  const aiStateKey = String(dog?.aiState || "")
    .trim()
    .toLowerCase();
  const isDogMoving = Boolean(
    dog?.targetPosition || dog?.moving === true || aiStateKey === "walk"
  );
  const _dogRenderPosition = sleepPositionOverride || dog?.position || null;
  const animationSpeedMultiplier = Number(
    renderModel?.animationSpeedMultiplier || 1
  );
  const _effectiveAnimationSpeedMultiplier = Math.max(
    0.2,
    Math.min(
      2.8,
      animationSpeedMultiplier *
        ambientSpeedBoost *
        uiSpeedBoost *
        midnightZoomiesBoost
    )
  );
  const toysIgnored = Boolean(renderModel?.ignoreToys);
  const _holes = Array.isArray(dog?.yard?.holes) ? dog.yard.holes : [];
  const foodBowl = dog?.yard?.foodBowl || null;
  const premiumKibbleCount = Math.max(
    0,
    Math.floor(Number(dog?.inventory?.premiumKibble || 0))
  );
  const overallLevel = Math.max(1, Math.floor(Number(dog?.level || 1)));
  const shareRewardReady =
    !dog?.lastShareRewardAt ||
    Date.now() - Number(dog.lastShareRewardAt) >= SHARE_REWARD_COOLDOWN_MS;
  const stageLabel = String(
    life?.stageLabel || renderModel?.stageLabel || "Puppy"
  );
  const ageDays = Math.max(0, Math.floor(Number(life?.ageDays || 0)));
  const agePillValue = formatDogAgePill(ageDays);
  const ageBucketLabel = String(life?.ageBucketLabel || "New pup");
  const dailyFlavor = identity?.dailyFlavor || null;
  const favoriteSummary = identity?.favoriteSummary || null;
  const behaviorTendencies = useMemo(
    () =>
      Array.isArray(identity?.behaviorTendencies)
        ? identity.behaviorTendencies
        : [],
    [identity?.behaviorTendencies]
  );
  const styleSignature = identity?.styleSignature || null;
  const identityDogName =
    String(identity?.name || dog?.name || "Your pup").trim() || "Your pup";
  const dailyFlavorTitle = String(
    dailyFlavor?.title || "Today your dog is settling into the day."
  );
  const dailyFlavorBody = String(
    dailyFlavor?.body ||
      "A steady routine and a little attention will go a long way."
  );
  const identityFlavorToneClass = getIdentityFlavorToneClass(dailyFlavor?.tone);
  const favoriteReadouts = useMemo(
    () =>
      [
        favoriteSummary?.favoriteToyLabel
          ? { id: "toy", label: "Toy", value: favoriteSummary.favoriteToyLabel }
          : null,
        favoriteSummary?.favoriteFoodLabel
          ? {
              id: "food",
              label: "Food",
              value: favoriteSummary.favoriteFoodLabel,
            }
          : null,
        favoriteSummary?.favoriteNapSpotLabel
          ? {
              id: "nap",
              label: "Nap Spot",
              value: favoriteSummary.favoriteNapSpotLabel,
            }
          : null,
      ].filter(Boolean),
    [
      favoriteSummary?.favoriteFoodLabel,
      favoriteSummary?.favoriteNapSpotLabel,
      favoriteSummary?.favoriteToyLabel,
    ]
  );
  const identitySignatureReadouts = useMemo(
    () =>
      [
        styleSignature?.collarLabel
          ? { id: "collar", label: "Collar", value: styleSignature.collarLabel }
          : null,
        styleSignature?.tagLabel
          ? { id: "tag", label: "Tag", value: styleSignature.tagLabel }
          : null,
        styleSignature?.backdropLabel
          ? {
              id: "backdrop",
              label: "Yard Theme",
              value: styleSignature.backdropLabel,
            }
          : null,
        styleSignature?.environmentLabel
          ? {
              id: "environment",
              label: "Home",
              value: styleSignature.environmentLabel,
            }
          : null,
      ].filter(Boolean),
    [
      styleSignature?.backdropLabel,
      styleSignature?.collarLabel,
      styleSignature?.environmentLabel,
      styleSignature?.tagLabel,
    ]
  );
  const retentionAnalytics = useMemo(
    () => getRetentionAnalyticsSnapshot({ now: liveNow }),
    [liveNow]
  );
  const cadenceModel = useMemo(
    () =>
      getRetentionCadenceModel({
        dog,
        now: liveNow,
        isNight: visualNight,
        environment: environmentMode,
        analyticsSnapshot: retentionAnalytics,
      }),
    [dog, environmentMode, liveNow, retentionAnalytics, visualNight]
  );
  const cadenceToneClass = getCadenceToneClass(cadenceModel?.microMoment?.tone);
  const retentionRiskBand = String(cadenceModel?.retention?.riskBand || "low")
    .trim()
    .toLowerCase();
  const retentionInsightLabel = useMemo(() => {
    const reasons = Array.isArray(cadenceModel?.retention?.dropOffReasons)
      ? cadenceModel.retention.dropOffReasons
      : [];
    if (reasons.includes("very_short_first_session")) {
      return "Keep sessions brief and warm";
    }
    if (
      reasons.includes("no_first_care_action") ||
      reasons.includes("low_first_care_coverage")
    ) {
      return "First-day care trio helps bonding";
    }
    if (retentionRiskBand === "high" || retentionRiskBand === "medium") {
      return "Reconnect gently today";
    }
    return "";
  }, [cadenceModel?.retention?.dropOffReasons, retentionRiskBand]);
  const cadenceSurpriseDetail = cadenceModel?.surprise?.ready
    ? `${cadenceModel?.surprise?.hint || cadenceModel?.surprise?.label || "A small surprise may appear later."}`
    : `${Math.max(0, Number(cadenceModel?.surprise?.readinessPct || 0))}% warmed`;
  const habitLoopModel = useMemo(
    () => getHabitLoopModel(dog, cadenceModel, liveNow),
    [cadenceModel, dog, liveNow]
  );
  const liveContent = useMemo(
    () => getLiveContentSnapshot({ now: liveNow }),
    [liveNow]
  );
  const gameUiLayoutVariant = String(
    gameExperimentConfig?.uiLayoutVariant || "default"
  )
    .trim()
    .toLowerCase();
  const compactHudLayout = gameUiLayoutVariant === "compact_hud";
  const expandedYardLayout = gameUiLayoutVariant === "expanded_yard";
  const experimentalDogScaleBias = clamp(
    Number(gameExperimentConfig?.dogScaleBias || 1.02),
    0.82,
    1.18
  );
  const sceneDogScaleBias = clamp(
    experimentalDogScaleBias +
      (expandedYardLayout ? 0.06 : compactHudLayout ? 0.05 : 0.055),
    0.82,
    1.22
  );
  const idleAnimationIntensity = String(
    gameExperimentConfig?.idleAnimationIntensity || "calm"
  )
    .trim()
    .toLowerCase();
  const statsStackClassName = compactHudLayout
    ? "order-3 min-h-0 flex-[0.92_1_0%] space-y-3 overflow-y-auto overscroll-contain touch-pan-y pr-1"
    : "order-3 min-h-0 flex-[0.88_1_0%] space-y-4 overflow-y-auto overscroll-contain touch-pan-y pr-1";
  const yardRegionClassName = `order-1 relative -mx-3 sm:-mx-6 w-full min-h-0 overflow-hidden ${
    expandedYardLayout
      ? "flex-[1.18_1_0%] min-h-[420px]"
      : compactHudLayout
        ? "flex-[1.08_1_0%] min-h-[412px]"
        : "flex-1 min-h-[404px]"
  }`;
  const _dogBaseScale = 0.4 + clamp(ageDays / 365, 0, 1) * 0.4;
  const stageHeadline = String(life?.headline || "Tiny chaos era");
  const stageSummary = String(life?.summary || "Routine matters.");
  const stageDetail = String(life?.detail || "");
  const stageProgressPct = clamp(Number(life?.stageProgressPct || 0), 0, 100);
  const stageProgressLabel = String(life?.progressLabel || "Growing");
  const nextStageLabel = String(life?.nextStageLabel || "").trim();
  const daysUntilNextStage = Number.isFinite(Number(life?.daysUntilNextStage))
    ? Number(life.daysUntilNextStage)
    : null;
  const nextStageCountdown = formatStageCountdown(
    daysUntilNextStage,
    nextStageLabel
  );
  const goldenYearsActive =
    dogInteractive && Boolean(life?.isFinalStretchImmune);
  const renderStageForSprites = goldenYearsActive
    ? "SENIOR"
    : renderModel?.stage;
  const curatedSpriteAnim = useMemo(() => {
    const stageKey = String(renderStageForSprites || life?.stage || "PUPPY")
      .trim()
      .toUpperCase();
    const animKey = String(effectiveAnim || "idle")
      .trim()
      .toLowerCase();
    const lastActionKey = String(dog?.lastAction || "")
      .trim()
      .toLowerCase();

    if (goldenYearsActive) {
      if (effectiveDogSleeping) return "golden_years_sleeping";
      if (["idle", "idle_resting", "wag"].includes(animKey)) {
        return "golden_years_idle";
      }
    }

    if (stageKey === "PUPPY") {
      if (effectiveDogSleeping) return "puppy_sleeping_pack";
      if (lastActionKey === "potty") return "puppy_potty_success";
      if (
        ["train_ignore", "trainfailed", "trainblocked"].includes(lastActionKey)
      ) {
        return "puppy_confused";
      }
      if (["idle", "idle_resting", "wag"].includes(animKey)) {
        return "puppy_idle_pack";
      }
    }

    if (stageKey === "ADULT") {
      if (animKey === "spin") return "tornado";
      if (animKey === "jump") return "backflip";
      if (animKey === "crawl") return "army_crawl";
      if (["paw", "highfive", "high_five"].includes(animKey)) {
        return "handstand";
      }
    }

    return effectiveAnim;
  }, [
    dog?.lastAction,
    effectiveAnim,
    effectiveDogSleeping,
    goldenYearsActive,
    life?.stage,
    renderStageForSprites,
  ]);
  const syncedSpriteAnim = activeHudAnimationId || curatedSpriteAnim;
  const lifecycleTone = String(life?.tone || "fresh").toLowerCase();
  const lifecycleCardToneClass =
    lifecycleTone === "warm"
      ? "border-amber-300/35 bg-amber-400/10 text-amber-50"
      : lifecycleTone === "steady"
        ? "border-sky-300/35 bg-sky-400/10 text-sky-50"
        : "border-emerald-300/35 bg-emerald-400/10 text-emerald-50";
  const bondPct = toPct(vitals?.bondValue);
  const hungerPct = toPct(vitals?.hunger);
  const thirstPct = toPct(dog?.stats?.thirst);
  const energyPct = toPct(vitals?.energy);
  const cleanlinessPct = toPct(dog?.stats?.cleanliness);
  const affectionPct = toPct(dog?.stats?.affection);
  const happinessPct = toPct(vitals?.happiness);
  const mentalStimulationPct = toPct(dog?.stats?.mentalStimulation);
  const rawHealthPct = toPct(vitals?.health);
  const healthPct =
    dogInteractive && dog?.adoptedAt ? Math.max(1, rawHealthPct) : rawHealthPct;
  const pottyNeedPct = toPct(dog?.pottyLevel);
  const moodPresentation = useMemo(
    () =>
      getMoodPresentation({
        moodLabel: vitals?.moodLabel,
        hungerPct,
        thirstPct,
        energyPct,
        cleanlinessPct,
        cleanlinessTier: dog?.cleanlinessTier,
        happinessPct,
        healthPct,
        affectionPct,
        pottyPct: pottyNeedPct,
        stimulationPct: mentalStimulationPct,
        ambientType: ambientEvent?.type || "",
      }),
    [
      ambientEvent?.type,
      affectionPct,
      dog?.cleanlinessTier,
      cleanlinessPct,
      energyPct,
      happinessPct,
      healthPct,
      hungerPct,
      mentalStimulationPct,
      pottyNeedPct,
      thirstPct,
      vitals?.moodLabel,
    ]
  );
  const displayMoodLabel =
    moodPresentation?.label || toTitle(vitals?.moodLabel || "calm");
  const displayMoodTone = moodPresentation?.tone || "emerald";
  const displayMoodHint = moodPresentation?.hint || "";
  const displayMoodAccent = moodPresentation?.accent || "Easygoing";
  const energyCritical = energyPct < 20;
  const healthCritical = healthPct < 20;
  const dockNeedMetrics = useMemo(
    () => ({
      hunger: clamp(hungerPct, 0, 100),
      thirst: clamp(thirstPct, 0, 100),
      play: clamp(100 - mentalStimulationPct, 0, 100),
      affection: clamp(100 - affectionPct, 0, 100),
      hygiene: clamp(100 - cleanlinessPct, 0, 100),
      potty: clamp(pottyNeedPct, 0, 100),
      training: clamp(100 - mentalStimulationPct * 0.78, 0, 100),
    }),
    [
      affectionPct,
      cleanlinessPct,
      hungerPct,
      mentalStimulationPct,
      pottyNeedPct,
      thirstPct,
    ]
  );
  const moodNeedBadges = useMemo(() => {
    const moodlets = Array.isArray(dog?.moodlets) ? dog.moodlets : [];
    return moodlets
      .filter((entry) => {
        const type = String(entry?.type || "")
          .trim()
          .toLowerCase();
        return type && type !== "happy";
      })
      .sort(
        (left, right) =>
          Number(right?.intensity || 0) - Number(left?.intensity || 0)
      )
      .slice(0, 3)
      .map((entry) => {
        const type = String(entry?.type || "")
          .trim()
          .toLowerCase();
        const meta = getNeedBadgeMeta(type);
        return {
          key: `${type}:${entry?.source || "need"}`,
          icon: meta.icon,
          label: meta.label,
          detail: entry?.source || meta.label,
        };
      });
  }, [dog?.moodlets]);
  const cloudSyncUi = useMemo(
    () => formatCloudSyncLabel(cloudSync, isLoggedIn, liveNow),
    [cloudSync, isLoggedIn, liveNow]
  );
  const levelProgress = useMemo(
    () =>
      getLevelProgress({
        level: overallLevel,
        xp: Math.max(0, Math.floor(Number(dog?.xp || 0))),
      }),
    [dog?.xp, overallLevel]
  );
  const queueMemoryMoment = useCallback(
    (eventLike) => {
      const formatted = formatMemoryMoment(eventLike, {
        dogName: identityDogName,
        personalityVoice: identity?.memoryVoice || "steady",
      });
      if (!formatted) return;

      const dedupeKey = String(
        formatted.dedupeKey || formatted.id || ""
      ).trim();
      const cooldownMs = Math.max(
        1_000,
        Number(formatted.cooldownMs || 120_000)
      );
      const now = Date.now();

      if (dedupeKey) {
        const lastShownAt = Number(
          memoryMomentShownAtRef.current.get(dedupeKey) || 0
        );
        if (lastShownAt > 0 && now - lastShownAt < cooldownMs) return;
        memoryMomentShownAtRef.current.set(dedupeKey, now);
      }

      memoryMomentQueueRef.current.push(formatted);
      if (!memoryMoment) {
        const nextMoment = memoryMomentQueueRef.current.shift() || null;
        if (nextMoment) setMemoryMoment(nextMoment);
      }
    },
    [identity?.memoryVoice, identityDogName, memoryMoment]
  );

  useEffect(() => {
    if (!memoryMoment) {
      const nextMoment = memoryMomentQueueRef.current.shift() || null;
      if (nextMoment) {
        setMemoryMoment(nextMoment);
      }
      return;
    }

    if (memoryMomentDismissRef.current) {
      window.clearTimeout(memoryMomentDismissRef.current);
    }
    memoryMomentDismissRef.current = window.setTimeout(
      () => setMemoryMoment(null),
      Math.max(2_200, Number(memoryMoment.durationMs || 3200))
    );

    return () => {
      if (memoryMomentDismissRef.current) {
        window.clearTimeout(memoryMomentDismissRef.current);
        memoryMomentDismissRef.current = 0;
      }
    };
  }, [memoryMoment]);

  useEffect(
    () => () => {
      if (memoryMomentDismissRef.current) {
        window.clearTimeout(memoryMomentDismissRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const nextLevel = Math.max(1, Math.floor(Number(overallLevel || 1)));
    const previousLevel = trackedLevelRef.current;

    if (previousLevel === null) {
      trackedLevelRef.current = nextLevel;
      return;
    }

    if (nextLevel > previousLevel) {
      trackLevelUp({
        level: nextLevel,
        previousLevel,
        stage: String(life?.stage || "PUPPY").toLowerCase(),
      });
    }

    trackedLevelRef.current = nextLevel;
  }, [life?.stage, overallLevel]);
  useEffect(() => {
    const nextLevel = Math.max(1, Math.floor(Number(overallLevel || 1)));
    const previousLevel = memoryMomentLevelRef.current;

    if (previousLevel === null) {
      memoryMomentLevelRef.current = nextLevel;
      return;
    }

    if (previousLevel <= 1 && nextLevel > 1) {
      queueMemoryMoment(
        createMemoryMomentEvent(MEMORY_MOMENT_TYPES.FIRST_LEVEL_UP, {
          level: nextLevel,
          uniqueKey: "first_level_up",
          occurredAt: Date.now(),
        })
      );
    }

    memoryMomentLevelRef.current = nextLevel;
  }, [overallLevel, queueMemoryMoment]);

  useEffect(() => {
    const completedAt = Math.max(
      0,
      Number(retentionAnalytics?.firstCareLoopCompletedAt || 0)
    );
    if (!retentionAnalytics?.firstCareLoopCompleted || !completedAt) return;
    if (completedAt <= firstCareLoopMomentRef.current) return;
    firstCareLoopMomentRef.current = completedAt;
    queueMemoryMoment(
      createMemoryMomentEvent(MEMORY_MOMENT_TYPES.FIRST_CARE_LOOP, {
        occurredAt: completedAt,
        uniqueKey: `first_care_loop:${completedAt}`,
      })
    );
  }, [
    queueMemoryMoment,
    retentionAnalytics?.firstCareLoopCompleted,
    retentionAnalytics?.firstCareLoopCompletedAt,
  ]);
  const pottyTrainingState =
    dog?.training?.potty && typeof dog.training.potty === "object"
      ? dog.training.potty
      : null;
  const pottyTrainingGoal = Math.max(
    1,
    Math.floor(Number(pottyTrainingState?.goal || 1))
  );
  const rawPottyTrainingSuccessCount = clamp(
    Math.floor(Number(pottyTrainingState?.successCount || 0)),
    0,
    pottyTrainingGoal
  );
  const pottyTrainingSuccessCount = clamp(
    Math.max(
      rawPottyTrainingSuccessCount,
      Math.floor(Number(pottyProgressionTrack?.successes || 0))
    ),
    0,
    pottyTrainingGoal
  );
  const rawPottyTrainingPct = Math.round(
    (rawPottyTrainingSuccessCount / pottyTrainingGoal) * 100
  );
  const pottyTrainingPct = clamp(
    Math.max(
      rawPottyTrainingPct,
      Math.round(Number(pottyProgressionTrack?.progressPct || 0))
    ),
    0,
    100
  );
  const pottyTrackPhase = String(
    pottyProgressionTrack?.phase ||
      (pottyTrainingState?.completedAt ? "mastered" : "introduced")
  )
    .trim()
    .toLowerCase();
  const pottyTrackPhaseLabel = formatProgressionPhaseLabel(pottyTrackPhase);
  const pottyMasteryComplete =
    pottyTrackPhase === "mastered" || pottyTrainingPct >= 100;
  const obedienceTrainingUnlocked =
    progressionUnlockedFeatures.includes("obedience_training");
  const showPottyTrainingProgress =
    Boolean(dog?.adoptedAt) && !pottyMasteryComplete;
  const pottyTrainingCopy = pottyMasteryComplete
    ? "Potty training mastered. Trick lessons can grow from here."
    : pottyTrackPhase === "reliable"
      ? "Potty-first foundation is steady now. Finish the routine to fully open tricks."
      : String(life?.stage || "").toUpperCase() === "PUPPY"
        ? "Potty-first progression is active. Keep stacking clean wins before tricks open."
        : "Potty-first progression stays in charge until house training is finished.";
  const obedienceUnlockState =
    dog?.training?.obedience && typeof dog.training.obedience === "object"
      ? dog.training.obedience
      : null;
  const unlockedTrickIds = useMemo(() => {
    const raw = obedienceUnlockState?.unlockedIds;
    return Array.isArray(raw) ? raw.map((id) => String(id || "")) : [];
  }, [obedienceUnlockState?.unlockedIds]);
  const pendingUnlockStartsById = useMemo(() => {
    const raw = obedienceUnlockState?.unlockableAtById;
    if (!raw || typeof raw !== "object") return {};

    return Object.fromEntries(
      Object.entries(raw)
        .map(([id, startedAt]) => [String(id || ""), Number(startedAt || 0)])
        .filter(([id, startedAt]) => id && startedAt > 0)
    );
  }, [obedienceUnlockState?.unlockableAtById]);
  const masteredTrickIds = useMemo(() => {
    const mastered = new Set();
    const skillState =
      dog?.skills?.obedience && typeof dog.skills.obedience === "object"
        ? dog.skills.obedience
        : {};

    OBEDIENCE_COMMANDS.forEach((command) => {
      const id = String(command?.id || "");
      if (!id) return;
      if (getObedienceSkillMasteryPct(skillState[id]) >= 100) {
        mastered.add(id);
      }
    });

    return mastered;
  }, [dog?.skills?.obedience]);
  const activeTrickLearningLimit = getObedienceActiveLearningLimit({
    pottyComplete: pottyMasteryComplete,
    level: overallLevel,
    stage: life?.stage,
    masteredCount: masteredTrickIds.size,
  });
  const trickOptions = useMemo(
    () =>
      OBEDIENCE_COMMANDS.map((command) => {
        const id = String(command.id || "");
        const unlocked = unlockedTrickIds.includes(id);
        const mastered = masteredTrickIds.has(id);
        const pendingUnlockAt = Number(pendingUnlockStartsById[id] || 0);
        const pendingUnlock = pendingUnlockAt > 0 && !unlocked;
        const masteryPct = getObedienceSkillMasteryPct(
          dog?.skills?.obedience?.[id]
        );
        const meetsLevel = Number(command.minLevel || 1) <= overallLevel;
        const meetsBond =
          Number(command.minBond || 0) <= Number(dog?.bond?.value || 0);
        const delayMs = Math.max(
          0,
          Math.round(Number(command.unlockDelayMinutes || 0) * 60 * 1000)
        );
        const unlockReadyAt = pendingUnlockAt ? pendingUnlockAt + delayMs : 0;
        const minutesUntilReady = unlockReadyAt
          ? Math.max(0, Math.ceil((unlockReadyAt - liveNow) / 60_000))
          : 0;

        let requirementLabel = "Locked";
        let helperText = `Practice ${command.label.toLowerCase()}.`;
        if (mastered) {
          requirementLabel = "Mastered";
          helperText = "Second nature now. You can still practice it anytime.";
        } else if (unlocked) {
          requirementLabel = "Ready";
          helperText = `Ready to practice. Mastery ${masteryPct}%.`;
        } else if (pendingUnlock) {
          requirementLabel = "Soon";
          helperText =
            minutesUntilReady > 0
              ? `Almost ready. Check back in about ${minutesUntilReady} minute${minutesUntilReady === 1 ? "" : "s"}.`
              : "Almost ready. Check back in a moment.";
        } else if (!pottyMasteryComplete) {
          requirementLabel = "Potty first";
          helperText = "Finish potty training before trick lessons begin.";
        } else if (!meetsLevel) {
          requirementLabel = `Lv ${Number(command.minLevel || 1)}`;
          helperText = `Reach level ${Number(command.minLevel || 1)} to unlock this command.`;
        } else if (!meetsBond) {
          requirementLabel = `Bond ${Number(command.minBond || 0)}%`;
          helperText = `Grow bond to ${Number(command.minBond || 0)}% first.`;
        } else {
          requirementLabel =
            activeTrickLearningLimit <= 1 ? "Focus first" : "Focus current";
          helperText =
            activeTrickLearningLimit <= 1
              ? "Master the current lesson to reveal the next trick."
              : "Keep working on the current trick set and the next command will open.";
        }

        return {
          ...command,
          id,
          unlocked,
          mastered,
          masteryPct,
          difficultyStars: getDifficultyStars(command.difficulty),
          masteryRank: getMasteryRankMeta(masteryPct),
          pendingUnlock,
          unlockReadyAt,
          minutesUntilReady,
          requirementLabel,
          helperText,
        };
      }),
    [
      activeTrickLearningLimit,
      dog?.bond?.value,
      dog?.skills?.obedience,
      liveNow,
      masteredTrickIds,
      overallLevel,
      pendingUnlockStartsById,
      pottyMasteryComplete,
      unlockedTrickIds,
    ]
  );
  const trickOptionsById = useMemo(
    () => new Map(trickOptions.map((command) => [command.id, command])),
    [trickOptions]
  );
  const upcomingTrickId = useMemo(
    () => trickOptions.find((command) => !command.unlocked)?.id || null,
    [trickOptions]
  );
  const visibleTrickOptions = useMemo(
    () =>
      trickOptions.filter(
        (command) => command.unlocked || command.id === upcomingTrickId
      ),
    [trickOptions, upcomingTrickId]
  );
  const unlockedTrickCount = trickOptions.filter(
    (command) => command.unlocked
  ).length;
  const activeTrickCount = trickOptions.filter(
    (command) => command.unlocked && !command.mastered
  ).length;
  const pendingTrickCount = trickOptions.filter(
    (command) => command.pendingUnlock
  ).length;
  const reliableCommandCount = Math.max(
    progressionReliableCommandCount,
    trickOptions.filter((command) => command.masteryPct >= 70).length
  );
  const masteredCommandCount = Math.max(
    progressionMasteredCommandCount,
    masteredTrickIds.size
  );
  const pottyButtonTooltip = pottyMasteryComplete
    ? "Potty routine helps avoid accidents."
    : `Potty first: ${pottyTrainingSuccessCount}/${pottyTrainingGoal} clean wins logged.`;
  const lastCheckInAt =
    dog?.memory?.lastSeenAt || dog?.lastUpdatedAt || dog?.adoptedAt || 0;
  const runawayState = useMemo(
    () =>
      getRunawayStrikeState({
        lastCheckInAt,
        runawayEndTimestamp: dog?.memory?.runawayEndTimestamp,
        lastRunawayTriggeredAt: dog?.memory?.lastRunawayTriggeredAt,
        now: liveNow,
      }),
    [
      dog?.memory?.lastRunawayTriggeredAt,
      dog?.memory?.runawayEndTimestamp,
      lastCheckInAt,
      liveNow,
    ]
  );
  const showRunawayLetter = false;
  const controlsDisabled = !dogInteractive || trickAnimationBusy;
  const _sceneLocationLabel = String(weatherDetails?.name || "")
    .trim()
    .replace(/\s{2,}/g, " ");

  const resolveSleepLocation = useCallback(() => {
    if (isApartmentEnvironment) return null;
    if (lowEnergySleep) {
      return {
        mode: "doghouse",
        position: toWorldPosition(DOGHOUSE_SLEEP_X_NORM, DOGHOUSE_SLEEP_Y_NORM),
      };
    }
    const chooseDoghouse =
      Math.random() < (isNightScene || isRainScene ? 0.72 : 0.48);
    if (chooseDoghouse) {
      return {
        mode: "doghouse",
        position: toWorldPosition(DOGHOUSE_SLEEP_X_NORM, DOGHOUSE_SLEEP_Y_NORM),
      };
    }
    const xNorm = clamp(0.16 + Math.random() * 0.7, 0.12, 0.9);
    const yNorm = clamp(0.73 + Math.random() * 0.1, 0.7, 0.86);
    return {
      mode: "yard",
      position: toWorldPosition(xNorm, yNorm),
    };
  }, [isApartmentEnvironment, isNightScene, isRainScene, lowEnergySleep]);
  const trainingInputMode = String(settings?.trainingInputMode || "both")
    .trim()
    .toLowerCase();
  const voiceInputEnabled =
    trainingInputMode === "voice" || trainingInputMode === "both";
  const _dogRenderZIndex = sleepInDogHouse
    ? 25
    : Math.max(14, Math.round(15 + dogDepthNorm * 20));
  const _streamlinedScene = true;
  const temperamentReady = Boolean(
    dog?.temperament?.revealReady && !dog?.temperament?.revealedAt
  );
  const pushStageFeedback = useCallback((feedbackLike, overrides = {}) => {
    const resolved =
      typeof feedbackLike === "string"
        ? buildStageFeedbackPayload(feedbackLike, overrides)
        : buildStageFeedbackPayload(feedbackLike?.key, {
            ...feedbackLike,
            ...overrides,
          });

    if (!resolved?.message) return;

    const nextEntry = {
      ...resolved,
      id: `${resolved.key || "feedback"}:${Date.now()}`,
    };

    if (stageFeedbackTimeoutRef.current) {
      window.clearTimeout(stageFeedbackTimeoutRef.current);
    }

    setStageFeedback(nextEntry);
    stageFeedbackTimeoutRef.current = window.setTimeout(() => {
      setStageFeedback((current) =>
        current?.id === nextEntry.id ? null : current
      );
      stageFeedbackTimeoutRef.current = 0;
    }, 1800);
  }, []);

  useEffect(() => {
    const milestoneId = String(nextProgressionMilestone?.id || "").trim();
    if (!milestoneId) {
      handledProgressionMilestoneIdRef.current = "";
      return;
    }

    if (handledProgressionMilestoneIdRef.current === milestoneId) return;
    handledProgressionMilestoneIdRef.current = milestoneId;

    pushStageFeedback({
      key: `milestone:${milestoneId}`,
      label: nextProgressionMilestone?.title || "Progress",
      message:
        nextProgressionMilestone?.body ||
        "A new progression milestone is ready.",
      icon: nextProgressionMilestone?.icon || "✨",
      tone: nextProgressionMilestone?.tone || "amber",
    });

    toast.once(
      `progression:${milestoneId}`,
      {
        type: "reward",
        message:
          nextProgressionMilestone?.title || "Progress milestone reached.",
        durationMs: 3200,
        haptic: true,
      },
      60_000
    );

    dispatch(dequeueProgressionMilestone(milestoneId));
  }, [dispatch, nextProgressionMilestone, pushStageFeedback, toast]);

  const triggerActionFeedback = useCallback(
    (key) => {
      const nextKey = String(key || "")
        .trim()
        .toLowerCase();
      if (!nextKey) return;
      if (actionFeedbackTimeoutRef.current) {
        window.clearTimeout(actionFeedbackTimeoutRef.current);
      }
      setActiveActionFeedbackKey(nextKey);
      actionFeedbackTimeoutRef.current = window.setTimeout(() => {
        setActiveActionFeedbackKey((current) =>
          current === nextKey ? "" : current
        );
        actionFeedbackTimeoutRef.current = 0;
      }, 240);
      pushStageFeedback(nextKey);
    },
    [pushStageFeedback]
  );
  const triggerStatPop = useCallback((key) => {
    const statKey = String(key || "")
      .trim()
      .toLowerCase();
    if (!statKey) return;
    const currentTimer = statFeedbackTimeoutsRef.current[statKey];
    if (currentTimer) {
      window.clearTimeout(currentTimer);
    }
    setPoppedStats((prev) => ({ ...prev, [statKey]: true }));
    statFeedbackTimeoutsRef.current[statKey] = window.setTimeout(() => {
      setPoppedStats((prev) => ({ ...prev, [statKey]: false }));
      delete statFeedbackTimeoutsRef.current[statKey];
    }, 720);
  }, []);
  const isActionHijacked = useCallback(() => false, []);
  const tricksLocked = controlsDisabled || !pottyMasteryComplete;
  const bottomMenuTabs = useMemo(
    () =>
      BOTTOM_MENU_TABS.map((tab) =>
        tab.id === "train"
          ? {
              ...tab,
              label: pottyMasteryComplete ? "Tricks" : "Train",
              icon: pottyMasteryComplete ? "🎩" : tab.icon,
            }
          : tab
      ),
    [pottyMasteryComplete]
  );
  const lastTrainingReaction =
    dog?.memory?.lastTrainingReaction &&
    typeof dog.memory.lastTrainingReaction === "object"
      ? dog.memory.lastTrainingReaction
      : null;

  const playHudAnimation = useCallback(
    (
      animId,
      { duration = 1400, speedBoost = 1.2, lockControls = false } = {}
    ) => {
      const normalizedAnimId = String(animId || "")
        .trim()
        .toLowerCase();
      if (uiAnimResetTimeoutRef.current) {
        window.clearTimeout(uiAnimResetTimeoutRef.current);
      }

      trickAnimationTokenRef.current += 1;
      const token = trickAnimationTokenRef.current;
      setActiveHudAnimationId(normalizedAnimId);
      setUiAnimOverride(normalizedAnimId);
      setUiSpeedBoost(speedBoost);
      setTrickAnimationBusy(lockControls);

      uiAnimResetTimeoutRef.current = window.setTimeout(() => {
        if (trickAnimationTokenRef.current !== token) return;
        setActiveHudAnimationId("");
        setUiAnimOverride("");
        setUiSpeedBoost(1);
        setTrickAnimationBusy(false);
        uiAnimResetTimeoutRef.current = 0;
      }, duration);
    },
    []
  );

  useEffect(() => {
    if (dogInteractive && pottyMasteryComplete) return;
    setTricksOpen(false);
  }, [dogInteractive, pottyMasteryComplete]);

  useEffect(() => {
    if (!pottyMasteryComplete && bottomMenuCategory === "train") return;
    if (pottyMasteryComplete && bottomMenuCategory === "train") {
      setBottomMenuCategory("");
    }
  }, [bottomMenuCategory, pottyMasteryComplete]);

  useEffect(() => {
    const reaction = lastTrainingReaction;
    if (!reaction?.createdAt) return;

    const performedAnim = String(
      reaction.kind === "zoomies"
        ? "walk"
        : reaction.performedActionId || reaction.requestedCommandId || ""
    )
      .trim()
      .toLowerCase();
    if (!performedAnim) return;

    playHudAnimation(performedAnim, {
      duration: reaction.kind === "zoomies" ? 1650 : 1400,
      speedBoost: reaction.kind === "zoomies" ? 1.3 : 1.2,
      lockControls: true,
    });
  }, [lastTrainingReaction, playHudAnimation]);

  useEffect(() => {
    if (!dogInteractive) {
      stopDogSimulation();
      return undefined;
    }
    startDogSimulation(store);
    return () => {
      stopDogSimulation();
    };
  }, [dogInteractive, store]);

  useEffect(() => {
    if (!dog?.adoptedAt || !dogInteractive || !runawayState.shouldTrigger) {
      return;
    }
    dispatch(
      beginRunawayStrike({
        now: liveNow,
        runawayEndTimestamp: runawayState.runawayEndTimestamp,
      })
    );
  }, [
    dispatch,
    dog?.adoptedAt,
    dogInteractive,
    liveNow,
    runawayState.runawayEndTimestamp,
    runawayState.shouldTrigger,
  ]);

  useEffect(() => {
    if (!showRunawayLetter) return;
    setInteractionOpen(false);
    setBottomMenuCategory("");
    setPlacingBowl(false);
  }, [showRunawayLetter]);

  const actionOutcomeLabel = useMemo(() => {
    const key = String(dog?.lastAction || "")
      .trim()
      .toLowerCase();
    const trainingReaction =
      dog?.memory?.lastTrainingReaction &&
      typeof dog.memory.lastTrainingReaction === "object"
        ? dog.memory.lastTrainingReaction
        : null;
    const requestedLabel = getCommandLabel(
      trainingReaction?.requestedCommandId,
      "That trick"
    );
    const performedLabel = getCommandLabel(
      trainingReaction?.performedCommandId ||
        trainingReaction?.performedActionId,
      "something else"
    );

    if (key === "train_zoomies") {
      return `Training outcome: ignored "${requestedLabel}" and exploded into zoomies.`;
    }

    if (key === "train_ignore") {
      const reason = String(trainingReaction?.reasonId || "").toLowerCase();
      if (reason === "sniff") {
        return `Training outcome: heard "${requestedLabel}", then followed a smell instead.`;
      }
      if (reason === "scratch") {
        return `Training outcome: "${requestedLabel}" lost to an urgent scratch break.`;
      }
      if (reason === "dig") {
        return `Training outcome: "${requestedLabel}" was ignored in favor of surprise excavation.`;
      }
      if (reason === "ghost_bark") {
        return `Training outcome: "${requestedLabel}" was interrupted by barking at invisible nonsense.`;
      }
      return `Training outcome: stared at you, declined "${requestedLabel}".`;
    }

    if (key === "train_reinterpret") {
      return `Training outcome: you asked for "${requestedLabel}", he freestyled "${performedLabel}".`;
    }

    const labels = {
      pet_cuddle: "Pet outcome: full cuddle mode.",
      pet_zoomies: "Pet outcome: instant zoomies.",
      pet_doze_off: "Pet outcome: rolled over and fell asleep.",
      pet_side_eye: "Pet outcome: dramatic side-eye.",
      train_perfect: "Training outcome: perfect execution.",
      train_doze_off: "Training outcome: tried, then passed out.",
      trainfailed: "Training outcome: not today.",
      sniff_kibble_reject:
        "Feed outcome: sniffed regular kibble and walked away.",
      table_theft: "Apartment outcome: low-table snack stolen.",
      feed_quick: "Feed outcome: energy restored to 100%.",
      potty_fakeout: "Potty outcome: fake-out. Circled, then just sat down.",
      surprise_fetch_recover: "Surprise resolved: fetch won, control returned.",
      surprise_cleanup: "Surprise resolved: digging redirected.",
      surprise_fetch_cleanup: "Surprise resolved: fetched then cleaned up.",
    };
    return labels[key] || null;
  }, [dog?.lastAction, dog?.memory?.lastTrainingReaction]);
  const lastMasteredCommandId = dog?.memory?.lastMasteredCommandId || null;
  const lastMasteredCommandAt = Number(dog?.memory?.lastMasteredCommandAt || 0);
  const lastTreasureFoundId = dog?.memory?.lastTreasureFoundId || null;
  const lastTreasureFoundAt = Number(dog?.memory?.lastTreasureFoundAt || 0);
  const lastUnlockedCommandId = obedienceUnlockState?.lastUnlockedId || null;
  const lastUnlockedCommandAt = Number(
    obedienceUnlockState?.lastUnlockedAt || 0
  );
  const lastDreamWoofAt = Number(dog?.memory?.lastDreamWoofAt || 0);
  const _showDreamBubble =
    lastDreamWoofAt > 0 && liveNow - lastDreamWoofAt <= 35_000;
  const lastGuiltyPawsAt = Number(dog?.memory?.lastGuiltyPawsAt || 0);
  const _showGuiltyPaws =
    lastGuiltyPawsAt > 0 && liveNow - lastGuiltyPawsAt <= 45_000;
  const _isSleepyState =
    String(displayMoodLabel || "").toLowerCase() === "sleepy" ||
    Number(dog?.stats?.energy || 0) <= 15;
  const _showFireflySnap =
    fireflySnapAt > 0 && liveNow - Number(fireflySnapAt || 0) <= 2600;
  const showMidnightZoomies =
    midnightZoomiesAt > 0 && liveNow - midnightZoomiesAt <= 7000;
  const _showButterflyNotice =
    butterflyNoticeAt > 0 && liveNow - butterflyNoticeAt <= 1100;
  const activeInvestigationLabel =
    investigationProps.find((prop) => prop.id === activeInvestigationId)
      ?.label || "";
  const activeAnimatedEventType = showMidnightZoomies
    ? "midnight_zoomies"
    : _showFireflySnap
      ? "firefly_snap"
      : ambientEvent?.type;
  const activeAnimatedEventMeta = useMemo(
    () => getAnimatedEventMeta(activeAnimatedEventType),
    [activeAnimatedEventType]
  );
  const treasurePhase = String(treasureHunt?.phase || "").toLowerCase();
  const _showTreasurePrompt =
    treasurePhase === "sniffing" || treasurePhase === "digging";
  const _showTreasureMarker = Boolean(treasureHunt);
  const fireflySeeds = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 30 + Math.random() * 58,
        delay: Number((Math.random() * 3.2).toFixed(2)),
        duration: Number((2 + Math.random() * 2.2).toFixed(2)),
      })),
    []
  );
  const temperamentCardCopy = useMemo(() => {
    const primary = String(dog?.temperament?.primary || "SWEET").toUpperCase();
    const secondary = String(
      dog?.temperament?.secondary || "CHILL"
    ).toUpperCase();
    const archetype = String(dog?.temperament?.archetype || "").toUpperCase();
    const archetypeCopy = {
      ATHLETE: {
        title: "72-Hour Archetype Read Ready",
        summary:
          "Your pup is reading as an Athlete: play-hungry, fast-learning, and always one bounce from motion.",
        detail:
          "High play frequency is shaping a body-first, action-first personality.",
      },
      SHADOW: {
        title: "72-Hour Archetype Read Ready",
        summary:
          "Your pup is reading as a Shadow: tuned into you, sticky with attention, and extra responsive to your presence.",
        detail:
          "Frequent check-ins and steady affection are building a people-focused companion.",
      },
      INDEPENDENT: {
        title: "72-Hour Archetype Read Ready",
        summary:
          "Your pup is reading as Independent: self-directed, routine-aware, and less interested in constant supervision.",
        detail:
          "Long gaps between check-ins are shaping a terrier that solves problems solo.",
      },
      MISCHIEVOUS: {
        title: "72-Hour Archetype Read Ready",
        summary:
          "Your pup is reading as Mischievous: clever, distracting, and very committed to doing one weird extra thing first.",
        detail:
          "Expect fake-outs, freestyle choices, and the occasional dramatically incorrect response.",
      },
    };
    const byPrimary = {
      SWEET:
        "Your care pattern built a trusting, people-first pup that seeks connection.",
      CHILL:
        "Your steady routine shaped a calm, balanced temperament with dependable habits.",
      SPICY:
        "Your pup developed a bold, independent streak and tests boundaries more often.",
    };
    const bySecondary = {
      SWEET: "Warm social responses and fast emotional recovery.",
      CHILL: "Stable mood and good self-regulation.",
      SPICY: "Higher reactivity, stronger autonomy, and selective obedience.",
    };
    const resolved = archetypeCopy[archetype];
    return {
      title: resolved?.title || "72-Hour Archetype Read Ready",
      summary: resolved?.summary || byPrimary[primary] || byPrimary.CHILL,
      detail: resolved?.detail || bySecondary[secondary] || bySecondary.CHILL,
      primary,
      secondary,
      archetype,
    };
  }, [
    dog?.temperament?.archetype,
    dog?.temperament?.primary,
    dog?.temperament?.secondary,
  ]);
  const temperamentPageAvailable = Boolean(
    dog?.temperament?.revealReady || dog?.temperament?.revealedAt
  );
  useEffect(() => {
    return () => {
      if (actionFeedbackTimeoutRef.current) {
        window.clearTimeout(actionFeedbackTimeoutRef.current);
      }
      if (stageFeedbackTimeoutRef.current) {
        window.clearTimeout(stageFeedbackTimeoutRef.current);
      }
      if (uiAnimResetTimeoutRef.current) {
        window.clearTimeout(uiAnimResetTimeoutRef.current);
      }
      Object.values(statFeedbackTimeoutsRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      setTrickAnimationBusy(false);
      statFeedbackTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const previous = previousVitalSnapshotRef.current;
    if (Number.isFinite(previous.energy) && energyPct > previous.energy) {
      triggerStatPop("energy");
    }
    if (Number.isFinite(previous.health) && healthPct > previous.health) {
      triggerStatPop("health");
    }
    previousVitalSnapshotRef.current = {
      energy: energyPct,
      health: healthPct,
    };
  }, [energyPct, healthPct, triggerStatPop]);

  useEffect(() => {
    if (!lastUnlockedCommandAt || !lastUnlockedCommandId) return;
    const commandLabel = getCommandLabel(lastUnlockedCommandId, "New trick");
    toast.once(
      `unlocked:${lastUnlockedCommandId}:${lastUnlockedCommandAt}`,
      {
        type: "reward",
        message: `New trick ready: ${commandLabel}.`,
        durationMs: 3200,
        haptic: true,
      },
      60_000
    );
  }, [lastUnlockedCommandAt, lastUnlockedCommandId, toast]);

  useEffect(() => {
    if (!lastMasteredCommandAt || !lastMasteredCommandId) return;
    const dedupeKey = `${lastMasteredCommandId}:${lastMasteredCommandAt}`;
    if (lastMasteredMomentRef.current === dedupeKey) return;
    lastMasteredMomentRef.current = dedupeKey;
    queueMemoryMoment(
      createMemoryMomentEvent(MEMORY_MOMENT_TYPES.TRICK_MASTERED, {
        commandId: lastMasteredCommandId,
        commandLabel: getCommandLabel(lastMasteredCommandId, "That trick"),
        occurredAt: lastMasteredCommandAt,
        uniqueKey: `trick_mastered:${dedupeKey}`,
      })
    );
  }, [lastMasteredCommandAt, lastMasteredCommandId, queueMemoryMoment]);

  useEffect(() => {
    if (!lastTreasureFoundAt || !lastTreasureFoundId) return;
    if (lastTreasureFoundAt <= lastTreasureMomentRef.current) return;
    lastTreasureMomentRef.current = lastTreasureFoundAt;
    queueMemoryMoment(
      createMemoryMomentEvent(MEMORY_MOMENT_TYPES.TREASURE_FOUND, {
        rewardId: lastTreasureFoundId,
        rewardName: formatTreasureName(lastTreasureFoundId),
        occurredAt: lastTreasureFoundAt,
        uniqueKey: `treasure_found:${lastTreasureFoundId}:${lastTreasureFoundAt}`,
      })
    );
  }, [lastTreasureFoundAt, lastTreasureFoundId, queueMemoryMoment]);

  useEffect(() => {
    const sleepingInDoghouse = Boolean(effectiveDogSleeping && sleepInDogHouse);
    const wasSleepingInDoghouse = doghouseSleepActiveRef.current;
    if (!wasSleepingInDoghouse && sleepingInDoghouse) {
      const now = Date.now();
      queueMemoryMoment(
        createMemoryMomentEvent(MEMORY_MOMENT_TYPES.SLEPT_IN_DOGHOUSE, {
          occurredAt: now,
          uniqueKey: buildDoghouseSleepMomentKey(now),
        })
      );
    }
    doghouseSleepActiveRef.current = sleepingInDoghouse;
  }, [effectiveDogSleeping, queueMemoryMoment, sleepInDogHouse]);

  useEffect(() => {
    if (!midnightZoomiesAt) return;
    if (midnightZoomiesAt <= lastMidnightZoomiesMomentRef.current) return;
    lastMidnightZoomiesMomentRef.current = midnightZoomiesAt;
    queueMemoryMoment(
      createMemoryMomentEvent(MEMORY_MOMENT_TYPES.MIDNIGHT_ZOOMIES, {
        occurredAt: midnightZoomiesAt,
        uniqueKey: `midnight_zoomies:${midnightZoomiesAt}`,
      })
    );
  }, [midnightZoomiesAt, queueMemoryMoment]);

  useEffect(() => {
    if (pawPrintsEnabled) return;
    setPawPrints([]);
    lastPawPrintRef.current = { x: 0, y: 0, at: 0 };
  }, [pawPrintsEnabled]);

  useEffect(() => {
    setInvestigationProps(createInvestigationProps(environmentMode));
    setActiveInvestigationId("");
    setTreasureHunt(null);
  }, [environmentMode]);

  const _handleDogPositionChange = useCallback(
    (pos) => {
      if (!pos || typeof pos !== "object") return;
      const now = Date.now();
      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      if (rect?.height) {
        const nextNorm = clamp(Number(pos.y || 0) / rect.height, 0, 1);
        const depthState = lastDepthSyncRef.current;
        if (
          Math.abs(nextNorm - Number(depthState.norm || 0.5)) >= 0.035 ||
          now - Number(depthState.at || 0) >= 120
        ) {
          depthState.norm = nextNorm;
          depthState.at = now;
          setDogDepthNorm(nextNorm);
        }
      }
      if (rect?.width && rect?.height) {
        const nextXNorm = clamp(Number(pos.x || 0) / rect.width, 0, 1);
        const nextYNorm = clamp(Number(pos.y || 0) / rect.height, 0, 1);
        const parallaxState = lastParallaxSyncRef.current;
        if (
          Math.abs(nextXNorm - Number(parallaxState.xNorm || 0.5)) >= 0.02 ||
          Math.abs(nextYNorm - Number(parallaxState.yNorm || 0.74)) >= 0.02 ||
          now - Number(parallaxState.at || 0) >= 120
        ) {
          parallaxState.xNorm = nextXNorm;
          parallaxState.yNorm = nextYNorm;
          parallaxState.at = now;
          setDogPositionNorm({
            xNorm: nextXNorm,
            yNorm: nextYNorm,
            moving: Boolean(pos?.moving),
          });
        }
      }

      if (!pawPrintsEnabled) return;
      if (!pos?.moving) return;
      const last = lastPawPrintRef.current;
      const dx = Number(pos.x || 0) - Number(last.x || 0);
      const dy = Number(pos.y || 0) - Number(last.y || 0);
      const dist = Math.hypot(dx, dy);
      const minDist = cleanlinessTier === "DIRTY" ? 22 : 18;
      const minMs =
        cleanlinessTier === "DIRTY"
          ? 420
          : cleanlinessTier === "FLEAS"
            ? 320
            : 260;
      if (now - last.at < minMs && dist < minDist) return;

      lastPawPrintRef.current = { x: pos.x, y: pos.y, at: now };
      const size = cleanlinessTier === "MANGE" ? 22 : 18;
      const rot = (pos.facing < 0 ? 180 : 0) + (Math.random() * 50 - 25);
      const fill =
        PAW_PRINT_COLORS[cleanlinessTier] ||
        PAW_PRINT_COLORS.DIRTY ||
        "rgba(92, 64, 42, 0.5)";

      setPawPrints((prev) => {
        const fresh = prev.filter(
          (p) => now - Number(p.createdAt || 0) < PAW_PRINT_TTL_MS
        );
        const next = {
          id: ++pawPrintIdRef.current,
          x: pos.x,
          y: pos.y,
          rot,
          size,
          fill,
          createdAt: now,
        };
        return [...fresh, next];
      });
    },
    [cleanlinessTier, pawPrintsEnabled]
  );

  useEffect(() => {
    const xNorm = clamp(
      Number(
        (sleepPositionOverride?.x ??
          dog?.position?.x ??
          DOG_WORLD_WIDTH * 0.5) / DOG_WORLD_WIDTH
      ),
      0,
      1
    );
    const yNorm = clamp(
      Number(
        (sleepPositionOverride?.y ??
          dog?.position?.y ??
          DOG_WORLD_HEIGHT * 0.74) / DOG_WORLD_HEIGHT
      ),
      0,
      1
    );

    setDogPositionNorm((current) => {
      const sameX = Math.abs(Number(current?.xNorm || 0.5) - xNorm) < 0.001;
      const sameY = Math.abs(Number(current?.yNorm || 0.74) - yNorm) < 0.001;
      const sameMoving = Boolean(current?.moving) === Boolean(isDogMoving);
      if (sameX && sameY && sameMoving) return current;
      return {
        xNorm,
        yNorm,
        moving: Boolean(isDogMoving),
      };
    });
  }, [
    dog?.position?.x,
    dog?.position?.y,
    isDogMoving,
    sleepPositionOverride?.x,
    sleepPositionOverride?.y,
  ]);

  useEffect(() => {
    dogPositionNormRef.current = dogPositionNorm;
  }, [dogPositionNorm]);

  const handlePetSwipeRecognized = useCallback(
    (event) => {
      if (controlsDisabled) return;
      if (placingBowl) return;
      if (effectiveDogSleeping) return;
      if (movementLocked) return;
      if (isActionHijacked("pet")) return;

      const now = Date.now();
      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      const rawX = Number(event?.clientX);
      const rawY = Number(event?.clientY);
      if (rect && Number.isFinite(rawX) && Number.isFinite(rawY)) {
        const xNorm = clamp((rawX - rect.left) / rect.width, 0, 1);
        const yNorm = clampYardTapYNorm((rawY - rect.top) / rect.height);
        setAttentionTarget({ xNorm, yNorm, at: now });
      }
      dispatch(petDog({ now, source: "swipe_pet" }));
    },
    [
      controlsDisabled,
      dispatch,
      effectiveDogSleeping,
      isActionHijacked,
      movementLocked,
      placingBowl,
    ]
  );

  useEffect(() => {
    const recognizer = createSwipeGestureRecognizer({
      onRecognized: handlePetSwipeRecognized,
      shouldIgnoreTarget: (target) =>
        Boolean(
          target?.closest?.(
            "#ui-container, .ui-layer, [data-doggerz-ignore-swipe='true'], button, input, textarea, select, a, [role='button']"
          )
        ),
    });
    swipeRecognizerRef.current = recognizer;
    return () => {
      recognizer.cancel();
      if (swipeRecognizerRef.current === recognizer) {
        swipeRecognizerRef.current = null;
      }
    };
  }, [handlePetSwipeRecognized]);

  useEffect(() => {
    const manager = createDragAndDropManager({
      dropPaddingPx: 18,
      getDropZone: () => {
        const rect = dogViewportRef.current?.getBoundingClientRect?.();
        if (!rect) return null;
        const pos = dogPositionNormRef.current || { xNorm: 0.5, yNorm: 0.74 };
        const xNorm = clamp(Number(pos.xNorm || 0.5), 0, 1);
        const yNorm = clamp(Number(pos.yNorm || 0.74), 0, 1);
        const centerX = rect.left + xNorm * rect.width;
        const centerY = rect.top + yNorm * rect.height - rect.height * 0.08;
        const size = clamp(rect.width * 0.16, 92, 170);
        return {
          left: centerX - size / 2,
          top: centerY - size / 2,
          right: centerX + size / 2,
          bottom: centerY + size / 2,
        };
      },
    });
    dragDropManagerRef.current = manager;
    return () => {
      manager.cancelDrag();
      if (dragDropManagerRef.current === manager) {
        dragDropManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    voiceCommandDispatchRef.current = (commandId, transcript = "") => {
      if (!voiceInputEnabled) return false;
      if (controlsDisabled) return false;
      if (isActionHijacked("train")) return false;
      if (!pottyMasteryComplete) {
        toast.error("Finish potty training before teaching tricks.");
        return false;
      }

      const command = getObedienceCommand(commandId);
      const resolvedCommandId = command?.id || "";
      if (!resolvedCommandId) {
        toast.error("That trick was not recognized.");
        return false;
      }
      const trickOption = trickOptionsById.get(resolvedCommandId);
      if (!trickOption?.unlocked) {
        toast.error(
          trickOption?.helperText ||
            `${command?.label || resolvedCommandId} is not ready yet.`
        );
        return false;
      }
      dispatch(
        trainObedience({
          now: Date.now(),
          commandId: resolvedCommandId,
          input: "voice",
        })
      );
      const heard = String(transcript || "").trim();
      const message = heard
        ? `Voice command: ${command?.label || resolvedCommandId} (${heard}).`
        : `Voice command: ${command?.label || resolvedCommandId}.`;
      toast.success(message);
      return true;
    };
  }, [
    controlsDisabled,
    dispatch,
    isActionHijacked,
    pottyMasteryComplete,
    toast,
    trickOptionsById,
    voiceInputEnabled,
  ]);

  useEffect(() => {
    const handler = createVoiceCommandHandler({
      onCommand: ({ commandId, transcript }) => {
        voiceCommandDispatchRef.current(commandId, transcript);
      },
      onError: ({ code }) => {
        const key = String(code || "").toLowerCase();
        if (key === "unmatched_command") {
          toast.error("Try saying: Sit, Speak, or Roll over.");
          return;
        }
        if (key === "not-allowed" || key === "service-not-allowed") {
          toast.error("Microphone permission is blocked.");
        }
      },
      onStatusChange: (status) => {
        setVoiceListening(status === "listening");
      },
    });
    voiceCommandHandlerRef.current = handler;
    setVoiceSupported(handler.isSupported());
    return () => {
      handler.destroy();
      if (voiceCommandHandlerRef.current === handler) {
        voiceCommandHandlerRef.current = null;
      }
      setVoiceListening(false);
    };
  }, [toast]);

  useEffect(() => {
    if (voiceInputEnabled) return;
    if (voiceListening) {
      voiceCommandHandlerRef.current?.stop();
    }
  }, [voiceInputEnabled, voiceListening]);

  const handleVoiceTrainTap = useCallback(() => {
    if (!voiceInputEnabled) {
      toast.error("Enable voice input in Settings > Game > Training input.");
      return;
    }
    if (!pottyMasteryComplete) {
      toast.error("Finish potty training before using voice tricks.");
      return;
    }
    const handler = voiceCommandHandlerRef.current;
    if (!handler || !handler.isSupported()) {
      toast.error("Voice commands are not available on this device.");
      return;
    }
    if (voiceListening) {
      triggerActionFeedback("voice-train");
      handler.stop();
      return;
    }
    const started = handler.start();
    if (!started) {
      toast.error("Could not start voice command listening.");
      return;
    }
    triggerActionFeedback("voice-train");
  }, [
    pottyMasteryComplete,
    toast,
    triggerActionFeedback,
    voiceInputEnabled,
    voiceListening,
  ]);

  const openTricksPicker = useCallback(() => {
    if (!pottyMasteryComplete) {
      toast.error("Finish potty training before teaching tricks.");
      return;
    }
    if (isActionHijacked("train")) return;
    triggerActionFeedback("tricks");
    setTrainingLogOpen(false);
    setTricksOpen(true);
  }, [isActionHijacked, pottyMasteryComplete, toast, triggerActionFeedback]);

  const handleTrickTrain = useCallback(
    (commandId, input = "button") => {
      if (!pottyMasteryComplete) {
        toast.error("Finish potty training before teaching tricks.");
        return;
      }
      const trickOption = trickOptionsById.get(String(commandId || ""));
      if (!trickOption?.unlocked) {
        toast.error(
          trickOption?.helperText ||
            `${getCommandLabel(commandId, "That trick")} is not ready yet.`
        );
        return;
      }
      playHudAnimation(trickOption.animationKey || commandId, {
        duration: 1400,
        speedBoost: 1.2,
        lockControls: true,
      });
      trackTrainTrick({
        commandId,
        input,
        stage: life?.stage || "PUPPY",
      });
      dispatch(
        trainObedience({
          now: Date.now(),
          commandId,
          input,
        })
      );
      setTricksOpen(false);
    },
    [
      dispatch,
      life?.stage,
      playHudAnimation,
      pottyMasteryComplete,
      toast,
      trickOptionsById,
    ]
  );

  const triggerPropHaptic = useCallback(
    async (mode = "impact") => {
      if (settings?.hapticsEnabled === false) return;
      if (Capacitor.getPlatform?.() === "web") {
        try {
          if (typeof navigator !== "undefined" && navigator?.vibrate) {
            navigator.vibrate(mode === "success" ? 18 : 10);
          }
        } catch {
          // Ignore haptic fallback failures.
        }
        return;
      }
      try {
        const mod = await import("@capacitor/haptics");
        if (
          mode === "success" &&
          mod?.Haptics?.notification &&
          mod?.NotificationType?.Success
        ) {
          await mod.Haptics.notification({
            type: mod.NotificationType.Success,
          });
          return;
        }
        if (mod?.Haptics?.impact && mod?.ImpactStyle?.Light) {
          await mod.Haptics.impact({ style: mod.ImpactStyle.Light });
          return;
        }
      } catch {
        // Fall back to web vibration below.
      }
      try {
        if (typeof navigator !== "undefined" && navigator?.vibrate) {
          navigator.vibrate(mode === "success" ? 18 : 10);
        }
      } catch {
        // Ignore haptic fallback failures.
      }
    },
    [settings?.hapticsEnabled]
  );

  useEffect(() => {
    if (!lastMasteredCommandAt || !lastMasteredCommandId) return;
    const commandLabel = getCommandLabel(lastMasteredCommandId, "That trick");
    const masteryPct = getObedienceSkillMasteryPct(
      dog?.skills?.obedience?.[lastMasteredCommandId]
    );
    setMasteryCelebration({
      id: `${lastMasteredCommandId}:${lastMasteredCommandAt}`,
      commandId: lastMasteredCommandId,
      label: commandLabel,
      rank: getMasteryRankMeta(masteryPct).label,
      perk: "Permanent bond bonus unlocked for mastered reps.",
    });
    triggerPropHaptic("success");
    setUiAnimOverride("jump");
    setUiSpeedBoost(1.2);
    if (masteryCelebrationTimeoutRef.current) {
      window.clearTimeout(masteryCelebrationTimeoutRef.current);
    }
    masteryCelebrationTimeoutRef.current = window.setTimeout(() => {
      setMasteryCelebration(null);
      setUiAnimOverride("");
      setUiSpeedBoost(1);
    }, 2800);
  }, [
    dog?.skills?.obedience,
    lastMasteredCommandAt,
    lastMasteredCommandId,
    triggerPropHaptic,
  ]);

  useEffect(
    () => () => {
      if (masteryCelebrationTimeoutRef.current) {
        window.clearTimeout(masteryCelebrationTimeoutRef.current);
      }
    },
    []
  );

  const clearTreasureHuntTimer = useCallback(() => {
    if (!treasureHuntTimeoutRef.current) return;
    window.clearTimeout(treasureHuntTimeoutRef.current);
    treasureHuntTimeoutRef.current = 0;
  }, []);

  const clearTreasureHunt = useCallback(() => {
    clearTreasureHuntTimer();
    setTreasureHunt(null);
    setMovementLocked(false);
    setUiAnimOverride("");
    setUiSpeedBoost(1);
  }, [clearTreasureHuntTimer]);

  const startTreasureHunt = useCallback(() => {
    if (
      controlsDisabled ||
      effectiveDogSleeping ||
      movementLocked ||
      treasureHunt
    ) {
      return;
    }

    const now = Date.now();
    const reward = rollTreasureReward();
    const target = createTreasureHuntTarget(environmentMode);
    clearTreasureHuntTimer();
    setTreasureHunt({
      id: `treasure-${now}`,
      phase: "approaching",
      startedAt: now,
      rewardId: reward.id,
      rewardName: reward.name,
      rewardIcon: reward.icon,
      ...target,
    });
    setAttentionTarget({ xNorm: target.xNorm, yNorm: target.yNorm, at: now });
  }, [
    clearTreasureHuntTimer,
    controlsDisabled,
    effectiveDogSleeping,
    environmentMode,
    movementLocked,
    treasureHunt,
  ]);

  const _handleTreasureHuntTap = useCallback(() => {
    if (treasurePhase !== "sniffing" || !treasureHunt) return;

    const activeHunt = treasureHunt;
    clearTreasureHuntTimer();
    setTreasureHunt((current) =>
      current?.id === activeHunt.id
        ? { ...current, phase: "digging", tappedAt: Date.now() }
        : current
    );
    setUiAnimOverride("scratch");
    setUiSpeedBoost(1.05);

    const revealTreasureAfterDig = async () => {
      try {
        dispatch(
          claimTreasureFind({
            id: activeHunt.rewardId,
            now: Date.now(),
          })
        );
        await triggerPropHaptic("success");
        toast.reward(
          `${activeHunt.rewardIcon} Dug up ${activeHunt.rewardName}.`,
          2400
        );
        clearTreasureHunt();
      } catch (error) {
        // Prevent unhandled promise rejections from async timeout callback
        console.error("Failed to reveal treasure hunt reward:", error);
      }
    };

    treasureHuntTimeoutRef.current = window.setTimeout(() => {
      void revealTreasureAfterDig();
    }, TREASURE_HUNT_DIG_REVEAL_MS);
  }, [
    clearTreasureHunt,
    clearTreasureHuntTimer,
    dispatch,
    toast,
    treasureHunt,
    treasurePhase,
    triggerPropHaptic,
  ]);

  const handleDogPetTap = useCallback(() => {
    if (controlsDisabled) return;
    if (placingBowl) return;
    if (effectiveDogSleeping) return;
    if (movementLocked) return;
    if (isActionHijacked("pet")) return;

    const now = Date.now();
    const pos = dogPositionNormRef.current || dogPositionNorm;
    setAttentionTarget({
      xNorm: clamp(Number(pos?.xNorm || 0.5), 0, 1),
      yNorm: clampYardTapYNorm(Number(pos?.yNorm || 0.74) - 0.05),
      at: now,
    });
    triggerActionFeedback("pet");
    dispatch(petDog({ now, source: "tap_pet" }));
  }, [
    controlsDisabled,
    dispatch,
    dogPositionNorm,
    effectiveDogSleeping,
    isActionHijacked,
    movementLocked,
    placingBowl,
    triggerActionFeedback,
  ]);

  const handleBathAction = useCallback(() => {
    if (controlsDisabled) return;
    if (isActionHijacked("bath")) return;
    triggerActionFeedback("bath");
    dispatch(bathe({ now: Date.now() }));
  }, [controlsDisabled, dispatch, isActionHijacked, triggerActionFeedback]);

  const handlePottyAction = useCallback(() => {
    if (controlsDisabled) return;
    if (isActionHijacked("potty")) return;
    triggerActionFeedback("potty");
    dispatch(goPotty({ now: Date.now() }));
  }, [controlsDisabled, dispatch, isActionHijacked, triggerActionFeedback]);

  const handleGiveWater = useCallback(() => {
    if (controlsDisabled) return;
    trackGiveWater({
      source: "game_controls",
      stage: life?.stage || "PUPPY",
    });
    triggerActionFeedback("water");
    dispatch(giveWater({ now: Date.now() }));
    toast.once(
      `habit:water:${getLocalDayKey()}`,
      {
        type: "success",
        message: "Fresh water landed well. Small care still counts.",
        durationMs: 2200,
      },
      90_000
    );
    triggerStatPop("health");
  }, [
    controlsDisabled,
    dispatch,
    life?.stage,
    toast,
    triggerActionFeedback,
    triggerStatPop,
  ]);

  const handleFeedAction = useCallback(
    (foodType, source = "game_controls") => {
      if (controlsDisabled) return false;

      const resolvedFoodType = String(foodType || "")
        .trim()
        .toLowerCase();
      const now = Date.now();
      trackFeedDog({
        feedType: resolvedFoodType || "regular_kibble",
        source,
        stage: life?.stage || "PUPPY",
      });
      dispatch(
        feed({
          now,
          foodType: resolvedFoodType || "regular_kibble",
          source,
        })
      );
      triggerActionFeedback("quick-feed");
      toast.once(
        `habit:feed:${getLocalDayKey()}:${resolvedFoodType || "regular_kibble"}`,
        {
          type: "reward",
          message: "Fed and settled. The routine is starting to stick.",
          durationMs: 2200,
        },
        90_000
      );
      triggerStatPop("health");
      return true;
    },
    [
      controlsDisabled,
      dispatch,
      life?.stage,
      toast,
      triggerActionFeedback,
      triggerStatPop,
    ]
  );

  const dispatchPlayAction = useCallback(
    (source = "button") => {
      const now = Date.now();
      lastPlayTapAtRef.current = now;
      trackPlayWithDog({
        source,
        stage: life?.stage || "PUPPY",
      });
      triggerActionFeedback("play");
      dispatch(play({ now, source }));
      toast.once(
        `habit:play:${getLocalDayKey()}`,
        {
          type: "reward",
          message: "Good play burst. Mood and bond both got a lift.",
          durationMs: 2200,
        },
        90_000
      );
      triggerStatPop("energy");
      return now;
    },
    [dispatch, life?.stage, toast, triggerActionFeedback, triggerStatPop]
  );

  const handlePlayAction = useCallback(
    (source = "dock") => {
      if (controlsDisabled) return;
      if (toysIgnored) return;
      if (isActionHijacked("play")) return;
      dispatchPlayAction(source);
    },
    [controlsDisabled, dispatchPlayAction, isActionHijacked, toysIgnored]
  );

  const handleOpenInteractionMenu = useCallback(() => {
    if (controlsDisabled) return;
    triggerActionFeedback("interact");
    setBottomMenuCategory("");
    setInteractionOpen(true);
  }, [controlsDisabled, triggerActionFeedback]);

  const closeInteractionMenu = useCallback(() => {
    setInteractionOpen(false);
    setBottomMenuCategory("");
  }, []);

  const handleOpenRoute = useCallback(
    (path) => {
      if (!path) return;
      navigate(path);
    },
    [navigate]
  );

  const triggerDockFeedback = useCallback(
    async ({
      message = "",
      type = "info",
      hapticMode = "impact",
      key = "",
      cooldownMs = 900,
      showInStage = true,
      inStageFeedback = null,
    } = {}) => {
      await triggerPropHaptic(hapticMode);
      const feedbackMessage = String(message || "").trim();
      if (!feedbackMessage) return;
      if (showInStage) {
        pushStageFeedback(
          inStageFeedback || {
            key,
            message: feedbackMessage,
            tone: type,
          }
        );
      }
      if (key) {
        toast.once(
          `dock:${key}`,
          { type, message: feedbackMessage, durationMs: 1200 },
          cooldownMs
        );
        return;
      }
      toast.show({ type, message: feedbackMessage, durationMs: 1200 });
    },
    [pushStageFeedback, toast, triggerPropHaptic]
  );

  const handleBottomMenuItemPress = useCallback(
    (item) => {
      if (!item || item.disabled) return;
      const itemKey = String(item?.key || "")
        .trim()
        .toLowerCase();
      const feedbackMessage =
        item.feedbackMessage ||
        (item.route ? `Opening ${item.label}.` : `${item.label} triggered.`);
      void triggerDockFeedback({
        key: item.key,
        message: feedbackMessage,
        type: item.feedbackType || "info",
        hapticMode: item.feedbackHaptic || "impact",
        showInStage: !isActionDrivenDockItemKey(itemKey),
        inStageFeedback: {
          key: itemKey,
          label: item.label,
          message: feedbackMessage,
          icon: item.icon,
          tone: item.feedbackType || item.progressTone || "neutral",
        },
      });
      item.onClick?.();
    },
    [triggerDockFeedback]
  );

  const startPropInvestigation = useCallback(
    (prop) => {
      if (
        !prop ||
        controlsDisabled ||
        effectiveDogSleeping ||
        movementLocked ||
        treasureHunt
      ) {
        return;
      }
      const now = Date.now();
      setMovementLocked(true);
      setActiveInvestigationId(prop.id);
      setUiAnimOverride(prop.action || "sniff");
      setUiSpeedBoost(0.9);
      setAttentionTarget({ xNorm: prop.xNorm, yNorm: prop.yNorm, at: now });

      if (investigationResetRef.current) {
        window.clearTimeout(investigationResetRef.current);
      }

      investigationResetRef.current = window.setTimeout(async () => {
        const finishedAt = Date.now();
        setMovementLocked(false);
        setActiveInvestigationId("");
        setUiAnimOverride("");
        setUiSpeedBoost(1);
        setInvestigationProps((prev) =>
          prev.map((item) =>
            item.id === prop.id
              ? {
                  ...item,
                  interactedUntil:
                    finishedAt + Number(item.cooldownMs || 60_000),
                }
              : item
          )
        );
        await triggerPropHaptic("success");
      }, 3000);
    },
    [
      controlsDisabled,
      effectiveDogSleeping,
      movementLocked,
      treasureHunt,
      triggerPropHaptic,
    ]
  );

  const handlePropTap = useCallback(
    async (propId) => {
      const prop = investigationProps.find((item) => item.id === propId);
      if (!prop || controlsDisabled) return;
      const now = Date.now();
      propGateRef.current[propId] = false;
      setAttentionTarget({ xNorm: prop.xNorm, yNorm: prop.yNorm, at: now });
      await triggerPropHaptic("impact");
    },
    [controlsDisabled, investigationProps, triggerPropHaptic]
  );

  useEffect(() => {
    return () => {
      clearTreasureHuntTimer();
    };
  }, [clearTreasureHuntTimer]);

  useEffect(() => {
    if (!treasureHunt || treasurePhase !== "approaching") return;
    const nearX = Math.abs(
      dogPositionNorm.xNorm - Number(treasureHunt.xNorm || 0.5)
    );
    const nearY = Math.abs(
      dogPositionNorm.yNorm - Number(treasureHunt.yNorm || 0.75)
    );
    if (nearX > 0.09 || nearY > 0.12) return;

    setMovementLocked(true);
    setTreasureHunt((current) =>
      current?.id === treasureHunt.id
        ? { ...current, phase: "sniffing", sniffingAt: Date.now() }
        : current
    );
    setUiAnimOverride("sniff");
    setUiSpeedBoost(0.85);
    clearTreasureHuntTimer();
    treasureHuntTimeoutRef.current = window.setTimeout(() => {
      clearTreasureHunt();
    }, TREASURE_HUNT_RESPONSE_MS);
  }, [
    clearTreasureHunt,
    clearTreasureHuntTimer,
    dogPositionNorm.xNorm,
    dogPositionNorm.yNorm,
    treasureHunt,
    treasurePhase,
  ]);

  useEffect(() => {
    if (
      !dogInteractive ||
      controlsDisabled ||
      effectiveDogSleeping ||
      movementLocked ||
      treasureHunt
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      const lastTreasureAt = Number(dog?.memory?.lastTreasureHuntAt || 0);
      if (activeInvestigationId) return;
      if (Number(dog?.stats?.energy || 0) < 18) return;
      const triggerChance = getTreasureHuntTriggerChance(lastTreasureAt, now);
      if (triggerChance <= 0) return;
      if (Math.random() >= triggerChance) return;
      startTreasureHunt();
    }, TREASURE_HUNT_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    activeInvestigationId,
    controlsDisabled,
    dog?.memory?.lastTreasureHuntAt,
    dog?.stats?.energy,
    dogInteractive,
    effectiveDogSleeping,
    movementLocked,
    startTreasureHunt,
    treasureHunt,
  ]);

  useEffect(() => {
    if (!treasureHunt) return;
    if (!dogInteractive || effectiveDogSleeping) {
      clearTreasureHunt();
    }
  }, [clearTreasureHunt, dogInteractive, effectiveDogSleeping, treasureHunt]);

  const handleToySqueak = useCallback(
    (point) => {
      if (controlsDisabled) return;
      const itemType =
        String(point?.itemType || "toy").toLowerCase() === "food"
          ? "food"
          : "toy";
      if (itemType === "toy" && toysIgnored) return;
      const now = Date.now();
      if (now - lastToySqueakAtRef.current < 600) return;
      lastToySqueakAtRef.current = now;

      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      const rawX = Number(point?.x);
      const rawY = Number(point?.y);
      if (rect && Number.isFinite(rawX) && Number.isFinite(rawY)) {
        const xNorm = Math.max(0, Math.min(1, (rawX - rect.left) / rect.width));
        const yNorm = clampYardTapYNorm((rawY - rect.top) / rect.height);
        setAttentionTarget({ xNorm, yNorm, at: now });
      }

      const source = String(point?.source || "").toLowerCase();
      if (
        source === "drop" &&
        Number.isFinite(rawX) &&
        Number.isFinite(rawY) &&
        dragDropManagerRef.current
      ) {
        const hit = dragDropManagerRef.current.evaluateDrop({
          itemType,
          clientX: rawX,
          clientY: rawY,
          source: "inventory_drop",
        });
        if (hit?.accepted) {
          if (itemType === "food") {
            handleFeedAction("regular_kibble", "drag_drop_food");
            setUiAnimOverride("eat");
            setUiSpeedBoost(1.1);
            if (quickFeedResetRef.current) {
              window.clearTimeout(quickFeedResetRef.current);
            }
            quickFeedResetRef.current = window.setTimeout(() => {
              setUiAnimOverride("");
              setUiSpeedBoost(1);
            }, 900);
            return true;
          }
          dispatchPlayAction("toy_drop");
          return true;
        }
      }

      if (itemType === "food") return false;
      dispatchPlayAction(source === "drop" ? "toy_drop_miss" : "toy");
      return false;
    },
    [controlsDisabled, dispatchPlayAction, handleFeedAction, toysIgnored]
  );

  const handleViewportPointerDown = useCallback(
    (event) => {
      if (controlsDisabled) return;
      const ignoredTarget = Boolean(
        event?.target?.closest?.(
          "#ui-container, .ui-layer, [data-doggerz-ignore-swipe='true']"
        )
      );
      if (ignoredTarget) return;

      if (!placingBowl) {
        swipeRecognizerRef.current?.start(event);
        return;
      }
      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xNorm = Math.max(0, Math.min(1, x / rect.width));
      const yNorm = clampYardTapYNorm(y / rect.height);
      const now = Date.now();

      dispatch(
        dropFoodBowl({
          now,
          xNorm,
          yNorm,
          readyDelayMs: 800,
        })
      );

      setPlacingBowl(false);
      setInteractionOpen(false);

      // Nudge the FSM to consume soon without waiting for the next tick.
      setTimeout(() => {
        dispatch(tryConsumeFoodBowl({ now: Date.now() }));
      }, 1000);
    },
    [controlsDisabled, dispatch, placingBowl]
  );

  const handleViewportPointerMove = useCallback((event) => {
    swipeRecognizerRef.current?.move(event);
  }, []);

  const handleViewportPointerUp = useCallback((event) => {
    swipeRecognizerRef.current?.end(event);
  }, []);

  const handleViewportPointerCancel = useCallback(() => {
    swipeRecognizerRef.current?.cancel();
  }, []);

  const startAmbientEventRoute = useCallback((type, options = {}) => {
    const now = Number(options?.now || Date.now());
    const route = createAnimatedEventRoute(type, now, options);
    if (!route) return null;
    setAmbientEventRoute(route);
    setAmbientEvent({
      id: route.id,
      type: route.type,
      phase: route.phase,
      createdAt: route.createdAt,
      yNorm: route.anchor?.yNorm ?? null,
    });
    return route;
  }, []);

  const runButterflyNoticeChase = useCallback(
    ({ yNorm = 0.24 } = {}) => {
      if (!dogInteractive || controlsDisabled || effectiveDogSleeping) return;
      if (movementLocked) return;

      const now = Date.now();
      const anchorY = clamp(Number(yNorm || 0.24), 0.12, 0.68);
      const route = startAmbientEventRoute("butterfly", {
        now,
        xNorm: 0.14,
        yNorm: anchorY,
      });
      if (!route) return;
      setButterflyNoticeAt(now);
      setAttentionTarget({ xNorm: 0.14, yNorm: anchorY, at: now });
    },
    [
      controlsDisabled,
      dogInteractive,
      effectiveDogSleeping,
      movementLocked,
      startAmbientEventRoute,
    ]
  );

  useEffect(() => {
    if (!isApartmentEnvironment) return undefined;
    if (!foodBowl || String(foodBowl.surface || "") !== "low_table") {
      return undefined;
    }

    const now = Date.now();
    const stealReadyAt = Number(
      foodBowl.stealReadyAt || foodBowl.readyAt || foodBowl.placedAt || now
    );
    const delayMs = Math.max(0, stealReadyAt - now);
    const timer = window.setTimeout(() => {
      dispatch(
        tryConsumeFoodBowl({
          now: Date.now(),
          hungerThreshold: 26,
          action: "table_theft",
        })
      );
    }, delayMs + 250);

    return () => window.clearTimeout(timer);
  }, [dispatch, foodBowl, isApartmentEnvironment]);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const delayMs =
        typeof document !== "undefined" && document.visibilityState === "hidden"
          ? 15_000
          : 2_000;
      timer = window.setTimeout(() => {
        setLiveNow(Date.now());
        schedule();
      }, delayMs);
    };

    schedule();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!dogInteractive) return undefined;

    const spawnAmbientEvent = () => {
      if (effectiveDogSleeping) return;
      if (ambientEventRoute && !ambientEventRoute.done) return;

      const now = Date.now();
      const night = isNightScene;
      const triggerChance = night ? 0.05 : 0.01;
      if (Math.random() >= triggerChance) return;
      setButterflyNoticeAt(0);

      if (night) {
        const eventType = rollAmbientAnimatedEvent({ night: true });
        if (eventType === "comet") {
          startAmbientEventRoute("comet", { now, xNorm: 0.82, yNorm: 0.17 });
          setAttentionTarget({ xNorm: 0.82, yNorm: 0.17, at: now });
          return;
        }
        startAmbientEventRoute("owl", { now, xNorm: 0.18, yNorm: 0.6 });
        setAttentionTarget({ xNorm: 0.18, yNorm: 0.6, at: now });
        return;
      }

      const eventType = rollAmbientAnimatedEvent({ night: false });
      if (eventType === "leaf_gust") {
        const yNorm = 0.52 + Math.random() * 0.18;
        startAmbientEventRoute("leaf_gust", { now, xNorm: 0.36, yNorm });
        setAttentionTarget({ xNorm: 0.36, yNorm: 0.62, at: now });
        return;
      }

      runButterflyNoticeChase({ yNorm: 0.18 + Math.random() * 0.24 });
    };

    const timer = window.setInterval(spawnAmbientEvent, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [
    ambientEventRoute,
    dogInteractive,
    effectiveDogSleeping,
    isNightScene,
    runButterflyNoticeChase,
    startAmbientEventRoute,
  ]);

  useEffect(() => {
    if (!ambientEventRoute || ambientEventRoute.done) return undefined;

    const step = () => {
      const now = Date.now();
      const dogNorm = {
        xNorm: clamp(Number(dogPositionNorm.xNorm || 0.5), 0, 1),
        yNorm: clamp(Number(dogPositionNorm.yNorm || 0.74), 0, 1),
      };
      const route = stepAnimatedEventRoute(ambientEventRoute, now);

      if (!route || route.done) {
        setAmbientEvent(null);
        setAmbientEventRoute(null);
        setAmbientAnimOverride("");
        setAmbientSpeedBoost(1);
        setButterflyNoticeAt(0);
        return;
      }

      setAmbientEvent({
        id: route.id,
        type: route.type,
        phase: route.phase,
        createdAt: route.createdAt,
        yNorm: route.anchor?.yNorm ?? null,
      });

      if (route.type === "butterfly") {
        const t = clamp(
          (now - Number(route.phaseStartedAt || now)) /
            Math.max(
              1,
              Number(route.phaseEndsAt || now) -
                Number(route.phaseStartedAt || now)
            ),
          0,
          1
        );
        const chaseX = clamp(0.08 + t * 0.84, 0.05, 0.95);
        const chaseY = clamp(
          Number(route.anchor?.yNorm || 0.26) +
            Math.sin(t * Math.PI * 6) * 0.08,
          0.08,
          0.8
        );
        if (route.phase === "notice") {
          setAmbientAnimOverride("idle");
          setAmbientSpeedBoost(1);
          setButterflyNoticeAt(now);
          setAttentionTarget({
            xNorm: clamp(Number(route.anchor?.xNorm || 0.14), 0.05, 0.95),
            yNorm: clamp(Number(route.anchor?.yNorm || 0.24), 0.08, 0.8),
            at: now,
          });
        } else if (route.phase === "chase") {
          setAmbientAnimOverride("fetch");
          setAmbientSpeedBoost(1.55);
          setButterflyNoticeAt(0);
          setAttentionTarget({ xNorm: chaseX, yNorm: chaseY, at: now });
          if (shouldResolveEventByDistance(route, dogNorm)) {
            setAmbientEventRoute({ ...route, done: true });
            return;
          }
        } else {
          setAmbientAnimOverride("idle");
          setAmbientSpeedBoost(1);
        }
      } else if (route.type === "leaf_gust") {
        setAmbientAnimOverride("wag");
        setAmbientSpeedBoost(1.18);
      } else if (route.type === "owl") {
        setAmbientAnimOverride("sit");
        setAmbientSpeedBoost(1);
      } else if (route.type === "comet") {
        setAmbientAnimOverride("idle");
        setAmbientSpeedBoost(1);
      }

      setAmbientEventRoute(route);
    };

    step();
    const timer = window.setInterval(step, 140);
    return () => {
      window.clearInterval(timer);
    };
  }, [ambientEventRoute, dogPositionNorm.xNorm, dogPositionNorm.yNorm]);

  useEffect(() => {
    if (!isSummerNight) return undefined;
    if (controlsDisabled) return undefined;
    const timer = window.setInterval(() => {
      if (Math.random() >= 0.22) return;
      const now = Date.now();
      setFireflySnapAt(now);
      const xNorm = clamp(0.5 + (Math.random() * 0.2 - 0.1), 0.35, 0.75);
      const yNorm = clamp(0.64 + (Math.random() * 0.14 - 0.07), 0.5, 0.8);
      setAttentionTarget({ xNorm, yNorm, at: now });
    }, 15_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [controlsDisabled, isSummerNight]);

  useEffect(() => {
    if (
      controlsDisabled ||
      effectiveDogSleeping ||
      movementLocked ||
      treasureHunt
    )
      return;
    if (Number(dog?.stats?.energy || 0) < 10) return;

    const now = Date.now();
    const nextGate = { ...propGateRef.current };

    for (const prop of investigationProps) {
      const nearX = Math.abs(dogPositionNorm.xNorm - Number(prop.xNorm || 0));
      const nearY = Math.abs(dogPositionNorm.yNorm - Number(prop.yNorm || 0));
      const withinRange = nearX <= 0.08 && nearY <= 0.12;

      if (!withinRange) {
        nextGate[prop.id] = false;
        continue;
      }
      if (nextGate[prop.id]) continue;

      nextGate[prop.id] = true;
      if (Number(prop.interactedUntil || 0) > now) continue;
      if (Math.random() > Number(prop.triggerChance || 0.25)) continue;

      propGateRef.current = nextGate;
      startPropInvestigation(prop);
      return;
    }

    propGateRef.current = nextGate;
  }, [
    controlsDisabled,
    dog?.stats?.energy,
    dogPositionNorm.xNorm,
    dogPositionNorm.yNorm,
    effectiveDogSleeping,
    investigationProps,
    movementLocked,
    startPropInvestigation,
    treasureHunt,
  ]);

  useEffect(() => {
    if (!dogInteractive) return undefined;

    const attemptZoomies = () => {
      const hour = new Date().getHours();
      if (hour < 2 || hour >= 4) return;
      if (controlsDisabled || effectiveDogSleeping || movementLocked) return;
      if (Number(dog?.stats?.energy || 0) < 18) return;
      if (Math.random() >= 0.18) return;

      const now = Date.now();
      setMidnightZoomiesAt(now);
      setMidnightZoomiesBoost(2);
      setAttentionTarget({
        xNorm: dogPositionNorm.xNorm < 0.5 ? 0.88 : 0.12,
        yNorm: 0.74,
        at: now,
      });

      if (midnightZoomiesResetRef.current) {
        window.clearTimeout(midnightZoomiesResetRef.current);
      }
      midnightZoomiesResetRef.current = window.setTimeout(() => {
        setMidnightZoomiesBoost(1);
      }, 6500);
    };

    const timer = window.setInterval(attemptZoomies, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [
    controlsDisabled,
    dog?.stats?.energy,
    dogInteractive,
    dogPositionNorm.xNorm,
    effectiveDogSleeping,
    movementLocked,
  ]);

  useEffect(() => {
    if (!effectiveDogSleeping) return;
    setAmbientEvent(null);
    setAmbientEventRoute(null);
    setAmbientAnimOverride("");
    setAmbientSpeedBoost(1);
  }, [effectiveDogSleeping]);

  useEffect(() => {
    const sleepingNow = Boolean(effectiveDogSleeping);
    const enteringSleep = sleepingNow && !wasSleepingRef.current;
    wasSleepingRef.current = sleepingNow;

    if (!sleepingNow || isApartmentEnvironment) {
      setSleepLocation(null);
      setPendingSleepWalk(null);
      return;
    }

    if (!lowEnergySleep) return;
    if (!enteringSleep && sleepLocation) return;
    if (sleepLocation) return;
    const nextSleepLocation = resolveSleepLocation();
    if (nextSleepLocation) {
      setSleepLocation(nextSleepLocation);
    }
  }, [
    effectiveDogSleeping,
    isApartmentEnvironment,
    lowEnergySleep,
    resolveSleepLocation,
    sleepLocation,
  ]);

  useEffect(() => {
    if (!dogInteractive || controlsDisabled) return;
    if (effectiveDogSleeping) return;
    if (currentEnergy > LOW_ENERGY_AUTO_SLEEP_TRIGGER) return;
    if (pendingSleepWalk) return;

    const now = Date.now();
    if (
      now - Number(lowEnergyAutoSleepAtRef.current || 0) <
      LOW_ENERGY_AUTO_SLEEP_COOLDOWN_MS
    ) {
      return;
    }
    lowEnergyAutoSleepAtRef.current = now;

    // Clear temporary event overrides so sleep animation can take over immediately.
    setAmbientEvent(null);
    setAmbientEventRoute(null);
    setAmbientAnimOverride("");
    setAmbientSpeedBoost(1);
    setUiAnimOverride("");
    setUiSpeedBoost(1);
    setButterflyNoticeAt(0);
    const nextSleepLocation = sleepLocation || resolveSleepLocation();
    if (!nextSleepLocation) return;
    setSleepLocation(nextSleepLocation);
    const targetPosition = {
      ...nextSleepLocation.position,
      id: `sleep_spot_${nextSleepLocation.mode}`,
      type: "sleep_spot",
      label:
        nextSleepLocation.mode === "doghouse" ? "Doghouse" : "Yard nap spot",
      interaction: "sleep_spot",
      interactionRadius: 24,
    };
    dispatch(
      simulationTick({
        now,
        action: "walk",
        aiState: "walk",
        aiStateUntilAt: now + 10_000,
        targetPosition,
      })
    );
    setAttentionTarget({
      xNorm: clamp(targetPosition.x / DOG_WORLD_WIDTH, 0, 1),
      yNorm: clamp(targetPosition.y / DOG_WORLD_HEIGHT, 0, 1),
      at: now,
    });
    setPendingSleepWalk({
      mode: nextSleepLocation.mode,
      targetPosition: nextSleepLocation.position,
      expiresAt: now + SLEEP_SPOT_WALK_TIMEOUT_MS,
    });
    sleepWalkRetargetAtRef.current = now;
  }, [
    controlsDisabled,
    currentEnergy,
    dispatch,
    dogInteractive,
    effectiveDogSleeping,
    pendingSleepWalk,
    resolveSleepLocation,
    sleepLocation,
  ]);

  useEffect(() => {
    if (!pendingSleepWalk) return;
    if (effectiveDogSleeping) {
      setPendingSleepWalk(null);
      return;
    }

    const now = Date.now();
    const dogX = Number(dog?.position?.x);
    const dogY = Number(dog?.position?.y);
    const targetX = Number(pendingSleepWalk?.targetPosition?.x);
    const targetY = Number(pendingSleepWalk?.targetPosition?.y);
    const hasCoordinates =
      Number.isFinite(dogX) &&
      Number.isFinite(dogY) &&
      Number.isFinite(targetX) &&
      Number.isFinite(targetY);
    const distance = hasCoordinates
      ? Math.hypot(targetX - dogX, targetY - dogY)
      : Number.POSITIVE_INFINITY;

    if (
      distance <= SLEEP_SPOT_ARRIVAL_DISTANCE ||
      now >= Number(pendingSleepWalk.expiresAt || 0)
    ) {
      dispatch(
        rest({
          now,
          action: "sleep_auto_low_energy",
          napSpotId: pendingSleepWalk.mode || "yard",
        })
      );
      setPendingSleepWalk(null);
      return;
    }

    if (
      now - Number(sleepWalkRetargetAtRef.current || 0) >=
      SLEEP_SPOT_RETARGET_COOLDOWN_MS
    ) {
      sleepWalkRetargetAtRef.current = now;
      dispatch(
        simulationTick({
          now,
          action: "walk",
          aiState: "walk",
          aiStateUntilAt: now + 7000,
          targetPosition: {
            ...pendingSleepWalk.targetPosition,
            id: `sleep_spot_${pendingSleepWalk.mode || "yard"}`,
            type: "sleep_spot",
            label:
              pendingSleepWalk.mode === "doghouse"
                ? "Doghouse"
                : "Yard nap spot",
            interaction: "sleep_spot",
            interactionRadius: 24,
          },
        })
      );
    }
  }, [
    dispatch,
    dog?.position?.x,
    dog?.position?.y,
    effectiveDogSleeping,
    pendingSleepWalk,
  ]);

  useEffect(() => {
    return () => {
      if (quickFeedResetRef.current) {
        window.clearTimeout(quickFeedResetRef.current);
      }
      if (investigationResetRef.current) {
        window.clearTimeout(investigationResetRef.current);
      }
      if (midnightZoomiesResetRef.current) {
        window.clearTimeout(midnightZoomiesResetRef.current);
      }
      setAmbientEventRoute(null);
      setAmbientEvent(null);
    };
  }, []);

  useEffect(() => {
    const { auth: initializedAuth } = initFirebase();
    const auth = initializedAuth || firebaseAuth;
    if (!auth) return undefined;
    const unsub = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!temperamentReady) {
      setTemperamentCardDismissed(false);
    }
  }, [temperamentReady]);

  const handleActionHoverAnticipation = useCallback(
    (event) => {
      if (overallLevel < 10) return;
      if (controlsDisabled) return;
      const now = Date.now();
      if (now - lastAnticipationAtRef.current < 240) return;
      lastAnticipationAtRef.current = now;

      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      if (!rect) return;
      const rawX = Number(event?.clientX);
      const rawY = Number(event?.clientY);
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;

      const xNorm = Math.max(
        0.05,
        Math.min(0.95, (rawX - rect.left) / rect.width)
      );
      const yNorm = Math.max(
        0.05,
        Math.min(0.95, (rawY - rect.top) / rect.height)
      );
      setAttentionTarget({ xNorm, yNorm, at: now });
    },
    [controlsDisabled, overallLevel]
  );

  const handleQuickFeed = useCallback(() => {
    if (controlsDisabled) return;
    const now = Date.now();

    trackFeedDog({
      feedType: "quick_feed",
      source: "quick_feed",
      stage: life?.stage || "PUPPY",
    });
    triggerActionFeedback("quick-feed");
    dispatch(quickFeed({ now }));
    setUiAnimOverride("wag");
    setUiSpeedBoost(1.15);
    setAttentionTarget({ xNorm: 0.54, yNorm: 0.7, at: now });

    if (quickFeedResetRef.current) {
      window.clearTimeout(quickFeedResetRef.current);
    }
    quickFeedResetRef.current = window.setTimeout(() => {
      setUiAnimOverride("");
      setUiSpeedBoost(1);
    }, 1400);

    const audioEnabled = settings?.audio?.enabled !== false;
    const masterVolume = clamp(
      Number(settings?.audio?.masterVolume ?? 0.8),
      0,
      1
    );
    const sfxVolume = clamp(Number(settings?.audio?.sfxVolume ?? 0.7), 0, 1);
    if (!audioEnabled || masterVolume * sfxVolume <= 0) return;

    try {
      const bark = new Audio(withBaseUrl("/audio/bark.m4a"));
      bark.volume = clamp(masterVolume * sfxVolume, 0, 1);
      bark.play().catch(() => {});
    } catch {
      // Ignore audio playback failures on unsupported environments.
    }
  }, [
    controlsDisabled,
    dispatch,
    life?.stage,
    settings?.audio?.enabled,
    settings?.audio?.masterVolume,
    settings?.audio?.sfxVolume,
    triggerActionFeedback,
  ]);

  const buildBaseShareContext = useCallback(
    () => ({
      dogName: identityDogName,
      stageLabel,
      level: overallLevel,
      bondPct: Math.round(Number(dog?.bond?.value || 0)),
      energyPct,
      personalitySummary: identity?.personalitySummary || "",
      tendencyLabels: behaviorTendencies
        .map((item) => item?.label)
        .filter(Boolean),
      styleSignature,
    }),
    [
      behaviorTendencies,
      dog?.bond?.value,
      energyPct,
      identity?.personalitySummary,
      identityDogName,
      overallLevel,
      stageLabel,
      styleSignature,
    ]
  );

  const handleShareCard = useCallback(
    async (card, { reward = false } = {}) => {
      if (!card) return;
      try {
        await shareDoggerzMoment(card, {
          shareUrl: String(
            import.meta.env.VITE_APP_SHARE_URL || "https://doggerz.app"
          ),
          onCopied: () => toast.success("Share text copied."),
        });
        if (reward && shareRewardReady) {
          dispatch(
            rewardSocialShare({ now: Date.now(), energy: 10, happiness: 3 })
          );
          toast.reward("Shared your pup. +10 energy.");
        } else {
          toast.success("Shared your moment.");
        }
        setShareMomentCard(null);
      } catch (error) {
        const message = String(error?.message || "").toLowerCase();
        if (message.includes("cancel")) return;
        toast.error("Share canceled or unavailable.");
      }
    },
    [dispatch, shareRewardReady, toast]
  );

  const handleSharePup = useCallback(() => {
    triggerActionFeedback("share-pup");
    setShareMomentCard(buildGenericPupShareCard(buildBaseShareContext()));
  }, [buildBaseShareContext, triggerActionFeedback]);

  const handleShareMemoryMoment = useCallback(() => {
    if (!memoryMoment || !isShareableMemoryMoment(memoryMoment)) return;
    setShareMomentCard(
      buildShareMomentCard(memoryMoment, buildBaseShareContext())
    );
  }, [buildBaseShareContext, memoryMoment]);

  const handleShareMasteryMoment = useCallback(() => {
    if (!masteryCelebration) return;
    setShareMomentCard(
      buildShareMomentCard(
        {
          id: `trick_mastered:${String(masteryCelebration.id || masteryCelebration.label || "trick")}`,
          type: "trick_mastered",
          payload: {
            commandLabel: masteryCelebration.label,
          },
        },
        buildBaseShareContext()
      )
    );
  }, [buildBaseShareContext, masteryCelebration]);

  const handleShareIdentityProfile = useCallback(() => {
    setShareMomentCard(
      buildShareMomentCard(
        {
          id: `identity_profile:${identity?.profileId || identityDogName}`,
          type: "identity_profile",
        },
        buildBaseShareContext()
      )
    );
  }, [buildBaseShareContext, identity?.profileId, identityDogName]);

  const funnyShareMoment = useMemo(() => {
    const key = String(dog?.lastAction || "")
      .trim()
      .toLowerCase();
    const mapping = {
      pet_zoomies: "post-pet zoomies",
      pet_side_eye: "dramatic side-eye",
      pet_doze_off: "pet-then-nap collapse",
      train_zoomies: "training zoomies",
      train_reinterpret: "freestyle obedience remix",
      train_ignore: "full command refusal",
      potty_fakeout: "potty fake-out",
      table_theft: "table snack theft",
    };
    const label = mapping[key];
    if (!label || !actionOutcomeLabel) return null;
    return {
      id: `funny_behavior:${key}:${Math.floor(Date.now() / 10000)}`,
      type: "funny_behavior",
      payload: {
        behavior: key,
        label,
        summary: actionOutcomeLabel,
      },
    };
  }, [actionOutcomeLabel, dog?.lastAction]);

  const handleShareFunnyMoment = useCallback(() => {
    if (!funnyShareMoment) return;
    setShareMomentCard(
      buildShareMomentCard(funnyShareMoment, buildBaseShareContext())
    );
  }, [buildBaseShareContext, funnyShareMoment]);

  const bottomMenuSections = useMemo(
    () => ({
      interact: {
        title: "Interactions",
        subtitle: "Daily care and fast-touch actions.",
        items: [
          {
            key: "feed",
            label: "Quick Feed",
            detail: "Top off hunger fast",
            icon: "🍖",
            progress: dockNeedMetrics.hunger,
            progressTone: "amber",
            onClick: handleQuickFeed,
            feedbackMessage: "Quick feed queued.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "quick-feed",
          },
          {
            key: "water",
            label: "Water",
            detail: "Hydrate and recover",
            icon: "💧",
            progress: dockNeedMetrics.thirst,
            progressTone: "sky",
            onClick: handleGiveWater,
            feedbackMessage: "Water ready.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "water",
          },
          {
            key: "play",
            label: "Play",
            detail: toysIgnored ? "Toys ignored right now" : "Boost happiness",
            icon: "🎾",
            progress: dockNeedMetrics.play,
            progressTone: "emerald",
            onClick: () => handlePlayAction("dock"),
            feedbackMessage: toysIgnored
              ? "Toys ignored right now."
              : "Play session starting.",
            disabled: controlsDisabled || toysIgnored,
            active: activeActionFeedbackKey === "play",
          },
          {
            key: "pet",
            label: "Pet",
            detail: "Tap-time affection",
            icon: "🖐️",
            progress: dockNeedMetrics.affection,
            progressTone: "rose",
            onClick: handleDogPetTap,
            feedbackMessage: "Petting your pup.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "pet",
          },
          {
            key: "bath",
            label: "Bath",
            detail: "Clean up grime",
            icon: "🧼",
            progress: dockNeedMetrics.hygiene,
            progressTone: "violet",
            onClick: handleBathAction,
            feedbackMessage: "Bath routine started.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "bath",
          },
          {
            key: "potty",
            label: "Potty",
            detail: pottyButtonTooltip,
            icon: "🌿",
            progress: dockNeedMetrics.potty,
            progressTone: "lime",
            onClick: handlePottyAction,
            feedbackMessage: "Potty break queued.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "potty",
          },
          {
            key: "care-sheet",
            label: "Care Menu",
            detail: "Open full interaction sheet",
            icon: "✨",
            progress: Math.max(
              dockNeedMetrics.hunger,
              dockNeedMetrics.thirst,
              dockNeedMetrics.affection
            ),
            progressTone: "gold",
            onClick: handleOpenInteractionMenu,
            feedbackMessage: "Opening interactions.",
            disabled: controlsDisabled,
            active: activeActionFeedbackKey === "interact",
          },
        ],
      },
      train: {
        title: "Training",
        subtitle: "Commands, routines, and growth systems.",
        items: [
          {
            key: "tricks",
            label: "Tricks",
            detail: pottyMasteryComplete
              ? `Open command practice · ${reliableCommandCount} reliable`
              : `Potty first · ${pottyTrackPhaseLabel}`,
            icon: "🎯",
            progress: dockNeedMetrics.training,
            progressTone: "gold",
            onClick: openTricksPicker,
            feedbackMessage: pottyMasteryComplete
              ? "Training menu ready."
              : `Potty-first progression is still ${pottyTrackPhaseLabel.toLowerCase()}.`,
            feedbackType: pottyMasteryComplete ? "info" : "warn",
            disabled: tricksLocked,
            active: activeActionFeedbackKey === "tricks",
          },
          {
            key: "voice",
            label: voiceListening ? "Listening..." : "Voice Train",
            detail: voiceSupported
              ? "Speech-based training"
              : "Voice unavailable",
            icon: "🎙️",
            progress: dockNeedMetrics.training,
            progressTone: "sky",
            onClick: handleVoiceTrainTap,
            feedbackMessage: voiceListening
              ? "Voice training live."
              : "Starting voice training.",
            disabled:
              controlsDisabled ||
              !voiceInputEnabled ||
              !pottyMasteryComplete ||
              !voiceSupported,
            active: activeActionFeedbackKey === "voice-train",
          },
          {
            key: "skill-tree",
            label: "Skill Tree",
            detail: "Perks and permanent growth",
            icon: "🌟",
            onClick: () => handleOpenRoute(PATHS.SKILL_TREE),
            feedbackMessage: "Opening skill tree.",
            route: PATHS.SKILL_TREE,
          },
          {
            key: "potty-guide",
            label: "Potty Guide",
            detail: `${pottyTrackPhaseLabel} · ${pottyTrainingSuccessCount}/${pottyTrainingGoal} clean wins`,
            icon: "🪴",
            onClick: () => handleOpenRoute(PATHS.POTTY),
            feedbackMessage: "Opening potty guide.",
            route: PATHS.POTTY,
          },
        ],
      },
      journey: {
        title: "Journey",
        subtitle: "Progress pages, story, and social loop.",
        items: [
          {
            key: "progress-path",
            label: "Progress Path",
            detail: nextProgressionMilestone?.title
              ? nextProgressionMilestone.title
              : obedienceTrainingUnlocked
                ? `${masteredCommandCount} mastered · ${reliableCommandCount} reliable`
                : `Potty-first track · ${pottyTrackPhaseLabel}`,
            icon: nextProgressionMilestone?.icon || "🧭",
            progress: clamp(
              pottyMasteryComplete
                ? masteredCommandCount * 20
                : pottyTrainingPct,
              0,
              100
            ),
            progressTone: nextProgressionMilestone?.tone || "emerald",
            onClick: () => handleOpenRoute(PATHS.MEMORIES),
            feedbackMessage: nextProgressionMilestone?.title
              ? `Tracking: ${nextProgressionMilestone.title}.`
              : "Opening progress history.",
            route: PATHS.MEMORIES,
          },
          {
            key: "store",
            label: "Store",
            detail: "Cosmetics and rewards",
            icon: "🛍️",
            onClick: () => handleOpenRoute(PATHS.STORE),
            feedbackMessage: "Opening store.",
            route: PATHS.STORE,
          },
          {
            key: "memories",
            label: "Memories",
            detail: "Milestones and moments",
            icon: "📖",
            onClick: () => handleOpenRoute(PATHS.MEMORIES),
            feedbackMessage: "Opening memories.",
            route: PATHS.MEMORIES,
          },
          {
            key: "dreams",
            label: "Dreams",
            detail: "Sleep journal and motifs",
            icon: "🌙",
            onClick: () => handleOpenRoute(PATHS.DREAMS),
            feedbackMessage: "Opening dreams.",
            route: PATHS.DREAMS,
          },
          {
            key: "temperament",
            label: "Temperament",
            detail: temperamentPageAvailable
              ? "Open archetype card"
              : "Unlocks after more play",
            icon: "🧬",
            onClick: () => handleOpenRoute(PATHS.TEMPERAMENT_REVEAL),
            feedbackMessage: temperamentPageAvailable
              ? "Opening temperament."
              : "Temperament unlock is not ready yet.",
            feedbackType: temperamentPageAvailable ? "info" : "warn",
            route: PATHS.TEMPERAMENT_REVEAL,
            disabled: !temperamentPageAvailable,
          },
          {
            key: "share",
            label: "Share Pup",
            detail: "Rewarded social share",
            icon: "📤",
            onClick: handleSharePup,
            feedbackMessage: "Preparing share card.",
            feedbackHaptic: "success",
            active: activeActionFeedbackKey === "share-pup",
          },
          {
            key: "menu",
            label: "Menu",
            detail: "Utilities and app links",
            icon: "☰",
            onClick: () => handleOpenRoute(PATHS.MENU),
            feedbackMessage: "Opening menu.",
            route: PATHS.MENU,
          },
        ],
      },
      settings: {
        title: "Settings",
        subtitle: "Preferences, support, and app controls.",
        items: [
          {
            key: "settings",
            label: "Settings",
            detail: "Audio, gameplay, storage",
            icon: "⚙️",
            onClick: () => handleOpenRoute(PATHS.SETTINGS),
            feedbackMessage: "Opening settings.",
            route: PATHS.SETTINGS,
          },
          {
            key: "help",
            label: "Help",
            detail: "Support and troubleshooting",
            icon: "❓",
            onClick: () => handleOpenRoute(PATHS.HELP),
            feedbackMessage: "Opening help.",
            route: PATHS.HELP,
          },
          {
            key: "about",
            label: "About",
            detail: "What Doggerz is",
            icon: "ℹ️",
            onClick: () => handleOpenRoute(PATHS.ABOUT),
            feedbackMessage: "Opening about page.",
            route: PATHS.ABOUT,
          },
        ],
      },
    }),
    [
      activeActionFeedbackKey,
      controlsDisabled,
      dockNeedMetrics,
      handleBathAction,
      handleDogPetTap,
      handleGiveWater,
      handleOpenInteractionMenu,
      handleOpenRoute,
      handlePlayAction,
      handlePottyAction,
      handleQuickFeed,
      handleSharePup,
      handleVoiceTrainTap,
      openTricksPicker,
      pottyButtonTooltip,
      pottyMasteryComplete,
      pottyTrackPhaseLabel,
      pottyTrainingGoal,
      pottyTrainingPct,
      pottyTrainingSuccessCount,
      reliableCommandCount,
      masteredCommandCount,
      obedienceTrainingUnlocked,
      nextProgressionMilestone?.icon,
      nextProgressionMilestone?.title,
      nextProgressionMilestone?.tone,
      temperamentPageAvailable,
      toysIgnored,
      tricksLocked,
      voiceInputEnabled,
      voiceListening,
      voiceSupported,
    ]
  );

  const handleBottomMenuSelect = useCallback(
    (tabId) => {
      const normalizedTabId = String(tabId || "")
        .trim()
        .toLowerCase();
      const tabMeta = bottomMenuTabs.find((tab) => tab.id === normalizedTabId);
      if (normalizedTabId === "train" && pottyMasteryComplete) {
        void triggerDockFeedback({
          key: "tricks-tab",
          message: "Tricks menu ready.",
          inStageFeedback: {
            key: "tricks",
            label: "Tricks",
            message: "Training menu ready.",
            icon: tabMeta?.icon || "🎩",
            tone: "amber",
          },
        });
        openTricksPicker();
        return;
      }
      const tabCopy = bottomMenuSections?.[normalizedTabId];
      const closing = bottomMenuCategory === normalizedTabId;
      const stageMessage = closing
        ? "Dock collapsed."
        : `${tabCopy?.title || tabMeta?.label || "Menu"} ready.`;
      void triggerDockFeedback({
        key: normalizedTabId || "dock",
        message: stageMessage,
        inStageFeedback: {
          key: normalizedTabId,
          label: tabCopy?.title || tabMeta?.label || "Menu",
          message: stageMessage,
          icon: tabMeta?.icon || "✨",
          tone:
            normalizedTabId === "settings"
              ? "sky"
              : normalizedTabId === "journey"
                ? "emerald"
                : normalizedTabId === "train"
                  ? "amber"
                  : "neutral",
        },
      });
      setBottomMenuCategory((current) =>
        current === normalizedTabId ? "" : normalizedTabId
      );
    },
    [
      bottomMenuCategory,
      bottomMenuSections,
      bottomMenuTabs,
      openTricksPicker,
      pottyMasteryComplete,
      triggerDockFeedback,
    ]
  );

  const stageStatusPills = useMemo(
    () => [
      {
        label: "Affection",
        value: `${affectionPct}%`,
        detail: "Low affection makes your pup clingy or withdrawn.",
        tone:
          affectionPct <= 20 ? "danger" : affectionPct <= 40 ? "pending" : "ok",
      },
      {
        label: "Hunger",
        value: `${hungerPct}%`,
        detail: "High hunger makes begging and food-seeking more likely.",
        tone: hungerPct >= 85 ? "danger" : hungerPct >= 65 ? "pending" : "ok",
      },
      {
        label: "Thirst",
        value: `${thirstPct}%`,
        detail: "High thirst shifts behavior toward water and slower play.",
        tone: thirstPct >= 85 ? "danger" : thirstPct >= 65 ? "pending" : "ok",
      },
      {
        label: "Energy",
        value: `${energyPct}%`,
        detail: "Low energy slows the day down and pushes rest behavior.",
        tone: energyPct <= 20 ? "danger" : energyPct <= 40 ? "pending" : "ok",
      },
      {
        label: "Clean",
        value: `${cleanlinessPct}%`,
        detail: "Low cleanliness causes scratching, itchiness, and discomfort.",
        tone:
          cleanlinessPct <= 20
            ? "danger"
            : cleanlinessPct <= 40
              ? "pending"
              : "ok",
      },
      {
        label: "Potty",
        value: `${pottyNeedPct}%`,
        detail: pottyMasteryComplete
          ? "Even trained pups pace when the potty meter climbs."
          : `${pottyTrainingSuccessCount}/${pottyTrainingGoal} clean wins logged so far.`,
        tone:
          pottyNeedPct >= 88 ? "danger" : pottyNeedPct >= 70 ? "pending" : "ok",
      },
      {
        label: "Save",
        value: cloudSyncUi.label,
        detail:
          cloudSyncUi.detail ||
          (isLoggedIn ? "Cloud save active." : "Saved on this device."),
        tone:
          cloudSyncUi.tone === "ok"
            ? "ok"
            : cloudSyncUi.tone === "pending" || cloudSyncUi.tone === "warning"
              ? "pending"
              : "sky",
      },
    ],
    [
      affectionPct,
      cloudSyncUi.detail,
      cloudSyncUi.label,
      cloudSyncUi.tone,
      cleanlinessPct,
      energyPct,
      hungerPct,
      isLoggedIn,
      pottyMasteryComplete,
      pottyTrainingGoal,
      pottyTrainingSuccessCount,
      pottyNeedPct,
      thirstPct,
    ]
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="main-scroll-container relative z-20 mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+124px)] sm:gap-4">
        <GameTopBar
          dogName={dog?.name || "Doggerz Pup"}
          dogStage={stageLabel || "Puppy"}
          conditionLabel={displayMoodLabel || "Content"}
          conditionTone={displayMoodTone}
          conditionHint={displayMoodHint}
          avatarSrc={dog?.profileImage || dog?.avatar || ""}
          coins={Number(dog?.currency?.coins || dog?.coins || 0)}
          gems={Number(dog?.currency?.gems || dog?.gems || 0)}
          level={Number(overallLevel || 1)}
          xp={levelProgress.inLevelXp}
          xpMax={levelProgress.levelSpan}
          saveLabel={cloudSyncUi.label}
          saveDetail={cloudSyncUi.detail}
          saveTone={cloudSyncUi.tone}
          saveHint={cloudSyncUi.reassurance}
          onOpenSettings={() => setBottomMenuCategory("settings")}
          onOpenShop={() => navigate(PATHS.STORE)}
        />
        <div className="pup-card flex min-h-0 flex-1 flex-col rounded-[28px] px-3 pb-4 sm:px-6 sm:pb-6">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className={statsStackClassName}>
              {activeAnimatedEventMeta || actionOutcomeLabel ? (
                <div className="game-card event-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="m-0 text-[1.1rem] font-black uppercase tracking-[0.08em] text-[var(--text-main)]">
                        {activeAnimatedEventMeta?.label || "Yard Event"}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        {actionOutcomeLabel ||
                          `Watch the yard. ${activeAnimatedEventMeta?.label || "Something"} is happening right now.`}
                      </p>
                    </div>
                    {funnyShareMoment ? (
                      <button
                        type="button"
                        onClick={handleShareFunnyMoment}
                        className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88 transition hover:bg-black/30"
                      >
                        Share Moment
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <h2 className="m-0 text-2xl font-black tracking-tight text-white">
                Pup Stats
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatBarCard
                  label="Energy"
                  value={energyPct}
                  color="var(--energy-color)"
                  critical={energyCritical}
                  popped={poppedStats.energy}
                />
                <StatBarCard
                  label="Health"
                  value={healthPct}
                  color="var(--health-color)"
                  critical={healthCritical}
                  popped={poppedStats.health}
                />
              </div>
              <div className="text-xs text-doggerz-paw/80">
                Bond: {bondPct}% • Hunger: {hungerPct}% • Age: {agePillValue}
              </div>
              <div
                className={`game-card rounded-2xl border px-4 py-4 ${identityFlavorToneClass}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                      Today With {identityDogName}
                    </div>
                    <div className="mt-1 text-base font-black">
                      {dailyFlavorTitle}
                    </div>
                    <div className="mt-2 text-[11px] leading-5 opacity-90">
                      {dailyFlavorBody}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                      Daily Read
                    </div>
                    <button
                      type="button"
                      onClick={handleShareIdentityProfile}
                      className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88 transition hover:bg-black/30"
                    >
                      Share Pup
                    </button>
                  </div>
                </div>
                {favoriteReadouts.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {favoriteReadouts.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-full border border-white/12 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85"
                      >
                        <span className="text-white/55">{item.label}</span>{" "}
                        {item.value}
                      </div>
                    ))}
                  </div>
                ) : null}
                {behaviorTendencies.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {behaviorTendencies.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-full border border-emerald-200/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-50"
                        title={item.summary || item.label}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                ) : null}
                {identitySignatureReadouts.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {identitySignatureReadouts.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-full border border-white/12 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85"
                      >
                        <span className="text-white/55">{item.label}</span>{" "}
                        {item.value}
                      </div>
                    ))}
                  </div>
                ) : null}
                {identity?.personalitySummary ? (
                  <div className="mt-3 text-[11px] leading-5 text-white/72">
                    {identity.personalitySummary}
                  </div>
                ) : null}
              </div>
              <div
                className={`game-card rounded-2xl border px-4 py-4 ${cadenceToneClass}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                      Care Cadence
                    </div>
                    <div className="mt-1 text-base font-black">
                      {cadenceModel?.dailyMoment?.title || "Daily Check-in"}
                    </div>
                    <div className="mt-2 text-[11px] leading-5 opacity-90">
                      {cadenceModel?.dailyMoment?.body ||
                        "Small care moments keep your dog’s day feeling steady."}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                    {cadenceModel?.dailyMoment?.windowLabel ||
                      cadenceModel?.routineTheme?.label ||
                      "Routine"}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                    <div className="text-[9px] text-white/60">
                      Rotating Event
                    </div>
                    <div className="mt-1 text-[11px] text-white">
                      {cadenceModel?.rotatingEvent?.label || "Daily Care"}
                    </div>
                    <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-white/70">
                      {cadenceModel?.rotatingEvent?.detail ||
                        "Small rotating moments keep return visits from feeling repetitive."}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                    <div className="text-[9px] text-white/60">Theme</div>
                    <div className="mt-1 text-[11px] text-white">
                      {cadenceModel?.routineTheme?.summary ||
                        "Steady rituals build trust."}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                    <div className="text-[9px] text-white/60">
                      Occasional Surprise
                    </div>
                    <div className="mt-1 text-[11px] text-white">
                      {cadenceModel?.surprise?.label || "Small surprise"}
                    </div>
                    <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-white/70">
                      {cadenceSurpriseDetail}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/15 px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                        Habit Loop
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-white">
                        {habitLoopModel.label}
                      </div>
                      <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-white/70">
                        {habitLoopModel.detail}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                      {Math.max(0, Number(habitLoopModel.streakDays || 0))}d
                      streak
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                    <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                      {Math.max(0, Number(habitLoopModel.completedCount || 0))}
                      /3 care touches
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                      {habitLoopModel.surpriseReady
                        ? "surprise warmed"
                        : `${Math.max(0, Number(habitLoopModel.surprisePct || 0))}% surprise`}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/15 px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                        Live Update
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-white">
                        {liveContent.bulletin.title}
                      </div>
                      <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-white/70">
                        {liveContent.bulletin.body}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                      {liveContent.seasonalDrop.label}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  <div className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                    {cadenceModel?.dayKey || "Today"}
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                    {cadenceModel?.routineTheme?.label || "Routine"}
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                    {Math.max(
                      0,
                      Number(cadenceModel?.surprise?.readinessPct || 0)
                    )}
                    % surprise warmth
                  </div>
                  {retentionInsightLabel ? (
                    <div className="rounded-full border border-emerald-200/25 bg-emerald-400/10 px-2.5 py-1 text-emerald-50">
                      {retentionInsightLabel}
                    </div>
                  ) : null}
                </div>
              </div>
              <div
                className={`game-card rounded-2xl border px-4 py-4 ${lifecycleCardToneClass}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                      Growth
                    </div>
                    <div className="mt-1 text-base font-black">
                      {stageLabel} • {stageHeadline}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold opacity-90">
                      {stageSummary}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                    {ageBucketLabel}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/35">
                  <div
                    className="h-full rounded-full bg-white/80 transition-[width] duration-300"
                    style={{ width: `${stageProgressPct}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                    <div className="text-[9px] text-white/60">
                      Stage Progress
                    </div>
                    <div className="mt-1 text-[11px] text-white">
                      {stageProgressLabel}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                    <div className="text-[9px] text-white/60">
                      Next Milestone
                    </div>
                    <div className="mt-1 text-[11px] text-white">
                      {nextStageCountdown}
                    </div>
                  </div>
                </div>
                {stageDetail ? (
                  <div className="mt-3 text-[11px] text-white/75">
                    {stageDetail}
                  </div>
                ) : null}
                {goldenYearsActive ? (
                  <div className="mt-3 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-[11px] font-semibold text-amber-50">
                    Golden Years active — rescue checks are suspended for the
                    final stretch to Rainbow Bridge.
                  </div>
                ) : null}
              </div>
              {showPottyTrainingProgress ? (
                <PottyTrainingCard
                  successCount={pottyTrainingSuccessCount}
                  goal={pottyTrainingGoal}
                  progressPct={pottyTrainingPct}
                  copy={pottyTrainingCopy}
                />
              ) : null}
              {actionOutcomeLabel ? (
                <div className="rounded-xl border border-doggerz-leaf/35 bg-doggerz-neon/10 px-3 py-2 text-xs font-semibold text-doggerz-bone">
                  {actionOutcomeLabel}
                </div>
              ) : null}
              {isApartmentEnvironment ? (
                <div className="rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-50">
                  Apartment hard mode: food left on the low table can be stolen.
                </div>
              ) : null}
              {activeInvestigationLabel ? (
                <div className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50">
                  Investigating the {activeInvestigationLabel}.
                </div>
              ) : null}
              {showMidnightZoomies ? (
                <div className="rounded-xl border border-fuchsia-300/35 bg-fuchsia-300/10 px-3 py-2 text-xs font-semibold text-fuchsia-50">
                  Midnight zoomies.
                </div>
              ) : null}
            </div>

            <div className={yardRegionClassName}>
              {showRunawayLetter ? (
                <RunawayLetterPanel
                  dogName={dog?.name || "Your pup"}
                  endTimestamp={runawayState.runawayEndTimestamp}
                  onWelcome={() =>
                    dispatch(resolveRunawayStrike({ now: Date.now() }))
                  }
                />
              ) : (
                <div className="flex h-full min-h-0 flex-col gap-3">
                  <div className="flex flex-col gap-3 px-3 pt-3 sm:px-6 sm:pt-4 lg:flex-row lg:items-start lg:justify-between">
                    <MoodBadge
                      label={displayMoodLabel || "Content"}
                      tone={displayMoodTone}
                      hint={displayMoodHint || "Comfortable right now."}
                      accent={displayMoodAccent}
                      badges={moodNeedBadges}
                      className="w-full max-w-[228px]"
                    />
                    <div className="w-full lg:ml-auto lg:max-w-[244px]">
                      <MemoryMomentToast
                        moment={memoryMoment}
                        onShare={
                          memoryMoment && isShareableMemoryMoment(memoryMoment)
                            ? handleShareMemoryMoment
                            : undefined
                        }
                        shareLabel="Share"
                      />
                    </div>
                  </div>
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    <DogStage
                      ref={dogViewportRef}
                      id="backyard"
                      scene={scene}
                      environment={environmentMode}
                      isNight={visualNight}
                      weather={scene?.weatherKey || weatherCondition || "clear"}
                      reduceMotion={reduceMotion}
                      dogName={dog?.name || "Your pup"}
                      stageLabel={stageLabel}
                      ageValue={agePillValue}
                      energyPct={energyPct}
                      conditionLabel={displayMoodLabel}
                      conditionTone={displayMoodTone}
                      syncLabel={cloudSyncUi.label}
                      syncDetail={
                        cloudSyncUi.detail ||
                        (isLoggedIn ? "Cloud save" : "Local save")
                      }
                      syncTone={cloudSyncUi.tone}
                      statusPills={stageStatusPills}
                      stageFeedback={stageFeedback}
                      dogPositionNorm={{
                        xNorm: clamp(
                          Number(
                            (sleepPositionOverride?.x ??
                              dog?.position?.x ??
                              DOG_WORLD_WIDTH * 0.5) / DOG_WORLD_WIDTH
                          ),
                          0,
                          1
                        ),
                        yNorm: clamp(
                          Number(
                            (sleepPositionOverride?.y ??
                              dog?.position?.y ??
                              DOG_WORLD_HEIGHT * 0.74) / DOG_WORLD_HEIGHT
                          ),
                          0,
                          1
                        ),
                        moving: Boolean(isDogMoving),
                      }}
                      investigationProps={investigationProps}
                      activePropId={activeInvestigationId}
                      onPropTap={handlePropTap}
                      pawPrints={pawPrints}
                      fireflySeeds={fireflySeeds}
                      showFireflies={isSummerNight}
                      placingBowl={placingBowl}
                      dogSleepingInDoghouse={
                        sleepInDogHouse && effectiveDogSleeping
                      }
                      dogScaleBias={sceneDogScaleBias}
                      animationSpeedMultiplier={
                        _effectiveAnimationSpeedMultiplier
                      }
                      idleAnimationIntensity={idleAnimationIntensity}
                      requestedAnimation={syncedSpriteAnim}
                      containerClassName={`yard-viewport ${visualNight ? "yard-night" : "yard-day"} relative w-full h-full min-h-0 overflow-hidden`}
                      rendererClassName="absolute inset-0 z-[22] pointer-events-none contrast-[1.03] saturate-[1.05]"
                      rendererMinHeight={null}
                      onPointerDown={handleViewportPointerDown}
                      onPointerMove={handleViewportPointerMove}
                      onPointerUp={handleViewportPointerUp}
                      onPointerCancel={handleViewportPointerCancel}
                    />
                    {!effectiveDogSleeping && !placingBowl ? (
                      <>
                        <DogToy
                          onSqueak={handleToySqueak}
                          itemType="food"
                          title="Drag food onto your pup to feed"
                          className={`absolute right-16 left-auto top-auto z-[30] h-11 w-11 ${
                            bottomMenuCategory
                              ? "bottom-[208px]"
                              : "bottom-[118px]"
                          }`}
                        />
                        <DogToy
                          onSqueak={handleToySqueak}
                          itemType="toy"
                          title="Drag toy onto your pup to play"
                          className={`absolute right-3 left-auto top-auto z-[30] h-11 w-11 ${
                            bottomMenuCategory
                              ? "bottom-[208px]"
                              : "bottom-[118px]"
                          }`}
                        />
                      </>
                    ) : null}
                    {masteryCelebration ? (
                      <div className="absolute inset-0 z-[26] flex items-center justify-center">
                        <div className="mastery-burst" aria-hidden="true" />
                        <div className="mastery-celebration-card">
                          <div className="mastery-celebration-card__eyebrow">
                            Mastery Unlocked
                          </div>
                          <div className="mastery-celebration-card__title">
                            {masteryCelebration.label}
                          </div>
                          <div className="mastery-celebration-card__rank">
                            {masteryCelebration.rank} Rank
                          </div>
                          <div className="mastery-celebration-card__perk">
                            {masteryCelebration.perk}
                          </div>
                          <div className="mt-4 flex justify-center">
                            <button
                              type="button"
                              onClick={handleShareMasteryMoment}
                              className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 transition hover:bg-black/35"
                            >
                              Share Moment
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            {shareMomentCard ? (
              <div className="fixed inset-0 z-[64] flex items-end justify-center bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.74))] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-8 sm:items-center">
                <div
                  className="absolute inset-0"
                  onClick={() => setShareMomentCard(null)}
                  aria-hidden="true"
                />
                <ShareMomentCard
                  card={shareMomentCard}
                  className="relative z-[65] w-full max-w-md"
                  onClose={() => setShareMomentCard(null)}
                  onShare={() =>
                    handleShareCard(shareMomentCard, {
                      reward: shareMomentCard?.rewardEligible === true,
                    })
                  }
                />
              </div>
            ) : null}
            {!showRunawayLetter &&
            !interactionOpen &&
            !tricksOpen &&
            !trainingLogOpen &&
            !(temperamentReady && !temperamentCardDismissed) ? (
              <div
                data-doggerz-ignore-swipe="true"
                className="ui-layer fixed inset-x-0 bottom-0 z-[56] flex justify-center px-2 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] sm:px-4"
              >
                <div className="relative w-full max-w-3xl">
                  <div className="pointer-events-none absolute inset-x-6 -top-5 h-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2),rgba(251,191,36,0)_72%)] blur-xl" />
                  <BottomMenuDock
                    activeCategory={bottomMenuCategory}
                    onSelectCategory={handleBottomMenuSelect}
                    onSelectItem={handleBottomMenuItemPress}
                    sections={bottomMenuSections}
                    tabs={bottomMenuTabs}
                    onPointerEnter={handleActionHoverAnticipation}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {temperamentReady && !temperamentCardDismissed ? (
        <TemperamentRevealCard
          copy={temperamentCardCopy}
          onLater={() => setTemperamentCardDismissed(true)}
          onReveal={() => {
            dispatch(ackTemperamentReveal({ now: Date.now() }));
            navigate(PATHS.TEMPERAMENT_REVEAL);
          }}
        />
      ) : null}
      {interactionOpen ? (
        <InteractionSheet
          onClose={closeInteractionMenu}
          onQuickFeed={() => {
            handleQuickFeed();
            closeInteractionMenu();
          }}
          onDropBowl={() => {
            setPlacingBowl(true);
            closeInteractionMenu();
          }}
          onGiveWater={() => {
            handleGiveWater();
            closeInteractionMenu();
          }}
          onPlay={() => {
            if (toysIgnored) {
              closeInteractionMenu();
              return;
            }
            handlePlayAction("sheet");
            closeInteractionMenu();
          }}
          onFeedRegular={() => {
            handleFeedAction("regular_kibble", "interaction_sheet");
            closeInteractionMenu();
          }}
          onFeedHuman={() => {
            handleFeedAction("human_food", "interaction_sheet");
            closeInteractionMenu();
          }}
          onFeedPremium={() => {
            handleFeedAction("premium_kibble", "interaction_sheet");
            closeInteractionMenu();
          }}
          premiumKibbleCount={premiumKibbleCount}
          onPet={() => {
            handleDogPetTap();
            closeInteractionMenu();
          }}
          onBath={() => {
            handleBathAction();
            closeInteractionMenu();
          }}
          onPotty={() => {
            handlePottyAction();
            closeInteractionMenu();
          }}
          onOpenTricks={() => {
            closeInteractionMenu();
            openTricksPicker();
          }}
          showTricksButton={pottyMasteryComplete}
          pottyTooltip={pottyButtonTooltip}
        />
      ) : null}
      {tricksOpen ? (
        <TricksOverlay
          commands={visibleTrickOptions}
          unlockedCount={unlockedTrickCount}
          activeCount={activeTrickCount}
          activeLimit={activeTrickLearningLimit}
          pendingCount={pendingTrickCount}
          onClose={() => setTricksOpen(false)}
          onOpenLog={() => {
            setTricksOpen(false);
            setTrainingLogOpen(true);
          }}
          onTrainCommand={(commandId) => handleTrickTrain(commandId, "button")}
        />
      ) : null}
      {trainingLogOpen ? (
        <TrainingLogOverlay
          commands={trickOptions}
          unlockedCount={unlockedTrickCount}
          masteredCount={masteredTrickIds.size}
          onClose={() => setTrainingLogOpen(false)}
        />
      ) : null}
      <style>
        {`@keyframes dgViewportRain {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-30px, 120px, 0); }
}
@keyframes dgSnowFall {
  0% { transform: translate3d(0, -8px, 0); }
  100% { transform: translate3d(-14px, 86px, 0); }
}
@keyframes dgZzzFloat {
  0% { transform: translate3d(0, 0, 0); opacity: 0.2; }
  45% { opacity: 0.95; }
  100% { transform: translate3d(0, -12px, 0); opacity: 0.15; }
}
@keyframes dgButterflyTraverse {
  0% { transform: translate3d(0, 0, 0); }
  20% { transform: translate3d(22vw, -10px, 0); }
  45% { transform: translate3d(44vw, 10px, 0); }
  70% { transform: translate3d(64vw, -6px, 0); }
  100% { transform: translate3d(92vw, 6px, 0); }
}
@keyframes dgOwlPerchPulse {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0px); }
}
@keyframes dgFireflyPulse {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}
@keyframes dgFireflyDrift {
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(4px, -5px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
@keyframes dgCometTraverse {
  0% { transform: translate3d(0, 0, 0) rotate(-16deg); opacity: 0; }
  8% { opacity: 1; }
  100% { transform: translate3d(132vw, 54px, 0) rotate(-16deg); opacity: 0; }
}
@keyframes dgLeafGust {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  6% { opacity: 0.92; }
  100% { transform: translate3d(126vw, -22px, 0) rotate(420deg); opacity: 0; }
}
@keyframes dgMasteryBurst {
  0% { transform: scale(0.72); opacity: 0; }
  22% { opacity: 0.38; }
  100% { transform: scale(1.68); opacity: 0; }
}
@keyframes dgMasteryCardIn {
  0% { transform: translate3d(0, 8px, 0) scale(0.96); opacity: 0; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
}
@keyframes dgGoldShine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.12); }
  100% { filter: brightness(1); }
}
@keyframes dgDockPressPop {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(0, 2px, 0) scale(0.965); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
.yard-viewport.yard-day {
  box-shadow: inset 0 -36px 55px rgba(16, 185, 129, 0.14);
}
.yard-viewport.yard-night {
  box-shadow: inset 0 -40px 64px rgba(30, 58, 138, 0.22);
}
.yard-viewport.yard-night [data-night-owl="true"] {
  will-change: filter;
}
.mastery-burst {
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-gold) 66%, white 6%) 0%, rgba(251,191,36,0.14) 48%, rgba(251,191,36,0) 72%);
  animation: dgMasteryBurst 1.5s ease-out forwards;
}
.mastery-celebration-card {
  max-width: min(82vw, 340px);
  border: 1px solid rgba(251, 191, 36, 0.34);
  border-radius: 20px;
  padding: 12px 16px;
  text-align: center;
  color: var(--text-main);
  background: linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.92));
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 14px 34px rgba(2,6,23,0.5), 0 0 26px rgba(251,191,36,0.14);
  animation: dgMasteryCardIn 200ms ease-out forwards, dgGoldShine 1.1s ease-in-out 0.12s 1;
}
.mastery-celebration-card__eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--accent-gold) 78%, white 12%);
}
.mastery-celebration-card__title {
  margin-top: 5px;
  font-size: 19px;
  font-weight: 900;
  line-height: 1.2;
  color: color-mix(in srgb, var(--accent-gold) 82%, white 18%);
  text-shadow: 0 0 10px rgba(251,191,36,0.18);
}
.mastery-celebration-card__rank {
  margin-top: 5px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(251,191,36,0.86);
}
.mastery-celebration-card__perk {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(229,231,235,0.9);
}
.badge-icon {
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--accent-gold) 82%, white 8%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), rgba(255,255,255,0) 46%),
    linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96));
  color: color-mix(in srgb, var(--accent-gold) 86%, white 14%);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}
.pulse-gold {
  animation: dgGoldShine 1.8s ease-in-out infinite;
}
.dock-glass-button {
  position: relative;
  isolation: isolate;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 14px 28px rgba(2,6,23,0.24);
}
.dock-pressable {
  transform-origin: 50% 50%;
}
.dock-pressable:active {
  animation: dgDockPressPop 160ms ease-out;
  transform: translate3d(0, 2px, 0) scale(0.95);
}
.badge-sit { background-position: 0px 0px; }
.badge-stay { background-position: -50px 0px; }
.badge-down { background-position: -100px 0px; }
.badge-come { background-position: -150px 0px; }
.badge-heel { background-position: -200px 0px; }
.badge-rollOver { background-position: 0px -50px; }
.badge-speak { background-position: -50px -50px; }
.badge-shake { background-position: -100px -50px; }
.badge-highFive { background-position: -150px -50px; }
.badge-wave { background-position: -200px -50px; }
.badge-spin { background-position: 0px -100px; }
.badge-jump { background-position: -50px -100px; }
.badge-bow { background-position: -100px -100px; }
.badge-playDead { background-position: -150px -100px; }
.badge-fetch { background-position: -200px -100px; }
.badge-dance { background-position: 0px -150px; }
.countdown-clock {
  font-family: "Courier New", Courier, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
}`}
      </style>
    </div>
  );
}
