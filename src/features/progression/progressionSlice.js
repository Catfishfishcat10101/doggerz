// src/features/progression/progressionSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { OBEDIENCE_COMMANDS } from "@/features/training/obedienceCommands.js";
import {
  CARE_STREAK_CONFIG,
  POTTY_STREAK_CONFIG,
  PROGRESSION_MEMORY_RULES,
  PROGRESSION_SCHEMA_VERSION,
  PROGRESSION_UNLOCK_RULES,
  PROGRESSION_EVENT_TYPES,
  buildLevelState,
  getCommandTrainingPhase,
  getPhaseRank,
  getPottyTrainingPhase,
  getTrainingRewardsForEvent,
  getProgressionDayKey,
  isConditionSatisfied,
  isPhaseAtLeast,
  toTimestamp,
} from "./progressionConfig.js";

const clampInt = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const numeric = Math.floor(Number(value));
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
};

function createInitialTrack(id, label, category = "obedience") {
  return {
    id,
    label,
    category,
    phase: id === "potty" ? "introduced" : "locked",
    progressPct: 0,
    masteryPct: 0,
    successes: 0,
    accidents: 0,
    introducedAt: null,
    reliableAt: null,
    masteredAt: null,
  };
}

function createInitialTrainingTracks() {
  const tracks = {
    potty: createInitialTrack("potty", "Potty Training", "potty"),
  };

  for (const command of OBEDIENCE_COMMANDS) {
    tracks[command.id] = createInitialTrack(
      command.id,
      command.label,
      "obedience"
    );
  }

  return tracks;
}

function createInitialProgressionState() {
  return {
    schemaVersion: PROGRESSION_SCHEMA_VERSION,
    story: {
      focusMode: "one_dog_one_bond_one_story",
      activeDogId: null,
      activeDogName: null,
      adoptedAt: null,
      lastEventAt: null,
    },
    owner: buildLevelState("owner", 0, null),
    bond: buildLevelState("bond", 0, null),
    lifeStage: {
      current: "PUPPY",
      previous: null,
      ageDays: 0,
      changedAt: null,
      history: [],
    },
    training: {
      tracks: createInitialTrainingTracks(),
      activeTrackIds: ["potty"],
      reliableCommandCount: 0,
      masteredCommandCount: 0,
    },
    streaks: {
      care: {
        current: 0,
        best: 0,
        currentDayKey: null,
        categoriesCompleted: [],
        lastCompletedAt: null,
      },
      potty: {
        current: 0,
        best: 0,
        lastOutcome: null,
        lastEventAt: null,
      },
    },
    unlocks: {
      features: [],
      items: [],
      interactions: [],
    },
    memories: [],
    milestoneQueue: [],
    seenMilestoneIds: [],
    eventLog: {
      recentKeys: [],
      countsByType: {},
      lastEventAtByType: {},
      lastEventType: null,
    },
  };
}

function normalizeRecentKeys(recentKeys = []) {
  return (Array.isArray(recentKeys) ? recentKeys : [])
    .map((entry) => ({
      key: String(entry?.key || "").trim(),
      at: toTimestamp(entry?.at),
    }))
    .filter((entry) => entry.key)
    .slice(-250);
}

function normalizeTrack(rawTrack, fallbackTrack) {
  const track = rawTrack && typeof rawTrack === "object" ? rawTrack : {};
  const base =
    fallbackTrack ||
    createInitialTrack(track.id || "track", track.label || "Track");
  return {
    ...base,
    ...track,
    id: String(track.id || base.id).trim() || base.id,
    label: String(track.label || base.label).trim() || base.label,
    category: String(track.category || base.category).trim() || base.category,
    phase:
      String(track.phase || base.phase)
        .trim()
        .toLowerCase() || base.phase,
    progressPct: clampInt(track.progressPct ?? base.progressPct, 0, 100),
    masteryPct: clampInt(track.masteryPct ?? base.masteryPct, 0, 100),
    successes: clampInt(track.successes ?? base.successes, 0),
    accidents: clampInt(track.accidents ?? base.accidents, 0),
    introducedAt: toTimestamp(track.introducedAt ?? base.introducedAt),
    reliableAt: toTimestamp(track.reliableAt ?? base.reliableAt),
    masteredAt: toTimestamp(track.masteredAt ?? base.masteredAt),
  };
}

