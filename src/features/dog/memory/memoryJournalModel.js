// src/features/dog/memory/memoryJournalModel.js
const STORY_CATEGORY_IDS = Object.freeze({
  FIRSTS: "firsts",
  MILESTONES: "milestones",
  FAVORITES: "favorites",
  FUNNY: "funny",
  CARE_HISTORY: "care_history",
});

export const MEMORY_STORY_CATEGORIES = Object.freeze({
  [STORY_CATEGORY_IDS.FIRSTS]: Object.freeze({
    id: STORY_CATEGORY_IDS.FIRSTS,
    label: "Firsts",
    icon: "🌟",
    description: "The moments that started your shared story.",
  }),
  [STORY_CATEGORY_IDS.MILESTONES]: Object.freeze({
    id: STORY_CATEGORY_IDS.MILESTONES,
    label: "Milestones",
    icon: "🏅",
    description: "Growth markers and hard-earned progress together.",
  }),
  [STORY_CATEGORY_IDS.FAVORITES]: Object.freeze({
    id: STORY_CATEGORY_IDS.FAVORITES,
    label: "Favorite Things",
    icon: "💛",
    description: "The toys, foods, and comforts your pup loves most.",
  }),
  [STORY_CATEGORY_IDS.FUNNY]: Object.freeze({
    id: STORY_CATEGORY_IDS.FUNNY,
    label: "Funny Moments",
    icon: "😄",
    description: "Unexpected little moments that make your pup feel alive.",
  }),
  [STORY_CATEGORY_IDS.CARE_HISTORY]: Object.freeze({
    id: STORY_CATEGORY_IDS.CARE_HISTORY,
    label: "Care History",
    icon: "🫶",
    description: "Daily care moments that built trust over time.",
  }),
});

export const MEMORY_STORY_ORDER = Object.freeze([
  STORY_CATEGORY_IDS.FIRSTS,
  STORY_CATEGORY_IDS.MILESTONES,
  STORY_CATEGORY_IDS.FAVORITES,
  STORY_CATEGORY_IDS.FUNNY,
  STORY_CATEGORY_IDS.CARE_HISTORY,
]);

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function tokenizeEntry(entry = {}) {
  return [
    normalizeText(entry?.type),
    normalizeText(entry?.category),
    normalizeText(entry?.moodTag),
    normalizeText(entry?.emotion),
    normalizeText(entry?.sourceMemory),
    normalizeText(entry?.summary),
    normalizeText(entry?.body),
  ]
    .filter(Boolean)
    .join(" ");
}

function includesAny(source, needles) {
  return needles.some((needle) => source.includes(needle));
}

export function classifyMemoryStoryCategory(entry) {
  const text = tokenizeEntry(entry);
  if (!text) return STORY_CATEGORY_IDS.CARE_HISTORY;

  if (
    includesAny(text, [
      "first ",
      "first_",
      "adoption",
      "started",
      "welcome home",
      "first level up",
    ])
  ) {
    return STORY_CATEGORY_IDS.FIRSTS;
  }

  if (
    includesAny(text, [
      "milestone",
      "master",
      "mastered",
      "level up",
      "unlocked",
      "unlock",
      "completed",
      "graduated",
      "rank",
    ])
  ) {
    return STORY_CATEGORY_IDS.MILESTONES;
  }

  if (
    includesAny(text, [
      "favorite",
      "prefers",
      "favorite toy",
      "favorite food",
      "favorite nap",
      "cozy",
      "comfort",
    ])
  ) {
    return STORY_CATEGORY_IDS.FAVORITES;
  }

  if (
    includesAny(text, [
      "zoomies",
      "squirrel",
      "stole",
      "dig",
      "goofy",
      "mischief",
      "chaos",
      "awkward",
      "smug",
      "oops",
      "dramatic",
    ])
  ) {
    return STORY_CATEGORY_IDS.FUNNY;
  }

  return STORY_CATEGORY_IDS.CARE_HISTORY;
}

