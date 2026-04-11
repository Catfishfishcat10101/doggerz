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
  STORE_VIEW: "store_view",
  STORE_ITEM_VIEW: "store_item_view",
  STORE_PURCHASE_ATTEMPT: "store_purchase_attempt",
  STORE_PURCHASE_SUCCESS: "store_purchase_success",
  PLAYER_SEGMENT_SNAPSHOT: "player_segment_snapshot",
});

const LOCAL_ANALYTICS_KEY = "__DOGGERZ_ANALYTICS_TIMELINE_V1__";
const MAX_LOCAL_ANALYTICS_EVENTS = 240;
const LOCAL_EVENT_DEDUPE_MS = 700;

function getTimelineStore() {
  if (typeof window === "undefined") return [];
  if (!Array.isArray(window.__DOGGERZ_ANALYTICS_TIMELINE__)) {
    window.__DOGGERZ_ANALYTICS_TIMELINE__ = [];
  }
  return window.__DOGGERZ_ANALYTICS_TIMELINE__;
}

function loadTimelineFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage?.getItem(LOCAL_ANALYTICS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        name: normalizeKey(entry?.name, "unknown"),
        at: Math.max(0, Math.round(Number(entry?.at || 0))),
        params:
          entry?.params && typeof entry.params === "object"
            ? { ...entry.params }
            : {},
      }))
      .filter((entry) => entry.name !== "unknown" && entry.at > 0)
      .slice(-MAX_LOCAL_ANALYTICS_EVENTS);
  } catch {
    return [];
  }
}

function ensureTimelineHydrated() {
  if (typeof window === "undefined") return;
  const timeline = getTimelineStore();
  if (timeline.length) return;
  const restored = loadTimelineFromStorage();
  if (!restored.length) return;
  timeline.push(...restored);
}

function persistTimeline(timeline) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(
      LOCAL_ANALYTICS_KEY,
      JSON.stringify(timeline.slice(-MAX_LOCAL_ANALYTICS_EVENTS))
    );
  } catch {
    // Ignore storage write errors.
  }
}

function recordLocalAnalyticsEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  ensureTimelineHydrated();
  const timeline = getTimelineStore();
  const now = Date.now();
  const key = normalizeKey(name);
  if (!key || key === "unknown") return;

  const previous = timeline[timeline.length - 1] || null;
  if (
    previous &&
    previous.name === key &&
    now - Number(previous.at || 0) < LOCAL_EVENT_DEDUPE_MS
  ) {
    return;
  }

  timeline.push({
    name: key,
    at: now,
    params: params && typeof params === "object" ? { ...params } : {},
  });

  if (timeline.length > MAX_LOCAL_ANALYTICS_EVENTS) {
    timeline.splice(0, timeline.length - MAX_LOCAL_ANALYTICS_EVENTS);
  }
  persistTimeline(timeline);
}

function readLocalAnalyticsTimeline() {
  if (typeof window === "undefined") return [];
  ensureTimelineHydrated();
  return [...getTimelineStore()];
}

function getEventCount(
  timeline,
  eventName,
  { fromAt = 0, toAt = Date.now() } = {}
) {
  const name = normalizeKey(eventName);
  return timeline.filter(
    (entry) =>
      entry.name === name &&
      Number(entry.at || 0) >= Number(fromAt || 0) &&
      Number(entry.at || 0) <= Number(toAt || Date.now())
  ).length;
}

function getLastEventAt(timeline, eventName) {
  const name = normalizeKey(eventName);
  for (let i = timeline.length - 1; i >= 0; i -= 1) {
    const entry = timeline[i];
    if (entry?.name === name) return Number(entry.at || 0) || 0;
  }
  return 0;
}

function pickDropOffReasons({
  firstSessionSeconds,
  careActionsCompleted,
  hasTrain,
}) {
  const reasons = [];
  if (firstSessionSeconds > 0 && firstSessionSeconds < 45) {
    reasons.push("very_short_first_session");
  } else if (firstSessionSeconds > 0 && firstSessionSeconds < 120) {
    reasons.push("short_first_session");
  }
  if (careActionsCompleted === 0) {
    reasons.push("no_first_care_action");
  } else if (careActionsCompleted < 2) {
    reasons.push("low_first_care_coverage");
  } else if (careActionsCompleted < 3) {
    reasons.push("incomplete_first_care_loop");
  }
  if (!hasTrain) {
    reasons.push("no_early_training_touch");
  }
  return reasons;
}

