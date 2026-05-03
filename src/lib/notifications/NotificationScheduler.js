/** @format */

import { CHECK_IN_THRESHOLDS } from "@/utils/checkIn.js";

async function loadNotificationRuntime() {
  return import("@/utils/notifications.js");
}

export const DEFAULT_DOGGERZ_REMINDERS = Object.freeze([
  {
    key: "checkin-hungry",
    label: "Hungry",
    title: "Your pup is a little hungry",
    message: "A small meal would make their tail wag again.",
    thresholdMs: CHECK_IN_THRESHOLDS.hungryMs,
  },
  {
    key: "checkin-lonely",
    label: "Lonely",
    title: "Your pup misses you",
    message: "A quick check-in and a little play would mean a lot.",
    thresholdMs: CHECK_IN_THRESHOLDS.strayMs,
  },
  {
    key: "checkin-milestone",
    label: "Milestone ready",
    title: "A milestone moment is waiting",
    message: "Your dog has a growth moment ready for you to celebrate.",
    thresholdMs: 30 * 60 * 1000,
  },
]);

function normalizeReminders(reminders) {
  const list = Array.isArray(reminders) ? reminders : DEFAULT_DOGGERZ_REMINDERS;
  return list
    .map((item) => ({
      key: String(item?.key || "").trim(),
      label: String(item?.label || item?.key || "Reminder").trim(),
      title: String(item?.title || "Doggerz").trim(),
      message: String(item?.message || "").trim(),
      thresholdMs: Math.max(0, Number(item?.thresholdMs || 0)),
    }))
    .filter((item) => item.key && item.title);
}

export async function scheduleDogNotifications({
  lastSeenAt,
  lastFedAt,
  baseByKey = {},
  reminders = DEFAULT_DOGGERZ_REMINDERS,
} = {}) {
  const { ensureNotificationsEnabled, scheduleLifeLoopNotifications } =
    await loadNotificationRuntime();
  const permission = await ensureNotificationsEnabled();
  if (permission !== "granted") return false;

  return scheduleLifeLoopNotifications({
    lastSeenAt: Number(lastSeenAt || Date.now()),
    lastFedAt: Number(lastFedAt || 0),
    baseByKey:
      baseByKey && typeof baseByKey === "object" ? { ...baseByKey } : {},
    reminders: normalizeReminders(reminders),
  });
}

export async function sendDogNotification({
  title = "Doggerz",
  body = "",
  tag = "doggerz",
  data = null,
} = {}) {
  const { ensureNotificationsEnabled, showDoggerzNotification } =
    await loadNotificationRuntime();
  const permission = await ensureNotificationsEnabled();
  if (permission !== "granted") return false;
  return showDoggerzNotification({ title, body, tag, data });
}

export async function sendDogNeedsNotification(kind = "hungry") {
  const hit =
    normalizeReminders(DEFAULT_DOGGERZ_REMINDERS).find(
      (item) => item.key === `checkin-${String(kind || "").toLowerCase()}`
    ) || DEFAULT_DOGGERZ_REMINDERS[0];
  return sendDogNotification({
    title: hit.title,
    body: hit.message,
    tag: hit.key,
    data: { kind },
  });
}

export async function cancelDogNotifications() {
  const { cancelLifeLoopNotifications } = await loadNotificationRuntime();
  return cancelLifeLoopNotifications();
}
