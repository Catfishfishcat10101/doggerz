// src/components/system/AppStorageHydrator.jsx

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getStoredValue } from "@/utils/nativeStorage.js";
import {
  hydrateSettings,
  SETTINGS_STORAGE_KEY,
} from "@/redux/settingsSlice.js";
import { hydrateUserState, USER_STORAGE_KEY } from "@/redux/userSlice.js";

function parseStoredJson(raw, label) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[AppStorageHydrator] Failed to parse ${label}:`, err);
    return null;
  }
}

export default function AppStorageHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const [userRaw, settingsRaw] = await Promise.all([
        getStoredValue(USER_STORAGE_KEY),
        getStoredValue(SETTINGS_STORAGE_KEY),
      ]);
      if (cancelled) return;

      const userParsed = parseStoredJson(userRaw, USER_STORAGE_KEY);
      if (userParsed && typeof userParsed === "object") {
        dispatch(hydrateUserState(userParsed));
      }

      const settingsParsed = parseStoredJson(settingsRaw, SETTINGS_STORAGE_KEY);
      if (settingsParsed && typeof settingsParsed === "object") {
        dispatch(hydrateSettings(settingsParsed));
      }
    };

    run().catch((err) => {
      console.warn("[AppStorageHydrator] Failed to hydrate app storage:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