export function getRetentionAnalyticsSnapshot({ now = Date.now() } = {}) {
  const timeline = readLocalAnalyticsTimeline();
  const safeNow = Math.max(0, Math.round(Number(now || Date.now())));
  const firstEnterAt = timeline.find(
    (entry) => entry.name === GAME_ANALYTICS_EVENTS.ENTER_GAME
  )?.at;
  const latestEnterAt = getLastEventAt(
    timeline,
    GAME_ANALYTICS_EVENTS.ENTER_GAME
  );
  const firstSessionWindowEnd =
    firstEnterAt > 0 ? firstEnterAt + 15 * 60_000 : 0;
  const firstSessionDurationEntry = timeline.find(
    (entry) =>
      entry.name === GAME_ANALYTICS_EVENTS.SESSION_DURATION &&
      (!firstEnterAt ||
        (entry.at >= firstEnterAt &&
          entry.at <= firstSessionWindowEnd + 30 * 60_000))
  );
  const firstSessionSeconds = Math.max(
    0,
    Math.round(Number(firstSessionDurationEntry?.params?.duration_seconds || 0))
  );
  const firstWindowEnd = firstSessionWindowEnd || safeNow;
  const firstFeedCount = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.FEED_DOG,
    {
      fromAt: firstEnterAt || 0,
      toAt: firstWindowEnd,
    }
  );
  const firstWaterCount = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.GIVE_WATER,
    {
      fromAt: firstEnterAt || 0,
      toAt: firstWindowEnd,
    }
  );
  const firstPlayCount = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.PLAY_WITH_DOG,
    {
      fromAt: firstEnterAt || 0,
      toAt: firstWindowEnd,
    }
  );
  const firstTrainCount = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.TRAIN_TRICK,
    {
      fromAt: firstEnterAt || 0,
      toAt: firstWindowEnd,
    }
  );

  const careActionsCompleted =
    (firstFeedCount > 0 ? 1 : 0) +
    (firstWaterCount > 0 ? 1 : 0) +
    (firstPlayCount > 0 ? 1 : 0);
  const firstCareLoopCompleted = careActionsCompleted >= 3;
  const firstCareLoopCompletedAt = firstCareLoopCompleted
    ? Math.max(
        getLastEventAt(timeline, GAME_ANALYTICS_EVENTS.FEED_DOG),
        getLastEventAt(timeline, GAME_ANALYTICS_EVENTS.GIVE_WATER),
        getLastEventAt(timeline, GAME_ANALYTICS_EVENTS.PLAY_WITH_DOG)
      )
    : 0;
  const firstSessionComplete = firstSessionSeconds >= 60;
  const returnGapHours =
    latestEnterAt > 0 ? Math.max(0, (safeNow - latestEnterAt) / 3_600_000) : 0;
  const riskBand =
    returnGapHours >= 48
      ? "high"
      : returnGapHours >= 24
        ? "medium"
        : returnGapHours >= 12
          ? "watch"
          : "low";
  const dropOffReasons = pickDropOffReasons({
    firstSessionSeconds,
    careActionsCompleted,
    hasTrain: firstTrainCount > 0,
  });

  return {
    timelineSize: timeline.length,
    firstEnterAt: Number(firstEnterAt || 0),
    latestEnterAt: Number(latestEnterAt || 0),
    firstSessionSeconds,
    firstSessionComplete,
    firstSessionCare: {
      feed: firstFeedCount > 0,
      water: firstWaterCount > 0,
      play: firstPlayCount > 0,
      train: firstTrainCount > 0,
      completedCount: careActionsCompleted,
    },
    firstCareLoopCompleted,
    firstCareLoopCompletedAt,
    returnGapHours: Math.round(returnGapHours * 10) / 10,
    riskBand,
    dropOffReasons,
  };
}

function getUniqueDayCount(entries) {
  const daySet = new Set();
  entries.forEach((entry) => {
    const at = Number(entry?.at || 0);
    if (at <= 0) return;
    daySet.add(new Date(at).toISOString().slice(0, 10));
  });
  return daySet.size;
}

function buildSegmentationGuidance(segment) {
  if (segment === "churn_risk") {
    return {
      focusArea: "recovery",
      recommendedActions: ["gentle_return_moments", "low_friction_rewards"],
    };
  }
  if (segment === "returning") {
    return {
      focusArea: "re_onboarding",
      recommendedActions: ["welcome_back_copy", "quick_win_moments"],
    };
  }
  if (segment === "engaged") {
    return {
      focusArea: "depth_and_monetization",
      recommendedActions: ["premium_cosmetics", "content_variety"],
    };
  }
  return {
    focusArea: "habit_building",
    recommendedActions: ["care_loop_clarity", "daily_micro_rewards"],
  };
}

