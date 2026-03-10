// src/components/game/MainGame.jsx
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import {
  Suspense,
  lazy,
  memo,
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
import Tooltip from "@/components/ui/Tooltip.jsx";
import { useToast } from "@/state/toastContext.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import useCountdown from "@/hooks/useCountdown.js";
import {
  selectUserIsFounder,
  setZip,
  selectUserZip,
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
  resolveRunawayStrike,
  resolveSessionSurprise,
  play,
  triggerButtonHeist,
  trainObedience,
  tryConsumeFoodBowl,
} from "@/redux/dogSlice.js";
import { PATHS } from "@/routes.js";
import {
  selectWeatherCondition,
  selectWeatherDetails,
  selectWeatherError,
  selectWeatherLastFetchedAt,
  selectWeatherStatus,
  setWeatherError,
  setWeatherLoading,
  setWeatherSnapshot,
} from "@/redux/weatherSlice.js";
import { fetchRealTimeWeather } from "@/logic/RealTimeWeatherFetcher.js";
import { getRunawayStrikeState } from "@/logic/OfflineProgressCalculator.js";
import { auth as firebaseAuth, initFirebase } from "@/firebase.js";
import { getObedienceCommand } from "@/logic/obedienceCommands.js";
import { createSwipeGestureRecognizer } from "@/logic/SwipeGestureRecognizer.js";
import { createDragAndDropManager } from "@/logic/DragAndDropManager.js";
import { createVoiceCommandHandler } from "@/logic/VoiceCommandHandler.js";
import { useDogGameView } from "@/hooks/useDogState.js";
import {
  startDogSimulation,
  stopDogSimulation,
} from "@/components/dog/DogSimulationEngine.js";
import { getDogEnvironmentTargets } from "@/components/dog/DogEnvironmentTargets.js";
import { withBaseUrl } from "@/utils/assetUtils.js";

const DogPixiView = lazy(() => import("@/components/dog/DogPixiView.jsx"));
const SHARE_REWARD_COOLDOWN_MS = 12 * 60 * 60 * 1000;

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
  Train: {
    icon: "🎯",
    hint: "Level skills",
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

const SURPRISE_ACTION_LABELS = Object.freeze({
  play: "Play",
  pet: "Pet",
  bath: "Bath",
  potty: "Potty",
  train: "Train",
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

function toNightBucket(timeOfDay) {
  const key = String(timeOfDay || "").toLowerCase();
  return key === "night" || key === "evening" ? "night" : "day";
}

function isNightHour(ms = Date.now()) {
  const hour = new Date(ms).getHours();
  return hour > 19 || hour < 6;
}

function isSummerMonth(ms = Date.now()) {
  const month = new Date(ms).getMonth();
  return month >= 5 && month <= 7;
}

function getSunriseBlend(ms = Date.now()) {
  const date = new Date(ms);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const start = 6 * 60;
  const peak = 7 * 60;
  const end = 8 * 60;
  if (minutes < start || minutes >= end) return 0;
  if (minutes <= peak) return (minutes - start) / (peak - start);
  return 1 - (minutes - peak) / (end - peak);
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
  const userZip = useSelector(selectUserZip);
  const isFounder = useSelector(selectUserIsFounder);
  const weatherCondition = useSelector(selectWeatherCondition);
  const weatherStatus = useSelector(selectWeatherStatus);
  const weatherDetails = useSelector(selectWeatherDetails);
  const weatherError = useSelector(selectWeatherError);
  const weatherLastFetchedAt = useSelector(selectWeatherLastFetchedAt);
  const lastToySqueakAtRef = useRef(0);
  const lastPlayTapAtRef = useRef(Date.now());
  const lastAnticipationAtRef = useRef(0);
  const ambientEventTimeoutRef = useRef(0);
  const quickFeedResetRef = useRef(0);
  const investigationResetRef = useRef(0);
  const treasureHuntTimeoutRef = useRef(0);
  const midnightZoomiesResetRef = useRef(0);
  const lastDepthSyncRef = useRef({ at: 0, norm: 0.5 });
  const lastParallaxSyncRef = useRef({ at: 0, xNorm: 0.5, yNorm: 0.74 });
  const pawPrintIdRef = useRef(0);
  const lastPawPrintRef = useRef({ x: 0, y: 0, at: 0 });
  const propGateRef = useRef({});
  const dogViewportRef = useRef(null);
  const swipeRecognizerRef = useRef(null);
  const dragDropManagerRef = useRef(null);
  const voiceCommandHandlerRef = useRef(null);
  const dogPositionNormRef = useRef({ xNorm: 0.5, yNorm: 0.74 });
  const voiceCommandDispatchRef = useRef(() => false);
  const [, setAttentionTarget] = useState(null);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [placingBowl, setPlacingBowl] = useState(false);
  const [liveNow, setLiveNow] = useState(Date.now());
  const [zipDraft, setZipDraft] = useState(userZip || "");
  const [zipTouched, setZipTouched] = useState(false);
  const [weatherBusy, setWeatherBusy] = useState(false);
  const [temperamentCardDismissed, setTemperamentCardDismissed] =
    useState(false);
  const [pawPrints, setPawPrints] = useState([]);
  const [ambientEvent, setAmbientEvent] = useState(null);
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
  const isApartmentEnvironment = environmentMode === "apartment";
  const environmentTargets = useMemo(
    () => getDogEnvironmentTargets(dog || {}),
    [dog]
  );

  const activeAnim = renderModel?.anim || "idle";
  const sceneTime = String(scene?.timeOfDay || "").toLowerCase();
  const sceneWeather = String(
    scene?.weatherKey || scene?.weather || ""
  ).toLowerCase();
  const weatherKey = `${sceneWeather} ${String(weatherCondition || "").toLowerCase()}`;
  const localNight = isNightHour(liveNow);
  const isNightScene =
    sceneTime.includes("night") || sceneTime.includes("evening") || localNight;
  const isRainScene =
    !isApartmentEnvironment &&
    (weatherKey.includes("rain") || weatherKey.includes("storm"));
  const isSnowScene =
    !isApartmentEnvironment &&
    (weatherKey.includes("snow") || weatherKey.includes("sleet"));
  const isSummerNight =
    !isApartmentEnvironment && localNight && isSummerMonth(liveNow);
  const sunriseBlend = getSunriseBlend(liveNow);
  const forceSleepForScene = isNightScene && isRainScene;
  const sceneAnim = forceSleepForScene ? "deep_rem_sleep" : activeAnim;
  const effectiveAnim = uiAnimOverride || ambientAnimOverride || sceneAnim;
  const effectiveDogSleeping =
    Boolean(renderModel?.isSleeping) || forceSleepForScene;
  const sleepInDogHouse =
    !isApartmentEnvironment &&
    effectiveDogSleeping &&
    (isNightScene || isRainScene);
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
  const moodLabel = toTitle(vitals?.moodLabel || "ok");
  const displayMoodLabel = ambientEvent?.type === "owl" ? "Curious" : moodLabel;
  const hungerPct = toPct(vitals?.hunger);
  const energyPct = toPct(vitals?.energy);
  const healthPct = toPct(vitals?.health);
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
    Boolean(dog?.adoptedAt) &&
    dogInteractive &&
    (runawayState.shouldTrigger || runawayState.hasPendingReturn);
  const zipIsValid = /^\d{5}$/.test(String(zipDraft || "").trim());
  const effectiveZip = userZip || zipDraft || "65401";
  const controlsDisabled = !dogInteractive || showRunawayLetter;
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
  const hijackedActionLabel =
    SURPRISE_ACTION_LABELS[hijackedActionKey] || "Action";
  const isActionHijacked = useCallback(
    (actionKey) =>
      !!hijackedActionKey &&
      String(actionKey || "")
        .trim()
        .toLowerCase() === hijackedActionKey,
    [hijackedActionKey]
  );

  useEffect(() => {
    if (!dogInteractive || showRunawayLetter) {
      stopDogSimulation();
      return undefined;
    }
    startDogSimulation(store);
    return () => {
      stopDogSimulation();
    };
  }, [dogInteractive, showRunawayLetter, store]);

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
  const activeInvestigationLabel =
    investigationProps.find((prop) => prop.id === activeInvestigationId)
      ?.label || "";
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

      const command = getObedienceCommand(commandId);
      const resolvedCommandId = command?.id || "sit";
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
  }, [controlsDisabled, dispatch, isActionHijacked, toast, voiceInputEnabled]);

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
    const handler = voiceCommandHandlerRef.current;
    if (!handler || !handler.isSupported()) {
      toast.error("Voice commands are not available on this device.");
      return;
    }
    if (voiceListening) {
      handler.stop();
      return;
    }
    const started = handler.start();
    if (!started) {
      toast.error("Could not start voice command listening.");
    }
  }, [voiceInputEnabled, voiceListening, toast]);

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
      dispatch(play({ now, source }));
      return now;
    },
    [dispatch]
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

    const clearAmbientTimeout = () => {
      if (ambientEventTimeoutRef.current) {
        window.clearTimeout(ambientEventTimeoutRef.current);
        ambientEventTimeoutRef.current = 0;
      }
    };

    const spawnAmbientEvent = () => {
      if (effectiveDogSleeping) return;

      const now = Date.now();
      const night = isNightHour(now);
      const triggerChance = night ? 0.05 : 0.01;
      if (Math.random() >= triggerChance) return;
      clearAmbientTimeout();

      if (night) {
        const nextEvent = {
          id: now,
          type: "owl",
          createdAt: now,
          durationMs: 10_000,
        };
        setAmbientEvent(nextEvent);
        setAmbientAnimOverride("sit");
        setAmbientSpeedBoost(1);
        setAttentionTarget({ xNorm: 0.18, yNorm: 0.6, at: now });
        ambientEventTimeoutRef.current = window.setTimeout(() => {
          setAmbientEvent((current) =>
            current?.id === nextEvent.id ? null : current
          );
          setAmbientAnimOverride("");
        }, nextEvent.durationMs);
        return;
      }

      const nextEvent = {
        id: now,
        type: "butterfly",
        yNorm: 0.18 + Math.random() * 0.24,
        createdAt: now,
        durationMs: 9_000,
      };
      setAmbientEvent(nextEvent);
      setAmbientAnimOverride("");
      setAmbientSpeedBoost(1.5);
      ambientEventTimeoutRef.current = window.setTimeout(() => {
        setAmbientEvent((current) =>
          current?.id === nextEvent.id ? null : current
        );
        setAmbientSpeedBoost(1);
      }, nextEvent.durationMs);
    };

    const timer = window.setInterval(spawnAmbientEvent, 60_000);
    return () => {
      window.clearInterval(timer);
      clearAmbientTimeout();
    };
  }, [dogInteractive, effectiveDogSleeping]);

  useEffect(() => {
    if (!ambientEvent || ambientEvent.type !== "butterfly") return undefined;
    const startedAt = Number(ambientEvent.createdAt || Date.now());
    const durationMs = Math.max(1000, Number(ambientEvent.durationMs || 9000));
    const baseY = clamp(Number(ambientEvent.yNorm || 0.28), 0.12, 0.72);
    const chaseTimer = window.setInterval(() => {
      const now = Date.now();
      const t = clamp((now - startedAt) / durationMs, 0, 1);
      const xNorm = clamp(0.08 + t * 0.84, 0.05, 0.95);
      const yNorm = clamp(baseY + Math.sin(t * Math.PI * 6) * 0.08, 0.08, 0.8);
      setAttentionTarget({ xNorm, yNorm, at: now });
    }, 520);
    return () => {
      window.clearInterval(chaseTimer);
    };
  }, [ambientEvent]);

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
    setAmbientAnimOverride("");
    setAmbientSpeedBoost(1);
  }, [effectiveDogSleeping]);

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
    };
  }, []);

  useEffect(() => {
    if (!dogInteractive) return undefined;
    const timer = window.setInterval(() => {
      if (activeSurprise) return;
      const now = Date.now();
      const silenceMs = now - Number(lastPlayTapAtRef.current || now);
      if (silenceMs < 60_000) return;
      dispatch(
        triggerButtonHeist({
          now,
          silenceMs,
          stolenAction: "play",
        })
      );
      lastPlayTapAtRef.current = now;
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeSurprise, dispatch, dogInteractive]);

  useEffect(() => {
    const { auth: initializedAuth } = initFirebase();
    const auth = initializedAuth || firebaseAuth;
    if (!auth) return undefined;
    const unsub = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    if (zipTouched) return;
    setZipDraft(userZip || "");
  }, [userZip, zipTouched]);

  useEffect(() => {
    if (!temperamentReady) {
      setTemperamentCardDismissed(false);
    }
  }, [temperamentReady]);

  const refreshWeatherNow = useCallback(
    async (zipValue) => {
      const nextZip = String(zipValue || "").trim();
      if (!/^\d{5}$/.test(nextZip)) return;

      setWeatherBusy(true);
      dispatch(setWeatherLoading({ zip: nextZip }));
      try {
        const snapshot = await fetchRealTimeWeather({
          zip: nextZip,
          forceRefresh: true,
        });
        dispatch(setWeatherSnapshot(snapshot));
      } catch (err) {
        dispatch(setWeatherError(err?.message || "Weather refresh failed"));
      } finally {
        setWeatherBusy(false);
      }
    },
    [dispatch]
  );

  const handleResolveSurprise = useCallback(
    (method) => {
      dispatch(resolveSessionSurprise({ now: Date.now(), method }));
    },
    [dispatch]
  );

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
  ]);

  const handleSharePup = useCallback(async () => {
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
  ]);

  return (
    <div className="relative min-h-dvh">
      <EnvironmentScene
        environment={environmentMode}
        season={seasonMode}
        timeOfDay={toNightBucket(scene?.timeOfDay)}
        weather={scene?.weatherKey || "clear"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        holes={holes}
      />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="rounded-[28px] border border-doggerz-leaf/35 bg-black/45 p-4 shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.label || "Backyard"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.timeOfDay || "Day"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.weather || "Clear"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-doggerz-paw">
              <LiveClockBadge />
              <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1">
                ZIP: {effectiveZip}
              </span>
              {weatherDetails?.name ? (
                <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1 normal-case tracking-normal">
                  {weatherDetails.name}
                </span>
              ) : null}
              <WeatherUpdatedBadge timestamp={weatherLastFetchedAt} />
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const nextZip = String(zipDraft || "").trim();
                if (!/^\d{5}$/.test(nextZip)) return;
                dispatch(setZip(nextZip));
                setZipTouched(false);
                refreshWeatherNow(nextZip);
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipDraft}
                onChange={(event) => {
                  const onlyDigits = event.target.value.replace(/\D/g, "");
                  setZipDraft(onlyDigits.slice(0, 5));
                  setZipTouched(true);
                }}
                placeholder="ZIP"
                className="w-24 rounded-xl border border-doggerz-leaf/35 bg-black/55 px-3 py-2 text-sm font-semibold text-doggerz-bone outline-none transition focus:border-doggerz-neon"
                aria-label="Zip code"
                title="Enter a 5-digit ZIP to refresh local weather cues."
              />
              <button
                type="submit"
                disabled={!zipIsValid || weatherBusy}
                className="rounded-xl border border-doggerz-leaf/40 bg-doggerz-neon/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-doggerz-bone transition hover:bg-doggerz-neon/30 disabled:cursor-not-allowed disabled:opacity-50"
                title="Fetch latest weather using the ZIP code."
              >
                {weatherBusy ? "Updating" : "Update"}
              </button>
            </form>
          </div>

          {weatherStatus === "error" && weatherError ? (
            <div className="mt-2 rounded-xl border border-rose-400/30 bg-rose-950/35 px-3 py-2 text-xs text-rose-100">
              Weather update failed: {weatherError}
            </div>
          ) : null}
          {activeSurprise ? (
            <SessionSurpriseBanner
              event={activeSurprise}
              hijackedActionLabel={hijackedActionLabel}
              onResolve={handleResolveSurprise}
            />
          ) : null}

          <div className="mt-3 flex items-center gap-2 text-2xl font-black tracking-tight text-doggerz-bone sm:text-3xl">
            <span>{dog?.name || "Your pup"}</span>
            {isFounder ? (
              <span className="inline-flex items-center rounded-full border border-sky-300/35 bg-sky-400/12 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sky-100 shadow-[0_0_20px_rgba(96,165,250,0.18)]">
                Founder
              </span>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <HudChip
              label="Level"
              value={`Lv ${overallLevel}`}
              tooltip="Overall progression level. Higher levels unlock tougher training tracks."
            />
            <HudChip
              label="Age"
              value={`${ageDays}d`}
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
            <HudChip
              label="Energy"
              value={`${energyPct}%`}
              tooltip="Action stamina. Rest, food, and routine restore this."
            />
            <HudChip
              label="Health"
              value={`${healthPct}%`}
              tooltip="Overall wellbeing. Neglect over time causes faster decline."
            />
          </div>
          <div className="mt-2 text-xs text-doggerz-paw/80">
            Hunger: {hungerPct}%
          </div>
          {actionOutcomeLabel ? (
            <div className="mt-2 rounded-xl border border-doggerz-leaf/35 bg-doggerz-neon/10 px-3 py-2 text-xs font-semibold text-doggerz-bone">
              {actionOutcomeLabel}
            </div>
          ) : null}
          {isApartmentEnvironment ? (
            <div className="mt-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-50">
              Apartment hard mode: food left on the low table can be stolen.
            </div>
          ) : null}
          {activeInvestigationLabel ? (
            <div className="mt-2 rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50">
              Investigating the {activeInvestigationLabel}.
            </div>
          ) : null}
          {showMidnightZoomies ? (
            <div className="mt-2 rounded-xl border border-fuchsia-300/35 bg-fuchsia-300/10 px-3 py-2 text-xs font-semibold text-fuchsia-50">
              Midnight zoomies.
            </div>
          ) : null}

          <div className="mt-4 rounded-3xl border border-doggerz-leaf/35 bg-black/30 px-2 py-4 sm:px-4">
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
                className={`yard-viewport ${localNight ? "yard-night" : "yard-day"} relative flex items-center justify-center overflow-hidden rounded-[24px] border border-doggerz-leaf/25 bg-black/20`}
                onPointerDown={handleViewportPointerDown}
                onPointerMove={handleViewportPointerMove}
                onPointerUp={handleViewportPointerUp}
                onPointerCancel={handleViewportPointerCancel}
              >
                <YardBackdrop
                  environment={environmentMode}
                  dogXNorm={dogPositionNorm.xNorm}
                  isNight={localNight || sunriseBlend > 0}
                  sunriseProgress={sunriseBlend}
                  reduceMotion={reduceMotion}
                  environmentTargets={environmentTargets}
                  activeEnvironmentTargetId={dog?.targetPosition?.id || ""}
                  props={investigationProps}
                  activePropId={activeInvestigationId}
                  onPropTap={handlePropTap}
                />
                <div
                  id="ui-container"
                  className="absolute left-4 top-4 z-40 flex flex-col gap-2"
                >
                  <div className="rounded-2xl border border-white/15 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_28px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                    <strong>Energy: </strong>
                    <span id="energy-display">{energyPct}</span>%
                  </div>
                  <Tooltip
                    className="w-full"
                    content="Quick feed instantly restores energy and helps hunger."
                  >
                    <button
                      id="feed-button"
                      type="button"
                      onClick={handleQuickFeed}
                      disabled={controlsDisabled}
                      className="w-full rounded-2xl border border-emerald-300/45 bg-gradient-to-b from-emerald-300 to-lime-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Feed Pup
                    </button>
                  </Tooltip>
                  <Tooltip
                    className="w-full"
                    content="Share your pup for social rewards when cooldown is ready."
                  >
                    <button
                      type="button"
                      onClick={handleSharePup}
                      className="min-h-11 w-full rounded-2xl border border-cyan-300/45 bg-gradient-to-b from-cyan-300 to-sky-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.28)] transition hover:brightness-105"
                    >
                      Share My Pup
                    </button>
                  </Tooltip>
                  {voiceInputEnabled ? (
                    <Tooltip
                      className="w-full"
                      content="Use voice commands like Sit, Speak, or Roll over."
                    >
                      <button
                        type="button"
                        onClick={handleVoiceTrainTap}
                        disabled={controlsDisabled || !voiceSupported}
                        className="min-h-11 w-full rounded-2xl border border-violet-300/45 bg-gradient-to-b from-violet-300 to-fuchsia-300 px-4 py-2 text-sm font-black tracking-[0.02em] text-slate-950 shadow-[0_10px_24px_rgba(167,139,250,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {voiceListening ? "Listening..." : "Voice Train"}
                      </button>
                    </Tooltip>
                  ) : null}
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
                    style={{ zIndex: dogRenderZIndex }}
                  >
                    <DogPixiView
                      stage={renderModel?.stage}
                      condition={renderModel?.condition}
                      anim={effectiveAnim}
                      behaviorState={dog?.aiState || "idle"}
                      position={dog?.position || null}
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
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <ActionButton
                label="Interact"
                disabled={controlsDisabled}
                onPointerEnter={handleActionHoverAnticipation}
                onClick={() => setInteractionOpen(true)}
              />
              <ActionButton
                label="Play"
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
                hijacked={isActionHijacked("pet")}
                disabled={controlsDisabled || isActionHijacked("pet")}
                onClick={() => {
                  if (isActionHijacked("pet")) return;
                  dispatch(petDog({ now: Date.now() }));
                }}
              />
              <ActionButton
                label="Bath"
                hijacked={isActionHijacked("bath")}
                disabled={controlsDisabled || isActionHijacked("bath")}
                onClick={() => {
                  if (isActionHijacked("bath")) return;
                  dispatch(bathe({ now: Date.now() }));
                }}
              />
              <ActionButton
                label="Potty"
                hijacked={isActionHijacked("potty")}
                disabled={controlsDisabled || isActionHijacked("potty")}
                onClick={() => {
                  if (isActionHijacked("potty")) return;
                  dispatch(goPotty({ now: Date.now() }));
                }}
              />
              <ActionButton
                label="Train"
                hijacked={isActionHijacked("train")}
                disabled={controlsDisabled || isActionHijacked("train")}
                onClick={() => {
                  if (isActionHijacked("train")) return;
                  dispatch(
                    trainObedience({
                      now: Date.now(),
                      commandId: "sit",
                      input: "button",
                    })
                  );
                }}
              />
            </div>
          ) : null}
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
          onTrain={() => {
            if (isActionHijacked("train")) {
              setInteractionOpen(false);
              return;
            }
            dispatch(
              trainObedience({
                now: Date.now(),
                commandId: "sit",
                input: "button",
              })
            );
            setInteractionOpen(false);
          }}
          playHijacked={isActionHijacked("play")}
          petHijacked={isActionHijacked("pet")}
          bathHijacked={isActionHijacked("bath")}
          pottyHijacked={isActionHijacked("potty")}
          trainHijacked={isActionHijacked("train")}
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
.yard-viewport.yard-day {
  box-shadow: inset 0 -36px 55px rgba(16, 185, 129, 0.14);
}
.yard-viewport.yard-night {
  box-shadow: inset 0 -40px 64px rgba(30, 58, 138, 0.22);
}
.countdown-clock {
  font-family: "Courier New", Courier, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
}`}
      </style>
    </div>
  );
}

const LiveClockBadge = memo(function LiveClockBadge() {
  const [now, setNow] = useState(Date.now());
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1">
      Local Time: {formatter.format(new Date(now))}
    </span>
  );
});

const WeatherUpdatedBadge = memo(function WeatherUpdatedBadge({ timestamp }) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  if (!timestamp) return null;
  return (
    <span className="rounded-full border border-doggerz-leaf/25 bg-black/30 px-2.5 py-1 normal-case tracking-normal text-doggerz-paw/70">
      Updated {formatter.format(new Date(timestamp))}
    </span>
  );
});

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

function SessionSurpriseBanner({
  event,
  hijackedActionLabel = "Action",
  onResolve,
}) {
  const type = String(event?.type || "").toUpperCase();
  const isHeist = type === "STOLEN_BUTTON";
  const title = isHeist ? "Button Heist" : "Surprise Digging";
  const body = isHeist
    ? `Your pup stole "${hijackedActionLabel}". Play fetch to get it back.`
    : "Your pup started digging before you interacted. Redirect it now.";
  const cta = isHeist ? "Play Fetch" : "Investigate";

  return (
    <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-amber-50">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs font-bold uppercase tracking-[0.16em]">
          {title}
        </div>
        <div className="text-xs text-amber-100/90">{body}</div>
        <button
          type="button"
          onClick={() => onResolve(isHeist ? "fetch" : "investigate")}
          className="ml-auto rounded-xl border border-amber-200/40 bg-amber-200/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-50 hover:bg-amber-200/25"
        >
          {cta}
        </button>
      </div>
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
        className={`group relative w-full overflow-hidden rounded-2xl border px-3 py-3 text-left transition active:translate-y-[1px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
          hijacked
            ? "border-amber-300/65 bg-amber-500/15"
            : `${meta.edge} bg-gradient-to-b ${meta.card}`
        } shadow-[0_10px_22px_rgba(2,6,23,0.25)] hover:brightness-110`}
      >
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
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
  onTrain,
  playHijacked = false,
  petHijacked = false,
  bathHijacked = false,
  pottyHijacked = false,
  trainHijacked = false,
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
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone hover:bg-white/10"
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
                : "Potty routine helps avoid accidents."
            }
          />
          <SheetButton
            label={trainHijacked ? "Train (stolen)" : "Train"}
            icon="🎯"
            onClick={onTrain}
            disabled={trainHijacked}
            tooltip={
              trainHijacked
                ? "Train is currently stolen by a surprise event."
                : "Training builds per-command mastery."
            }
          />
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
        className="group flex w-full items-center gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 px-3 py-3 text-left text-sm font-semibold text-doggerz-bone transition hover:border-doggerz-neon/60 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="w-full rounded-xl border border-doggerz-leaf/35 bg-black/35 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-doggerz-paw/85">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-bold text-doggerz-bone">
          {value}
        </div>
      </div>
    </Tooltip>
  );
}
