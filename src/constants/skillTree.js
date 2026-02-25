// src/constants/skillTree.js

export const SKILL_TREE_BRANCHES = Object.freeze([
  {
    id: "companion",
    name: "Companion",
    tagline: "Bonding and daily care bonuses",
    perks: [
      {
        id: "soft-landing",
        name: "Soft Landing",
        type: "Bond",
        effect: "Happiness decays slower when your pup is well cared for.",
        modifiers: { happinessDecayMultiplier: 0.92 },
      },
      {
        id: "warm-cuddles",
        name: "Warm Cuddles",
        type: "Bond",
        effect: "Rest actions recover more energy.",
        modifiers: { restEnergyGainMultiplier: 1.15 },
      },
      {
        id: "scrapbook-charm",
        name: "Scrapbook Charm",
        type: "Cosmetic",
        effect: "Unlocks a star tag cosmetic.",
        unlocks: "Star tag",
      },
    ],
  },
  {
    id: "guardian",
    name: "Guardian",
    tagline: "Health, cleanliness, and resilience",
    perks: [
      {
        id: "clean-steps",
        name: "Clean Steps",
        type: "Care",
        effect: "Cleanliness decays slower over time.",
        modifiers: { cleanlinessDecayMultiplier: 0.9 },
      },
      {
        id: "steady-stomach",
        name: "Steady Stomach",
        type: "Care",
        effect: "Hunger decays slower between meals.",
        modifiers: { hungerDecayMultiplier: 0.9 },
      },
      {
        id: "cozy-fort",
        name: "Cozy Fort",
        type: "Cosmetic",
        effect: "Unlocks a leaf collar cosmetic.",
        unlocks: "Leaf collar",
      },
    ],
  },
  {
    id: "athlete",
    name: "Athlete",
    tagline: "Training and active play bonuses",
    perks: [
      {
        id: "quick-learner",
        name: "Quick Learner",
        type: "Training",
        effect: "Training XP gains are increased.",
        modifiers: { trainingSkillXpMultiplier: 1.15 },
      },
      {
        id: "zen-run",
        name: "Zen Run",
        type: "Stamina",
        effect: "Idle energy decays slower when not napping.",
        modifiers: { idleEnergyDecayMultiplier: 0.9 },
      },
      {
        id: "agility-path",
        name: "Agility Path",
        type: "Cosmetic",
        effect: "Unlocks a neon collar cosmetic.",
        unlocks: "Neon collar",
      },
    ],
  },
]);

const SKILL_TREE_PERK_BY_ID = Object.freeze(
  SKILL_TREE_BRANCHES.flatMap((branch) =>
    branch.perks.map((perk, index) => ({
      ...perk,
      branchId: branch.id,
      order: index,
    }))
  ).reduce((acc, perk) => {
    acc[perk.id] = perk;
    return acc;
  }, {})
);

export function getSkillTreePerk(perkId) {
  const id = String(perkId || "").trim();
  return SKILL_TREE_PERK_BY_ID[id] || null;
}

export function getSkillTreeBranchIdForPerk(perkId) {
  return getSkillTreePerk(perkId)?.branchId || null;
}

export function getSkillTreeRequiredPerkId(perkId) {
  const perk = getSkillTreePerk(perkId);
  if (!perk) return null;
  const branch = SKILL_TREE_BRANCHES.find((b) => b.id === perk.branchId);
  if (!branch) return null;
  const index = branch.perks.findIndex((p) => p.id === perkId);
  if (index <= 0) return null;
  return branch.perks[index - 1]?.id || null;
}

export function computeSkillTreeModifiers(unlockedIds = []) {
  const mods = {
    hungerDecayMultiplier: 1,
    happinessDecayMultiplier: 1,
    cleanlinessDecayMultiplier: 1,
    idleEnergyDecayMultiplier: 1,
    restEnergyGainMultiplier: 1,
    trainingSkillXpMultiplier: 1,
  };

  const ids = Array.isArray(unlockedIds) ? unlockedIds : [];
  ids.forEach((id) => {
    const perk = getSkillTreePerk(id);
    if (!perk?.modifiers) return;
    Object.entries(perk.modifiers).forEach(([key, value]) => {
      if (!(key in mods)) return;
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) return;
      mods[key] = mods[key] * numeric;
    });
  });

  return mods;
}

export default {
  SKILL_TREE_BRANCHES,
  getSkillTreePerk,
  getSkillTreeBranchIdForPerk,
  getSkillTreeRequiredPerkId,
  computeSkillTreeModifiers,
};