export function getPlayerSegmentationSnapshot({ now = Date.now() } = {}) {
  const safeNow = Math.max(0, Math.round(Number(now || Date.now())));
  const timeline = readLocalAnalyticsTimeline();
  const last1dAt = safeNow - 24 * 60 * 60 * 1000;
  const last3dAt = safeNow - 3 * 24 * 60 * 60 * 1000;
  const last7dAt = safeNow - 7 * 24 * 60 * 60 * 1000;
  const last30dAt = safeNow - 30 * 24 * 60 * 60 * 1000;

  const sessionEntries = timeline
    .filter((entry) => entry?.name === GAME_ANALYTICS_EVENTS.ENTER_GAME)
    .sort((a, b) => Number(a.at || 0) - Number(b.at || 0));
  const recent7Sessions = sessionEntries.filter(
    (entry) => Number(entry?.at || 0) >= last7dAt
  );
  const recent30Sessions = sessionEntries.filter(
    (entry) => Number(entry?.at || 0) >= last30dAt
  );
  const lastSessionAt = Number(
    sessionEntries[sessionEntries.length - 1]?.at || 0
  );
  const previousSessionAt = Number(
    sessionEntries[sessionEntries.length - 2]?.at || 0
  );
  const daysSinceLastSession =
    lastSessionAt > 0 ? (safeNow - lastSessionAt) / (24 * 60 * 60 * 1000) : 999;
  const returnGapHours =
    lastSessionAt > 0 && previousSessionAt > 0
      ? (lastSessionAt - previousSessionAt) / (60 * 60 * 1000)
      : 0;

  const sessionDurations7d = timeline.filter(
    (entry) =>
      entry?.name === GAME_ANALYTICS_EVENTS.SESSION_DURATION &&
      Number(entry?.at || 0) >= last7dAt
  );
  const avgSessionSeconds7d =
    sessionDurations7d.length > 0
      ? Math.round(
          sessionDurations7d.reduce(
            (sum, entry) =>
              sum + Math.max(0, Number(entry?.params?.duration_seconds || 0)),
            0
          ) / sessionDurations7d.length
        )
      : 0;

  const featureUsage7d = Object.freeze({
    feed: getEventCount(timeline, GAME_ANALYTICS_EVENTS.FEED_DOG, {
      fromAt: last7dAt,
      toAt: safeNow,
    }),
    water: getEventCount(timeline, GAME_ANALYTICS_EVENTS.GIVE_WATER, {
      fromAt: last7dAt,
      toAt: safeNow,
    }),
    play: getEventCount(timeline, GAME_ANALYTICS_EVENTS.PLAY_WITH_DOG, {
      fromAt: last7dAt,
      toAt: safeNow,
    }),
    train: getEventCount(timeline, GAME_ANALYTICS_EVENTS.TRAIN_TRICK, {
      fromAt: last7dAt,
      toAt: safeNow,
    }),
    storeViews: getEventCount(timeline, GAME_ANALYTICS_EVENTS.STORE_VIEW, {
      fromAt: last7dAt,
      toAt: safeNow,
    }),
    purchases: getEventCount(
      timeline,
      GAME_ANALYTICS_EVENTS.STORE_PURCHASE_SUCCESS,
      {
        fromAt: last7dAt,
        toAt: safeNow,
      }
    ),
  });
  const featureDiversity7d = Object.values(featureUsage7d).filter(
    (count) => Number(count || 0) > 0
  ).length;

  let retentionPattern = "new_or_sparse";
  if (daysSinceLastSession >= 7) {
    retentionPattern = "dormant";
  } else if (daysSinceLastSession >= 3) {
    retentionPattern = "slipping";
  } else if (getUniqueDayCount(recent7Sessions) >= 4) {
    retentionPattern = "habit";
  } else if (recent7Sessions.length >= 2) {
    retentionPattern = "building";
  }

  const wasReturning =
    returnGapHours >= 24 &&
    daysSinceLastSession <= 1 &&
    recent30Sessions.length >= 2;
  const engaged =
    recent7Sessions.length >= 5 ||
    (getUniqueDayCount(recent7Sessions) >= 4 &&
      featureDiversity7d >= 4 &&
      avgSessionSeconds7d >= 120);
  const churnRisk =
    daysSinceLastSession >= 3 ||
    (recent7Sessions.length <= 1 &&
      featureDiversity7d <= 1 &&
      avgSessionSeconds7d > 0 &&
      avgSessionSeconds7d < 75);

  const segment = churnRisk
    ? "churn_risk"
    : wasReturning
      ? "returning"
      : engaged
        ? "engaged"
        : "casual";

  return {
    segment,
    retentionPattern,
    guidance: buildSegmentationGuidance(segment),
    metrics: {
      sessions1d: recent7Sessions.filter(
        (entry) => Number(entry.at || 0) >= last1dAt
      ).length,
      sessions3d: recent7Sessions.filter(
        (entry) => Number(entry.at || 0) >= last3dAt
      ).length,
      sessions7d: recent7Sessions.length,
      sessions30d: recent30Sessions.length,
      activeDays7d: getUniqueDayCount(recent7Sessions),
      avgSessionSeconds7d,
      daysSinceLastSession: Math.round(daysSinceLastSession * 10) / 10,
      returnGapHours: Math.round(returnGapHours * 10) / 10,
      featureDiversity7d,
      featureUsage7d,
    },
  };
}

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

