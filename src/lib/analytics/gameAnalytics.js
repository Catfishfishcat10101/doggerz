import { trackDoggerzEvent } from "@/lib/firebase/analytics.js";

export const GAME_ANALYTICS_EVENTS = Object.freeze({
  APP_OPEN: "app_open",
  ENTER_GAME: "enter_game",
  FEED_DOG: "feed_dog",
  GIVE_WATER: "give_water",
  PLAY_WITH_DOG: "play_with_dog",
  TRAIN_TRICK: "train_trick",
  LEVEL_UP: "level_up",
  SESSION_DURATION: "session_duration",
});

function normalizeStage(stage) {
  return String(stage || "PUPPY")
    .trim()
    .toLowerCase();
}

function normalizeSource(source, fallback = "game_controls") {
  const value = String(source || "")
    .trim()
    .toLowerCase();
  return value || fallback;
}

function normalizeKey(value, fallback = "unknown") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized || fallback;
}

export function trackAppOpen({ platform = "web" } = {}) {
  const platformKey = normalizeKey(
    String(platform || "web").slice(0, 40),
    "web"
  );
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.APP_OPEN,
    {
      platform: platformKey,
    },
    {
      dedupeKey: `app_open:${platformKey}`,
      dedupeMs: 30_000,
    }
  );
}

export function trackEnterGame({
  hasDog = false,
  lifecycleStatus = "none",
} = {}) {
  const lifecycle = normalizeKey(lifecycleStatus, "none");
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.ENTER_GAME,
    {
      has_dog: Boolean(hasDog),
      lifecycle_status: lifecycle,
    },
    {
      dedupeKey: `enter_game:${hasDog ? "active" : "guest"}:${lifecycle}`,
      dedupeMs: 5_000,
    }
  );
}

export function trackSessionDuration({
  durationSeconds = 0,
  hasDog = false,
  lifecycleStatus = "none",
  sessionStartedAt = 0,
} = {}) {
  const seconds = Math.max(0, Math.round(Number(durationSeconds || 0)));
  if (seconds < 5) return Promise.resolve(false);

  const lifecycle = normalizeKey(lifecycleStatus, "none");
  const startedAt = Math.max(0, Math.round(Number(sessionStartedAt || 0)));
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.SESSION_DURATION,
    {
      duration_seconds: seconds,
      has_dog: Boolean(hasDog),
      lifecycle_status: lifecycle,
    },
    {
      dedupeKey: `session_duration:${startedAt || Date.now()}:${seconds}`,
      dedupeMs: 10_000,
    }
  );
}

export function trackFeedDog({
  feedType = "regular_kibble",
  source = "game_controls",
  stage = "PUPPY",
} = {}) {
  const resolvedFeedType = normalizeKey(feedType, "regular_kibble");
  const resolvedSource = normalizeSource(source);
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.FEED_DOG,
    {
      feed_type: resolvedFeedType,
      source: resolvedSource,
      stage: normalizeStage(stage),
    },
    {
      dedupeKey: `feed_dog:${resolvedFeedType}:${resolvedSource}`,
      dedupeMs: 700,
    }
  );
}

export function trackGiveWater({
  source = "game_controls",
  stage = "PUPPY",
} = {}) {
  const resolvedSource = normalizeSource(source);
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.GIVE_WATER,
    {
      source: resolvedSource,
      stage: normalizeStage(stage),
    },
    {
      dedupeKey: `give_water:${resolvedSource}`,
      dedupeMs: 700,
    }
  );
}

export function trackPlayWithDog({ source = "button", stage = "PUPPY" } = {}) {
  const resolvedSource = normalizeSource(source, "button");
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.PLAY_WITH_DOG,
    {
      source: resolvedSource,
      stage: normalizeStage(stage),
    },
    {
      dedupeKey: `play_with_dog:${resolvedSource}`,
      dedupeMs: 700,
    }
  );
}

export function trackTrainTrick({
  commandId = "",
  input = "button",
  stage = "PUPPY",
} = {}) {
  const command = normalizeKey(commandId);
  const source = normalizeSource(input, "button");
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.TRAIN_TRICK,
    {
      command_id: command,
      source,
      stage: normalizeStage(stage),
    },
    {
      dedupeKey: `train_trick:${command}:${source}`,
      dedupeMs: 1_500,
    }
  );
}

export function trackLevelUp({
  level = 1,
  previousLevel = 1,
  stage = "PUPPY",
} = {}) {
  const nextLevel = Math.max(1, Math.floor(Number(level || 1)));
  const priorLevel = Math.max(1, Math.floor(Number(previousLevel || 1)));
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.LEVEL_UP,
    {
      level: nextLevel,
      previous_level: priorLevel,
      stage: normalizeStage(stage),
    },
    {
      dedupeKey: `level_up:${nextLevel}`,
      dedupeMs: 86_400_000,
    }
  );
}