function normalizeProgressionState(rawState) {
  const base = createInitialProgressionState();
  const raw = rawState && typeof rawState === "object" ? rawState : {};
  const owner = buildLevelState(
    "owner",
    clampInt(raw?.owner?.totalXp, 0),
    raw?.owner?.lastLeveledAt
  );
  const bond = buildLevelState(
    "bond",
    clampInt(raw?.bond?.totalXp, 0),
    raw?.bond?.lastLeveledAt
  );

  const normalizedTracks = { ...base.training.tracks };
  const rawTracks =
    raw?.training?.tracks && typeof raw.training.tracks === "object"
      ? raw.training.tracks
      : {};
  for (const [trackId, fallbackTrack] of Object.entries(base.training.tracks)) {
    normalizedTracks[trackId] = normalizeTrack(
      rawTracks?.[trackId],
      fallbackTrack
    );
  }

  const memories = (Array.isArray(raw?.memories) ? raw.memories : [])
    .map((memory) => ({
      id: String(memory?.id || "").trim(),
      title: String(memory?.title || "").trim(),
      body: String(memory?.body || "").trim(),
      icon: String(memory?.icon || "🐾").trim() || "🐾",
      tone: String(memory?.tone || "emerald").trim() || "emerald",
      unlockedAt: toTimestamp(memory?.unlockedAt),
    }))
    .filter((memory) => memory.id);

  return {
    ...base,
    schemaVersion: PROGRESSION_SCHEMA_VERSION,
    story: {
      ...base.story,
      ...(raw?.story && typeof raw.story === "object" ? raw.story : {}),
      activeDogId: String(raw?.story?.activeDogId || "").trim() || null,
      activeDogName: String(raw?.story?.activeDogName || "").trim() || null,
      adoptedAt: toTimestamp(raw?.story?.adoptedAt),
      lastEventAt: toTimestamp(raw?.story?.lastEventAt),
    },
    owner,
    bond,
    lifeStage: {
      ...base.lifeStage,
      ...(raw?.lifeStage && typeof raw.lifeStage === "object"
        ? raw.lifeStage
        : {}),
      current: String(raw?.lifeStage?.current || base.lifeStage.current)
        .trim()
        .toUpperCase(),
      previous:
        String(raw?.lifeStage?.previous || "")
          .trim()
          .toUpperCase() || null,
      ageDays: clampInt(raw?.lifeStage?.ageDays, 0),
      changedAt: toTimestamp(raw?.lifeStage?.changedAt),
      history: (Array.isArray(raw?.lifeStage?.history)
        ? raw.lifeStage.history
        : []
      )
        .map((entry) => ({
          stage: String(entry?.stage || "")
            .trim()
            .toUpperCase(),
          changedAt: toTimestamp(entry?.changedAt),
        }))
        .filter((entry) => entry.stage),
    },
    training: {
      ...base.training,
      ...(raw?.training && typeof raw.training === "object"
        ? raw.training
        : {}),
      tracks: normalizedTracks,
      activeTrackIds: (Array.isArray(raw?.training?.activeTrackIds)
        ? raw.training.activeTrackIds
        : base.training.activeTrackIds
      )
        .map((trackId) => String(trackId || "").trim())
        .filter(Boolean),
      reliableCommandCount: clampInt(raw?.training?.reliableCommandCount, 0),
      masteredCommandCount: clampInt(raw?.training?.masteredCommandCount, 0),
    },
    streaks: {
      care: {
        ...base.streaks.care,
        ...(raw?.streaks?.care && typeof raw.streaks.care === "object"
          ? raw.streaks.care
          : {}),
        current: clampInt(raw?.streaks?.care?.current, 0),
        best: clampInt(raw?.streaks?.care?.best, 0),
        currentDayKey:
          String(raw?.streaks?.care?.currentDayKey || "").trim() || null,
        categoriesCompleted: (Array.isArray(
          raw?.streaks?.care?.categoriesCompleted
        )
          ? raw.streaks.care.categoriesCompleted
          : []
        )
          .map((category) => String(category || "").trim())
          .filter(Boolean),
        lastCompletedAt: toTimestamp(raw?.streaks?.care?.lastCompletedAt),
      },
      potty: {
        ...base.streaks.potty,
        ...(raw?.streaks?.potty && typeof raw.streaks.potty === "object"
          ? raw.streaks.potty
          : {}),
        current: clampInt(raw?.streaks?.potty?.current, 0),
        best: clampInt(raw?.streaks?.potty?.best, 0),
        lastOutcome:
          String(raw?.streaks?.potty?.lastOutcome || "").trim() || null,
        lastEventAt: toTimestamp(raw?.streaks?.potty?.lastEventAt),
      },
    },
    unlocks: {
      features: Array.from(
        new Set(
          (Array.isArray(raw?.unlocks?.features) ? raw.unlocks.features : [])
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        )
      ),
      items: Array.from(
        new Set(
          (Array.isArray(raw?.unlocks?.items) ? raw.unlocks.items : [])
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        )
      ),
      interactions: Array.from(
        new Set(
          (Array.isArray(raw?.unlocks?.interactions)
            ? raw.unlocks.interactions
            : []
          )
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        )
      ),
    },
    memories,
    milestoneQueue: (Array.isArray(raw?.milestoneQueue)
      ? raw.milestoneQueue
      : []
    )
      .map((milestone) => ({
        ...milestone,
        id: String(milestone?.id || "").trim(),
        createdAt: toTimestamp(milestone?.createdAt),
      }))
      .filter((milestone) => milestone.id),
    seenMilestoneIds: Array.from(
      new Set(
        (Array.isArray(raw?.seenMilestoneIds) ? raw.seenMilestoneIds : [])
          .map((id) => String(id || "").trim())
          .filter(Boolean)
      )
    ),
    eventLog: {
      recentKeys: normalizeRecentKeys(raw?.eventLog?.recentKeys),
      countsByType:
        raw?.eventLog?.countsByType &&
        typeof raw.eventLog.countsByType === "object"
          ? { ...raw.eventLog.countsByType }
          : {},
      lastEventAtByType:
        raw?.eventLog?.lastEventAtByType &&
        typeof raw.eventLog.lastEventAtByType === "object"
          ? Object.fromEntries(
              Object.entries(raw.eventLog.lastEventAtByType).map(
                ([type, value]) => [
                  String(type || "").trim(),
                  toTimestamp(value),
                ]
              )
            )
          : {},
      lastEventType: String(raw?.eventLog?.lastEventType || "").trim() || null,
    },
  };
}

