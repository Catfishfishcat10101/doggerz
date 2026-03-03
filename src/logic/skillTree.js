// src/constants/skillTree.js

function freezePerk(perk) {
  return Object.freeze({
    ...perk,
    modifiers:
      perk?.modifiers && typeof perk.modifiers === "object"
        ? Object.freeze({ ...perk.modifiers })
        : Object.freeze({}),
  });
}

function freezeBranch(branch) {
  return Object.freeze({
    ...branch,
    perks: Object.freeze((branch?.perks || []).map(freezePerk)),
  });
}

const DEFAULT_MODIFIERS = Object.freeze({
  hungerDecayMultiplier: 1,
  happinessDecayMultiplier: 1,
  cleanlinessDecayMultiplier: 1,
  idleEnergyDecayMultiplier: 1,
  pottyGainMultiplier: 1,
  restEnergyGainMultiplier: 1,
  trainingSkillXpMultiplier: 1,
});

export const SKILL_TREE_BRANCHES = Object.freeze(
  [
    {
      id: "companion",
      name: "Companion",
      tagline: "Bond-focused perks for emotional stability and trust.",
      perks: [
        {
          id: "lap-loyalty",
          name: "Lap Loyalty",
          type: "Passive",
          effect: "Slows happiness decay during downtime.",
          modifiers: { happinessDecayMultiplier: 0.95 },
        },
        {
          id: "scrapbook-charm",
          name: "Scrapbook Charm",
          type: "Unlock",
          effect: "Unlocks the Star Tag cosmetic and improves mood resilience.",
          unlocks: "Star Tag",
          modifiers: { happinessDecayMultiplier: 0.92 },
        },
        {
          id: "heart-sync",
          name: "Heart Sync",
          type: "Passive",
          effect: "Reduces passive energy drain while relaxing.",
          modifiers: { idleEnergyDecayMultiplier: 0.95 },
        },
        {
          id: "calm-presence",
          name: "Calm Presence",
          type: "Passive",
          effect: "Reduces cleanliness decay from minor stress behavior.",
          modifiers: { cleanlinessDecayMultiplier: 0.94 },
        },
        {
          id: "comfort-routine",
          name: "Comfort Routine",
          type: "Passive",
          effect: "Improves rest recovery speed.",
          modifiers: { restEnergyGainMultiplier: 1.12 },
        },
      ],
    },
    {
      id: "guardian",
      name: "Guardian",
      tagline: "Yard-care perks for cleanliness and routine discipline.",
      perks: [
        {
          id: "tidy-patrol",
          name: "Tidy Patrol",
          type: "Passive",
          effect: "Slows cleanliness decay while active in the yard.",
          modifiers: { cleanlinessDecayMultiplier: 0.92 },
        },
        {
          id: "cozy-fort",
          name: "Cozy Fort",
          type: "Unlock",
          effect:
            "Unlocks the Leaf Collar cosmetic and boosts rest efficiency.",
          unlocks: "Leaf Collar",
          modifiers: { restEnergyGainMultiplier: 1.08 },
        },
        {
          id: "weather-watch",
          name: "Weather Watch",
          type: "Passive",
          effect: "Reduces hunger decay during harsh weather swings.",
          modifiers: { hungerDecayMultiplier: 0.95 },
        },
        {
          id: "accident-shield",
          name: "Accident Shield",
          type: "Passive",
          effect: "Slows potty pressure gain between breaks.",
          modifiers: { pottyGainMultiplier: 0.88 },
        },
        {
          id: "cleanup-drill",
          name: "Cleanup Drill",
          type: "Passive",
          effect: "Further reduces cleanliness decay in long sessions.",
          modifiers: { cleanlinessDecayMultiplier: 0.9 },
        },
      ],
    },
    {
      id: "athlete",
      name: "Athlete",
      tagline: "Performance perks for training speed and movement stamina.",
      perks: [
        {
          id: "trail-legs",
          name: "Trail Legs",
          type: "Passive",
          effect: "Improves idle energy efficiency after movement.",
          modifiers: { idleEnergyDecayMultiplier: 0.94 },
        },
        {
          id: "agility-path",
          name: "Agility Path",
          type: "Unlock",
          effect: "Unlocks the Neon Collar cosmetic and boosts training XP.",
          unlocks: "Neon Collar",
          modifiers: { trainingSkillXpMultiplier: 1.08 },
        },
        {
          id: "zoomie-focus",
          name: "Zoomie Focus",
          type: "Passive",
          effect: "Increases obedience training XP gain.",
          modifiers: { trainingSkillXpMultiplier: 1.12 },
        },
        {
          id: "recovery-breath",
          name: "Recovery Breath",
          type: "Passive",
          effect: "Improves rest recovery between sessions.",
          modifiers: { restEnergyGainMultiplier: 1.1 },
        },
        {
          id: "trick-cascade",
          name: "Trick Cascade",
          type: "Passive",
          effect: "Major training XP boost for advanced command chaining.",
          modifiers: { trainingSkillXpMultiplier: 1.18 },
        },
      ],
    },
  ].map(freezeBranch)
);

export const SKILL_TREE_BRANCH_BY_ID = Object.freeze(
  SKILL_TREE_BRANCHES.reduce((acc, branch) => {
    acc[branch.id] = branch;
    return acc;
  }, {})
);

export const SKILL_TREE_PERKS = Object.freeze(
  SKILL_TREE_BRANCHES.flatMap((branch) =>
    branch.perks.map((perk, index) =>
      Object.freeze({
        ...perk,
        branchId: branch.id,
        branchName: branch.name,
        order: index,
        requiredPerkId: index > 0 ? branch.perks[index - 1]?.id || null : null,
      })
    )
  )
);

export const SKILL_TREE_PERK_BY_ID = Object.freeze(
  SKILL_TREE_PERKS.reduce((acc, perk) => {
    acc[perk.id] = perk;
    return acc;
  }, {})
);

export function getSkillTreePerk(perkId) {
  const key = String(perkId || "").trim();
  if (!key) return null;
  return SKILL_TREE_PERK_BY_ID[key] || null;
}

export function getSkillTreeBranchIdForPerk(perkId) {
  return getSkillTreePerk(perkId)?.branchId || null;
}

export function getSkillTreeRequiredPerkId(perkId) {
  return getSkillTreePerk(perkId)?.requiredPerkId || null;
}

export function computeSkillTreeModifiers(unlockedIds) {
  const out = { ...DEFAULT_MODIFIERS };
  if (!Array.isArray(unlockedIds) || unlockedIds.length === 0) return out;

  for (const id of unlockedIds) {
    const perk = getSkillTreePerk(id);
    const mods = perk?.modifiers;
    if (!mods || typeof mods !== "object") continue;

    for (const [key, raw] of Object.entries(mods)) {
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(out, key)) continue;
      out[key] = Number((out[key] * value).toFixed(4));
    }
  }

  return out;
}