function normalizeEntry(entry = {}, index = 0) {
  const timestamp = Number(entry?.timestamp || 0);
  const storyCategoryId = classifyMemoryStoryCategory(entry);
  const storyCategory =
    MEMORY_STORY_CATEGORIES[storyCategoryId] ||
    MEMORY_STORY_CATEGORIES[STORY_CATEGORY_IDS.CARE_HISTORY];
  const summary = String(entry?.summary || "").trim();
  const body = String(entry?.body || "").trim();
  const categoryLabel = String(entry?.category || entry?.type || "MEMORY")
    .trim()
    .toUpperCase();
  const id =
    String(entry?.id || "").trim() ||
    `memory-entry:${Math.max(0, timestamp)}:${index}`;

  return {
    ...entry,
    id,
    timestamp: Number.isFinite(timestamp) ? timestamp : 0,
    summary: summary || "A shared moment",
    body,
    categoryLabel,
    storyCategoryId,
    storyCategory,
    searchableText: [
      normalizeText(summary),
      normalizeText(body),
      normalizeText(entry?.sourceMemory),
      normalizeText(storyCategory.label),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function createCategoryCounts(entries = []) {
  const counts = { all: entries.length };
  MEMORY_STORY_ORDER.forEach((id) => {
    counts[id] = 0;
  });
  entries.forEach((entry) => {
    const key = String(entry?.storyCategoryId || "");
    if (!counts[key] && counts[key] !== 0) counts[key] = 0;
    counts[key] += 1;
  });
  return counts;
}

function createHighlights(entries = []) {
  const highlights = [];
  MEMORY_STORY_ORDER.forEach((categoryId) => {
    const latest = entries.find(
      (entry) => entry.storyCategoryId === categoryId
    );
    if (!latest) return;
    highlights.push({
      id: `highlight:${categoryId}`,
      categoryId,
      category: MEMORY_STORY_CATEGORIES[categoryId],
      summary: latest.summary,
      timestamp: latest.timestamp,
      entryId: latest.id,
    });
  });
  return highlights;
}

const CARE_ACTION_LABELS = Object.freeze({
  feed: "Feed",
  water: "Water",
  play: "Play",
  sleep: "Sleep",
  rest: "Sleep",
  clean: "Clean",
  potty: "Potty",
  bond: "Play",
  pet: "Affection",
});

function getDayKey(timestamp) {
  const date = new Date(Number(timestamp || 0));
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function normalizeCareKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "_");
  if (!key) return "";
  if (key.includes("feed") || key.includes("food") || key.includes("ate")) {
    return "feed";
  }
  if (key.includes("water") || key.includes("drink")) return "water";
  if (key.includes("play") || key.includes("toy") || key.includes("pet")) {
    return "play";
  }
  if (key.includes("sleep") || key.includes("rest")) return "sleep";
  if (key.includes("bath") || key.includes("clean")) return "clean";
  if (key.includes("potty") || key.includes("accident")) return "potty";
  if (key.includes("bond")) return "play";
  return key;
}

function buildDailyCareLogs(memoryState = {}, entries = []) {
  const persisted = Array.isArray(memoryState?.dailyCareLogs)
    ? memoryState.dailyCareLogs
    : [];
  const byDay = new Map();

  persisted.forEach((log) => {
    const dayKey = String(log?.dayKey || "").trim();
    if (!dayKey) return;
    byDay.set(dayKey, {
      dayKey,
      timestamp: Number(log?.updatedAt || log?.startedAt || 0),
      completedAt: Number(log?.completedAt || 0) || null,
      counts:
        log?.counts && typeof log.counts === "object" ? { ...log.counts } : {},
      categories: Array.isArray(log?.categories) ? [...log.categories] : [],
    });
  });

  entries.forEach((entry) => {
    const category = String(entry?.category || entry?.type || "").toUpperCase();
    if (category !== "CARE") return;
    const key = normalizeCareKey(
      entry?.type || entry?.sourceMemory || entry?.summary || entry?.body
    );
    if (!key) return;
    const dayKey = getDayKey(entry.timestamp);
    const log = byDay.get(dayKey) || {
      dayKey,
      timestamp: Number(entry.timestamp || 0),
      completedAt: null,
      counts: {},
      categories: [],
    };
    log.timestamp = Math.max(
      Number(log.timestamp || 0),
      Number(entry.timestamp || 0)
    );
    log.counts[key] = Math.max(0, Math.floor(Number(log.counts[key] || 0))) + 1;
    if (!log.categories.includes(key)) log.categories.push(key);
    byDay.set(dayKey, log);
  });

  return [...byDay.values()]
    .map((log) => ({
      ...log,
      completedCount: [
        "feed",
        "water",
        "play",
        "sleep",
        "clean",
        "potty",
      ].filter((key) => log.categories.includes(key)).length,
    }))
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
    .slice(0, 7);
}

function buildBondHistory(memoryState = {}, entries = []) {
  const persisted = Array.isArray(memoryState?.bondHistory)
    ? memoryState.bondHistory
    : [];
  const normalized = persisted.map((entry, index) => ({
    id: String(entry?.id || `bond:${index}`),
    timestamp: Number(entry?.timestamp || 0),
    delta: Number(entry?.delta || 0),
    value: Number(entry?.value || 0),
    source: String(entry?.source || "care").replace(/[_-]+/g, " "),
  }));

  if (normalized.length) {
    return normalized
      .filter((entry) => entry.timestamp && entry.delta > 0)
      .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
      .slice(0, 8);
  }

  return entries
    .filter((entry) => String(entry?.category || "").toUpperCase() === "CARE")
    .slice(0, 8)
    .map((entry, index) => ({
      id: `bond-derived:${entry.id || index}`,
      timestamp: Number(entry.timestamp || 0),
      delta: Math.max(0.1, Number(entry.happiness || 1) / 3),
      value: null,
      source: String(entry.type || entry.summary || "care").replace(
        /[_-]+/g,
        " "
      ),
    }));
}

function buildNeglectHistory(memoryState = {}, entries = []) {
  const persisted = Array.isArray(memoryState?.neglectHistory)
    ? memoryState.neglectHistory
    : [];
  const fromLedger = persisted.map((entry, index) => ({
    id: String(entry?.id || `neglect:${index}`),
    timestamp: Number(entry?.timestamp || 0),
    strikes: Math.max(0, Math.floor(Number(entry?.strikes || 0))),
    moodTag: String(entry?.moodTag || "LONELY"),
    summary: String(entry?.summary || "Care gap remembered."),
    body: String(entry?.body || ""),
  }));
  const fromEntries = entries
    .filter((entry) => {
      const label = String(entry?.category || entry?.type || "").toUpperCase();
      return label === "NEGLECT";
    })
    .map((entry) => ({
      id: `neglect-entry:${entry.id}`,
      timestamp: Number(entry.timestamp || 0),
      strikes: null,
      moodTag: String(entry.moodTag || "LONELY"),
      summary: String(entry.summary || "Care gap remembered."),
      body: String(entry.body || ""),
    }));

  const seen = new Set();
  return [...fromLedger, ...fromEntries]
    .filter((entry) => {
      const key = `${entry.timestamp}:${entry.summary}`;
      if (!entry.timestamp || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
    .slice(0, 6);
}

function buildFavoriteActions(
  memoryState = {},
  dailyCareLogs = [],
  entries = []
) {
  const counts =
    memoryState?.favoriteActionCounts &&
    typeof memoryState.favoriteActionCounts === "object"
      ? { ...memoryState.favoriteActionCounts }
      : {};

  if (!Object.keys(counts).length) {
    dailyCareLogs.forEach((log) => {
      Object.entries(log.counts || {}).forEach(([key, count]) => {
        counts[key] =
          Math.max(0, Number(counts[key] || 0)) + Number(count || 0);
      });
    });
    entries.forEach((entry) => {
      const category = String(
        entry?.category || entry?.type || ""
      ).toUpperCase();
      if (category !== "CARE") return;
      const key = normalizeCareKey(
        entry?.type || entry?.summary || entry?.body
      );
      if (key) counts[key] = Math.max(0, Number(counts[key] || 0)) + 1;
    });
  }

  return Object.entries(counts)
    .map(([key, count]) => ({
      id: key,
      key,
      label: CARE_ACTION_LABELS[key] || key.replace(/_/g, " "),
      count: Math.max(0, Math.floor(Number(count || 0))),
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 6);
}

function buildRememberedMoments(entries = []) {
  return entries
    .filter((entry) => {
      const text = tokenizeEntry(entry);
      const category = String(
        entry?.category || entry?.type || ""
      ).toUpperCase();
      return (
        category === "NEGLECT" ||
        category === "TRAINING" ||
        includesAny(text, [
          "first",
          "favorite",
          "daily care rhythm",
          "mastered",
          "milestone",
          "comfort",
          "missed you",
        ])
      );
    })
    .slice(0, 4)
    .map((entry) => ({
      id: `remembered:${entry.id}`,
      timestamp: Number(entry.timestamp || 0),
      summary: entry.summary,
      body: entry.body,
      moodTag: entry.moodTag || null,
    }));
}

export function getMemoryStoryFilterOptions() {
  return [
    { id: "all", label: "All Memories" },
    ...MEMORY_STORY_ORDER.map((id) => ({
      id,
      label: MEMORY_STORY_CATEGORIES[id].label,
    })),
  ];
}

export function buildMemoryJournalModel({
  memories = [],
  journalEntries = [],
  memoryState = {},
  query = "",
  categoryFilter = "all",
  sortNewest = true,
} = {}) {
  const rawMemories = Array.isArray(memories) ? memories : [];
  const rawJournal = Array.isArray(journalEntries) ? journalEntries : [];
  const sourceEntries = rawMemories.length ? rawMemories : rawJournal;

  const normalizedEntries = sourceEntries.map((entry, index) =>
    normalizeEntry(entry, index)
  );

  const sortedAll = normalizedEntries
    .slice()
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));

  const countsByCategory = createCategoryCounts(sortedAll);
  const highlights = createHighlights(sortedAll);
  const dailyCareLogs = buildDailyCareLogs(memoryState, sortedAll);
  const bondHistory = buildBondHistory(memoryState, sortedAll);
  const neglectHistory = buildNeglectHistory(memoryState, sortedAll);
  const favoriteActions = buildFavoriteActions(
    memoryState,
    dailyCareLogs,
    sortedAll
  );
  const rememberedMoments = buildRememberedMoments(sortedAll);

  const queryText = normalizeText(query);
  const requestedCategory = normalizeText(categoryFilter || "all");
  const filtered = sortedAll.filter((entry) => {
    if (
      requestedCategory !== "all" &&
      entry.storyCategoryId !== requestedCategory
    ) {
      return false;
    }
    if (!queryText) return true;
    return entry.searchableText.includes(queryText);
  });

  const entries = filtered
    .slice()
    .sort((a, b) =>
      sortNewest
        ? Number(b.timestamp || 0) - Number(a.timestamp || 0)
        : Number(a.timestamp || 0) - Number(b.timestamp || 0)
    );

  return {
    entries,
    countsByCategory,
    highlights,
    dailyCareLogs,
    bondHistory,
    neglectHistory,
    favoriteActions,
    rememberedMoments,
    totalEntries: sortedAll.length,
  };
}