function hasProcessedEventKey(state, key) {
  if (!key) return false;
  return state.eventLog.recentKeys.some((entry) => entry.key === key);
}

function rememberEventKey(state, key, occurredAt) {
  if (!key) return;
  state.eventLog.recentKeys.push({ key, at: occurredAt });
  if (state.eventLog.recentKeys.length > 250) {
    state.eventLog.recentKeys = state.eventLog.recentKeys.slice(-250);
  }
}

function incrementEventCount(state, eventType, occurredAt) {
  const type = String(eventType || "").trim();
  if (!type) return;
  state.eventLog.countsByType[type] =
    clampInt(state.eventLog.countsByType[type], 0) + 1;
  state.eventLog.lastEventAtByType[type] = occurredAt;
  state.eventLog.lastEventType = type;
}

function queueMilestone(state, milestone) {
  const nextMilestone =
    milestone && typeof milestone === "object" ? milestone : null;
  const milestoneId = String(nextMilestone?.id || "").trim();
  if (!milestoneId) return false;
  if (state.seenMilestoneIds.includes(milestoneId)) return false;
  if (state.milestoneQueue.some((entry) => entry.id === milestoneId))
    return false;
  state.milestoneQueue.push({
    ...nextMilestone,
    id: milestoneId,
    createdAt: toTimestamp(nextMilestone.createdAt) ?? Date.now(),
  });
  return true;
}

