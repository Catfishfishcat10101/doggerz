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
import {
  dispatchReminderEvent,
  loadReminderState,
  markReminderFired,
  shouldFire,
} from "@/utils/reminders.js";

function minutes(n) {
  return Math.max(0, Number(n) || 0) * 60_000;
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
      label: "Hungry",
      title: "Doggerz",
      message: "Your pup is hungry. Quick feed?",
      cooldownMs: minutes(90),
    };
  }

  if (!dog?.isAsleep && energy <= 22) {
    return {
      key: "sleepy",
      label: "Sleepy",
      title: "Doggerz",
      message: "Your pup looks sleepy. Time for a nap?",
      cooldownMs: minutes(120),
    };
  }

  if (cleanliness <= 22) {
    return {
      key: "dirty",
      label: "Dirty",
      title: "Doggerz",
      message: "Your pup is getting dirty. Bath time soon.",
      cooldownMs: minutes(180),
    };
  }

  if (pottyLevel >= 85) {
    return {
      key: "potty",
      label: "Potty Break",
      title: "Doggerz",
      message: "Potty break? Take your pup out.",
      cooldownMs: minutes(60),
    };
  }

  if (msSinceSeen >= 6 * 60 * 60_000) {
    return {
      key: "checkin",
      label: "Check-in",
      title: "Doggerz",
      message: "Your pup misses you. Quick check-in?",
      cooldownMs: minutes(240),
    };
  }

  return null;
}

function getForcedReminder(input) {
  if (!input) return null;
  if (typeof input === "object" && input.key && input.message) {
    return {
      key: `force-${String(input.key)}`,
      label: input.label || input.key,
      title: input.title || "Doggerz",
      message: String(input.message),
      cooldownMs: 0,
    };
  }

  const raw = String(input || "").trim();
  if (!raw) return null;
  const key = raw.toLowerCase();

  switch (key) {
    case "hungry":
      return {
        key: "force-hungry",
        label: "Hungry",
        title: "Doggerz",
        message: "Your pup is hungry. Quick feed?",
        cooldownMs: 0,
      };
    case "sleepy":
      return {
        key: "force-sleepy",
        label: "Sleepy",
        title: "Doggerz",
        message: "Your pup looks sleepy. Time for a nap?",
        cooldownMs: 0,
      };
    case "dirty":
      return {
        key: "force-dirty",
        label: "Dirty",
        title: "Doggerz",
        message: "Your pup is getting dirty. Bath time soon.",
        cooldownMs: 0,
      };
    case "potty":
      return {
        key: "force-potty",
        label: "Potty Break",
        title: "Doggerz",
        message: "Potty break? Take your pup out.",
        cooldownMs: 0,
      };
    case "checkin":
      return {
        key: "force-checkin",
        label: "Check-in",
        title: "Doggerz",
        message: "Your pup misses you. Quick check-in?",
        cooldownMs: 0,
      };
    default:
      return {
        key: "force-custom",
        label: "Reminder",
        title: "Doggerz",
        message: raw,
        cooldownMs: 0,
      };
  }
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
      const forcedInput =
        typeof window !== "undefined"
          ? window.__DOGGERZ_FORCE_REMINDER__
          : null;
      const forcedReminder = getForcedReminder(forcedInput);
      if (forcedReminder) {
        if (typeof window !== "undefined") {
          window.__DOGGERZ_FORCE_REMINDER__ = null;
        }
        reminderState = markReminderFired(reminderState, forcedReminder, now);
        dispatchReminderEvent(reminderState.lastReminder);

        const canNotify =
          canUseNotifications() && Notification.permission === "granted";
        if (document.hidden && canNotify) {
          await showDoggerzNotification({
            title: forcedReminder.title,
            body: forcedReminder.message,
            tag: `dz-${forcedReminder.key}`,
          });
          return;
        }

        toast.info(forcedReminder.message, 2200);
        return;
      }

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

      reminderState = markReminderFired(reminderState, reminder, now);
      dispatchReminderEvent(reminderState.lastReminder);

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
    const forceInterval = window.setInterval(() => {
      if (typeof window !== "undefined" && window.__DOGGERZ_FORCE_REMINDER__) {
        tick();
      }
    }, 1500);
    tick();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearInterval(forceInterval);
    };
  }, [dog, settings?.dailyRemindersEnabled, toast]);

  return null;
}
