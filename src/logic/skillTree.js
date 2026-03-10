// src/constants/skillTree.js

function freezePerk(perk, index = 0) {
  return Object.freeze({
    ...perk,
    tier: Math.max(1, Math.floor(Number(perk?.tier || index + 1))),
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
          cost: 1,
          minDogLevel: 1,
          modifiers: { happinessDecayMultiplier: 0.95 },
        },
        {
          id: "scrapbook-charm",
          name: "Scrapbook Charm",
          type: "Unlock",
          effect: "Unlocks the Star Tag cosmetic and improves mood resilience.",
          unlocks: "Star Tag",
          cost: 1,
          minDogLevel: 2,
          modifiers: { happinessDecayMultiplier: 0.92 },
        },
        {
          id: "heart-sync",
          name: "Heart Sync",
          type: "Passive",
          effect: "Reduces passive energy drain while relaxing.",
          cost: 2,
          minDogLevel: 4,
          modifiers: { idleEnergyDecayMultiplier: 0.95 },
        },
        {
          id: "calm-presence",
          name: "Calm Presence",
          type: "Passive",
          effect: "Reduces cleanliness decay from minor stress behavior.",
          cost: 2,
          minDogLevel: 6,
          modifiers: { cleanlinessDecayMultiplier: 0.94 },
        },
        {
          id: "comfort-routine",
          name: "Comfort Routine",
          type: "Passive",
          effect: "Improves rest recovery speed.",
          cost: 3,
          minDogLevel: 8,
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
          cost: 1,
          minDogLevel: 1,
          modifiers: { cleanlinessDecayMultiplier: 0.92 },
        },
        {
          id: "cozy-fort",
          name: "Cozy Fort",
          type: "Unlock",
          effect:
            "Unlocks the Leaf Collar cosmetic and boosts rest efficiency.",
          unlocks: "Leaf Collar",
          cost: 1,
          minDogLevel: 2,
          modifiers: { restEnergyGainMultiplier: 1.08 },
        },
        {
          id: "weather-watch",
          name: "Weather Watch",
          type: "Passive",
          effect: "Reduces hunger decay during harsh weather swings.",
          cost: 2,
          minDogLevel: 4,
          modifiers: { hungerDecayMultiplier: 0.95 },
        },
        {
          id: "accident-shield",
          name: "Accident Shield",
          type: "Passive",
          effect: "Slows potty pressure gain between breaks.",
          cost: 2,
          minDogLevel: 6,
          modifiers: { pottyGainMultiplier: 0.88 },
        },
        {
          id: "cleanup-drill",
          name: "Cleanup Drill",
          type: "Passive",
          effect: "Further reduces cleanliness decay in long sessions.",
          cost: 3,
          minDogLevel: 8,
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
          cost: 1,
          minDogLevel: 1,
          modifiers: { idleEnergyDecayMultiplier: 0.94 },
        },
        {
          id: "agility-path",
          name: "Agility Path",
          type: "Unlock",
          effect: "Unlocks the Neon Collar cosmetic and boosts training XP.",
          unlocks: "Neon Collar",
          cost: 1,
          minDogLevel: 2,
          modifiers: { trainingSkillXpMultiplier: 1.08 },
        },
        {
          id: "zoomie-focus",
          name: "Zoomie Focus",
          type: "Passive",
          effect: "Increases obedience training XP gain.",
          cost: 2,
          minDogLevel: 4,
          modifiers: { trainingSkillXpMultiplier: 1.12 },
        },
        {
          id: "recovery-breath",
          name: "Recovery Breath",
          type: "Passive",
          effect: "Improves rest recovery between sessions.",
          cost: 2,
          minDogLevel: 6,
          modifiers: { restEnergyGainMultiplier: 1.1 },
        },
        {
          id: "trick-cascade",
          name: "Trick Cascade",
          type: "Passive",
          effect: "Major training XP boost for advanced command chaining.",
          cost: 3,
          minDogLevel: 8,
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
        tier: Math.max(1, Math.floor(Number(perk?.tier || index + 1))),
        cost: Math.max(1, Math.floor(Number(perk?.cost || 1))),
        minDogLevel: Math.max(1, Math.floor(Number(perk?.minDogLevel || 1))),
        requiredPerkIds: Object.freeze(
          Array.isArray(perk?.requiredPerkIds)
            ? perk.requiredPerkIds
                .map((id) => String(id || "").trim())
                .filter(Boolean)
            : index > 0
              ? [String(branch.perks[index - 1]?.id || "").trim()].filter(
                  Boolean
                )
              : []
        ),
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
  return getSkillTreePerk(perkId)?.requiredPerkIds?.[0] || null;
}

export function getSkillTreeRequiredPerkIds(perkId) {
  const ids = getSkillTreePerk(perkId)?.requiredPerkIds;
  return Array.isArray(ids) ? ids : [];
}

export function getSkillTreePerkCost(perkId) {
  return Math.max(1, Math.floor(Number(getSkillTreePerk(perkId)?.cost || 1)));
}

export function computeSkillTreePoints(level, unlockedIds) {
  const pointsEarned = Math.max(0, Math.floor(Number(level || 1)) - 1);
  const spent = Array.isArray(unlockedIds) ? unlockedIds : [];
  const pointsSpent = spent.reduce(
    (sum, id) => sum + getSkillTreePerkCost(id),
    0
  );
  const pointsAvailable = Math.max(0, pointsEarned - pointsSpent);
  return { pointsEarned, pointsSpent, pointsAvailable };
}

export function getSkillTreeUnlockCheck({
  perkId,
  unlockedIds = [],
  pointsAvailable = 0,
  dogLevel = 1,
} = {}) {
  const perk = getSkillTreePerk(perkId);
  if (!perk) return { ok: false, reason: "Unknown perk." };

  const unlocked = new Set(
    Array.isArray(unlockedIds) ? unlockedIds.map((id) => String(id)) : []
  );
  if (unlocked.has(perk.id)) {
    return { ok: false, reason: "Already unlocked.", perk };
  }

  const required = Array.isArray(perk.requiredPerkIds)
    ? perk.requiredPerkIds
    : [];
  const missing = required.filter((id) => !unlocked.has(String(id)));
  if (missing.length > 0) {
    return { ok: false, reason: "Unlock prerequisite perks first.", perk };
  }

  if (Math.max(1, Math.floor(Number(dogLevel || 1))) < perk.minDogLevel) {
    return {
      ok: false,
      reason: `Requires level ${perk.minDogLevel}.`,
      perk,
    };
  }

  if (Number(pointsAvailable || 0) < perk.cost) {
    return { ok: false, reason: `Need ${perk.cost} skill point(s).`, perk };
  }

  return { ok: true, reason: "", perk };
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
