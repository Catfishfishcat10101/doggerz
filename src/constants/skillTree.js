// src/constants/skillTree.js

/**
 * Skill tree catalog + effect computation.
 *
 * This file is intentionally framework-free so it can be used by Redux reducers
 * and UI components without circular deps.
 */

export const SKILL_TREE_BRANCHES = Object.freeze([
  {
    id: "companion",
    name: "Companion",
    tagline: "Warm bonds and social sparkle.",
    summary:
      "Build deep bonds, soften decay, and unlock cozy memory perks.",
    theme: {
      accent: "#e11d48", // rose-600
      tint: "rgba(244, 63, 94, 0.18)",
    },
    perks: [
      {
        id: "foodie",
        name: "Foodie",
        effect: "Hunger decays 20% slower.",
        type: "Passive",
        rarity: "Common",
        tier: 1,
        requires: null,
        modifiers: { hungerDecayMultiplier: 0.8 },
      },
      {
        id: "social-butterfly",
        name: "Social Butterfly",
        effect: "Happiness decays 30% slower.",
        type: "Passive",
        rarity: "Uncommon",
        tier: 2,
        requires: "foodie",
        modifiers: { happinessDecayMultiplier: 0.7 },
      },
      {
        id: "cuddle-time",
        name: "Cuddle Time",
        effect: "Bonding gains +10% after petting.",
        type: "Passive",
        rarity: "Rare",
        tier: 3,
        requires: "social-butterfly",
        // Wired later (petting system).
        modifiers: {},
      },
      {
        id: "scrapbook-charm",
        name: "Scrapbook Charm",
        effect: "Journals save an extra daily memory.",
        type: "Unlock",
        rarity: "Epic",
        tier: 4,
        requires: "cuddle-time",
        unlocks: "Storybook photo frames",
        modifiers: {},
      },
    ],
  },
  {
    id: "guardian",
    name: "Guardian",
    tagline: "Steady, watchful, and cozy.",
    summary: "Protect routines, stabilize energy, and unlock night comforts.",
    theme: {
      accent: "#b45309", // amber-700
      tint: "rgba(245, 158, 11, 0.16)",
    },
    perks: [
      {
        id: "night-owl",
        name: "Night Owl",
        effect: "Play at night without waking the pup.",
        type: "Unlock",
        rarity: "Common",
        tier: 1,
        requires: null,
        unlocks: "Nighttime yard session",
        modifiers: {},
      },
      {
        id: "calm-watch",
        name: "Calm Watch",
        effect: "Energy decays 15% slower while idle.",
        type: "Passive",
        rarity: "Uncommon",
        tier: 2,
        requires: "night-owl",
        modifiers: { idleEnergyDecayMultiplier: 0.85 },
      },
      {
        id: "safe-haven",
        name: "Safe Haven",
        effect: "Cleanliness decays 15% slower.",
        type: "Passive",
        rarity: "Rare",
        tier: 3,
        requires: "calm-watch",
        modifiers: { cleanlinessDecayMultiplier: 0.85 },
      },
      {
        id: "cozy-fort",
        name: "Cozy Fort",
        effect: "Unlock a guardian blanket cosmetic.",
        type: "Unlock",
        rarity: "Epic",
        tier: 4,
        requires: "safe-haven",
        unlocks: "Blanket cosmetic",
        modifiers: {},
      },
    ],
  },
  {
    id: "athlete",
    name: "Athlete",
    tagline: "Speed, focus, and playful grit.",
    summary: "Boost training velocity, recovery, and active perks.",
    theme: {
      accent: "#047857", // emerald-700
      tint: "rgba(16, 185, 129, 0.16)",
    },
    perks: [
      {
        id: "quick-learner",
        name: "Quick Learner",
        effect: "Training progresses 50% faster.",
        type: "Passive",
        rarity: "Common",
        tier: 1,
        requires: null,
        modifiers: { trainingSkillXpMultiplier: 1.5 },
      },
      {
        id: "trail-runner",
        name: "Trail Runner",
        effect: "Energy recovery is 20% faster.",
        type: "Passive",
        rarity: "Uncommon",
        tier: 2,
        requires: "quick-learner",
        modifiers: { restEnergyGainMultiplier: 1.2 },
      },
      {
        id: "fetch-focus",
        name: "Fetch Focus",
        effect: "Mini-game scores gain a small bonus.",
        type: "Passive",
        rarity: "Rare",
        tier: 3,
        requires: "trail-runner",
        modifiers: {},
      },
      {
        id: "agility-path",
        name: "Agility Path",
        effect: "Unlock a new agility course activity.",
        type: "Unlock",
        rarity: "Epic",
        tier: 4,
        requires: "fetch-focus",
        unlocks: "Agility course",
        modifiers: {},
      },
    ],
  },
]);

const PERK_INDEX = (() => {
  const map = new Map();
  for (const b of SKILL_TREE_BRANCHES) {
    for (const p of b.perks) {
      map.set(p.id, { ...p, branchId: b.id, branchName: b.name });
    }
  }
  return map;
})();

export function getSkillTreePerk(perkId) {
  if (!perkId) return null;
  return PERK_INDEX.get(String(perkId)) || null;
}

export function getSkillTreeBranchIdForPerk(perkId) {
  return getSkillTreePerk(perkId)?.branchId || null;
}

export function getSkillTreeRequiredPerkId(perkId) {
  return getSkillTreePerk(perkId)?.requires || null;
}

export function computeSkillTreeModifiers(unlockedIds) {
  const base = {
    hungerDecayMultiplier: 1,
    happinessDecayMultiplier: 1,
    cleanlinessDecayMultiplier: 1,
    idleEnergyDecayMultiplier: 1,
    trainingSkillXpMultiplier: 1,
    restEnergyGainMultiplier: 1,
  };

  const ids = Array.isArray(unlockedIds) ? unlockedIds : [];
  for (const rawId of ids) {
    const perk = getSkillTreePerk(rawId);
    if (!perk || !perk.modifiers) continue;

    for (const [k, v] of Object.entries(perk.modifiers)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      // Multipliers compose multiplicatively.
      base[k] = Number(base[k] || 1) * n;
    }
  }

  return base;
}

export function getSkillTreeThemeForBranch(branchId) {
  const b = SKILL_TREE_BRANCHES.find((x) => x.id === branchId);
  return b?.theme || null;
}

export function getSkillTreeBranch(branchId) {
  return SKILL_TREE_BRANCHES.find((x) => x.id === branchId) || null;
}

export function getSkillTreeBranches() {
  return SKILL_TREE_BRANCHES.slice();
}

export function getSkillTreePerksByBranch(branchId) {
  const branch = getSkillTreeBranch(branchId);
  return branch?.perks ? branch.perks.slice() : [];
}

export function getSkillTreePerkRarity(perkId) {
  return getSkillTreePerk(perkId)?.rarity || "Common";
}

export function getSkillTreePerkTier(perkId) {
  const tier = getSkillTreePerk(perkId)?.tier;
  return Number.isFinite(Number(tier)) ? Number(tier) : null;
}
