// src/utils/reminders.js

import { getStoredValue, setStoredValue } from "@/utils/nativeStorage.js";

export const REMINDER_STORAGE_KEY = "doggerz:reminders:v1";
export const REMINDER_EVENT = "doggerz:reminder";

const DEFAULT_STATE = { lastByKey: {}, lastReminder: null };

let reminderStateCache = { ...DEFAULT_STATE };
let reminderStateHydrated = false;
let reminderHydrationPromise = null;

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeReminderState(parsed) {
  if (!parsed || typeof parsed !== "object") return { ...DEFAULT_STATE };
  return {
    lastByKey: { ...(parsed.lastByKey || {}) },
    lastReminder: parsed.lastReminder || null,
  };
}

export async function loadReminderStateAsync() {
  if (reminderStateHydrated) return { ...reminderStateCache };
  if (!reminderHydrationPromise) {
    reminderHydrationPromise = (async () => {
      try {
        const raw = await getStoredValue(REMINDER_STORAGE_KEY);
        const parsed = raw ? safeParseJson(raw) : null;
        reminderStateCache = normalizeReminderState(parsed);
      } catch {
        reminderStateCache = { ...DEFAULT_STATE };
      } finally {
        reminderStateHydrated = true;
        reminderHydrationPromise = null;
      }
      return { ...reminderStateCache };
    })();
  }
  return reminderHydrationPromise;
}

export function loadReminderState() {
  // Kick off background hydration for native builds.
  if (!reminderStateHydrated && !reminderHydrationPromise) {
    loadReminderStateAsync().catch(() => {
      // ignore
    });
  }
  return { ...reminderStateCache };
}

export function saveReminderState(next) {
  reminderStateCache = normalizeReminderState(next);
  reminderStateHydrated = true;
  setStoredValue(
    REMINDER_STORAGE_KEY,
    JSON.stringify(reminderStateCache)
  ).catch(() => {
    // ignore
  });
}

export function getLastReminder() {
  return loadReminderState().lastReminder || null;
}

export function shouldFire(state, key, cooldownMs, now) {
  const last = Number(state?.lastByKey?.[key] || 0);
  return !last || now - last >= cooldownMs;
}

export function markReminderFired(state, reminder, now) {
  const next = {
    lastByKey: {
      ...(state?.lastByKey || {}),
      [reminder.key]: now,
    },
    lastReminder: {
      key: reminder.key,
      label: reminder.label || reminder.key,
      message: reminder.message,
      at: now,
    },
  };
  saveReminderState(next);
  return next;
}

export function dispatchReminderEvent(reminder) {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(REMINDER_EVENT, { detail: reminder }));
  } catch {
    // ignore
  }
}

export function buildReminder({ key, label, message, tone = "gentle" } = {}) {
  const safeKey = String(key || "").trim();
  return {
    key: safeKey || "reminder",
    label: label || safeKey || "Reminder",
    message: message || "",
    tone,
  };
}

export function shouldFireReminder(key, cooldownMs, now = Date.now()) {
  const state = loadReminderState();
  return shouldFire(state, key, cooldownMs, now);
}

export function fireReminder(reminder, { now = Date.now() } = {}) {
  const state = loadReminderState();
  const next = markReminderFired(state, reminder, now);
  dispatchReminderEvent(next?.lastReminder || reminder);
  return next;
}
