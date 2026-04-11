import { isSupported, getAnalytics, logEvent } from "firebase/analytics";
import { app, firebaseReady } from "@/lib/firebase/index.js";

const ANALYTICS_EVENTS = new Set([
  "app_open",
  "enter_game",
  "feed_dog",
  "give_water",
  "play_with_dog",
  "train_trick",
  "level_up",
  "session_duration",
  "store_view",
  "store_item_view",
  "store_purchase_attempt",
  "store_purchase_success",
  "player_segment_snapshot",
]);

let analyticsInstancePromise = null;

function getAnalyticsDedupeStore() {
  if (typeof window === "undefined") return new Map();
  if (!window.__DOGGERZ_ANALYTICS_DEDUPE__) {
    window.__DOGGERZ_ANALYTICS_DEDUPE__ = new Map();
  }
  return window.__DOGGERZ_ANALYTICS_DEDUPE__;
}

async function resolveAnalyticsInstance() {
  if (analyticsInstancePromise) return analyticsInstancePromise;

  analyticsInstancePromise = (async () => {
    if (typeof window === "undefined") return null;
    if (!firebaseReady || !app) return null;
    if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null;

    try {
      const supported = await isSupported();
      if (!supported) return null;
      return getAnalytics(app);
    } catch {
      return null;
    }
  })();

  return analyticsInstancePromise;
}

function shouldSkipEvent(name, dedupeKey, dedupeMs) {
  if (!ANALYTICS_EVENTS.has(name)) return true;
  if (!dedupeKey || !Number.isFinite(Number(dedupeMs)) || dedupeMs <= 0) {
    return false;
  }

  const store = getAnalyticsDedupeStore();
  const now = Date.now();
  const previousAt = Number(store.get(dedupeKey) || 0);
  if (previousAt > 0 && now - previousAt < Number(dedupeMs)) {
    return true;
  }
  store.set(dedupeKey, now);
  return false;
}

export async function trackDoggerzEvent(
  name,
  params = {},
  { dedupeKey = "", dedupeMs = 0 } = {}
) {
  if (shouldSkipEvent(name, dedupeKey, dedupeMs)) return false;

  const analytics = await resolveAnalyticsInstance();
  if (!analytics) return false;

  try {
    logEvent(analytics, name, params);
    return true;
  } catch {
    return false;
  }
}
