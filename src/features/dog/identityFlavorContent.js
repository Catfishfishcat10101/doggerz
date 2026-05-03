// src/features/dog/identityFlavorContent.js
export const IDENTITY_FAVORITE_FOOD_LABELS = Object.freeze({
  regular_kibble: "Regular Bowl",
  premium_kibble: "Premium Bowl",
  human_food: "Human Food",
});

export const IDENTITY_NAP_SPOT_LABELS = Object.freeze({
  doghouse: "Doghouse",
  yard: "Sunny Yard Spot",
  indoors: "Indoor Bed Spot",
  default: "Favorite Nap Spot",
});

export const DAILY_IDENTITY_FLAVOR_TEMPLATES = Object.freeze({
  puppy: Object.freeze([
    {
<<<<<<< HEAD
      id: "puppy-chaos",
      tone: "playful",
      title: "Today your dog is tiny chaos.",
      body: "Everything feels new, exciting, and slightly dramatic.",
=======
      id: "puppy-energy",
      tone: "playful",
      title: "Today your puppy is extra alert.",
      body: "Everything feels new, exciting, and worth investigating.",
>>>>>>> 10f88903 (chore: remove committed backup folders)
    },
    {
      id: "puppy-clingy",
      tone: "sweet",
      title: "Today your dog is extra attached.",
      body: "Short check-ins and warm routines will land well.",
    },
  ]),
  adult: Object.freeze([
    {
      id: "adult-confident",
      tone: "steady",
      title: "Today your dog is feeling capable.",
      body: "A little structure and attention will go a long way.",
    },
    {
      id: "adult-proud",
      tone: "bright",
      title: "Today your dog is carrying themself with confidence.",
      body: "Good habits are starting to feel like identity, not effort.",
    },
  ]),
  senior: Object.freeze([
    {
      id: "senior-soft",
      tone: "calm",
      title: "Today your dog is in a softer mood.",
      body: "Comfort, quiet care, and familiar rituals matter more than ever.",
    },
    {
      id: "senior-gentle",
      tone: "calm",
      title: "Today your dog is taking it slow.",
      body: "A calm day still counts as a meaningful day together.",
    },
  ]),
});

const FLAVOR_TONE_BY_MOOD = Object.freeze({
  calm: "calm",
  content: "calm",
  happy: "bright",
  playful: "bright",
  proud: "bright",
  curious: "steady",
  focused: "steady",
  energized: "bright",
  restless: "warm",
  uneasy: "warm",
  lonely: "warm",
  hungry: "warm",
  thirsty: "warm",
  dirty: "warm",
  sleepy: "calm",
});

const TEMPERAMENT_CONTEXT_BY_KEY = Object.freeze({
  SWEET: "They are leaning into closeness today.",
  CHILL: "A slower, steadier rhythm fits them well.",
  SPICY: "There is a little extra personality in every reaction right now.",
  BOLD: "They seem ready to lead the moment instead of follow it.",
  CURIOUS: "Little details are pulling their attention in.",
  PLAYFUL: "A short playful moment will mean more than a big production.",
});

const MOOD_CONTEXT_BY_KEY = Object.freeze({
  calm: "A gentle routine should keep the day feeling grounded.",
  content: "Things already feel settled, so small rituals will land well.",
  happy: "A little praise will carry the mood even further.",
  playful: "Short play bursts will feel better than overstimulation.",
  proud: "They will respond well to attention that feels earned.",
  curious: "Let them notice the world before asking for too much.",
  focused: "A little structure will feel satisfying today.",
  energized: "A short walk and a clean reset should be enough.",
  restless: "A little movement will help them settle back into themselves.",
  uneasy: "Quiet reassurance matters more than extra noise right now.",
  lonely: "A few check-ins will go further than a long session later.",
  hungry: "A dependable meal will change the tone of the whole day.",
  thirsty: "Fresh water and a reset should help quickly.",
  dirty: "A cleanup pass will help them feel more comfortable.",
  sleepy: "Comfort and rest should be the priority.",
});

export function getIdentityFavoriteFoodLabel(foodType) {
  const key = String(foodType || "")
    .trim()
    .toLowerCase();
  return IDENTITY_FAVORITE_FOOD_LABELS[key] || null;
}

