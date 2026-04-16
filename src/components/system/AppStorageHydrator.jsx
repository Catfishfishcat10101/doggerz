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
import {
  hydrateProgression,
  resetProgression,
} from "@/features/progression/progressionSlice.js";

function splitPersistedDogRecord(raw) {
  if (!raw || typeof raw !== "object") {
    return { dogPayload: null, progressionPayload: null };
  }

  if (raw.dog && typeof raw.dog === "object") {
    return {
      dogPayload: raw.dog,
      progressionPayload:
        raw.progression && typeof raw.progression === "object"
          ? raw.progression
          : null,
    };
  }

  const dogPayload = { ...raw };
  const progressionPayload =
    dogPayload.progression && typeof dogPayload.progression === "object"
      ? dogPayload.progression
      : null;
  delete dogPayload.progression;

  return {
    dogPayload,
    progressionPayload,
  };
}

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
      const persistedRecord = dogParsed || dogLegacyParsed;
      const { dogPayload, progressionPayload } =
        splitPersistedDogRecord(persistedRecord);
      if (dogPayload && typeof dogPayload === "object") {
        dispatch(hydrateDog(dogPayload));
        if (progressionPayload) {
          dispatch(hydrateProgression(progressionPayload));
        } else {
          dispatch(resetProgression());
        }
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
