export const DOG_CLOUD_SCHEMA_VERSION = 2;

function finiteMs(value) {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value?.toMillis === "function") {
    const ms = Number(value.toMillis());
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof value === "object" && Number.isFinite(value?.seconds)) {
    return Math.max(0, Math.floor(value.seconds * 1000));
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampPct(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function safeObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
}

function pickDogTimestamp(dog) {
  return Math.max(
    finiteMs(dog?.updatedAt),
    finiteMs(dog?.lastCloudSyncAt),
    finiteMs(dog?.meta?.savedAt),
    finiteMs(dog?.lastUpdatedAt),
    finiteMs(dog?.adoptedAt)
  );
}

function pickMoodLabel(dog) {
  if (typeof dog?.mood === "string" && dog.mood.trim()) return dog.mood.trim();
  if (typeof dog?.emotionCue === "string" && dog.emotionCue.trim()) {
    return dog.emotionCue.trim();
  }
  return "Content";
}

export function getPersistenceSnapshotTimestamp(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return 0;
  if (Number(snapshot.schemaVersion) >= 2) {
    return Math.max(
      finiteMs(snapshot?.meta?.savedAt),
      pickDogTimestamp(snapshot?.dog)
    );
  }
  return pickDogTimestamp(snapshot);
}

export function buildDogCloudSummary({ dog = {}, user = {}, settings = {} }) {
  const dogName =
    String(dog?.name || user?.dogName || "Your dog").trim() || "Your dog";

  return {
    schemaVersion: DOG_CLOUD_SCHEMA_VERSION,
    dog: {
      name: dogName,
      stage:
        String(
          dog?.lifeStage?.label || dog?.lifeStage?.stage || "Puppy"
        ).trim() || "Puppy",
      ageDays: Math.max(0, Math.round(Number(dog?.lifeStage?.days || 0))),
      level: Math.max(1, Math.round(Number(dog?.level || 1))),
    },
    stats: {
      energy: clampPct(dog?.stats?.energy),
      health: clampPct(dog?.stats?.health),
      mood: pickMoodLabel(dog),
    },
    settings: {
      weatherNotifications: settings?.dailyRemindersEnabled !== false,
      soundVolume: clampPct(Number(settings?.audio?.masterVolume ?? 0.8) * 100),
      weatherFx: settings?.showWeatherFx !== false,
    },
  };
}

export function createDogPersistenceSnapshot(
  state,
  { savedAt = Date.now() } = {}
) {
  const dog = safeObject(state?.dog);
  const progression = safeObject(state?.progression, null);
  const user = safeObject(state?.user);
  const settings = safeObject(state?.settings);

  return {
    schemaVersion: DOG_CLOUD_SCHEMA_VERSION,
    dog: {
      adoptedAt: dog.adoptedAt || null,
      name: dog.name || user.dogName || "Your dog",
      stats: safeObject(dog.stats),
      bond: safeObject(dog.bond),
      memory: safeObject(dog.memory),
      memories: Array.isArray(dog.memories) ? dog.memories.slice(0, 80) : [],
      training: safeObject(dog.training),
      skills: safeObject(dog.skills),
      cosmetics: safeObject(dog.cosmetics),
      inventory: safeObject(dog.inventory),
      coins: Math.max(0, Math.round(Number(dog.coins || 0))),
      gems: Math.max(0, Math.round(Number(dog.gems || 0))),
      level: Math.max(1, Math.round(Number(dog.level || 1))),
      xp: Math.max(0, Math.round(Number(dog.xp || 0))),
      streak: safeObject(dog.streak),
      lastAction: dog.lastAction || null,
      lastCareResponse: dog.lastCareResponse || dog.careResponse || null,
      lastRewardClaimedAt: dog.lastRewardClaimedAt || null,
      consecutiveDays: Math.max(
        0,
        Math.floor(Number(dog.consecutiveDays || 0))
      ),
      lifecycleStatus: dog.lifecycleStatus || null,
      lifeStage: safeObject(dog.lifeStage),
      lastUpdatedAt: dog.lastUpdatedAt || null,
    },
    progression,
    summary: buildDogCloudSummary({ dog, user, settings }),
    meta: {
      savedAt,
      source: "doggerz-web",
    },
  };
}

export function getDogPersistenceSignature(snapshot) {
  const dog = safeObject(snapshot?.dog);
  return JSON.stringify({
    schemaVersion: snapshot?.schemaVersion || DOG_CLOUD_SCHEMA_VERSION,
    savedAt: snapshot?.meta?.savedAt || null,
    adoptedAt: dog.adoptedAt || null,
    lastUpdatedAt: dog.lastUpdatedAt || null,
    lastAction: dog.lastAction || null,
    stats: dog.stats || null,
    bond: dog.bond || null,
    memory: dog.memory || null,
    training: dog.training || null,
    cosmetics: dog.cosmetics || null,
    inventory: dog.inventory || null,
    coins: dog.coins || 0,
    gems: dog.gems || 0,
    streak: dog.streak || null,
    dailyReward: {
      lastRewardClaimedAt: dog.lastRewardClaimedAt || null,
      consecutiveDays: dog.consecutiveDays || 0,
    },
    lifecycleStatus: dog.lifecycleStatus || null,
    progression: snapshot?.progression || null,
  });
}

export function splitDogPersistenceSnapshot(raw) {
  const data = safeObject(raw, null);
  if (!data) return { ok: false, reason: "missing_snapshot" };

  if (Number(data.schemaVersion) >= 2) {
    if (!data.dog || typeof data.dog !== "object") {
      return { ok: false, reason: "missing_dog_payload" };
    }
    return {
      ok: true,
      schemaVersion: Number(data.schemaVersion),
      dog: data.dog,
      progression:
        data.progression && typeof data.progression === "object"
          ? data.progression
          : null,
      timestamp: getPersistenceSnapshotTimestamp(data),
    };
  }

  const legacy = { ...data };
  const progression =
    legacy.progression && typeof legacy.progression === "object"
      ? legacy.progression
      : null;
  delete legacy.progression;
  delete legacy.cloudSummary;
  delete legacy.cloudSchemaVersion;
  return {
    ok: true,
    schemaVersion: 1,
    dog: legacy,
    progression,
    timestamp: getPersistenceSnapshotTimestamp(legacy),
  };
}
