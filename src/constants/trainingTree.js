/** @format */

// src/constants/trainingTree.js

export const TRAINING_BRANCHES = /** @type {const} */ ({
  obedience: "Obedience",
  tricks: "Tricks",
  behavior: "Behavior",
});

export const TRAINING_TREE = /** @type {const} */ ({
  obedience: {
    label: "Obedience",
    description: "Reliable commands and consistency.",
    nodes: [
      {
        id: "obedience_sit",
        label: "Sit",
        pose: "sit",
        cost: 1,
        prereq: [],
        rustPerDay: 4,
      },
      {
        id: "obedience_stay",
        label: "Stay",
        pose: "stay",
        cost: 1,
        prereq: ["obedience_sit"],
        rustPerDay: 5,
      },
      {
        id: "obedience_heel",
        label: "Heel",
        pose: "heel",
        cost: 2,
        prereq: ["obedience_stay"],
        rustPerDay: 6,
      },
      {
        id: "obedience_recall",
        label: "Recall",
        pose: "alert",
        cost: 2,
        prereq: ["obedience_stay"],
        rustPerDay: 6,
      },
    ],
  },

  tricks: {
    label: "Tricks",
    description: "Fun moves with visible flair.",
    nodes: [
      {
        id: "trick_paw",
        label: "Paw",
        pose: "paw",
        cost: 1,
        prereq: [],
        rustPerDay: 6,
      },
      {
        id: "trick_roll",
        label: "Roll",
        pose: "roll",
        cost: 2,
        prereq: ["trick_paw"],
        rustPerDay: 7,
      },
      {
        id: "trick_bow",
        label: "Bow",
        pose: "bow",
        cost: 2,
        prereq: ["trick_paw"],
        rustPerDay: 7,
      },
      {
        id: "trick_sit_pretty",
        label: "Sit Pretty",
        pose: "sit_pretty",
        cost: 3,
        prereq: ["trick_bow"],
        rustPerDay: 8,
      },
    ],
  },

  behavior: {
    label: "Behavior",
    description: "Temperament shaping and habit control.",
    nodes: [
      {
        id: "behavior_calm",
        label: "Calm",
        pose: "calm_idle",
        cost: 1,
        prereq: [],
        rustPerDay: 4,
      },
      {
        id: "behavior_gentle",
        label: "Gentle",
        pose: "gentle_idle",
        cost: 2,
        prereq: ["behavior_calm"],
        rustPerDay: 5,
      },
      {
        id: "behavior_confident",
        label: "Confident",
        pose: "confident_idle",
        cost: 2,
        prereq: ["behavior_calm"],
        rustPerDay: 5,
      },
      {
        id: "behavior_quiet",
        label: "Quiet",
        pose: "quiet_idle",
        cost: 2,
        prereq: ["behavior_gentle"],
        rustPerDay: 6,
      },
    ],
  },
});

export function allSkillNodes() {
  return Object.values(TRAINING_TREE).flatMap((b) => b.nodes);
}

export function getSkillNode(skillId) {
  return allSkillNodes().find((n) => n.id === skillId) || null;
}

export function skillPrereqsMet(skillId, unlockedSet) {
  const node = getSkillNode(skillId);
  if (!node) return false;
  return node.prereq.every((p) => unlockedSet.has(p));
}
