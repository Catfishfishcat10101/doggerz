// src/utils/reminders.js

export const REMINDER_STORAGE_KEY = "doggerz:reminders:v1";
export const REMINDER_EVENT = "doggerz:reminder";

const DEFAULT_STATE = { lastByKey: {}, lastReminder: null };

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadReminderState() {
  try {
    if (typeof localStorage === "undefined") return { ...DEFAULT_STATE };
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    const parsed = raw ? safeParseJson(raw) : null;
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_STATE };
    return {
      lastByKey: { ...(parsed.lastByKey || {}) },
      lastReminder: parsed.lastReminder || null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveReminderState(next) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
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
