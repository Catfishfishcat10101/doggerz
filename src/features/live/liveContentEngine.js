<<<<<<< HEAD
=======
import { getMorningGloryLiveOp } from "@/features/dog/behaviorSceneProfile.js";

>>>>>>> 10f88903 (chore: remove committed backup folders)
function clampIndex(index, total) {
  if (!Number.isFinite(index) || total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, Math.floor(index)));
}

function getUtcWeekIndex(now = Date.now()) {
  const date = new Date(now);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const dayOfYear = Math.floor((today - yearStart) / 86_400_000);
  return Math.floor(dayOfYear / 7);
}

function getSeasonKey(now = Date.now()) {
  const month = new Date(now).getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

const SEASONAL_DROPS = Object.freeze({
  spring: Object.freeze({
    id: "spring_fresh_air",
    label: "Spring Fresh-Air Drop",
    summary: "Fresh yard looks and soft green identity pieces.",
    cosmeticIds: Object.freeze([
      "collar_leaf",
      "backdrop_meadow_morning",
      "yard_doghouse_cottage",
    ]),
    bulletin: Object.freeze({
      eyebrow: "Seasonal Update",
      title: "Spring yard refresh",
      body: "Lighter colors and calmer outdoor looks are in rotation right now.",
    }),
  }),
  summer: Object.freeze({
    id: "summer_sunset_run",
    label: "Summer Sunset Drop",
    summary: "Warm light, bright collars, and active-evening yard mood.",
    cosmeticIds: Object.freeze([
      "collar_sunflare",
      "backdrop_sunset",
      "tag_bolt",
    ]),
    bulletin: Object.freeze({
      eyebrow: "Seasonal Update",
      title: "Summer sunset set",
      body: "Warm evening looks and energetic identity pieces are active this season.",
    }),
  }),
  autumn: Object.freeze({
    id: "autumn_harvest_set",
    label: "Autumn Harvest Drop",
    summary: "Earthy collars and cozy tags built for calmer weeks.",
    cosmeticIds: Object.freeze([
      "collar_mosswood",
      "tag_harvest_leaf",
      "yard_doghouse_cottage",
    ]),
    bulletin: Object.freeze({
      eyebrow: "Seasonal Update",
      title: "Autumn comfort set",
      body: "Harvest tones and cozy home styling are taking the lead right now.",
    }),
  }),
  winter: Object.freeze({
    id: "winter_night_lodge",
    label: "Winter Lodge Drop",
    summary: "Cold-weather identity pieces with a warm shelter feel.",
    cosmeticIds: Object.freeze([
      "collar_winter_frost",
      "yard_doghouse_winter_lodge",
      "backdrop_moonlit_garden",
    ]),
    bulletin: Object.freeze({
      eyebrow: "Seasonal Update",
      title: "Winter lodge rotation",
      body: "Crisp winter styling and warmer home accents are in the spotlight.",
    }),
  }),
});

const WEEKLY_ROTATIONS = Object.freeze([
  Object.freeze({
    id: "signature_collar_week",
    label: "Signature Collar Week",
    summary: "Strong everyday identity pieces for your one dog.",
    cosmeticIds: Object.freeze(["collar_leaf", "collar_midnight", "tag_star"]),
    mood: "Identity-first week",
  }),
  Object.freeze({
    id: "yard_mood_week",
    label: "Yard Mood Week",
    summary: "Backdrop-led looks that refresh the whole scene.",
    cosmeticIds: Object.freeze([
      "backdrop_meadow_morning",
      "backdrop_sunset",
      "backdrop_moonlit_garden",
    ]),
    mood: "Scene-first week",
  }),
  Object.freeze({
    id: "cozy_home_week",
    label: "Cozy Home Week",
    summary: "Doghouse styles and comfort-coded looks rotate forward.",
    cosmeticIds: Object.freeze([
      "yard_fancy_doghouse",
      "yard_doghouse_cottage",
      "yard_doghouse_winter_lodge",
    ]),
    mood: "Comfort-first week",
  }),
  Object.freeze({
    id: "night_runner_week",
    label: "Night Runner Week",
    summary: "Bolder tags and darker collar tones take over the catalog.",
    cosmeticIds: Object.freeze(["collar_midnight", "collar_neon", "tag_bolt"]),
    mood: "After-dark week",
  }),
]);

export function getLiveContentSnapshot({
  now = Date.now(),
  catalog = [],
} = {}) {
  const seasonKey = getSeasonKey(now);
  const seasonalDrop = SEASONAL_DROPS[seasonKey] || SEASONAL_DROPS.spring;
  const weeklyRotation =
    WEEKLY_ROTATIONS[
      clampIndex(
        getUtcWeekIndex(now) % WEEKLY_ROTATIONS.length,
        WEEKLY_ROTATIONS.length
      )
    ] || WEEKLY_ROTATIONS[0];
  const catalogItems = Array.isArray(catalog) ? catalog : [];
  const catalogById = new Map(
    catalogItems
      .filter((item) => item && typeof item === "object")
      .map((item) => [String(item.id || "").trim(), item])
      .filter(([id]) => id)
  );

  const weeklyItems = weeklyRotation.cosmeticIds
    .map((id) => catalogById.get(id))
    .filter(Boolean);
  const seasonalItems = seasonalDrop.cosmeticIds
    .map((id) => catalogById.get(id))
    .filter(Boolean);
<<<<<<< HEAD
=======
  const timeWindowOffer = getMorningGloryLiveOp(now);
  const bulletin = timeWindowOffer.active
    ? {
        eyebrow: "Live This Morning",
        title: timeWindowOffer.label,
        body: `A limited treat window is active from ${timeWindowOffer.windowLabel}. Check in before it closes.`,
      }
    : {
        eyebrow: "Live This Week",
        title: weeklyRotation.label,
        body: weeklyRotation.summary,
      };
>>>>>>> 10f88903 (chore: remove committed backup folders)

  return {
    seasonKey,
    seasonalDrop,
    weeklyRotation,
    weeklyItems,
    seasonalItems,
<<<<<<< HEAD
=======
    timeWindowOffer,
>>>>>>> 10f88903 (chore: remove committed backup folders)
    liveCatalogIds: new Set([
      ...weeklyRotation.cosmeticIds,
      ...seasonalDrop.cosmeticIds,
    ]),
<<<<<<< HEAD
    bulletin: {
      eyebrow: "Live This Week",
      title: weeklyRotation.label,
      body: weeklyRotation.summary,
    },
=======
    bulletin,
>>>>>>> 10f88903 (chore: remove committed backup folders)
  };
}

export function getLiveCatalogMeta(item, liveSnapshot) {
  const id = String(item?.id || "").trim();
  const seasonalIds = new Set(liveSnapshot?.seasonalDrop?.cosmeticIds || []);
  const weeklyIds = new Set(liveSnapshot?.weeklyRotation?.cosmeticIds || []);
  return {
    isSeasonalLive: seasonalIds.has(id),
    isWeeklyFeatured: weeklyIds.has(id),
    isLive: seasonalIds.has(id) || weeklyIds.has(id),
  };
}
