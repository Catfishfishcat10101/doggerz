/** @format */
// src/components/CheckInReminders.jsx

import * as React from "react";
import { useSelector } from "react-redux";

import { selectDog } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { showDoggerzNotification } from "@/utils/notifications.js";
import {
  buildReminder,
  fireReminder,
  shouldFireReminder,
} from "@/utils/reminders.js";
import { withBaseUrl } from "@/utils/assetUrl.js";
import { CHECK_IN_THRESHOLDS, getCheckInTier } from "@/utils/checkIn.js";

const REMINDERS = [
  {
    key: "checkin-hungry",
    label: "Hungry",
    title: "Your pup is hungry",
    message: "It has been 4 hours. A quick snack keeps them happy.",
    thresholdMs: CHECK_IN_THRESHOLDS.hungryMs,
    cooldownMs: 3 * 60 * 60 * 1000,
    icon: "/assets/icons/doggerz-192.png",
  },
  {
    key: "checkin-dirty",
    label: "Needs a bath",
    title: "Your pup needs a rinse",
    message: "It has been 12 hours. They are getting scruffy.",
    thresholdMs: CHECK_IN_THRESHOLDS.dirtyMs,
    cooldownMs: 6 * 60 * 60 * 1000,
    icon: "/assets/icons/doggerz-192.png",
  },
  {
    key: "checkin-stray",
    label: "Feeling lonely",
    title: "Your Jack Russell is lonely",
    message:
      "It has been 24 hours. Your pup is looking a bit stray. Come check in.",
    thresholdMs: CHECK_IN_THRESHOLDS.strayMs,
    cooldownMs: 12 * 60 * 60 * 1000,
    icon: "/assets/imports/jr/stray_idle/frame_000.png",
  },
];

export default function CheckInReminders() {
  const dog = useSelector(selectDog);
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
    if (typeof window !== "undefined" && !window.isSecureContext) {
      return undefined;
    }

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
        const ok = await showDoggerzNotification({
          title: reminder.title,
          body: reminder.message,
          tag: reminder.key,
          icon: withBaseUrl(reminder.icon),
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

    clearTimers();
    REMINDERS.forEach(schedule);

    return () => clearTimers();
  }, [clearTimers, lastSeenAt, settings?.dailyRemindersEnabled]);

  React.useEffect(() => {
    if (settings?.dailyRemindersEnabled) return;
    const root = document.documentElement;
    delete root.dataset.checkinTier;
    clearTimers();
  }, [clearTimers, settings?.dailyRemindersEnabled]);

  return null;
}
