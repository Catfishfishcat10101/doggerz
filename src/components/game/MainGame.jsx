// src/components/game/MainGame.jsx
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import DogToy from "@/components/dog/DogToy.jsx";
import EnvironmentScene from "@/components/game/EnvironmentScene.jsx";
import YardBackdrop from "@/components/game/YardBackdrop.jsx";
import {
  createAnimatedEventRoute,
  getAnimatedEventMeta,
  rollAmbientAnimatedEvent,
  shouldResolveEventByDistance,
  stepAnimatedEventRoute,
} from "@/components/game/animatedEvents.js";
import Tooltip from "@/components/ui/Tooltip.jsx";
import { useToast } from "@/state/toastContext.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import useCountdown from "@/hooks/useCountdown.js";
import {
  selectCloudSyncState,
  selectIsLoggedIn,
  selectUserIsFounder,
  selectUser,
} from "@/redux/userSlice.js";
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
  resolveSessionSurprise,
  resolveRunawayStrike,
  play,
  rest,
  simulationTick,
  triggerButtonHeist,
  trainObedience,
  tryConsumeFoodBowl,
} from "@/redux/dogSlice.js";
import { PATHS } from "@/routes.js";
import { selectWeatherCondition, selectWeatherDetails } from "@/redux/weatherSlice.js";
import { getRunawayStrikeState } from "@/logic/OfflineProgressCalculator.js";
import { auth as firebaseAuth, initFirebase } from "@/firebase.js";
import {
  OBEDIENCE_COMMANDS,
  getObedienceActiveLearningLimit,
  getObedienceCommand,
} from "@/logic/obedienceCommands.js";
import { getObedienceSkillMasteryPct } from "@/logic/jrtTrainingController.js";
import { createSwipeGestureRecognizer } from "@/logic/SwipeGestureRecognizer.js";
import { createDragAndDropManager } from "@/logic/DragAndDropManager.js";
import { createVoiceCommandHandler } from "@/logic/VoiceCommandHandler.js";
import { useDogGameView } from "@/hooks/useDogState.js";
import {
  startDogSimulation,
  stopDogSimulation,
} from "@/components/dog/DogSimulationEngine.js";
import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/DogWanderBehavior.js";
import { getDogEnvironmentTargets } from "@/components/dog/DogEnvironmentTargets.js";
import { withBaseUrl } from "@/utils/assetUtils.js";
import { resolveBackdropLayers } from "@/utils/backgroundLayers.js";

const DogPixiView = lazy(() => import("@/components/dog/DogPixiView.jsx"));
const SHARE_REWARD_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const DEFAULT_OWNER_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23334155'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='32' fill='url(%23bg)'/%3E%3Ccircle cx='32' cy='25' r='12' fill='%2394a3b8'/%3E%3Cpath d='M16 53c3-10 12-16 16-16s13 6 16 16' fill='%2394a3b8'/%3E%3C/svg%3E";

const ACTION_META = Object.freeze({
  Feed: {
    icon: "🍖",
    hint: "Refill hunger",
    card: "from-doggerz-leaf/35 to-doggerz-treat/20",
    edge: "border-doggerz-leaf/45",
  },
  Play: {
    icon: "🎾",
    hint: "Boost happiness",
    card: "from-doggerz-leaf/30 to-doggerz-sky/20",
    edge: "border-doggerz-sky/45",
  },
  Pet: {
    icon: "🖐️",
    hint: "Build affection",
    card: "from-doggerz-leaf/30 to-doggerz-neonSoft/20",
    edge: "border-doggerz-leaf/45",
  },
  Bath: {
    icon: "🧼",
    hint: "Clean up dirt",
    card: "from-doggerz-paw/30 to-doggerz-sky/20",
    edge: "border-doggerz-paw/45",
  },
  Potty: {
    icon: "🌿",
    hint: "Prevent accidents",
    card: "from-doggerz-leaf/35 to-doggerz-neon/20",
    edge: "border-doggerz-leaf/45",
  },
  Tricks: {
    icon: "🎯",
    hint: "Train commands",
    card: "from-doggerz-neonSoft/30 to-doggerz-leaf/25",
    edge: "border-doggerz-leaf/45",
  },
  Interact: {
    icon: "✨",
    hint: "Open interaction sheet",
    card: "from-doggerz-bone/20 to-doggerz-neon/15",
    edge: "border-doggerz-neon/40",
  },
});

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
  { id: "rusty_key", name: "Rusty Key", icon: "🔑", weight: 0.1 },
  { id: "old_bone", name: "Fossilized Bone", icon: "🦴", weight: 0.4 },
  { id: "tennis_ball", name: "Muddy Tennis Ball", icon: "🎾", weight: 0.5 },
]);
const LOW_ENERGY_SLEEP_THRESHOLD = 0;
const LOW_ENERGY_AUTO_SLEEP_TRIGGER = 0;
const LOW_ENERGY_AUTO_SLEEP_COOLDOWN_MS = 45_000;
const LOW_ENERGY_WARNING_MIN_OFFSET = 5;
const LOW_ENERGY_WARNING_MAX_OFFSET = 10;
const SLEEP_SPOT_ARRIVAL_DISTANCE = 28;
const SLEEP_SPOT_WALK_TIMEOUT_MS = 12_000;
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
      label: "Local only",
      detail: "Cloud sync off",
    };
  }

  const status = String(cloudSync?.status || "").toLowerCase();
  const lastSuccessAt = Number(cloudSync?.lastSuccessAt || 0);
  if (status === "syncing") {
    return {
      tone: "pending",
      label: "Cloud saving",
      detail: "Sync in progress",
    };
  }
  if (status === "error") {
    return {
      tone: "error",
      label: "Cloud issue",
      detail: String(cloudSync?.errorMessage || "Save failed"),
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
      label: "Cloud saved",
      detail,
    };
  }
  return {
    tone: "pending",
    label: "Cloud ready",
    detail: "Waiting for first sync",
  };
}

