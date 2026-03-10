/** @format */
// src/components/CheckInReminders.jsx

import * as React from "react";
import { useSelector } from "react-redux";

import { selectSettings } from "@/redux/settingsSlice.js";
import {
  DEFAULT_DOGGERZ_REMINDERS,
  cancelDogNotifications,
  scheduleDogNotifications,
  sendDogNotification,
} from "@/logic/NotificationScheduler.js";
import { useDog } from "@/hooks/useDogState.js";
import {
  buildReminder,
  fireReminder,
  loadReminderStateAsync,
  shouldFireReminder,
} from "@/utils/reminders.js";
import { withBaseUrl } from "@/utils/assetUtils.js";
import { getCheckInTier } from "@/utils/checkIn.js";

const REMINDERS = DEFAULT_DOGGERZ_REMINDERS.map((item) => ({
  ...item,
  cooldownMs:
    item.key === "checkin-hungry"
      ? 3 * 60 * 60 * 1000
      : item.key === "checkin-dirty"
        ? 6 * 60 * 60 * 1000
        : 12 * 60 * 60 * 1000,
  icon:
    item.key === "checkin-stray"
      ? "/assets/sprites/jr/pup_clean.png"
      : "/assets/icons/icon-192.png",
}));

export default function CheckInReminders() {
  const dog = useDog();
  const settings = useSelector(selectSettings);
  const timersRef = React.useRef([]);

  const lastSeenAt =
    dog?.memory?.lastSeenAt || dog?.memory?.lastSeen || dog?.lastUpdatedAt || 0;

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  React.useEffect(() => {
    if (!settings?.dailyRemindersEnabled) return undefined;
    if (!lastSeenAt) return undefined;
    let cancelled = false;

    const root = document.documentElement;
    const tier = getCheckInTier(lastSeenAt).tier;
    if (tier && tier !== "ok") root.dataset.checkinTier = tier;
    else delete root.dataset.checkinTier;

    const now = Date.now();
    const elapsedMs = Math.max(0, now - Number(lastSeenAt || 0));

    const schedule = (reminder) => {
      const timeUntil = reminder.thresholdMs - elapsedMs;
      const fire = async () => {
        if (!settings?.dailyRemindersEnabled) return;
        if (typeof window !== "undefined" && !window.isSecureContext) return;
        if (
          !shouldFireReminder(reminder.key, reminder.cooldownMs, Date.now())
        ) {
          return;
        }
        const ok = await sendDogNotification({
          title: reminder.title,
          body: reminder.message,
          tag: reminder.key,
          data: { icon: withBaseUrl(reminder.icon) },
        });
        if (ok) {
          fireReminder(
            buildReminder({
              key: reminder.key,
              label: reminder.label,
              message: reminder.message,
            })
          );
        }
      };

      if (timeUntil <= 0) {
        fire();
      } else {
        timersRef.current.push(window.setTimeout(fire, timeUntil));
      }
    };

    const run = async () => {
      await loadReminderStateAsync();
      const scheduled = await scheduleDogNotifications({
        lastSeenAt,
        reminders: REMINDERS,
      });
      if (cancelled || scheduled) return;

      if (typeof window !== "undefined" && !window.isSecureContext) {
        return;
      }

      clearTimers();
      REMINDERS.forEach(schedule);
    };

    run();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [clearTimers, lastSeenAt, settings?.dailyRemindersEnabled]);

  React.useEffect(() => {
    if (settings?.dailyRemindersEnabled) return;
    const root = document.documentElement;
    delete root.dataset.checkinTier;
    cancelDogNotifications();
    clearTimers();
  }, [clearTimers, settings?.dailyRemindersEnabled]);

  return null;
}
