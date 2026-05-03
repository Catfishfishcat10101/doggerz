// src/lib/storage/dogPersistence.js
import {
  DOG_SAVE_SCHEMA_VERSION,
  DOG_STORAGE_KEY,
  getDogStorageKey,
} from "@/store/dogSlice.js";
import {
  loadLocalSave,
  removeLocalSave,
  saveLocalSave,
} from "@/lib/storage/LocalSaveManager.js";

export function splitPersistedDogRecord(raw) {
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

  return { dogPayload, progressionPayload };
}

export function buildPersistedDogRecord({
  dogState,
  progressionState,
  savedAt = new Date().toISOString(),
} = {}) {
  return {
    ...(dogState && typeof dogState === "object" ? dogState : {}),
    ...(progressionState && typeof progressionState === "object"
      ? { progression: progressionState }
      : {}),
    meta: {
      ...((dogState && dogState.meta) || {}),
      schemaVersion: DOG_SAVE_SCHEMA_VERSION,
      savedAt,
    },
  };
}

export async function loadDogSnapshotFromDevice(userId = null) {
  const activeKey = getDogStorageKey(userId);
  let persisted = await loadLocalSave(activeKey, null);
  if (!persisted && activeKey === getDogStorageKey(null)) {
    persisted = await loadLocalSave(DOG_STORAGE_KEY, null);
  }
  return splitPersistedDogRecord(persisted);
}

export async function saveDogSnapshotToDevice({
  userId = null,
  dogState,
  progressionState,
} = {}) {
  const activeKey = getDogStorageKey(userId);
  const payload = buildPersistedDogRecord({ dogState, progressionState });
  return saveLocalSave(activeKey, payload);
}

export async function deleteDogSnapshotFromDevice(userId = null) {
  const activeKey = getDogStorageKey(userId);
  const primaryDeleted = await removeLocalSave(activeKey);
  if (activeKey === getDogStorageKey(null)) {
    await removeLocalSave(DOG_STORAGE_KEY);
  }
  return primaryDeleted;
}