export function getIdentityNapSpotLabel(napSpotId) {
  const key = String(napSpotId || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  return IDENTITY_NAP_SPOT_LABELS[key] || IDENTITY_NAP_SPOT_LABELS.default;
}

function normalizeFlavorKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "_")
    .replace(/[^\w]/g, "");
}

function getLifeStageFlavorKey(stage) {
  const key = String(stage || "PUPPY")
    .trim()
    .toUpperCase();
  if (key === "ADULT") return "adult";
  if (key === "SENIOR") return "senior";
  return "puppy";
}

function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickStableTemplate(templates, seed) {
  if (!Array.isArray(templates) || !templates.length) return null;
  const index = hashString(seed) % templates.length;
  return templates[index] || templates[0] || null;
}

function pickFavoriteContext({
  moodKey,
  favoriteToyLabel,
  favoriteFoodLabel,
  favoriteNapSpotLabel,
}) {
  if (
    ["sleepy", "uneasy", "lonely", "calm", "content"].includes(moodKey) &&
    favoriteNapSpotLabel
  ) {
    return `They may gravitate back to ${favoriteNapSpotLabel.toLowerCase()}.`;
  }
  if (["hungry", "thirsty"].includes(moodKey) && favoriteFoodLabel) {
    return `${favoriteFoodLabel} would feel especially welcome today.`;
  }
  if (
    ["playful", "curious", "proud", "focused", "energized"].includes(moodKey) &&
    favoriteToyLabel
  ) {
    return `${favoriteToyLabel} is still the fastest way to get their attention.`;
  }
  if (favoriteToyLabel) {
    return `${favoriteToyLabel} still feels like their comfort pick.`;
  }
  if (favoriteFoodLabel) {
    return `${favoriteFoodLabel} still feels like a trusted favorite.`;
  }
  if (favoriteNapSpotLabel) {
    return `${favoriteNapSpotLabel} still reads like home base.`;
  }
  return null;
}

function pickPersonalityContext(personalityProfile) {
  const tendencies = Array.isArray(
    personalityProfile?.behaviorTendencies?.tendencies
  )
    ? personalityProfile.behaviorTendencies.tendencies
    : [];
  const tendencyIds = tendencies.map((item) =>
    String(item?.id || "")
      .trim()
      .toLowerCase()
  );

  if (tendencyIds.includes("clingy")) {
    return "They read small reassurances as meaningful contact, not filler.";
  }
  if (tendencyIds.includes("curious")) {
    return "They are likely to investigate before they fully settle.";
  }
  if (tendencyIds.includes("playful")) {
    return "A short burst of play will land better than a long busy session.";
  }
  if (tendencyIds.includes("cozy")) {
    return "Comfort and familiarity are part of their personality now.";
  }
  if (tendencyIds.includes("confident")) {
    return "They seem to carry themselves like the yard already belongs to them.";
  }
  if (tendencyIds.includes("orderly")) {
    return "Clear routine helps them feel like themself, not just managed.";
  }
  return null;
}

export function getDailyIdentityFlavor({
  stage,
  profileId,
  moodLabel,
  primaryTemperament,
  personalityProfile,
  favoriteToyLabel,
  favoriteFoodLabel,
  favoriteNapSpotLabel,
  dayKey,
}) {
  const stageKey = getLifeStageFlavorKey(stage);
  const moodKey = normalizeFlavorKey(moodLabel);
  const temperamentKey = String(primaryTemperament || "")
    .trim()
    .toUpperCase();
  const templates = DAILY_IDENTITY_FLAVOR_TEMPLATES[stageKey];
  const template = pickStableTemplate(
    templates,
    [stageKey, dayKey || "no-day", profileId || "no-profile"].join(":")
  );

  const bodyParts = [
    template?.body || "A steady day together still counts.",
    TEMPERAMENT_CONTEXT_BY_KEY[temperamentKey] || null,
    MOOD_CONTEXT_BY_KEY[moodKey] || null,
    pickPersonalityContext(personalityProfile),
    pickFavoriteContext({
      moodKey,
      favoriteToyLabel,
      favoriteFoodLabel,
      favoriteNapSpotLabel,
    }),
  ].filter(Boolean);

  return {
    dayKey: dayKey || null,
    title: template?.title || "Today your dog is staying close to routine.",
    body: bodyParts.join(" "),
    tone: FLAVOR_TONE_BY_MOOD[moodKey] || template?.tone || "calm",
  };
}