function applyXpGain(state, domain, gain, occurredAt) {
  const safeGain = clampInt(gain, 0);
  if (!safeGain)
    return { leveledUp: false, previousLevel: state[domain].level };
  const previousLevel = clampInt(state[domain]?.level, 1);
  const previousTotalXp = clampInt(state[domain]?.totalXp, 0);
  state[domain] = buildLevelState(
    domain,
    previousTotalXp + safeGain,
    state[domain]?.lastLeveledAt
  );
  if (state[domain].level > previousLevel) {
    state[domain].lastLeveledAt = occurredAt;
    return { leveledUp: true, previousLevel };
  }
  return { leveledUp: false, previousLevel };
}

function isSameLocalDay(a, b) {
  if (!a || !b) return false;
  return getProgressionDayKey(a) === getProgressionDayKey(b);
}

function isPreviousLocalDay(previousAt, currentAt) {
  if (!previousAt || !currentAt) return false;
  const previous = new Date(previousAt);
  previous.setHours(0, 0, 0, 0);
  const current = new Date(currentAt);
  current.setHours(0, 0, 0, 0);
  const diff = Math.round((current.getTime() - previous.getTime()) / 86400000);
  return diff === 1;
}

function updateCareStreak(state, careCategory, occurredAt) {
  const category = String(careCategory || "").trim();
  if (!category) return;
  const careState = state.streaks.care;
  const dayKey = getProgressionDayKey(occurredAt);

  if (careState.currentDayKey !== dayKey) {
    careState.currentDayKey = dayKey;
    careState.categoriesCompleted = [];
  }

  if (!careState.categoriesCompleted.includes(category)) {
    careState.categoriesCompleted.push(category);
  }

  if (
    careState.categoriesCompleted.length <
    CARE_STREAK_CONFIG.completionThreshold
  ) {
    return;
  }

  if (isSameLocalDay(careState.lastCompletedAt, occurredAt)) {
    return;
  }

  careState.current = isPreviousLocalDay(careState.lastCompletedAt, occurredAt)
    ? clampInt(careState.current, 0) + 1
    : 1;
  careState.best = Math.max(careState.best, careState.current);
  careState.lastCompletedAt = occurredAt;

  if (CARE_STREAK_CONFIG.milestoneDays.includes(careState.current)) {
    queueMilestone(state, {
      id: `care-streak:${careState.current}`,
      kind: "streak",
      title: `${careState.current}-day care streak`,
      body: "Your daily rhythm is becoming dependable instead of frantic.",
      icon: "🔥",
      tone: "amber",
      createdAt: occurredAt,
    });
  }
}

function updatePottyStreak(state, didSucceed, occurredAt) {
  const pottyState = state.streaks.potty;
  if (didSucceed) {
    pottyState.current = clampInt(pottyState.current, 0) + 1;
    pottyState.best = Math.max(pottyState.best, pottyState.current);
    pottyState.lastOutcome = "success";
    pottyState.lastEventAt = occurredAt;
    if (POTTY_STREAK_CONFIG.milestoneDays.includes(pottyState.current)) {
      queueMilestone(state, {
        id: `potty-streak:${pottyState.current}`,
        kind: "streak",
        title: `${pottyState.current} clean potty wins`,
        body: "House-training is settling into muscle memory for both of you.",
        icon: "🌿",
        tone: "emerald",
        createdAt: occurredAt,
      });
    }
    return;
  }

  pottyState.current = 0;
  pottyState.lastOutcome = "accident";
  pottyState.lastEventAt = occurredAt;
}

