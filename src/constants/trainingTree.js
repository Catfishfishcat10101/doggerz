/** @format */
// src/constants/trainingTree.js

function freezeNode(node) {
  return Object.freeze({
    ...node,
    prereq: Object.freeze(
      Array.isArray(node?.prereq) ? node.prereq.map(String) : []
    ),
    tags: Object.freeze(Array.isArray(node?.tags) ? node.tags.map(String) : []),
  });
}

function freezeBranch(branch) {
  return Object.freeze({
    ...branch,
    nodes: Object.freeze((branch?.nodes || []).map(freezeNode)),
  });
}

const BRANCHES = Object.freeze({
  obedience: freezeBranch({
    label: "Obedience",
    description:
      "Core commands that improve reliability and day-to-day control.",
    nodes: [
      {
        id: "sit",
        label: "Sit",
        pose: "sit",
        cost: 1,
        difficulty: "easy",
        rustPerDay: 0.9,
        tags: ["core", "calm"],
        prereq: [],
      },
      {
        id: "stay",
        label: "Stay",
        pose: "stay",
        cost: 1,
        difficulty: "easy",
        rustPerDay: 1.0,
        tags: ["core", "focus"],
        prereq: ["sit"],
      },
      {
        id: "heel",
        label: "Heel",
        pose: "heel",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 1.2,
        tags: ["walk", "focus"],
        prereq: ["stay"],
      },
      {
        id: "quiet",
        label: "Quiet Focus",
        pose: "quiet_idle",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 1.1,
        tags: ["calm", "focus"],
        prereq: ["stay"],
      },
    ],
  }),
  tricks: freezeBranch({
    label: "Tricks",
    description: "Flashier poses and show skills that improve engagement.",
    nodes: [
      {
        id: "paw_shake",
        label: "Paw / Shake",
        pose: "paw",
        cost: 1,
        difficulty: "easy",
        rustPerDay: 1.2,
        tags: ["show", "social"],
        prereq: [],
      },
      {
        id: "bow",
        label: "Bow",
        pose: "bow",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 1.3,
        tags: ["show", "mobility"],
        prereq: ["paw_shake"],
      },
      {
        id: "roll_over",
        label: "Roll Over",
        pose: "roll",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 1.4,
        tags: ["show", "mobility"],
        prereq: ["bow"],
      },
      {
        id: "sit_pretty",
        label: "Sit Pretty",
        pose: "sit_pretty",
        cost: 3,
        difficulty: "hard",
        rustPerDay: 1.6,
        tags: ["show", "balance"],
        prereq: ["roll_over"],
      },
    ],
  }),
  confidence: freezeBranch({
    label: "Confidence",
    description: "Stability and confidence poses that support consistency.",
    nodes: [
      {
        id: "alert_stance",
        label: "Alert Stance",
        pose: "alert",
        cost: 1,
        difficulty: "easy",
        rustPerDay: 0.8,
        tags: ["awareness", "calm"],
        prereq: [],
      },
      {
        id: "calm_idle",
        label: "Calm Idle",
        pose: "calm_idle",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 0.9,
        tags: ["calm", "maintenance"],
        prereq: ["alert_stance"],
      },
      {
        id: "confident_idle",
        label: "Confident Idle",
        pose: "confident_idle",
        cost: 2,
        difficulty: "medium",
        rustPerDay: 1.0,
        tags: ["calm", "confidence"],
        prereq: ["calm_idle"],
      },
      {
        id: "play_dead",
        label: "Play Dead",
        pose: "play_dead",
        cost: 3,
        difficulty: "hard",
        rustPerDay: 1.5,
        tags: ["show", "confidence"],
        prereq: ["confident_idle"],
      },
    ],
  }),
});

export const TRAINING_TREE = BRANCHES;

const BRANCH_INDEX = Object.freeze(
  Object.entries(BRANCHES).reduce((acc, [id, branch]) => {
    acc[id] = Object.freeze({ id, ...branch });
    return acc;
  }, {})
);

const NODE_INDEX = (() => {
  const m = new Map();
  for (const branch of Object.values(BRANCHES)) {
    for (const node of branch.nodes || []) {
      if (!node?.id) continue;
      m.set(String(node.id), node);
    }
  }
  return m;
})();

const ALL_NODES = Object.freeze(Array.from(NODE_INDEX.values()));

export function allSkillNodes() {
  return ALL_NODES;
}

export function getTrainingBranch(branchId) {
  const key = String(branchId || "").trim();
  if (!key) return null;
  return BRANCH_INDEX[key] || null;
}

export function getSkillNode(skillId) {
  const key = String(skillId || "").trim();
  if (!key) return null;
  return NODE_INDEX.get(key) || null;
}

export function skillPrereqsMet(skillId, unlockedIds) {
  const node = getSkillNode(skillId);
  if (!node) return false;
  if (!node.prereq.length) return true;

  const unlockedSet =
    unlockedIds instanceof Set
      ? unlockedIds
      : new Set(Array.isArray(unlockedIds) ? unlockedIds.map(String) : []);

  return node.prereq.every((id) => unlockedSet.has(String(id)));
}
