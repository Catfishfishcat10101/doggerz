export const DAILY_CARE_WEEKLY_LADDER_ID = "weekly-core";

const reward = (type, amount, options = {}) =>
  Object.freeze({
    type: String(type || "")
      .trim()
      .toUpperCase(),
    amount: Math.max(0, Number(amount || 0)),
    icon: options.icon || "",
    shortLabel: options.shortLabel || "",
    description: options.description || "",
    catalogId: options.catalogId || null,
  });

const step = ({
  dayNumber,
  key,
  eyebrow,
  title,
  icon,
  description,
  rewards,
  isGrand = false,
}) =>
  Object.freeze({
    dayNumber: Math.max(1, Math.floor(Number(dayNumber || 1))),
    key: String(key || `day-${dayNumber}`),
    eyebrow: eyebrow || "Daily Care",
    title: title || `Day ${dayNumber}`,
    icon: icon || "🐾",
    description: description || "",
    isGrand: Boolean(isGrand),
    rewards: Object.freeze(Array.isArray(rewards) ? rewards : []),
  });

export const DAILY_CARE_STREAK_BADGES = Object.freeze([
  Object.freeze({
    id: "care-starter",
    threshold: 3,
    label: "Care Starter",
    icon: "🌱",
  }),
  Object.freeze({
    id: "tail-keeper",
    threshold: 7,
    label: "Tail Keeper",
    icon: "🐕",
  }),
  Object.freeze({
    id: "moon-walker",
    threshold: 14,
    label: "Moon Walker",
    icon: "🌙",
  }),
  Object.freeze({
    id: "yard-legend",
    threshold: 30,
    label: "Yard Legend",
    icon: "🏡",
  }),
]);

const weeklySteps = Object.freeze([
  step({
    dayNumber: 1,
    key: "breakfast-patrol",
    eyebrow: "Morning check-in",
    title: "Breakfast Patrol",
    icon: "🥣",
    description:
      "A warm start for showing up. Your pup reads this as: breakfast, attention, and a good day ahead.",
    rewards: [
      reward("COINS", 120, {
        icon: "◎",
        shortLabel: "+120 Coins",
        description: "Soft currency for the yard and shop.",
      }),
    ],
  }),
  step({
    dayNumber: 2,
    key: "zoomies-juice",
    eyebrow: "Keep the rhythm",
    title: "Zoomies Juice",
    icon: "⚡",
    description:
      "A little energy bump so the yard feels alive the second you open Doggerz.",
    rewards: [
      reward("ENERGY", 18, {
        icon: "⚡",
        shortLabel: "+18 Energy",
        description: "Instant energy for your next session.",
      }),
    ],
  }),
  step({
    dayNumber: 3,
    key: "treat-tin",
    eyebrow: "Midweek care",
    title: "Treat Tin",
    icon: "🦴",
    description:
      "A stash of premium kibble for when you want your pup to feel extra spoiled.",
    rewards: [
      reward("PREMIUM_KIBBLE", 2, {
        icon: "🦴",
        shortLabel: "+2 Premium Bowls",
        description: "Adds two premium kibble bowls to inventory.",
      }),
    ],
  }),
  step({
    dayNumber: 4,
    key: "collar-spark",
    eyebrow: "Routine glow",
    title: "Collar Spark",
    icon: "💚",
    description:
      "Neon-green shard dust for the people who keep showing up. Small, clear, satisfying.",
    rewards: [
      reward("GEMS", 10, {
        icon: "✦",
        shortLabel: "+10 Gems",
        description: "Premium shards for future cosmetic systems.",
      }),
    ],
  }),
  step({
    dayNumber: 5,
    key: "bond-boost",
    eyebrow: "Emotional payoff",
    title: "Heartline Boost",
    icon: "💞",
    description:
      "Your pup feels the consistency. This one lands directly in the bond meter.",
    rewards: [
      reward("BOND", 5, {
        icon: "♥",
        shortLabel: "+5 Bond",
        description: "Raises the relationship meter.",
      }),
    ],
  }),
  step({
    dayNumber: 6,
    key: "yard-cache",
    eyebrow: "Almost there",
    title: "Yard Cache",
    icon: "🎾",
    description:
      "A chunkier prep reward before the weekly grand drop. Obvious, useful, and worth chasing.",
    rewards: [
      reward("COINS", 240, {
        icon: "◎",
        shortLabel: "+240 Coins",
        description: "A larger coin drop for steady care.",
      }),
      reward("XP", 12, {
        icon: "↑",
        shortLabel: "+12 XP",
        description: "A small progression push.",
      }),
    ],
  }),
  step({
    dayNumber: 7,
    key: "weekly-grand-reward",
    eyebrow: "Weekly grand reward",
    title: "Neon Night Crate",
    icon: "🎁",
    description:
      "The big weekly care drop: coins, gems, energy, and a little premium comfort for your next session.",
    isGrand: true,
    rewards: [
      reward("COINS", 600, {
        icon: "◎",
        shortLabel: "+600 Coins",
        description: "Weekly headline reward.",
      }),
      reward("GEMS", 20, {
        icon: "✦",
        shortLabel: "+20 Gems",
        description: "Extra premium shard bonus.",
      }),
      reward("ENERGY", 24, {
        icon: "⚡",
        shortLabel: "+24 Energy",
        description: "Lets the next session start hot.",
      }),
      reward("PREMIUM_KIBBLE", 3, {
        icon: "🦴",
        shortLabel: "+3 Premium Bowls",
        description: "A premium stock-up for care-heavy days.",
      }),
    ],
  }),
]);

export const DAILY_CARE_LADDERS = Object.freeze({
  [DAILY_CARE_WEEKLY_LADDER_ID]: Object.freeze({
    id: DAILY_CARE_WEEKLY_LADDER_ID,
    kind: "weekly",
    title: "Daily Care Bonus",
    shortLabel: "Care Bonus",
    eyebrow: "Daily check-in",
    accentTone: "neon-green",
    cycleLength: weeklySteps.length,
    steps: weeklySteps,
    premiumEmptyState: Object.freeze({
      eyebrow: "More care journeys",
      title: "VIP Kennel and seasonal ladders can sit beside this later.",
      body: "The free lane stays generous on its own. Future premium or event ladders can plug in without touching the core care loop.",
    }),
    futureLanes: Object.freeze([
      Object.freeze({
        id: "monthly-marathon",
        label: "Monthly Ladder",
        tone: "emerald",
        description:
          "Longer-form retention track with a bigger month-end reward.",
      }),
      Object.freeze({
        id: "seasonal-yard-event",
        label: "Seasonal Event",
        tone: "mint",
        description:
          "Limited-time reward path for holidays, festivals, and live ops beats.",
      }),
      Object.freeze({
        id: "vip-kennel",
        label: "VIP Kennel",
        tone: "slate",
        description:
          "Optional premium companion lane that runs beside the free ladder.",
      }),
      Object.freeze({
        id: "comeback-trail",
        label: "Comeback Rewards",
        tone: "zinc",
        description:
          "Soft re-entry track for lapsed players returning to the yard.",
      }),
    ]),
    streakBadges: DAILY_CARE_STREAK_BADGES,
  }),
});

export function getDailyCareLadderConfig(
  ladderId = DAILY_CARE_WEEKLY_LADDER_ID
) {
  return (
    DAILY_CARE_LADDERS[String(ladderId || DAILY_CARE_WEEKLY_LADDER_ID)] ||
    DAILY_CARE_LADDERS[DAILY_CARE_WEEKLY_LADDER_ID]
  );
}