function syncLifeStage(state, snapshot, event) {
  const stage = String(
    snapshot?.dog?.stage || state.lifeStage.current || "PUPPY"
  )
    .trim()
    .toUpperCase();
  const ageDays = clampInt(snapshot?.dog?.ageDays, 0);
  const previousStage = String(state.lifeStage.current || "PUPPY")
    .trim()
    .toUpperCase();
  state.lifeStage.ageDays = ageDays;

  if (
    event?.type === PROGRESSION_EVENT_TYPES.LIFE_STAGE_CHANGED &&
    stage &&
    stage !== previousStage
  ) {
    state.lifeStage.previous = previousStage || null;
    state.lifeStage.current = stage;
    state.lifeStage.changedAt = event.occurredAt;
    state.lifeStage.history.push({
      stage,
      changedAt: event.occurredAt,
    });
    state.lifeStage.history = state.lifeStage.history.slice(-12);
    queueMilestone(state, {
      id: `life-stage:${stage}`,
      kind: "life_stage",
      title: `${stage.charAt(0)}${stage.slice(1).toLowerCase()} stage reached`,
      body: `Your dog has grown into the ${stage.toLowerCase()} chapter of the story.`,
      icon: stage === "SENIOR" ? "✨" : "🌱",
      tone: stage === "SENIOR" ? "amber" : "emerald",
      createdAt: event.occurredAt,
    });
    return;
  }

  state.lifeStage.current = stage;
}

function queueLevelMilestones(state, domain, levelResult, occurredAt) {
  if (!levelResult?.leveledUp) return;
  const nextLevel = clampInt(state?.[domain]?.level, 1);
  queueMilestone(state, {
    id: `${domain}-level:${nextLevel}`,
    kind: `${domain}_level`,
    title:
      domain === "bond"
        ? `Bond level ${nextLevel}`
        : `Owner level ${nextLevel}`,
    body:
      domain === "bond"
        ? "The relationship has deepened through shared care and time."
        : "You’re getting more capable at keeping one dog, one bond, one story moving forward.",
    icon: domain === "bond" ? "💗" : "⭐",
    tone: domain === "bond" ? "rose" : "amber",
    createdAt: occurredAt,
  });
}

function markTrackMilestones(state, track, previousPhase, occurredAt) {
  const nextPhase = String(track?.phase || "locked")
    .trim()
    .toLowerCase();
  if (!track?.id || getPhaseRank(nextPhase) <= getPhaseRank(previousPhase))
    return;

  if (track.id === "potty" && isPhaseAtLeast(nextPhase, "reliable")) {
    queueMilestone(state, {
      id: `track:${track.id}:${nextPhase}`,
      kind: "training",
      title:
        nextPhase === "mastered"
          ? "Potty training mastered"
          : "Potty training reliable",
      body:
        nextPhase === "mastered"
          ? "The early gate is behind you now. The foundation held."
          : "Potty training is starting to feel dependable, not fragile.",
      icon: "🪴",
      tone: "emerald",
      createdAt: occurredAt,
    });
    return;
  }

  if (track.category === "obedience") {
    if (nextPhase === "introduced") {
      queueMilestone(state, {
        id: `track:${track.id}:introduced`,
        kind: "training",
        title: `${track.label} introduced`,
        body: "A new training lesson is ready to become part of your shared language.",
        icon: "🎯",
        tone: "sky",
        createdAt: occurredAt,
      });
      return;
    }
    if (nextPhase === "reliable" || nextPhase === "mastered") {
      queueMilestone(state, {
        id: `track:${track.id}:${nextPhase}`,
        kind: "training",
        title:
          nextPhase === "mastered"
            ? `${track.label} mastered`
            : `${track.label} reliable`,
        body:
          nextPhase === "mastered"
            ? "This command now feels natural and emotionally earned."
            : "This command has become a dependable part of the bond.",
        icon: nextPhase === "mastered" ? "🏅" : "🗣️",
        tone: nextPhase === "mastered" ? "amber" : "sky",
        createdAt: occurredAt,
      });
    }
  }
}

