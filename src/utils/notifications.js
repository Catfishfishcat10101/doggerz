// src/utils/notifications.js

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { withBaseUrl } from "@/utils/assetUtils.js";

export const DOG_ALERTS_CHANNEL_ID = "dog-alerts";
export const DOG_ALERT_SOUND_NAME = "bark";
export const DOG_ALERT_SOUND_FILE = `${DOG_ALERT_SOUND_NAME}.mp3`;

const LIFE_LOOP_IDS = Object.freeze({
  hungry: 9101,
  dirty: 9102,
  stray: 9103,
});

function isNativeNotifications() {
  try {
    if (!LocalNotifications?.schedule) return false;
    if (Capacitor?.isNativePlatform) return Capacitor.isNativePlatform();
    const platform = Capacitor?.getPlatform?.();
    return Boolean(platform && platform !== "web");
  } catch {
    return false;
  }
}

export function canUseNotifications() {
  return (
    isNativeNotifications() ||
    (typeof window !== "undefined" && "Notification" in window)
  );
}

export function getNotificationPermission() {
  if (isNativeNotifications()) return "prompt";
  if (!canUseNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationsPermission() {
  try {
    if (!canUseNotifications()) return "denied";
    if (isNativeNotifications()) {
      const perm = await LocalNotifications.requestPermissions();
      return perm?.display || "denied";
    }
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return "denied";
  }
}

export async function ensureDogAlertsChannel() {
  if (!isNativeNotifications()) return false;
  if (Capacitor?.getPlatform?.() !== "android") return true;
  if (!LocalNotifications?.createChannel) return false;

  try {
    await LocalNotifications.createChannel({
      id: DOG_ALERTS_CHANNEL_ID,
      name: "Dog Alerts",
      description: "Barking reminders for Doggerz care alerts",
      sound: DOG_ALERT_SOUND_NAME,
      importance: 5,
      visibility: 1,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {{ title?: string, body?: string, tag?: string, icon?: string, badge?: string, data?: any, renotify?: boolean, requireInteraction?: boolean }} [params]
 */
export async function showDoggerzNotification({
  title,
  body,
  tag,
  icon,
  badge,
  data,
  renotify = true,
  requireInteraction = false,
} = {}) {
  try {
    if (!canUseNotifications()) return false;
    if (isNativeNotifications()) {
      const perm = await requestNotificationsPermission();
      if (perm !== "granted") return false;
      await ensureDogAlertsChannel();
      const now = Date.now();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.max(1, Math.floor(now % 2147480000)),
            title: String(title || "Doggerz"),
            body: String(body || ""),
            extra: { tag, data },
            channelId: DOG_ALERTS_CHANNEL_ID,
            sound: DOG_ALERT_SOUND_FILE,
            schedule: { at: new Date(now + 1000) },
          },
        ],
      });
      return true;
    }
    if (Notification.permission !== "granted") return false;

    const options = {
      body: String(body || ""),
      tag: tag ? String(tag) : undefined,
      renotify: Boolean(renotify),
      requireInteraction: Boolean(requireInteraction),
      icon: icon || withBaseUrl("/assets/icons/icon-192.png"),
      badge: badge || withBaseUrl("/assets/icons/icon-192.png"),
      data,
    };

    // Browser fallback (works while tab/app is active).
    new Notification(String(title || "Doggerz"), options);
    return true;
  } catch {
    return false;
  }
}

export async function ensureNotificationsEnabled() {
  if (!canUseNotifications()) return "unsupported";
  if (isNativeNotifications()) return requestNotificationsPermission();
  if (Notification.permission === "granted") return "granted";
  return requestNotificationsPermission();
}

export async function cancelLifeLoopNotifications() {
  if (!isNativeNotifications()) return false;
  const ids = Object.values(LIFE_LOOP_IDS);
  try {
    await LocalNotifications.cancel({
      notifications: ids.map((id) => ({ id })),
    });
    return true;
  } catch {
    return false;
  }
}

export async function scheduleLifeLoopNotifications({
  lastSeenAt,
  lastFedAt,
  reminders = [],
} = {}) {
  if (!isNativeNotifications()) return false;
  const perm = await requestNotificationsPermission();
  if (perm !== "granted") return false;
  await ensureDogAlertsChannel();

  const now = Date.now();
  const seenBase = Number(lastSeenAt || now);
  const fedBase = Number(lastFedAt || seenBase);

  const notifications = reminders.map((reminder, idx) => {
    const reminderKey = String(reminder.key || "");
    const base =
      reminderKey === "checkin-hungry" &&
      Number.isFinite(fedBase) &&
      fedBase > 0
        ? fedBase
        : seenBase;
    const fireAt = Math.max(
      now + 60_000,
      base + Number(reminder.thresholdMs || 0)
    );
    const id = LIFE_LOOP_IDS[reminderKey.replace("checkin-", "")] || 9200 + idx;
    return {
      id,
      title: String(reminder.title || "Doggerz"),
      body: String(reminder.message || ""),
      extra: { tag: reminderKey },
      channelId: DOG_ALERTS_CHANNEL_ID,
      sound: DOG_ALERT_SOUND_FILE,
      schedule: { at: new Date(fireAt) },
    };
  });

  await cancelLifeLoopNotifications();
  try {
    await LocalNotifications.schedule({ notifications });
    return true;
  } catch {
    return false;
  }
}
