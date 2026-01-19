// src/components/AppReminderEffects.jsx
import * as React from "react";
import { useSelector } from "react-redux";

import { selectSettings } from "@/redux/settingsSlice.js";
import { selectDog } from "@/redux/dogSlice.js";
import { useToast } from "@/components/ToastProvider.jsx";
import {
  canUseNotifications,
  requestNotificationsPermission,
  showDoggerzNotification,
} from "@/utils/notifications.js";

const REMINDER_STORAGE_KEY = "doggerz:reminders:v1";

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadReminderState() {
  try {
    if (typeof localStorage === "undefined") return { lastByKey: {} };
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    const parsed = raw ? safeParseJson(raw) : null;
    const lastByKey =
      parsed && typeof parsed === "object" && parsed.lastByKey
        ? parsed.lastByKey
        : {};
    return { lastByKey: { ...(lastByKey || {}) } };
  } catch {
    return { lastByKey: {} };
  }
}

function saveReminderState(next) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function minutes(n) {
  return Math.max(0, Number(n) || 0) * 60_000;
}

function shouldFire(state, key, cooldownMs, now) {
  const last = Number(state?.lastByKey?.[key] || 0);
  return !last || now - last >= cooldownMs;
}

function markFired(state, key, now) {
  const next = {
    lastByKey: {
      ...(state?.lastByKey || {}),
      [key]: now,
    },
  };
  saveReminderState(next);
  return next;
}

function getPrimaryReminder(dog, now) {
  const stats = dog?.stats || {};
  const memory = dog?.memory || {};

  const hunger = Number(stats.hunger || 0);
  const energy = Number(stats.energy || 0);
  const cleanliness = Number(stats.cleanliness || 0);
  const pottyLevel = Number(dog?.pottyLevel || 0);

  const lastSeenAt = Number(memory.lastSeenAt || dog?.lastUpdatedAt || 0);
  const msSinceSeen = lastSeenAt ? now - lastSeenAt : Infinity;

  if (hunger >= 80) {
    return {
      key: "hungry",
      title: "Doggerz",
      message: "Your pup is hungry. Quick feed?",
      cooldownMs: minutes(90),
    };
  }

  if (!dog?.isAsleep && energy <= 22) {
    return {
      key: "sleepy",
      title: "Doggerz",
      message: "Your pup looks sleepy. Time for a nap?",
      cooldownMs: minutes(120),
    };
  }

  if (cleanliness <= 22) {
    return {
      key: "dirty",
      title: "Doggerz",
      message: "Your pup is getting dirty. Bath time soon.",
      cooldownMs: minutes(180),
    };
  }

  if (pottyLevel >= 85) {
    return {
      key: "potty",
      title: "Doggerz",
      message: "Potty break? Take your pup out.",
      cooldownMs: minutes(60),
    };
  }

  if (msSinceSeen >= 6 * 60 * 60_000) {
    return {
      key: "checkin",
      title: "Doggerz",
      message: "Your pup misses you. Quick check-in?",
      cooldownMs: minutes(240),
    };
  }

  return null;
}

export default function AppReminderEffects() {
  const toast = useToast();
  const settings = useSelector(selectSettings);
  const dog = useSelector(selectDog);

  // 1) Gentle permission prompt (only on user gesture via toast action)
  React.useEffect(() => {
    if (!settings?.dailyRemindersEnabled) return;
    if (!canUseNotifications()) return;
    if (Notification.permission !== "default") return;

    toast.once(
      "enable-notifications",
      {
        type: "info",
        message: "Enable notifications for gentle dog reminders?",
        durationMs: 6500,
        action: {
          label: "Enable",
          onClick: () => {
            requestNotificationsPermission().then((perm) => {
              if (perm === "granted") toast.success("Notifications enabled.");
              else toast.info("Notifications not enabled.");
            });
          },
        },
      },
      24 * 60 * 60_000
    );
  }, [settings?.dailyRemindersEnabled, toast]);

  // 2) Reminder loop (low frequency, debounced by localStorage cooldown)
  React.useEffect(() => {
    if (!settings?.dailyRemindersEnabled) return;

    let reminderState = loadReminderState();
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      if (!dog?.adoptedAt) return;

      const now = Date.now();
      const reminder = getPrimaryReminder(dog, now);
      if (!reminder) return;

      const canNotify =
        canUseNotifications() && Notification.permission === "granted";
      const should = shouldFire(
        reminderState,
        reminder.key,
        reminder.cooldownMs,
        now
      );
      if (!should) return;

      reminderState = markFired(reminderState, reminder.key, now);

      // If the app is backgrounded, prefer a system notification.
      if (document.hidden && canNotify) {
        await showDoggerzNotification({
          title: reminder.title,
          body: reminder.message,
          tag: `dz-${reminder.key}`,
        });
        return;
      }

      // Otherwise keep it subtle.
      toast.info(reminder.message, 2200);
    };

    const interval = window.setInterval(tick, 60_000);
    tick();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [dog, settings?.dailyRemindersEnabled, toast]);

  return null;
}
