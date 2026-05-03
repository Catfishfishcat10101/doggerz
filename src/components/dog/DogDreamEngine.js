// src/components/dog/DogDreamEngine.js
/** @format */

function fallbackId() {
  return `dream-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDreamId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall back below.
  }

  return fallbackId();
}

function normalizeMemoryType(memory) {
  return String(memory?.type || "")
    .trim()
    .toLowerCase();
}

function deriveTheme(memoryType) {
  const themeByType = {
    found_dig_spot: "digging",
    random_bark: "barking",
    begged_for_food: "food",
    potty_success: "relief",
    accident: "uneasy",
    petted: "comfort",
    fell_asleep: "sleep",
    wandered: "exploring",
    played_with_toy: "play",
    ate_food: "food",
    dreamed: "sleep",
  };

  return themeByType[memoryType] || "wandering";
}

function deriveEmotion(memory) {
  const happiness = Number(memory?.happiness || 0);
  if (happiness >= 4) return "joyful";
  if (happiness >= 1) return "excited";
  if (happiness <= -3) return "anxious";
  if (happiness < 0) return "uneasy";
  return "curious";
}

function deriveKind(memory, emotion) {
  const type = normalizeMemoryType(memory);
  if (
    type === "begged_for_food" ||
    type === "accident" ||
    emotion === "anxious" ||
    emotion === "uneasy"
  ) {
    return "nightmare";
  }
  if (
    emotion === "joyful" ||
    type === "played_with_toy" ||
    type === "petted" ||
    type === "potty_success"
  ) {
    return "lucid";
  }
  return "dream";
}

function buildDreamDescription(theme) {
  switch (theme) {
    case "digging":
      return "Dreamed about digging a huge hole in the yard.";
    case "barking":
      return "Dreamed about barking at something mysterious.";
    case "food":
      return "Dreamed about a giant bowl of food.";
    case "exploring":
      return "Dreamed about exploring a big open field.";
    case "play":
      return "Dreamed about a favorite toy bouncing just out of reach.";
    case "relief":
      return "Dreamed about finding the perfect patch of grass at exactly the right time.";
    case "comfort":
      return "Dreamed about gentle pets and staying close to you.";
    case "uneasy":
      return "Dreamed about an awkward little mess and wanting a quick cleanup.";
    case "sleep":
      return "Dreamed about curling up somewhere perfectly safe and warm.";
    default:
      return "Had a strange little dream.";
  }
}

function buildDreamTitle(theme, kind) {
  if (kind === "nightmare") return "Restless dream";
  if (kind === "lucid") return "Bright dream";

  switch (theme) {
    case "digging":
      return "Dig dream";
    case "barking":
      return "Bark dream";
    case "food":
      return "Snack dream";
    case "exploring":
      return "Adventure dream";
    case "play":
      return "Toy dream";
    default:
      return "Dream";
  }
}

export function generateDream(memories) {
  const sourcePool = Array.isArray(memories)
    ? memories
        .filter((memory) => memory && typeof memory === "object")
        .slice(0, 24)
    : [];
  if (!sourcePool.length) return null;

  const randomMemory =
    sourcePool[Math.floor(Math.random() * sourcePool.length)] || sourcePool[0];
  if (!randomMemory) return null;

  const memoryType = normalizeMemoryType(randomMemory);
  const theme = deriveTheme(memoryType);
  const emotion = deriveEmotion(randomMemory);
  const kind = deriveKind(randomMemory, emotion);
  const summary = buildDreamDescription(theme);

  return {
    id: createDreamId(),
    timestamp: Date.now(),
    kind,
    theme,
    emotion,
    sourceMemory: memoryType || "memory",
    title: buildDreamTitle(theme, kind),
    summary,
    description: summary,
    motifs: [theme, emotion].filter(Boolean),
  };
}