function isSummerMonth(ms = Date.now()) {
  const month = new Date(ms).getMonth();
  return month >= 5 && month <= 7;
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

function PawPrintSvg({ className = "" }) {
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
  const settings = useSelector(selectSettings);
  const user = useSelector(selectUser);
  const cloudSync = useSelector(selectCloudSyncState);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isFounder = useSelector(selectUserIsFounder);
  const weatherCondition = useSelector(selectWeatherCondition);
  const weatherDetails = useSelector(selectWeatherDetails);
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
  const statFeedbackTimeoutsRef = useRef({});
  const previousVitalSnapshotRef = useRef({ energy: null, health: null });
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
  const [fireflySnapAt, setFireflySnapAt] = useState(0);
  const [dogDepthNorm, setDogDepthNorm] = useState(0.5);
  const [dogPositionNorm, setDogPositionNorm] = useState({
    xNorm: 0.5,
    yNorm: 0.74,
    moving: false,
  });
  const [investigationProps, setInvestigationProps] = useState(() =>
    createInvestigationProps(dog?.yard?.environment || "apartment")
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
  const [tricksOpen, setTricksOpen] = useState(false);
  const [trainingLogOpen, setTrainingLogOpen] = useState(false);
  const [masteryCelebration, setMasteryCelebration] = useState(null);
  const [activeActionFeedbackKey, setActiveActionFeedbackKey] = useState("");
  const [poppedStats, setPoppedStats] = useState({
    energy: false,
    health: false,
  });
  const wasSleepingRef = useRef(false);
  const masteryCelebrationTimeoutRef = useRef(0);
  const [butterflyNoticeAt, setButterflyNoticeAt] = useState(0);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;
  const cleanlinessTier = String(dog?.cleanlinessTier || "").toUpperCase();
  const pawPrintsEnabled = ["DIRTY", "FLEAS", "MANGE"].includes(
    cleanlinessTier
  );
  const environmentMode = String(dog?.yard?.environment || "apartment")
    .trim()
    .toLowerCase();
  const equippedBackdropId = String(dog?.cosmetics?.equipped?.backdrop || "")
    .trim()
    .toLowerCase();
  const isApartmentEnvironment = environmentMode === "apartment";
  const environmentTargets = useMemo(
    () => getDogEnvironmentTargets(dog || {}),
    [dog]
  );

  const activeAnim = renderModel?.anim || "idle";
  const resolvedTimeBucket = String(
    scene?.timeOfDayBucket || scene?.timeOfDay || "day"
  )
    .trim()
    .toLowerCase();
  const displayTimeOfDay = toTitle(
    resolvedTimeBucket,
    String(scene?.timeOfDay || "Day")
  );
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
  const isSnowScene =
    !isApartmentEnvironment &&
    (weatherKey.includes("snow") || weatherKey.includes("sleet"));
  const isSummerNight =
    !isApartmentEnvironment && isNightScene && isSummerMonth(liveNow);
  const backdropLayers = useMemo(
    () =>
      resolveBackdropLayers({
        backdropId: equippedBackdropId,
        environment: environmentMode,
        isNight: visualNight,
        sunriseProgress: sunriseBlend,
        weather: sceneWeather,
      }),
    [equippedBackdropId, environmentMode, sceneWeather, sunriseBlend, visualNight]
  );
  const sceneAnim = activeAnim;
  const effectiveAnim = uiAnimOverride || ambientAnimOverride || sceneAnim;
  const effectiveDogSleeping = Boolean(renderModel?.isSleeping);
  const nightOwlActive = visualNight && !effectiveDogSleeping;
  const currentEnergy = Number(dog?.stats?.energy || 0);
  const lowEnergySleep = currentEnergy <= LOW_ENERGY_SLEEP_THRESHOLD;
  const sleepyWarningFloor =
    LOW_ENERGY_AUTO_SLEEP_TRIGGER + LOW_ENERGY_WARNING_MIN_OFFSET;
  const sleepyWarningCeil =
    LOW_ENERGY_AUTO_SLEEP_TRIGGER + LOW_ENERGY_WARNING_MAX_OFFSET;
  const showGettingSleepyWarning =
    !effectiveDogSleeping &&
    currentEnergy >= sleepyWarningFloor &&
    currentEnergy <= sleepyWarningCeil;
  const sleepLocationMode =
    !isApartmentEnvironment && effectiveDogSleeping
      ? sleepLocation?.mode ||
        (lowEnergySleep ? "yard" : null)
      : null;
  const sleepInDogHouse = sleepLocationMode === "doghouse";
  const sleepInYard = sleepLocationMode === "yard";
  const sleepPositionOverride =
    effectiveDogSleeping && sleepLocation?.position
      ? sleepLocation.position
      : null;
  const dogRenderPosition = sleepPositionOverride || dog?.position || null;
  const animationSpeedMultiplier = Number(
    renderModel?.animationSpeedMultiplier || 1
  );
  const effectiveAnimationSpeedMultiplier = Math.max(
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
  const holes = Array.isArray(dog?.yard?.holes) ? dog.yard.holes : [];
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
  const ageBucketLabel = String(life?.ageBucketLabel || "New pup");
  const stageHeadline = String(life?.headline || "Tiny chaos era");
  const stageSummary = String(life?.summary || "Routine matters.");
  const stageDetail = String(life?.detail || "");
  const stageProgressPct = clamp(Number(life?.stageProgressPct || 0), 0, 100);
  const stageProgressLabel = String(life?.progressLabel || "Growing");
  const nextStageLabel = String(life?.nextStageLabel || "").trim();
  const daysUntilNextStage = Number.isFinite(Number(life?.daysUntilNextStage))
    ? Number(life.daysUntilNextStage)
    : null;
  const lifecycleTone = String(life?.tone || "fresh").toLowerCase();
  const lifecycleCardToneClass =
    lifecycleTone === "warm"
      ? "border-amber-300/35 bg-amber-400/10 text-amber-50"
      : lifecycleTone === "steady"
        ? "border-sky-300/35 bg-sky-400/10 text-sky-50"
        : "border-emerald-300/35 bg-emerald-400/10 text-emerald-50";
  const moodLabel = toTitle(vitals?.moodLabel || "ok");
  const displayMoodLabel = ambientEvent?.type === "owl" ? "Curious" : moodLabel;
  const bondPct = toPct(vitals?.bondValue);
  const hungerPct = toPct(vitals?.hunger);
  const energyPct = toPct(vitals?.energy);
  const rawHealthPct = toPct(vitals?.health);
  const healthPct =
    dogInteractive && dog?.adoptedAt ? Math.max(1, rawHealthPct) : rawHealthPct;
  const energyCritical = energyPct < 20;
  const healthCritical = healthPct < 20;
  const cloudSyncUi = useMemo(
    () => formatCloudSyncLabel(cloudSync, isLoggedIn, liveNow),
    [cloudSync, isLoggedIn, liveNow]
  );
  const ownerName = useMemo(() => {
    if (!isLoggedIn) return "Catfish";
    const displayName = String(user?.displayName || "").trim();
    if (displayName) return displayName;
    const email = String(user?.email || "").trim();
    if (email.includes("@")) return email.split("@")[0];
    return "Player";
  }, [isLoggedIn, user?.displayName, user?.email]);
  const ownerAvatarUrl = useMemo(() => {
    const avatar = String(user?.avatarUrl || "").trim();
    return avatar || DEFAULT_OWNER_AVATAR;
  }, [user?.avatarUrl]);
  const pottyTrainingState =
    dog?.training?.potty && typeof dog.training.potty === "object"
      ? dog.training.potty
      : null;
  const pottyTrainingGoal = Math.max(
    1,
    Math.floor(Number(pottyTrainingState?.goal || 1))
  );
  const pottyTrainingSuccessCount = clamp(
    Math.floor(Number(pottyTrainingState?.successCount || 0)),
    0,
    pottyTrainingGoal
  );
  const pottyTrainingComplete = Boolean(pottyTrainingState?.completedAt);
  const pottyTrainingPct = Math.round(
    (pottyTrainingSuccessCount / pottyTrainingGoal) * 100
  );
  const showPottyTrainingProgress =
    Boolean(dog?.adoptedAt) && !pottyTrainingComplete;
  const pottyTrainingCopy =
    String(life?.stage || "").toUpperCase() === "PUPPY"
      ? "Finish puppy potty training before tricks unlock."
      : "Tricks stay locked until house training is finished.";
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
    pottyComplete: pottyTrainingComplete,
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
        } else if (!pottyTrainingComplete) {
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
      pottyTrainingComplete,
      unlockedTrickIds,
    ]
  );
  const trickOptionsById = useMemo(
    () => new Map(trickOptions.map((command) => [command.id, command])),
    [trickOptions]
  );
  const unlockedTrickCount = trickOptions.filter((command) => command.unlocked)
    .length;
  const activeTrickCount = trickOptions.filter(
    (command) => command.unlocked && !command.mastered
  ).length;
  const pendingTrickCount = trickOptions.filter(
    (command) => command.pendingUnlock
  ).length;
  const pottyButtonTooltip = pottyTrainingComplete
    ? "Potty routine helps avoid accidents."
    : `Potty train first: ${pottyTrainingSuccessCount}/${pottyTrainingGoal} complete.`;
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
  const showRunawayLetter =
    false;
  const controlsDisabled = !dogInteractive;
  const sceneLocationLabel = String(weatherDetails?.name || "")
    .trim()
    .replace(/\s{2,}/g, " ");

  const resolveSleepLocation = useCallback(() => {
    if (isApartmentEnvironment) return null;
    const chooseDoghouse =
      Math.random() < (isNightScene || isRainScene ? 0.72 : 0.48);
    if (chooseDoghouse) {
      return {
        mode: "doghouse",
        position: toWorldPosition(0.78, 0.79),
      };
    }
    const xNorm = clamp(0.16 + Math.random() * 0.7, 0.12, 0.9);
    const yNorm = clamp(0.73 + Math.random() * 0.1, 0.7, 0.86);
    return {
      mode: "yard",
      position: toWorldPosition(xNorm, yNorm),
    };
  }, [isApartmentEnvironment, isNightScene, isRainScene]);
  const trainingInputMode = String(settings?.trainingInputMode || "both")
    .trim()
    .toLowerCase();
  const voiceInputEnabled =
    trainingInputMode === "voice" || trainingInputMode === "both";
  const dogRenderZIndex = sleepInDogHouse
    ? 18
    : Math.max(14, Math.round(15 + dogDepthNorm * 20));
  const temperamentReady = Boolean(
    dog?.temperament?.revealReady && !dog?.temperament?.revealedAt
  );
  const activeSurprise =
    dog?.surprise?.active && typeof dog.surprise.active === "object"
      ? dog.surprise.active
      : null;
  const surpriseType = String(activeSurprise?.type || "").toUpperCase();
  const hijackedActionKey =
    surpriseType === "STOLEN_BUTTON"
      ? String(activeSurprise?.stolenAction || "")
          .trim()
          .toLowerCase()
      : "";
  const triggerActionFeedback = useCallback((key) => {
    const nextKey = String(key || "").trim().toLowerCase();
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
  }, []);
  const triggerStatPop = useCallback((key) => {
    const statKey = String(key || "").trim().toLowerCase();
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
  const isActionHijacked = useCallback(
    (actionKey) =>
      !!hijackedActionKey &&
      String(actionKey || "")
        .trim()
        .toLowerCase() === hijackedActionKey,
    [hijackedActionKey]
  );
  const tricksLocked =
    controlsDisabled || isActionHijacked("train") || !pottyTrainingComplete;

  useEffect(() => {
    if (dogInteractive && pottyTrainingComplete) return;
    setTricksOpen(false);
  }, [dogInteractive, pottyTrainingComplete]);

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
  const lastUnlockedCommandId =
    obedienceUnlockState?.lastUnlockedId || null;
  const lastUnlockedCommandAt = Number(obedienceUnlockState?.lastUnlockedAt || 0);
  const lastDreamWoofAt = Number(dog?.memory?.lastDreamWoofAt || 0);
  const showDreamBubble =
    lastDreamWoofAt > 0 && liveNow - lastDreamWoofAt <= 35_000;
  const lastGuiltyPawsAt = Number(dog?.memory?.lastGuiltyPawsAt || 0);
  const showGuiltyPaws =
    lastGuiltyPawsAt > 0 && liveNow - lastGuiltyPawsAt <= 45_000;
  const isSleepyState =
    moodLabel.toLowerCase() === "sleepy" ||
    Number(dog?.stats?.energy || 0) <= 15;
  const showFireflySnap =
    fireflySnapAt > 0 && liveNow - Number(fireflySnapAt || 0) <= 2600;
  const showMidnightZoomies =
    midnightZoomiesAt > 0 && liveNow - midnightZoomiesAt <= 7000;
  const showButterflyNotice =
    butterflyNoticeAt > 0 && liveNow - butterflyNoticeAt <= 1100;
  const activeInvestigationLabel =
    investigationProps.find((prop) => prop.id === activeInvestigationId)
      ?.label || "";
  const activeAnimatedEventType = showMidnightZoomies
    ? "midnight_zoomies"
    : showFireflySnap
      ? "firefly_snap"
      : ambientEvent?.type;
  const activeAnimatedEventMeta = useMemo(
    () => getAnimatedEventMeta(activeAnimatedEventType),
    [activeAnimatedEventType]
  );
  const treasurePhase = String(treasureHunt?.phase || "").toLowerCase();
  const showTreasurePrompt =
    treasurePhase === "sniffing" || treasurePhase === "digging";
  const showTreasureMarker = Boolean(treasureHunt);
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
    return {
      title: "2-Week Temperament Card Ready",
      summary: byPrimary[primary] || byPrimary.CHILL,
      detail: bySecondary[secondary] || bySecondary.CHILL,
      primary,
      secondary,
    };
  }, [dog?.temperament?.primary, dog?.temperament?.secondary]);

  useEffect(() => {
    return () => {
      if (actionFeedbackTimeoutRef.current) {
        window.clearTimeout(actionFeedbackTimeoutRef.current);
      }
      Object.values(statFeedbackTimeoutsRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
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
    const commandLabel = getCommandLabel(lastMasteredCommandId, "That trick");
    toast.once(
      `mastered:${lastMasteredCommandId}:${lastMasteredCommandAt}`,
      {
        type: "reward",
        message: `Mastered: ${commandLabel}.`,
        durationMs: 3200,
        haptic: true,
      },
      60_000
    );
  }, [lastMasteredCommandAt, lastMasteredCommandId, toast]);

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

  const handleDogPositionChange = useCallback(
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
        const yNorm = clamp((rawY - rect.top) / rect.height, 0, 1);
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
            "#ui-container, [data-doggerz-ignore-swipe='true'], button, input, textarea, select, a, [role='button']"
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
      if (!pottyTrainingComplete) {
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
    pottyTrainingComplete,
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
    if (!pottyTrainingComplete) {
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
    pottyTrainingComplete,
    toast,
    triggerActionFeedback,
    voiceInputEnabled,
    voiceListening,
  ]);

  const openTricksPicker = useCallback(() => {
    if (!pottyTrainingComplete) {
      toast.error("Finish potty training before teaching tricks.");
      return;
    }
    if (isActionHijacked("train")) return;
    triggerActionFeedback("tricks");
    setTrainingLogOpen(false);
    setTricksOpen(true);
  }, [
    isActionHijacked,
    pottyTrainingComplete,
    toast,
    triggerActionFeedback,
  ]);

  const handleTrickTrain = useCallback(
    (commandId, input = "button") => {
      if (!pottyTrainingComplete) {
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
      dispatch(
        trainObedience({
          now: Date.now(),
          commandId,
          input,
        })
      );
      setTricksOpen(false);
    },
    [dispatch, pottyTrainingComplete, toast, trickOptionsById]
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
      activeSurprise ||
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
    activeSurprise,
    clearTreasureHuntTimer,
    controlsDisabled,
    effectiveDogSleeping,
    environmentMode,
    movementLocked,
    treasureHunt,
  ]);

  const handleTreasureHuntTap = useCallback(() => {
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

    treasureHuntTimeoutRef.current = window.setTimeout(async () => {
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
      activeSurprise ||
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
    activeSurprise,
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
    if (!dogInteractive || effectiveDogSleeping || activeSurprise) {
      clearTreasureHunt();
    }
  }, [
    activeSurprise,
    clearTreasureHunt,
    dogInteractive,
    effectiveDogSleeping,
    treasureHunt,
  ]);

  const dispatchPlayAction = useCallback(
    (source = "button") => {
      const now = Date.now();
      lastPlayTapAtRef.current = now;
      triggerActionFeedback("play");
      dispatch(play({ now, source }));
      return now;
    },
    [dispatch, triggerActionFeedback]
  );

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
        const yNorm = Math.max(0, Math.min(1, (rawY - rect.top) / rect.height));
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
            dispatch(
              feed({
                now,
                foodType: "regular_kibble",
                source: "drag_drop_food",
              })
            );
            setUiAnimOverride("eat");
            setUiSpeedBoost(1.1);
            if (quickFeedResetRef.current) {
              window.clearTimeout(quickFeedResetRef.current);
            }
            quickFeedResetRef.current = window.setTimeout(() => {
              setUiAnimOverride("");
              setUiSpeedBoost(1);
            }, 900);
            return;
          }
          dispatchPlayAction("toy_drop");
          return;
        }
      }

      if (itemType === "food") return;
      dispatchPlayAction(source === "drop" ? "toy_drop_miss" : "toy");
    },
    [controlsDisabled, dispatch, dispatchPlayAction, toysIgnored]
  );

  const handleViewportPointerDown = useCallback(
    (event) => {
      if (controlsDisabled) return;
      const ignoredTarget = Boolean(
        event?.target?.closest?.(
          "#ui-container, [data-doggerz-ignore-swipe='true']"
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
      const yNorm = Math.max(0, Math.min(1, y / rect.height));
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
    const timer = window.setInterval(() => setLiveNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
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
            Math.max(1, Number(route.phaseEndsAt || now) - Number(route.phaseStartedAt || now)),
          0,
          1
        );
        const chaseX = clamp(0.08 + t * 0.84, 0.05, 0.95);
        const chaseY = clamp(
          Number(route.anchor?.yNorm || 0.26) + Math.sin(t * Math.PI * 6) * 0.08,
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
        setAmbientAnimOverride("bark");
        setAmbientSpeedBoost(1.08);
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
      label: nextSleepLocation.mode === "doghouse" ? "Doghouse" : "Yard nap spot",
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
    if (!dogInteractive) return undefined;
    const triggerRandomHeist = (stolenAction = "") => {
      const now = Date.now();
      dispatch(
        triggerButtonHeist({
          now,
          silenceMs: 60_000,
          stolenAction: String(stolenAction || "").trim().toLowerCase() || undefined,
        })
      );
    };

    window.triggerRandomHeist = triggerRandomHeist;
    if (window.__DOGGERZ_DEBUG__) {
      window.__DOGGERZ_DEBUG__.triggerRandomHeist = triggerRandomHeist;
    }

    return () => {
      if (window.triggerRandomHeist === triggerRandomHeist) {
        delete window.triggerRandomHeist;
      }
      if (
        window.__DOGGERZ_DEBUG__ &&
        window.__DOGGERZ_DEBUG__.triggerRandomHeist === triggerRandomHeist
      ) {
        delete window.__DOGGERZ_DEBUG__.triggerRandomHeist;
      }
    };
  }, [dispatch, dogInteractive]);

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
    settings?.audio?.enabled,
    settings?.audio?.masterVolume,
    settings?.audio?.sfxVolume,
    triggerActionFeedback,
  ]);

  const handleSharePup = useCallback(async () => {
    triggerActionFeedback("share-pup");
    const pupName = dog?.name || "my Doggerz pup";
    const shareUrl = String(
      import.meta.env.VITE_APP_SHARE_URL || "https://doggerz.app"
    );
    const shareTitle = "Meet my Doggerz pup";
    const shareText = `Check out ${pupName} in Doggerz. Lv ${overallLevel}, ${energyPct}% energy, ${Math.round(Number(dog?.bond?.value || 0))}% bond.`;

    try {
      if (Capacitor.getPlatform?.() !== "web") {
        try {
          const { Share } = await import("@capacitor/share");
          await Share.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
            dialogTitle: "Show off your pup",
          });
        } catch {
          if (typeof navigator !== "undefined" && navigator.share) {
            await navigator.share({
              title: shareTitle,
              text: `${shareText} ${shareUrl}`,
            });
          } else if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            toast.success("Share text copied.");
            return;
          } else {
            toast.error("Sharing is not available on this device.");
            return;
          }
        }
      } else if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${shareText} ${shareUrl}`,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Share text copied.");
        return;
      } else {
        toast.error("Sharing is not available on this device.");
        return;
      }
      if (shareRewardReady) {
        dispatch(
          rewardSocialShare({ now: Date.now(), energy: 10, happiness: 3 })
        );
        toast.reward("Shared your pup. +10 energy.");
      } else {
        toast.success("Shared your pup.");
      }
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("cancel")) return;
      toast.error("Share canceled or unavailable.");
    }
  }, [
    dispatch,
    dog?.bond?.value,
    dog?.name,
    energyPct,
    overallLevel,
    shareRewardReady,
    toast,
    triggerActionFeedback,
  ]);

  return (
    <div className="relative min-h-dvh">
      <EnvironmentScene
        environment={environmentMode}
        season={seasonMode}
        timeOfDay={resolvedTimeBucket}
        weather={scene?.weatherKey || "clear"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        holes={holes}
        onButterflySpotted={() => {
          runButterflyNoticeChase();
        }}
      />

      <div className="main-scroll-container relative z-20 mx-auto w-full max-w-6xl">
        <div className="pup-card rounded-[28px] sm:p-6">
          <OwnerBadge name={ownerName} avatarUrl={ownerAvatarUrl} />
          <div className="mt-3 flex items-center gap-2 text-2xl font-black tracking-tight text-doggerz-bone sm:text-3xl">
            <span>{dog?.name || "Your pup"}</span>
            {isFounder ? (
              <span className="inline-flex items-center rounded-full border border-sky-300/35 bg-sky-400/12 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-100 shadow-[0_0_20px_rgba(96,165,250,0.18)]">
                Founder
              </span>
            ) : null}
          </div>
          <div className="env-grid mt-4">
            <EnvCard
              label="Time of Day"
              value={displayTimeOfDay}
              detail={scene?.label || "Backyard"}
            />
            <EnvCard
              label="Weather"
              value={scene?.weather || "Clear"}
              detail={sceneLocationLabel || scene?.label || "Local"}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <CloudSyncChip
              label={cloudSyncUi.label}
              detail={cloudSyncUi.detail}
              tone={cloudSyncUi.tone}
            />
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <div className="order-3 space-y-4">
          {(hijackedActionKey || activeAnimatedEventMeta || actionOutcomeLabel) ? (
            <div className="game-card event-card">
              <h3 className="m-0 text-[1.1rem] font-black uppercase tracking-[0.08em] text-[var(--text-main)]">
                {hijackedActionKey
                  ? "Button Heist"
                  : activeAnimatedEventMeta?.label || "Yard Event"}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {hijackedActionKey
                  ? String(activeSurprise?.message || "").trim() ||
                    `Your pup stole "${toTitle(hijackedActionKey, "Play")}". Play fetch to get it back.`
                  : actionOutcomeLabel ||
                    `Watch the yard. ${activeAnimatedEventMeta?.label || "Something"} is happening right now.`}
              </p>
              {hijackedActionKey ? (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        resolveSessionSurprise({
                          now: Date.now(),
                          method: "fetch",
                        })
                      )
                    }
                    className="dz-touch-button rounded-xl border-0 bg-[var(--accent-gold)] px-5 py-2.5 text-sm font-black text-black"
                  >
                    PLAY FETCH
                  </button>
                </div>
              ) : null}
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
          <div className="stats-grid">
            <HudChip
              label="Level"
              value={`Lv ${overallLevel}`}
              tooltip="Overall progression level. Higher levels unlock tougher training tracks."
            />
            <HudChip
              label="Age"
              value={`${ageDays} Days`}
              tooltip="Age in days since adoption."
            />
            <HudChip
              label="Stage"
              value={stageLabel}
              tooltip="Current life stage of your pup."
            />
            <HudChip
              label="Mood"
              value={displayMoodLabel}
              tooltip="Current emotional state based on needs and events."
            />
          </div>
          <div className="text-xs text-doggerz-paw/80">
            Bond: {bondPct}% • Hunger: {hungerPct}% • {scene?.label || "Backyard"}
          </div>
          <div
            className={`game-card rounded-xl border px-3 py-3 ${lifecycleCardToneClass}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">
                  {stageLabel} era
                </div>
                <div className="mt-1 text-sm font-black">{stageHeadline}</div>
              </div>
              <div className="rounded-full border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                {ageBucketLabel}
              </div>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-white/85">
              {stageSummary}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/35">
              <div
                className="h-full rounded-full bg-white/80 transition-[width] duration-300"
                style={{ width: `${stageProgressPct}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              <span>{stageProgressLabel}</span>
              <span>
                {nextStageLabel && Number.isFinite(daysUntilNextStage)
                  ? `${daysUntilNextStage}d until ${nextStageLabel}`
                  : "Current life stage"}
              </span>
            </div>
            {stageDetail ? (
              <div className="mt-2 text-[11px] text-white/75">{stageDetail}</div>
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

          <div className="order-1 rounded-3xl border border-doggerz-leaf/35 bg-black/30 px-2 py-4 sm:px-4">
            {showRunawayLetter ? (
              <RunawayLetterPanel
                dogName={dog?.name || "Your pup"}
                endTimestamp={runawayState.runawayEndTimestamp}
                onWelcome={() =>
                  dispatch(resolveRunawayStrike({ now: Date.now() }))
                }
              />
            ) : (
              <div
                ref={dogViewportRef}
                id="backyard"
                className={`yard-viewport sprite-stage game-card !mb-0 !p-0 ${visualNight ? "yard-night" : "yard-day"} relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[24px] border border-doggerz-leaf/25 bg-black/20 sm:min-h-[420px]`}
                onPointerDown={handleViewportPointerDown}
                onPointerMove={handleViewportPointerMove}
                onPointerUp={handleViewportPointerUp}
                onPointerCancel={handleViewportPointerCancel}
              >
                <YardBackdrop
                  environment={environmentMode}
                  dogXNorm={dogPositionNorm.xNorm}
                  isNight={visualNight}
                  sunriseProgress={sunriseBlend}
                  reduceMotion={reduceMotion}
                  environmentTargets={environmentTargets}
                  activeEnvironmentTargetId={dog?.targetPosition?.id || ""}
                  props={investigationProps}
                  activePropId={activeInvestigationId}
                  onPropTap={handlePropTap}
                />
                {backdropLayers.length ? (
                  <div className="pointer-events-none absolute inset-0 z-[6]">
                    {backdropLayers.map((layer) => (
                      <div
                        key={layer.key}
                        className="absolute inset-0"
                        style={layer.style}
                      />
                    ))}
                  </div>
                ) : null}
                <div
                  id="ui-container"
                  className="absolute left-4 top-4 z-40 flex flex-col gap-2"
                >
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/55 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-doggerz-bone shadow-[0_10px_28px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                    <span id="energy-display">Energy {energyPct}%</span>
                    <span className="text-white/35">•</span>
                    <span>Bond {bondPct}%</span>
                  </div>
                </div>
                {isRainScene ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
                    style={{ opacity: 0.78 }}
                  >
                    <div
                      className="absolute -inset-[18%]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(106deg, rgba(191,219,254,0) 0px, rgba(191,219,254,0) 10px, rgba(191,219,254,0.82) 11px, rgba(191,219,254,0.82) 12px)",
                        animation: reduceMotion
                          ? "none"
                          : "dgViewportRain 0.62s linear infinite",
                      }}
                    />
                  </div>
                ) : null}
                {isSnowScene ? (
                  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-80">
                    <div
                      className="absolute -inset-[15%]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.92) 0 1.2px, transparent 1.4px)",
                        backgroundSize: "18px 18px",
                        animation: reduceMotion
                          ? "none"
                          : "dgSnowFall 1.6s linear infinite",
                      }}
                    />
                  </div>
                ) : null}
                {isSummerNight ? (
                  <div className="pointer-events-none absolute inset-0 z-[14]">
                    {fireflySeeds.map((seed) => (
                      <span
                        key={`firefly-${seed.id}`}
                        className="absolute block h-2 w-2 rounded-full"
                        style={{
                          left: `${seed.x}%`,
                          top: `${seed.y}%`,
                          background:
                            "radial-gradient(circle at center, rgba(252,211,77,0.95) 0%, rgba(250,204,21,0.18) 70%, transparent 100%)",
                          boxShadow: "0 0 10px rgba(250,204,21,0.6)",
                          animation: reduceMotion
                            ? "none"
                            : `dgFireflyPulse ${seed.duration}s ease-in-out ${seed.delay}s infinite, dgFireflyDrift ${Math.max(
                                3,
                                seed.duration + 0.8
                              )}s ease-in-out ${seed.delay}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                ) : null}
                {ambientEvent?.type === "butterfly" ? (
                  <div className="pointer-events-none absolute inset-0 z-[16] overflow-hidden">
                    <span
                      className="absolute text-2xl"
                      style={{
                        left: "-8%",
                        top: `${Math.round(Number(ambientEvent?.yNorm || 0.24) * 100)}%`,
                        transform: "translateY(-50%)",
                        animation: reduceMotion
                          ? "none"
                          : "dgButterflyTraverse 9s linear forwards",
                      }}
                    >
                      🦋
                    </span>
                  </div>
                ) : null}
                {showButterflyNotice ? (
                  <div
                    className="pointer-events-none absolute z-[22]"
                    style={{
                      left: `${Math.round(clamp(dogPositionNorm.xNorm, 0.05, 0.95) * 100)}%`,
                      top: `${Math.round(clamp(dogPositionNorm.yNorm - 0.19, 0.08, 0.86) * 100)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    aria-hidden="true"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-amber-200/55 bg-black/65 text-sm font-black text-amber-100 shadow-[0_0_20px_rgba(250,204,21,0.35)] animate-pulse">
                      !
                    </span>
                  </div>
                ) : null}
                {ambientEvent?.type === "owl" ? (
                  <div className="pointer-events-none absolute left-[17%] top-[30%] z-[16] text-2xl">
                    <span
                      style={{
                        animation: reduceMotion
                          ? "none"
                          : "dgOwlPerchPulse 2.4s ease-in-out infinite",
                      }}
                    >
                      🦉
                    </span>
                  </div>
                ) : null}
                {ambientEvent?.type === "comet" ? (
                  <div className="pointer-events-none absolute inset-0 z-[17] overflow-hidden">
                    <span className="absolute left-[-18%] top-[12%] text-2xl animate-[dgCometTraverse_4.2s_linear_forwards]">
                      ☄️
                    </span>
                  </div>
                ) : null}
                {ambientEvent?.type === "leaf_gust" ? (
                  <div className="pointer-events-none absolute inset-0 z-[17] overflow-hidden">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span
                        key={`leaf-gust-${i}`}
                        className="absolute text-lg"
                        style={{
                          left: `${-18 + i * 8}%`,
                          top: `${54 + (i % 3) * 6}%`,
                          opacity: 0.8,
                          animation: `dgLeafGust ${3.8 + i * 0.18}s linear ${i * 0.12}s forwards`,
                        }}
                      >
                        🍃
                      </span>
                    ))}
                  </div>
                ) : null}
                {pawPrints.length > 0 ? (
                  <div className="pointer-events-none absolute inset-0 z-20">
                    {pawPrints.map((print) => (
                      <span
                        key={print.id}
                        className="mud-paw-print"
                        style={{
                          left: `${Number(print.x || 0)}px`,
                          top: `${Number(print.y || 0)}px`,
                          width: `${Number(print.size || 18)}px`,
                          height: `${Number(print.size || 18)}px`,
                          transform: `translate(-50%, -50%) rotate(${Number(
                            print.rot || 0
                          )}deg)`,
                          color: print.fill,
                        }}
                      >
                        <PawPrintSvg className="h-full w-full" />
                      </span>
                    ))}
                  </div>
                ) : null}
                <Suspense
                  fallback={
                    <div className="flex h-[340px] w-full items-center justify-center rounded-3xl border border-doggerz-leaf/30 bg-black/30 text-xs uppercase tracking-[0.2em] text-doggerz-paw/80">
                      Loading Pup
                    </div>
                  }
                >
                  <div
                    className="absolute inset-0"
                    data-night-owl={nightOwlActive ? "true" : "false"}
                    style={{
                      zIndex: dogRenderZIndex,
                      filter: nightOwlActive
                        ? "drop-shadow(0 0 10px rgba(200, 230, 255, 0.32)) saturate(0.92) brightness(1.04)"
                        : undefined,
                      transition: "filter 220ms ease",
                    }}
                  >
                    <DogPixiView
                      stage={renderModel?.stage}
                      condition={renderModel?.condition}
                      anim={effectiveAnim}
                      behaviorState={dog?.aiState || "idle"}
                      position={dogRenderPosition}
                      facing={dog?.facing || "right"}
                      equippedCosmetics={dog?.cosmetics?.equipped || null}
                      width="100%"
                      height="100%"
                      scale={1.6}
                      animSpeedMultiplier={effectiveAnimationSpeedMultiplier}
                      bondValue={Number(dog?.bond?.value ?? 0)}
                      dogIsSleeping={effectiveDogSleeping}
                      onPositionChange={handleDogPositionChange}
                      onDogTap={
                        treasurePhase === "sniffing"
                          ? handleTreasureHuntTap
                          : null
                      }
                    />
                  </div>
                </Suspense>
                {masteryCelebration ? (
                  <div className="pointer-events-none absolute inset-0 z-[26] flex items-center justify-center">
                    <div className="mastery-burst" aria-hidden="true" />
                    <div className="mastery-celebration-card">
                      <div className="mastery-celebration-card__eyebrow">
                        {masteryCelebration.rank} Trick
                      </div>
                      <div className="mastery-celebration-card__title">
                        Mastered: {masteryCelebration.label}
                      </div>
                      <div className="mastery-celebration-card__perk">
                        {masteryCelebration.perk}
                      </div>
                    </div>
                  </div>
                ) : null}
                {showTreasureMarker ? (
                  <div
                    className="pointer-events-none absolute z-[24]"
                    style={{
                      left: `${Number(treasureHunt?.xNorm || 0.5) * 100}%`,
                      top: `${Number(treasureHunt?.yNorm || 0.75) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    aria-hidden="true"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-amber-200/45 bg-black/55 text-xl shadow-[0_0_28px_rgba(250,204,21,0.22)]">
                      {treasurePhase === "digging" ? "🕳️" : "❓"}
                    </div>
                  </div>
                ) : null}
                {showDreamBubble ? (
                  <div className="pointer-events-none absolute left-1/2 top-8 z-30 -translate-x-1/2 rounded-2xl border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-doggerz-bone">
                    💭 woof...
                  </div>
                ) : null}
                {showTreasurePrompt ? (
                  <div className="pointer-events-none absolute left-1/2 top-8 z-30 -translate-x-1/2 rounded-2xl border border-amber-300/45 bg-black/70 px-3 py-1 text-xs font-semibold text-amber-100 shadow-[0_10px_24px_rgba(120,53,15,0.28)]">
                    {treasurePhase === "digging"
                      ? `Digging up ${treasureHunt?.rewardName || "something"}...`
                      : "Caught a scent. Tap your pup before it disappears."}
                  </div>
                ) : null}
                {isSleepyState ? (
                  <div className="pointer-events-none absolute left-1/2 top-14 z-30 -translate-x-1/2 text-xs text-doggerz-bone/80">
                    <span className="inline-block animate-[dgZzzFloat_2.2s_ease-in-out_infinite]">
                      zZz
                    </span>
                    <span className="ml-2 inline-block animate-[dgZzzFloat_2.2s_ease-in-out_infinite_0.4s]">
                      zZz
                    </span>
                  </div>
                ) : null}
                {showGettingSleepyWarning ? (
                  <div className="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-amber-300/55 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100 shadow-[0_10px_24px_rgba(120,53,15,0.3)]">
                    getting sleepy...
                  </div>
                ) : null}
                {foodBowl ? (
                  <div
                    className="pointer-events-none absolute z-20"
                    style={{
                      left: `${foodBowl.xNorm * 100}%`,
                      top: `${foodBowl.yNorm * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    aria-hidden="true"
                  >
                    <div className="dog-bowl grid h-10 w-12 place-items-center rounded-full border border-doggerz-bone/60 bg-doggerz-bone/25 text-lg shadow-[0_8px_20px_rgba(2,6,23,0.35)]">
                      🥣
                    </div>
                    {String(foodBowl.surface || "") === "low_table" ? (
                      <div className="mt-1 whitespace-nowrap rounded-full border border-amber-300/35 bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-100">
                        theft risk
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {showGuiltyPaws ? (
                  <div className="pointer-events-none absolute bottom-12 left-5 z-30 rounded-xl border border-amber-300/45 bg-black/55 px-2 py-1 text-xs text-amber-100">
                    🥣 spilled... sorry.
                  </div>
                ) : null}
                {showFireflySnap ? (
                  <div className="pointer-events-none absolute left-1/2 top-[58%] z-30 -translate-x-1/2 rounded-full border border-amber-200/40 bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                    snap!
                  </div>
                ) : null}
                {sleepInDogHouse ? (
                  <div className="pointer-events-none absolute right-14 bottom-[18%] z-40 h-24 w-28">
                    <div
                      className="absolute inset-x-0 bottom-10 h-12"
                      style={{
                        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        background:
                          "linear-gradient(180deg, rgba(120,53,15,0.98) 0%, rgba(75,31,7,1) 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                ) : null}
                {sleepInYard ? (
                  <div className="pointer-events-none absolute left-1/2 top-[60%] z-30 -translate-x-1/2 rounded-full border border-doggerz-leaf/45 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-doggerz-bone">
                    yard nap
                  </div>
                ) : null}
                {placingBowl ? (
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-doggerz-bone">
                    {isApartmentEnvironment
                      ? "Tap the floor or low table"
                      : "Tap to place bowl"}
                  </div>
                ) : null}
                {!effectiveDogSleeping ? (
                  <>
                    <DogToy
                      onSqueak={handleToySqueak}
                      itemType="food"
                      title="Drag food onto your pup to feed"
                      className="bottom-3 right-16 left-auto top-auto z-30 h-11 w-11"
                    />
                    <DogToy
                      onSqueak={handleToySqueak}
                      itemType="toy"
                      title="Drag toy onto your pup to play"
                      className="bottom-3 right-3 left-auto top-auto z-30 h-11 w-11"
                    />
                  </>
                ) : null}
              </div>
            )}
          </div>

          {!showRunawayLetter ? (
            <div className="order-2">
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <ActionButton
                  label="Interact"
                  feedbackActive={activeActionFeedbackKey === "interact"}
                  disabled={controlsDisabled}
                  onPointerEnter={handleActionHoverAnticipation}
                  onClick={() => {
                    triggerActionFeedback("interact");
                    setInteractionOpen(true);
                  }}
                />
                <ActionButton
                  label="Play"
                  feedbackActive={activeActionFeedbackKey === "play"}
                  hijacked={isActionHijacked("play")}
                  disabled={
                    controlsDisabled || toysIgnored || isActionHijacked("play")
                  }
                  onClick={() => {
                    if (toysIgnored) return;
                    if (isActionHijacked("play")) return;
                    dispatchPlayAction("button");
                  }}
                />
                <ActionButton
                  label="Pet"
                  feedbackActive={activeActionFeedbackKey === "pet"}
                  hijacked={isActionHijacked("pet")}
                  disabled={controlsDisabled || isActionHijacked("pet")}
                  onClick={() => {
                    if (isActionHijacked("pet")) return;
                    triggerActionFeedback("pet");
                    dispatch(petDog({ now: Date.now() }));
                  }}
                />
                <ActionButton
                  label="Bath"
                  feedbackActive={activeActionFeedbackKey === "bath"}
                  hijacked={isActionHijacked("bath")}
                  disabled={controlsDisabled || isActionHijacked("bath")}
                  onClick={() => {
                    if (isActionHijacked("bath")) return;
                    triggerActionFeedback("bath");
                    dispatch(bathe({ now: Date.now() }));
                  }}
                />
                <ActionButton
                  label="Potty"
                  feedbackActive={activeActionFeedbackKey === "potty"}
                  hijacked={isActionHijacked("potty")}
                  disabled={controlsDisabled || isActionHijacked("potty")}
                  tooltip={pottyButtonTooltip}
                  onClick={() => {
                    if (isActionHijacked("potty")) return;
                    triggerActionFeedback("potty");
                    dispatch(goPotty({ now: Date.now() }));
                  }}
                />
                {pottyTrainingComplete ? (
                  <ActionButton
                    label="Tricks"
                    feedbackActive={activeActionFeedbackKey === "tricks"}
                    hijacked={isActionHijacked("train")}
                    disabled={tricksLocked}
                    onClick={openTricksPicker}
                  />
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  id="feed-button"
                  type="button"
                  onClick={handleQuickFeed}
                  disabled={controlsDisabled}
                  className={`dz-touch-button dz-touch-hover min-h-11 rounded-2xl border border-emerald-300/45 bg-gradient-to-b from-emerald-300 to-lime-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition disabled:cursor-not-allowed disabled:opacity-50 ${activeActionFeedbackKey === "quick-feed" ? "btn-feedback-pop" : ""}`}
                >
                  Quick Feed
                </button>
                <button
                  type="button"
                  onClick={handleSharePup}
                  className={`dz-touch-button dz-touch-hover min-h-11 rounded-2xl border border-cyan-300/45 bg-gradient-to-b from-cyan-300 to-sky-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.28)] transition ${activeActionFeedbackKey === "share-pup" ? "btn-feedback-pop" : ""}`}
                >
                  Share Pup
                </button>
                {voiceInputEnabled && pottyTrainingComplete ? (
                  <button
                    type="button"
                    onClick={handleVoiceTrainTap}
                    disabled={controlsDisabled || !voiceSupported}
                    className={`dz-touch-button dz-touch-hover min-h-11 rounded-2xl border border-violet-300/45 bg-gradient-to-b from-violet-300 to-fuchsia-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(167,139,250,0.28)] transition disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 col-span-2 ${activeActionFeedbackKey === "voice-train" ? "btn-feedback-pop" : ""}`}
                  >
                    {voiceListening ? "Listening..." : "Voice Train"}
                  </button>
                ) : null}
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
          onClose={() => setInteractionOpen(false)}
          onDropBowl={() => {
            setPlacingBowl(true);
            setInteractionOpen(false);
          }}
          onGiveWater={() => {
            dispatch(giveWater({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onPlay={() => {
            if (toysIgnored) {
              setInteractionOpen(false);
              return;
            }
            if (isActionHijacked("play")) {
              setInteractionOpen(false);
              return;
            }
            dispatchPlayAction("sheet");
            setInteractionOpen(false);
          }}
          onFeedRegular={() => {
            dispatch(feed({ now: Date.now(), foodType: "regular_kibble" }));
            setInteractionOpen(false);
          }}
          onFeedHuman={() => {
            dispatch(feed({ now: Date.now(), foodType: "human_food" }));
            setInteractionOpen(false);
          }}
          onFeedPremium={() => {
            dispatch(feed({ now: Date.now(), foodType: "premium_kibble" }));
            setInteractionOpen(false);
          }}
          premiumKibbleCount={premiumKibbleCount}
          onPet={() => {
            if (isActionHijacked("pet")) {
              setInteractionOpen(false);
              return;
            }
            dispatch(petDog({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onBath={() => {
            if (isActionHijacked("bath")) {
              setInteractionOpen(false);
              return;
            }
            dispatch(bathe({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onPotty={() => {
            if (isActionHijacked("potty")) {
              setInteractionOpen(false);
              return;
            }
            dispatch(goPotty({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onOpenTricks={() => {
            if (isActionHijacked("train")) {
              setInteractionOpen(false);
              return;
            }
            setInteractionOpen(false);
            openTricksPicker();
          }}
          showTricksButton={pottyTrainingComplete}
          playHijacked={isActionHijacked("play")}
          petHijacked={isActionHijacked("pet")}
          bathHijacked={isActionHijacked("bath")}
          pottyHijacked={isActionHijacked("potty")}
          trainHijacked={isActionHijacked("train")}
          pottyTooltip={pottyButtonTooltip}
        />
      ) : null}
      {tricksOpen ? (
        <TricksOverlay
          commands={trickOptions}
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
  0% { transform: scale(0.45); opacity: 0; }
  18% { opacity: 0.92; }
  100% { transform: scale(2.35); opacity: 0; }
}
@keyframes dgMasteryCardIn {
  0% { transform: translate3d(0, 12px, 0) scale(0.9); opacity: 0; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
}
@keyframes dgGoldShine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.45); }
  100% { filter: brightness(1); }
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
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-gold) 78%, white 10%) 0%, rgba(251,191,36,0.18) 46%, rgba(251,191,36,0) 72%);
  animation: dgMasteryBurst 1.9s ease-out forwards;
}
.mastery-celebration-card {
  max-width: min(78vw, 360px);
  border: 1px solid rgba(251, 191, 36, 0.42);
  border-radius: 24px;
  padding: 14px 18px;
  text-align: center;
  color: var(--text-main);
  background: linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.92));
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 18px 44px rgba(2,6,23,0.55), 0 0 44px rgba(251,191,36,0.2);
  animation: dgMasteryCardIn 220ms ease-out forwards, dgGoldShine 1.5s ease-in-out 0.1s 2;
}
.mastery-celebration-card__eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--accent-gold) 78%, white 12%);
}
.mastery-celebration-card__title {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.15;
  color: color-mix(in srgb, var(--accent-gold) 82%, white 18%);
  text-shadow: 0 0 16px rgba(251,191,36,0.24);
}
.mastery-celebration-card__perk {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(229,231,235,0.86);
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

function RunawayLetterPanel({
  dogName = "your pup",
  endTimestamp = 0,
  onWelcome,
}) {
  const countdown = useCountdown(endTimestamp);

  return (
    <div className="overflow-hidden rounded-[24px] border border-amber-300/25 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_45%),linear-gradient(180deg,rgba(24,16,10,0.96),rgba(9,8,7,0.98))] p-5 text-amber-50 shadow-[0_18px_46px_rgba(15,10,3,0.45)]">
      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200/80">
        Dear Hooman
      </div>
      <h3 className="mt-2 text-2xl font-black tracking-tight text-amber-100">
        {dogName} is on strike.
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/88">
        You were gone too long, so your dog packed a dramatic little bag and
        left you a letter instead of waiting in the yard. No coins, no XP, and
        no playtime until the cooldown burns off.
      </p>
      <div className="mt-5 inline-flex rounded-2xl border border-amber-300/30 bg-black/30 px-4 py-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
            I&apos;ll be back in
          </div>
          <div className="countdown-clock mt-1 text-3xl font-black tracking-tight text-amber-100">
            {countdown.formatted}
          </div>
          <div className="mt-1 text-xs text-amber-100/70">
            ...if I feel like it.
          </div>
        </div>
      </div>
      {countdown.isComplete ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={onWelcome}
            className="rounded-2xl border border-emerald-300/35 bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-50 shadow-[0_10px_24px_rgba(16,185,129,0.18)] hover:bg-emerald-400/20"
          >
            Welcome your dog back
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TemperamentRevealCard({ copy, onLater, onReveal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-doggerz-leaf/35 bg-black/90 p-5 text-doggerz-bone shadow-[0_20px_50px_rgba(2,6,23,0.7)]">
        <div className="text-xs uppercase tracking-[0.2em] text-doggerz-paw/90">
          Temperament Milestone
        </div>
        <h3 className="mt-2 text-xl font-black tracking-tight">
          {copy?.title}
        </h3>
        <p className="mt-3 text-sm text-doggerz-bone/85">{copy?.summary}</p>
        <p className="mt-2 text-xs text-doggerz-bone/70">{copy?.detail}</p>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
          Primary: {copy?.primary || "Unknown"} • Secondary:{" "}
          {copy?.secondary || "Unknown"}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onLater}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-doggerz-bone/80 hover:bg-white/10"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onReveal}
            className="rounded-xl border border-doggerz-leaf/45 bg-doggerz-neon/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-doggerz-bone hover:bg-doggerz-neon/30"
          >
            Open Card
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  onPointerEnter,
  disabled = false,
  hijacked = false,
  feedbackActive = false,
  tooltip = "",
}) {
  const meta = ACTION_META[label] || ACTION_META.Play;
  const tooltipText =
    tooltip ||
    (hijacked
      ? "This action is stolen. Resolve the surprise to recover it."
      : meta.hint);

  return (
    <Tooltip content={tooltipText} className="w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        className={`dz-touch-button dz-touch-hover group relative w-full overflow-hidden rounded-2xl border px-3 py-3 text-left transition active:translate-y-[1px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
          hijacked
            ? "border-amber-300/65 bg-amber-500/15"
            : `${meta.edge} bg-gradient-to-b ${meta.card}`
        } shadow-[0_10px_22px_rgba(2,6,23,0.25)] ${
          feedbackActive ? "btn-feedback-pop" : ""
        }`}
      >
        <div className="dz-touch-glow absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
        <div className="relative flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
            {hijacked ? "🕵️" : meta.icon}
          </span>
          <span>
            <span className="block text-sm font-bold text-doggerz-bone">
              {label}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
              {hijacked ? "Stolen - play fetch" : meta.hint}
            </span>
          </span>
        </div>
      </button>
    </Tooltip>
  );
}

function InteractionSheet({
  onClose,
  onDropBowl,
  onFeedRegular,
  onFeedHuman,
  onFeedPremium,
  premiumKibbleCount = 0,
  onGiveWater,
  onPlay,
  onPet,
  onBath,
  onPotty,
  onOpenTricks,
  showTricksButton = false,
  playHijacked = false,
  petHijacked = false,
  bathHijacked = false,
  pottyHijacked = false,
  trainHijacked = false,
  pottyTooltip = "",
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-[28px] border border-doggerz-leaf/30 bg-black/85 p-4 text-doggerz-bone shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
            Interactions
          </div>
          <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Premium bowls: {premiumKibbleCount}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SheetButton
            label="Feed Regular Kibble"
            icon="🦴"
            onClick={onFeedRegular}
            tooltip="Standard meal. Reliable hunger recovery."
          />
          <SheetButton
            label="Feed Human Food"
            icon="🍟"
            onClick={onFeedHuman}
            tooltip="Fast happiness spike, but not ideal as a routine diet."
          />
          <SheetButton
            label="Feed Premium Kibble"
            icon="🥩"
            onClick={onFeedPremium}
            disabled={premiumKibbleCount <= 0}
            tooltip="Best meal quality. Uses one premium bowl."
          />
          <SheetButton
            label="Drop Food Bowl"
            icon="🥣"
            onClick={onDropBowl}
            tooltip="Place a bowl in the scene so your pup can eat from it."
          />
          <SheetButton
            label="Give Water"
            icon="💧"
            onClick={onGiveWater}
            tooltip="Hydration support for mood and health."
          />
          <SheetButton
            label={playHijacked ? "Play (stolen)" : "Play"}
            icon="🎾"
            onClick={onPlay}
            disabled={playHijacked}
            tooltip={
              playHijacked
                ? "Play is currently stolen by a surprise event."
                : "Active play boosts happiness and bond."
            }
          />
          <SheetButton
            label={petHijacked ? "Pet (stolen)" : "Pet"}
            icon="🖐️"
            onClick={onPet}
            disabled={petHijacked}
            tooltip={
              petHijacked
                ? "Pet is currently stolen by a surprise event."
                : "Petting steadily increases affection."
            }
          />
          <SheetButton
            label={bathHijacked ? "Bath (stolen)" : "Bath"}
            icon="🧼"
            onClick={onBath}
            disabled={bathHijacked}
            tooltip={
              bathHijacked
                ? "Bath is currently stolen by a surprise event."
                : "Cleaning prevents hygiene-related penalties."
            }
          />
          <SheetButton
            label={pottyHijacked ? "Potty (stolen)" : "Potty"}
            icon="🌿"
            onClick={onPotty}
            disabled={pottyHijacked}
            tooltip={
              pottyHijacked
                ? "Potty is currently stolen by a surprise event."
                : pottyTooltip || "Potty routine helps avoid accidents."
            }
          />
          {showTricksButton ? (
            <SheetButton
              label={trainHijacked ? "Tricks (stolen)" : "Tricks"}
              icon="🎯"
              onClick={onOpenTricks}
              disabled={trainHijacked}
              tooltip={
                trainHijacked
                  ? "Tricks are currently stolen by a surprise event."
                  : "Open the trick list and choose a command to practice."
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PottyTrainingCard({
  successCount = 0,
  goal = 1,
  progressPct = 0,
  copy = "",
}) {
  return (
    <div className="mt-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-3 text-amber-50">
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
        <span>Potty Training</span>
        <span>
          {successCount}/{goal}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/45">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-300 transition-[width] duration-300"
          style={{ width: `${clamp(progressPct, 0, 100)}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] font-semibold text-amber-100/90">
        {copy}
      </div>
    </div>
  );
}

function TricksOverlay({
  commands = [],
  unlockedCount = 0,
  activeCount = 0,
  activeLimit = 1,
  pendingCount = 0,
  onClose,
  onOpenLog,
  onTrainCommand,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-[28px] border border-doggerz-leaf/30 bg-black/90 p-4 text-doggerz-bone shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
              Tricks
            </div>
            <div className="mt-1 text-xs text-doggerz-bone/75">
              Ready: {unlockedCount}. Active lessons: {activeCount}/{activeLimit}
            </div>
            <div className="mt-1 text-[11px] text-doggerz-bone/60">
              {pendingCount > 0
                ? `${pendingCount} more trick${pendingCount === 1 ? "" : "s"} warming up in the queue.`
                : "Pick a ready command to practice."}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount >= activeLimit ? (
              <span className="rounded-full border border-doggerz-neon/35 bg-doggerz-neon/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-doggerz-neon">
                Focus Set Full
              </span>
            ) : null}
            <button
              type="button"
              onClick={onOpenLog}
              className="dz-touch-button rounded-full border border-doggerz-leaf/35 bg-doggerz-neon/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
            >
              Training Log
            </button>
            <button
              type="button"
              onClick={onClose}
              className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
            >
              Close
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {commands.map((command) => (
            <button
              key={command.id}
              type="button"
              disabled={!command.unlocked}
              onClick={() => onTrainCommand(command.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                command.unlocked
                  ? "border-doggerz-leaf/35 bg-doggerz-neon/10 hover:bg-doggerz-neon/15"
                  : "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-doggerz-bone">
                  {command.label}
                </span>
                <span className="rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-doggerz-paw/85">
                  {command.requirementLabel}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-doggerz-bone/65">
                {command.helperText}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
                <span>{command.group || "Trick"}</span>
                <span>{command.difficultyStars}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainingLogOverlay({
  commands = [],
  unlockedCount = 0,
  masteredCount = 0,
  onClose,
}) {
  const masteredCommands = commands.filter((command) => command.mastered);
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-[28px] border border-doggerz-leaf/30 bg-[linear-gradient(180deg,rgba(2,6,23,0.97),rgba(15,23,42,0.96))] p-4 text-doggerz-bone shadow-[0_20px_50px_rgba(2,6,23,0.75)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-doggerz-paw/85">
              Training Logs
            </div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-doggerz-bone">
              Command Registry
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em]">
              <span className="rounded-full border border-doggerz-leaf/30 bg-doggerz-neon/10 px-2 py-1 text-doggerz-bone/85">
                Ready {unlockedCount}
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-amber-100/90">
                Mastered {masteredCount}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
          >
            Back
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/80">
            Hall of Fame
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {masteredCommands.length ? (
              masteredCommands.map((command) => (
                <div
                  key={`badge-${command.id}`}
                  className={`badge-icon pulse-gold badge-${command.id}`}
                  title={`Master of ${command.label}`}
                  aria-label={`Master of ${command.label}`}
                >
                  <span>{String(command.label || "").slice(0, 2).toUpperCase()}</span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-amber-50/75">
                No mastered badges yet. Finish a trick to start the wall.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 max-h-[72vh] space-y-2 overflow-y-auto pr-1">
          {commands.map((command) => (
            <div
              key={command.id}
              className={`rounded-2xl border px-3 py-3 ${
                command.mastered
                  ? "border-amber-300/35 bg-amber-400/10"
                  : command.unlocked
                    ? "border-doggerz-leaf/30 bg-white/5"
                    : "border-white/10 bg-black/35"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-doggerz-bone">
                    {command.label}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
                    <span>{command.group || "Trick"}</span>
                    <span>{command.difficultyStars}</span>
                    <span>{command.requirementLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-doggerz-bone">
                    {command.masteryPct}%
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/70">
                    Mastery
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                {command.mastered ? (
                  <div className="flex h-full items-center justify-center bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-300 text-[9px] font-black uppercase tracking-[0.16em] text-slate-950">
                    Star Mastered
                  </div>
                ) : (
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                      command.unlocked
                        ? "bg-gradient-to-r from-doggerz-neon via-doggerz-leaf to-doggerz-sky"
                        : "bg-white/25"
                    }`}
                    style={{ width: `${clamp(command.masteryPct, 0, 100)}%` }}
                  />
                )}
              </div>
              <div className="mt-3 text-[12px] leading-5 text-doggerz-bone/78">
                {command.summary || command.helperText}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-doggerz-neonSoft">
                {command.masteryRank?.label}: {command.masteryRank?.perk}
              </div>
              <div className="mt-2 text-[11px] text-doggerz-bone/60">
                {command.helperText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SheetButton({ label, icon, onClick, disabled = false, tooltip = "" }) {
  const tooltipText = tooltip || label;
  return (
    <Tooltip content={tooltipText} className="w-full" side="top">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="dz-touch-button dz-touch-hover group flex w-full items-center gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 px-3 py-3 text-left text-sm font-semibold text-doggerz-bone transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
          {icon}
        </span>
        <span className="leading-tight">{label}</span>
      </button>
    </Tooltip>
  );
}

function HudChip({ label, value, tooltip = "" }) {
  return (
    <Tooltip content={tooltip || label} className="w-full">
      <div className="stat-box w-full rounded-xl px-3 py-2">
        <div className="stat-label text-[10px] font-semibold tracking-[0.14em]">
          {label}
        </div>
        <div className="stat-value mt-0.5 text-sm font-bold">
          {value}
        </div>
      </div>
    </Tooltip>
  );
}

function EnvCard({ label, value, detail = "" }) {
  return (
    <div className="env-card">
      <span className="env-label">{label}</span>
      <span className="env-value">{value}</span>
      {detail ? (
        <div className="mt-1 text-xs text-[var(--text-muted)]">{detail}</div>
      ) : null}
    </div>
  );
}

function CloudSyncChip({ label, detail = "", tone = "muted" }) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-50"
      : tone === "error"
        ? "border-rose-300/35 bg-rose-400/10 text-rose-50"
        : tone === "pending"
          ? "border-amber-300/35 bg-amber-400/10 text-amber-50"
          : "border-white/15 bg-white/5 text-white/80";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass}`}
    >
      <span className="uppercase tracking-[0.14em]">{label}</span>
      {detail ? <span className="text-[10px] opacity-80">{detail}</span> : null}
    </div>
  );
}

function OwnerBadge({ name = "Catfish", avatarUrl = DEFAULT_OWNER_AVATAR }) {
  const [src, setSrc] = useState(avatarUrl || DEFAULT_OWNER_AVATAR);

  useEffect(() => {
    setSrc(avatarUrl || DEFAULT_OWNER_AVATAR);
  }, [avatarUrl]);

  return (
    <div className="owner-badge">
      <img
        src={src}
        alt="Owner avatar"
        className="owner-badge__avatar"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (src !== DEFAULT_OWNER_AVATAR) {
            setSrc(DEFAULT_OWNER_AVATAR);
          }
        }}
      />
      <div className="owner-badge__meta">
        <span className="owner-badge__label">Owner</span>
        <span className="owner-badge__name">{name}</span>
      </div>
    </div>
  );
}

function StatBarCard({
  label,
  value,
  color,
  critical = false,
  popped = false,
}) {
  const pct = clamp(Number(value || 0), 0, 100);
  return (
    <div
      className={`game-card stat-bar-card ${critical ? "critical-warning" : ""} ${
        popped ? "stat-pop" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="env-label !mb-0">{label}</span>
        <span className="env-label !mb-0 !text-[var(--text-main)]">{pct}%</span>
      </div>
      <div className="stat-bar-container">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
