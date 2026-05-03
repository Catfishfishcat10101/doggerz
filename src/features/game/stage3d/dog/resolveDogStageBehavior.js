const clamp = (value, min = 0, max = 100) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

const ONE_SHOT_ACTION_CLIPS = Object.freeze({
  bark: "Bark",
  paw: "Wag",
  beg: "Wag",
  potty: "Wag",
  train: "Wag",
  feed: "Wag",
  water: "Wag",
  play: "Walk",
  zoomies: "Walk",
  rest: "Sleep",
  sleep: "Sleep",
  bath: "Idle",
});

function hash01(seed = "") {
  const input = String(seed || "");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10_000) / 10_000;
}

function getTimeOfDay(scene = {}) {
  return String(scene?.timeOfDayBucket || scene?.timeOfDay || "day")
    .trim()
    .toLowerCase();
}

function getWeather(scene = {}) {
  return String(scene?.weatherKey || scene?.weather || "")
    .trim()
    .toLowerCase();
}

function isBadWeather(scene = {}) {
  const key = getWeather(scene);
  return (
    key.includes("rain") ||
    key.includes("storm") ||
    key.includes("drizzle") ||
    key.includes("snow") ||
    key.includes("sleet") ||
    key.includes("fog") ||
    key.includes("mist")
  );
}

function resolveRecentActionClip(lastAction = "") {
  const action = String(lastAction || "")
    .trim()
    .toLowerCase();
  if (!action) return null;

  for (const [token, clip] of Object.entries(ONE_SHOT_ACTION_CLIPS)) {
    if (action.includes(token)) return clip;
  }
  return null;
}

function chooseWeighted(entries, seed) {
  const activeEntries = entries.filter((entry) => Number(entry.weight) > 0);
  const total = activeEntries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return activeEntries[0]?.id || "idle";

  let cursor = hash01(seed) * total;
  for (const entry of activeEntries) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.id;
  }
  return activeEntries[activeEntries.length - 1]?.id || "idle";
}

export function resolveDogStageBehavior(scene = {}, now = Date.now()) {
  const windowMs = 6500;
  const windowId = Math.floor(Number(now || Date.now()) / windowMs);
  const energy = clamp(scene?.energyPct, 0, 100);
  const happiness = clamp(scene?.happinessPct, 0, 100);
  const bond = clamp(scene?.bondPct, 0, 100);
  const health = clamp(scene?.healthPct ?? 100, 0, 100);
  const cleanliness = clamp(scene?.cleanlinessPct, 0, 100);
  const potty = clamp(scene?.pottyNeedPct ?? 0, 0, 100);
  const lastAction = String(scene?.lastAction || "");
  const actionClip = resolveRecentActionClip(lastAction);
  const actionAt = Number(scene?.lastCareResponse?.createdAt || 0);
  const recentActionActive = actionAt > 0 && now - actionAt < 2600;

  if (scene?.isSleeping || energy <= 14 || health <= 18) {
    return {
      id: "sleep",
      clip: "Sleep",
      loop: true,
      lookAround: false,
      blink: false,
      intensity: 0.35,
    };
  }

  if (recentActionActive && actionClip) {
    return {
      id: `action:${lastAction}`,
      clip: actionClip,
      loop: actionClip !== "Bark",
      lookAround: actionClip === "Idle" || actionClip === "Wag",
      blink: false,
      intensity: 1,
    };
  }

  const timeOfDay = getTimeOfDay(scene);
  const badWeather = isBadWeather(scene);
  const night = timeOfDay.includes("night");
  const morning = timeOfDay.includes("morning");
  const evening = timeOfDay.includes("evening");
  const lowNeed =
    energy >= 45 &&
    happiness >= 45 &&
    health >= 45 &&
    cleanliness >= 38 &&
    potty < 82;

  const entries = [
    { id: "idle", weight: 34, clip: "Idle" },
    { id: "sit", weight: lowNeed ? 20 : 7, clip: "Sit" },
    { id: "look", weight: 16, clip: "Idle" },
    {
      id: "wander",
      weight: energy >= 38 && !badWeather ? 14 : 3,
      clip: "Walk",
    },
    {
      id: "wag",
      weight: happiness >= 68 || bond >= 65 ? 18 : happiness >= 50 ? 7 : 1,
      clip: "Wag",
    },
    {
      id: "paw",
      weight: bond >= 45 && happiness < 48 && energy >= 30 ? 8 : 0,
      clip: "Wag",
    },
    {
      id: "bark",
      weight:
        energy >= 45 && health >= 45 && (morning || evening) && !badWeather
          ? bond >= 55
            ? 4
            : 7
          : 0,
      clip: "Bark",
    },
    { id: "rest", weight: energy <= 32 || night ? 16 : 1, clip: "Sleep" },
    {
      id: "shelter",
      weight: badWeather ? 24 : 0,
      clip: energy <= 35 ? "Sleep" : "Sit",
    },
    {
      id: "uneasy",
      weight: health <= 38 || cleanliness <= 28 || potty >= 88 ? 24 : 0,
      clip: "Walk",
    },
  ];

  if (morning) entries.push({ id: "morning_wander", weight: 10, clip: "Walk" });
  if (evening) entries.push({ id: "evening_sit", weight: 10, clip: "Sit" });

  const id = chooseWeighted(
    entries,
    `${scene?.stageKey || "PUPPY"}:${timeOfDay}:${getWeather(scene)}:${Math.round(
      energy / 10
    )}:${Math.round(happiness / 10)}:${Math.round(bond / 10)}:${windowId}`
  );
  const selected = entries.find((entry) => entry.id === id) || entries[0];

  return {
    id,
    clip: selected.clip || "Idle",
    loop: selected.clip !== "Bark",
    lookAround: [
      "idle",
      "look",
      "sit",
      "paw",
      "shelter",
      "evening_sit",
    ].includes(id),
    blink: ["idle", "look", "sit", "wag", "paw"].includes(id),
    intensity:
      id === "bark" ? 1 : id === "shelter" || id === "uneasy" ? 0.7 : 0.5,
  };
}