function normalizeCurrency(value) {
  return normalizeKey(value, "coins") === "gems" ? "gems" : "coins";
}

function normalizeStoreOutcome(value) {
  const key = normalizeKey(value, "unknown");
  if (
    [
      "success",
      "insufficient_funds",
      "iap_only",
      "already_owned",
      "blocked",
      "cancelled",
    ].includes(key)
  ) {
    return key;
  }
  return "unknown";
}

export function trackAppOpen({ platform = "web" } = {}) {
  const platformKey = normalizeKey(
    String(platform || "web").slice(0, 40),
    "web"
  );
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.APP_OPEN, {
    platform: platformKey,
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.ENTER_GAME, {
    has_dog: Boolean(hasDog),
    lifecycle_status: lifecycle,
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.SESSION_DURATION, {
    duration_seconds: seconds,
    has_dog: Boolean(hasDog),
    lifecycle_status: lifecycle,
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.FEED_DOG, {
    feed_type: resolvedFeedType,
    source: resolvedSource,
    stage: normalizeStage(stage),
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.GIVE_WATER, {
    source: resolvedSource,
    stage: normalizeStage(stage),
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.PLAY_WITH_DOG, {
    source: resolvedSource,
    stage: normalizeStage(stage),
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.TRAIN_TRICK, {
    command_id: command,
    source,
    stage: normalizeStage(stage),
  });
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
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.LEVEL_UP, {
    level: nextLevel,
    previous_level: priorLevel,
    stage: normalizeStage(stage),
  });
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

export function getMonetizationAnalyticsSnapshot({
  now = Date.now(),
  windowHours = 24 * 7,
} = {}) {
  const timeline = readLocalAnalyticsTimeline();
  const toAt = Math.max(0, Math.round(Number(now || Date.now())));
  const fromAt = Math.max(
    0,
    toAt - Math.max(1, Number(windowHours || 24 * 7)) * 60 * 60 * 1000
  );

  const storeViews = getEventCount(timeline, GAME_ANALYTICS_EVENTS.STORE_VIEW, {
    fromAt,
    toAt,
  });
  const itemViews = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.STORE_ITEM_VIEW,
    {
      fromAt,
      toAt,
    }
  );
  const purchaseAttempts = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_ATTEMPT,
    {
      fromAt,
      toAt,
    }
  );
  const purchaseSuccesses = getEventCount(
    timeline,
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_SUCCESS,
    {
      fromAt,
      toAt,
    }
  );

  const conversionRate =
    purchaseAttempts > 0 ? purchaseSuccesses / purchaseAttempts : 0;

  return {
    fromAt,
    toAt,
    storeViews,
    itemViews,
    purchaseAttempts,
    purchaseSuccesses,
    conversionRate: Math.round(conversionRate * 1000) / 1000,
  };
}

export function trackStoreView({
  source = "store_screen",
  visibleItems = 0,
  coins = 0,
  gems = 0,
  conversionRate7d = 0,
} = {}) {
  const resolvedSource = normalizeSource(source, "store_screen");
  const payload = {
    source: resolvedSource,
    visible_items: Math.max(0, Math.round(Number(visibleItems || 0))),
    coins: Math.max(0, Math.round(Number(coins || 0))),
    gems: Math.max(0, Math.round(Number(gems || 0))),
    conversion_rate_7d: Math.max(
      0,
      Math.min(1, Number(conversionRate7d || 0) || 0)
    ),
  };
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.STORE_VIEW, payload);
  return trackDoggerzEvent(GAME_ANALYTICS_EVENTS.STORE_VIEW, payload, {
    dedupeKey: `store_view:${resolvedSource}`,
    dedupeMs: 15_000,
  });
}

export function trackStoreItemView({
  itemId = "",
  slot = "",
  category = "",
  currency = "coins",
  price = 0,
  owned = false,
} = {}) {
  const id = normalizeKey(String(itemId || "").slice(0, 80));
  if (!id || id === "unknown") return Promise.resolve(false);
  const payload = {
    item_id: id,
    slot: normalizeKey(slot, "unknown"),
    category: normalizeKey(category, "unknown"),
    currency: normalizeCurrency(currency),
    price: Math.max(0, Math.round(Number(price || 0))),
    owned: Boolean(owned),
  };
  recordLocalAnalyticsEvent(GAME_ANALYTICS_EVENTS.STORE_ITEM_VIEW, payload);
  return trackDoggerzEvent(GAME_ANALYTICS_EVENTS.STORE_ITEM_VIEW, payload, {
    dedupeKey: `store_item_view:${id}:${payload.owned ? "owned" : "new"}`,
    dedupeMs: 30_000,
  });
}

export function trackStorePurchaseAttempt({
  itemId = "",
  slot = "",
  category = "",
  currency = "coins",
  price = 0,
  outcome = "unknown",
  source = "store_screen",
} = {}) {
  const id = normalizeKey(String(itemId || "").slice(0, 80));
  if (!id || id === "unknown") return Promise.resolve(false);
  const payload = {
    item_id: id,
    slot: normalizeKey(slot, "unknown"),
    category: normalizeKey(category, "unknown"),
    currency: normalizeCurrency(currency),
    price: Math.max(0, Math.round(Number(price || 0))),
    outcome: normalizeStoreOutcome(outcome),
    source: normalizeSource(source, "store_screen"),
  };
  recordLocalAnalyticsEvent(
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_ATTEMPT,
    payload
  );
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_ATTEMPT,
    payload,
    {
      dedupeKey: `store_purchase_attempt:${id}:${payload.outcome}`,
      dedupeMs: 1_000,
    }
  );
}

export function trackStorePurchaseSuccess({
  itemId = "",
  slot = "",
  category = "",
  currency = "coins",
  price = 0,
  source = "store_screen",
} = {}) {
  const id = normalizeKey(String(itemId || "").slice(0, 80));
  if (!id || id === "unknown") return Promise.resolve(false);
  const payload = {
    item_id: id,
    slot: normalizeKey(slot, "unknown"),
    category: normalizeKey(category, "unknown"),
    currency: normalizeCurrency(currency),
    price: Math.max(0, Math.round(Number(price || 0))),
    source: normalizeSource(source, "store_screen"),
  };
  recordLocalAnalyticsEvent(
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_SUCCESS,
    payload
  );
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.STORE_PURCHASE_SUCCESS,
    payload,
    {
      dedupeKey: `store_purchase_success:${id}:${Date.now()}`,
      dedupeMs: 500,
    }
  );
}