function syncTrainingState(state, snapshot, occurredAt) {
  const tracks = state.training.tracks;
  const activeTrackIds = new Set();

  const pottySnapshot = snapshot?.dog?.potty || {};
  const pottyTrack =
    tracks.potty || createInitialTrack("potty", "Potty Training", "potty");
  const previousPottyPhase = pottyTrack.phase;
  pottyTrack.successes = clampInt(pottySnapshot.successCount, 0);
  pottyTrack.accidents = clampInt(
    state.eventLog.countsByType[PROGRESSION_EVENT_TYPES.POTTY_ACCIDENT],
    0
  );
  pottyTrack.progressPct = clampInt(
    Math.round(
      (pottyTrack.successes / Math.max(1, clampInt(pottySnapshot.goal, 1))) *
        100
    ),
    0,
    100
  );
  pottyTrack.masteryPct = pottyTrack.progressPct;
  pottyTrack.phase = getPottyTrainingPhase({
    successCount: pottySnapshot.successCount,
    goal: pottySnapshot.goal,
    completedAt: pottySnapshot.completedAt,
  });
  if (pottyTrack.phase !== "locked" && !pottyTrack.introducedAt)
    pottyTrack.introducedAt = occurredAt;
  if (pottyTrack.phase === "reliable" && !pottyTrack.reliableAt)
    pottyTrack.reliableAt = occurredAt;
  if (pottyTrack.phase === "mastered" && !pottyTrack.masteredAt)
    pottyTrack.masteredAt = occurredAt;
  if (isPhaseAtLeast(pottyTrack.phase, "introduced"))
    activeTrackIds.add("potty");
  tracks.potty = pottyTrack;
  markTrackMilestones(state, pottyTrack, previousPottyPhase, occurredAt);

  let reliableCommandCount = 0;
  let masteredCommandCount = 0;
  for (const command of Array.isArray(snapshot?.dog?.obedience)
    ? snapshot.dog.obedience
    : []) {
    const trackId = String(command?.id || "").trim();
    if (!trackId) continue;
    const previousTrack =
      tracks[trackId] ||
      createInitialTrack(trackId, command?.label || trackId, "obedience");
    const previousPhase = previousTrack.phase;
    previousTrack.label =
      String(command?.label || previousTrack.label || trackId).trim() ||
      trackId;
    previousTrack.masteryPct = clampInt(command?.masteryPct, 0, 100);
    previousTrack.progressPct = previousTrack.masteryPct;
    previousTrack.phase = getCommandTrainingPhase({
      unlocked: Boolean(command?.unlocked),
      masteryPct: previousTrack.masteryPct,
    });

    if (previousTrack.phase !== "locked" && !previousTrack.introducedAt) {
      previousTrack.introducedAt = occurredAt;
    }
    if (previousTrack.phase === "reliable" && !previousTrack.reliableAt) {
      previousTrack.reliableAt = occurredAt;
    }
    if (previousTrack.phase === "mastered" && !previousTrack.masteredAt) {
      previousTrack.masteredAt = occurredAt;
    }

    if (isPhaseAtLeast(previousTrack.phase, "introduced"))
      activeTrackIds.add(trackId);
    if (isPhaseAtLeast(previousTrack.phase, "reliable"))
      reliableCommandCount += 1;
    if (previousTrack.phase === "mastered") masteredCommandCount += 1;

    tracks[trackId] = previousTrack;
    markTrackMilestones(state, previousTrack, previousPhase, occurredAt);
  }

  state.training.reliableCommandCount = reliableCommandCount;
  state.training.masteredCommandCount = masteredCommandCount;
  state.training.activeTrackIds = Array.from(activeTrackIds);
}

function unlockConfiguredEntries(state, occurredAt) {
  for (const rule of PROGRESSION_UNLOCK_RULES) {
    if (!isConditionSatisfied(rule.when, state)) continue;
    const bucket = rule.bucket;
    if (!Array.isArray(state.unlocks?.[bucket])) continue;
    if (state.unlocks[bucket].includes(rule.id)) continue;
    state.unlocks[bucket].push(rule.id);
    queueMilestone(state, {
      id: `unlock:${rule.id}`,
      kind: "unlock",
      title: rule.title,
      body: rule.body,
      icon: rule.icon,
      tone: rule.tone,
      createdAt: occurredAt,
    });
  }

  for (const memoryRule of PROGRESSION_MEMORY_RULES) {
    if (!isConditionSatisfied(memoryRule.when, state)) continue;
    if (state.memories.some((memory) => memory.id === memoryRule.id)) continue;
    state.memories.push({
      id: memoryRule.id,
      title: memoryRule.title,
      body: memoryRule.body,
      icon: memoryRule.icon,
      tone: memoryRule.tone,
      unlockedAt: occurredAt,
    });
    queueMilestone(state, {
      id: `memory:${memoryRule.id}`,
      kind: "memory",
      title: memoryRule.title,
      body: memoryRule.body,
      icon: memoryRule.icon,
      tone: memoryRule.tone,
      createdAt: occurredAt,
    });
  }
}

