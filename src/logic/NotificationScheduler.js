/** @format */

import {
  cancelLifeLoopNotifications,
  ensureNotificationsEnabled,
  scheduleLifeLoopNotifications,
  showDoggerzNotification,
} from "@/utils/notifications.js";
import { CHECK_IN_THRESHOLDS } from "@/utils/checkIn.js";

export const DEFAULT_DOGGERZ_REMINDERS = Object.freeze([
  {
    key: "checkin-hungry",
    label: "Hungry",
    title: "Your pup is hungry",
    message: "It has been 4 hours. A quick snack keeps them happy.",
    thresholdMs: CHECK_IN_THRESHOLDS.hungryMs,
  },
  {
    key: "checkin-dirty",
    label: "Needs a bath",
    title: "Your pup needs a rinse",
    message: "It has been 12 hours. They are getting scruffy.",
    thresholdMs: CHECK_IN_THRESHOLDS.dirtyMs,
  },
  {
    key: "checkin-stray",
    label: "Feeling lonely",
    title: "Your Jack Russell is lonely",
    message:
      "It has been 24 hours. Your pup is looking a bit stray. Come check in.",
    thresholdMs: CHECK_IN_THRESHOLDS.strayMs,
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
  reminders = DEFAULT_DOGGERZ_REMINDERS,
} = {}) {
  const permission = await ensureNotificationsEnabled();
  if (permission !== "granted") return false;

  return scheduleLifeLoopNotifications({
    lastSeenAt: Number(lastSeenAt || Date.now()),
    lastFedAt: Number(lastFedAt || 0),
    reminders: normalizeReminders(reminders),
  });
}

export async function sendDogNotification({
  title = "Doggerz",
  body = "",
  tag = "doggerz",
  data = null,
} = {}) {
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

export { cancelLifeLoopNotifications as cancelDogNotifications };