export function trackPlayerSegmentSnapshot({
  snapshot = null,
  source = "game_enter",
} = {}) {
  const resolved = snapshot || getPlayerSegmentationSnapshot();
  const segment = normalizeKey(resolved?.segment, "casual");
  const retentionPattern = normalizeKey(
    resolved?.retentionPattern,
    "new_or_sparse"
  );
  const metrics = resolved?.metrics || {};
  const payload = {
    source: normalizeSource(source, "game_enter"),
    segment,
    retention_pattern: retentionPattern,
    sessions_7d: Math.max(0, Math.round(Number(metrics?.sessions7d || 0))),
    active_days_7d: Math.max(0, Math.round(Number(metrics?.activeDays7d || 0))),
    feature_diversity_7d: Math.max(
      0,
      Math.round(Number(metrics?.featureDiversity7d || 0))
    ),
    avg_session_seconds_7d: Math.max(
      0,
      Math.round(Number(metrics?.avgSessionSeconds7d || 0))
    ),
  };
  const windowKey = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
  recordLocalAnalyticsEvent(
    GAME_ANALYTICS_EVENTS.PLAYER_SEGMENT_SNAPSHOT,
    payload
  );
  return trackDoggerzEvent(
    GAME_ANALYTICS_EVENTS.PLAYER_SEGMENT_SNAPSHOT,
    payload,
    {
      dedupeKey: `player_segment_snapshot:${segment}:${windowKey}`,
      dedupeMs: 60 * 60 * 1000,
    }
  );
}