function syncStory(state, snapshot, occurredAt) {
  state.story.activeDogId =
    String(snapshot?.dog?.id || state.story.activeDogId || "").trim() || null;
  state.story.activeDogName =
    String(snapshot?.dog?.name || state.story.activeDogName || "").trim() ||
    null;
  state.story.adoptedAt =
    toTimestamp(snapshot?.dog?.adoptedAt) ?? state.story.adoptedAt;
  state.story.lastEventAt = occurredAt;
}

const progressionSlice = createSlice({
  name: "progression",
  initialState: createInitialProgressionState(),
  reducers: {
    hydrateProgression(state, action) {
      return normalizeProgressionState(action.payload);
    },
    resetProgression() {
      return createInitialProgressionState();
    },
    recordProgressionEvent(state, action) {
      const event =
        action.payload && typeof action.payload === "object"
          ? action.payload
          : null;
      const eventType = String(event?.type || "").trim();
      const occurredAt = toTimestamp(event?.occurredAt) ?? Date.now();
      const snapshot =
        event?.snapshot && typeof event.snapshot === "object"
          ? event.snapshot
          : null;
      if (!eventType || !snapshot) return;
      if (event?.dedupeKey && hasProcessedEventKey(state, event.dedupeKey))
        return;

      if (event?.dedupeKey)
        rememberEventKey(state, event.dedupeKey, occurredAt);
      incrementEventCount(state, eventType, occurredAt);
      syncStory(state, snapshot, occurredAt);
      syncLifeStage(state, snapshot, event);

      const rewards = getTrainingRewardsForEvent(event);
      const ownerResult = applyXpGain(
        state,
        "owner",
        rewards.ownerXp,
        occurredAt
      );
      const bondResult = applyXpGain(state, "bond", rewards.bondXp, occurredAt);
      queueLevelMilestones(state, "owner", ownerResult, occurredAt);
      queueLevelMilestones(state, "bond", bondResult, occurredAt);

      if (rewards.careCategory) {
        updateCareStreak(state, rewards.careCategory, occurredAt);
      }

      if (eventType === PROGRESSION_EVENT_TYPES.POTTY_SUCCESS) {
        updatePottyStreak(state, true, occurredAt);
      } else if (eventType === PROGRESSION_EVENT_TYPES.POTTY_ACCIDENT) {
        updatePottyStreak(state, false, occurredAt);
      }

      syncTrainingState(state, snapshot, occurredAt);
      unlockConfiguredEntries(state, occurredAt);
    },
    dequeueProgressionMilestone(state, action) {
      const requestedId = String(
        action?.payload?.id || action?.payload || ""
      ).trim();
      const removed = requestedId
        ? state.milestoneQueue.find((entry) => entry.id === requestedId)
        : state.milestoneQueue[0] || null;
      if (!removed) return;
      state.milestoneQueue = requestedId
        ? state.milestoneQueue.filter((entry) => entry.id !== requestedId)
        : state.milestoneQueue.slice(1);
      if (!state.seenMilestoneIds.includes(removed.id)) {
        state.seenMilestoneIds.push(removed.id);
      }
    },
    clearProgressionMilestones(state) {
      const seenIds = state.milestoneQueue
        .map((entry) => entry.id)
        .filter(Boolean);
      state.milestoneQueue = [];
      for (const id of seenIds) {
        if (!state.seenMilestoneIds.includes(id)) {
          state.seenMilestoneIds.push(id);
        }
      }
    },
  },
});

export const {
  hydrateProgression,
  resetProgression,
  recordProgressionEvent,
  dequeueProgressionMilestone,
  clearProgressionMilestones,
} = progressionSlice.actions;

export { createInitialProgressionState, normalizeProgressionState };

export default progressionSlice.reducer;
