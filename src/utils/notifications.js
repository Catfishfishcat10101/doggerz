// src/utils/notifications.js

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

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
      const now = Date.now();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.max(1, Math.floor(now % 2147480000)),
            title: String(title || "Doggerz"),
            body: String(body || ""),
            extra: { tag, data },
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
      icon: icon || "/assets/icons/doggerz-192.png",
      badge: badge || "/assets/icons/doggerz-192.png",
      data,
    };

    // Prefer SW notifications if available (better behavior in PWAs).
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(String(title || "Doggerz"), options);
        return true;
      }
    }

    // Fallback: in-page notification (works while tab/app is active).
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
  reminders = [],
} = {}) {
  if (!isNativeNotifications()) return false;
  const perm = await requestNotificationsPermission();
  if (perm !== "granted") return false;

  const now = Date.now();
  const base = Number(lastSeenAt || now);

  const notifications = reminders.map((reminder, idx) => {
    const fireAt = Math.max(
      now + 60_000,
      base + Number(reminder.thresholdMs || 0)
    );
    const id =
      LIFE_LOOP_IDS[reminder.key?.replace("checkin-", "")] || 9200 + idx;
    return {
      id,
      title: String(reminder.title || "Doggerz"),
      body: String(reminder.message || ""),
      extra: { tag: reminder.key },
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
