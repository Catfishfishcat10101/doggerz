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
    totalEntries: sortedAll.length,
  };
}
