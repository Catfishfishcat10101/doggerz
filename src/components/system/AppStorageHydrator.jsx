// src/components/system/AppStorageHydrator.jsx

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getStoredValue } from "@/utils/nativeStorage.js";
import {
  hydrateSettings,
  SETTINGS_STORAGE_KEY,
} from "@/store/settingsSlice.js";
import { hydrateUserState, USER_STORAGE_KEY } from "@/store/userSlice.js";
import {
  DOG_STORAGE_KEY,
  getDogStorageKey,
  hydrateDog,
} from "@/store/dogSlice.js";

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
      const [userRaw, settingsRaw, dogRaw, dogLegacyRaw] = await Promise.all([
        getStoredValue(USER_STORAGE_KEY),
        getStoredValue(SETTINGS_STORAGE_KEY),
        getStoredValue(getDogStorageKey(null)),
        getStoredValue(DOG_STORAGE_KEY),
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

      const dogParsed = parseStoredJson(dogRaw, getDogStorageKey(null));
      const dogLegacyParsed = parseStoredJson(dogLegacyRaw, DOG_STORAGE_KEY);
      const dogPayload = dogParsed || dogLegacyParsed;
      if (dogPayload && typeof dogPayload === "object") {
        dispatch(hydrateDog(dogPayload));
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
