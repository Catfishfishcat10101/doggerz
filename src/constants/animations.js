export const PET_ACTIONS = Object.freeze({
  IDLE: "idle",
  IDLE_RESTING: "idle_resting",
  WALK_LEFT: "walk_left",
  WALK_RIGHT: "walk_right",
  SLEEP: "sleep",
  DEEP_REM_SLEEP: "deep_rem_sleep",
  LETHARGIC_LAY: "lethargic_lay",
  LAY_DOWN: "lay_down",
  TURN_WALK_LEFT: "turn_walk_left",
  TURN_WALK_RIGHT: "turn_walk_right",
  BARK: "bark",
  SCRATCH: "scratch",
  SIT: "sit",
  WAG: "wag",
  EAT: "eat",
  DRINK: "drink",
  GATE_WATCH_LIGHT: "gate_watch_light",
  JUMP: "jump",
  FETCH_BAG: "fetch_bag",
  PAW_SHAKE: "paw_shake",
  HIGH_FIVE: "high_five",
  DANCE: "dance",
});

export const PET_ANIMATION_GROUPS = Object.freeze({
  AUTONOMOUS: "autonomous",
  CONTEXTUAL: "contextual",
  TRICK: "trick",
});

export const PET_ANIMATIONS = Object.freeze({
  [PET_ACTIONS.IDLE]: {
    name: PET_ACTIONS.IDLE,
    label: "Idle",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 140,
    loops: true,
  },
  [PET_ACTIONS.IDLE_RESTING]: {
    name: PET_ACTIONS.IDLE_RESTING,
    label: "Idle Resting",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 170,
    loops: true,
  },
  [PET_ACTIONS.WALK_LEFT]: {
    name: PET_ACTIONS.WALK_LEFT,
    label: "Walk Left",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 95,
    loops: true,
  },
  [PET_ACTIONS.WALK_RIGHT]: {
    name: PET_ACTIONS.WALK_RIGHT,
    label: "Walk Right",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 95,
    loops: true,
  },
  [PET_ACTIONS.SLEEP]: {
    name: PET_ACTIONS.SLEEP,
    label: "Sleep",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 220,
    loops: true,
  },
  [PET_ACTIONS.DEEP_REM_SLEEP]: {
    name: PET_ACTIONS.DEEP_REM_SLEEP,
    label: "Deep REM Sleep",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 260,
    loops: true,
  },
  [PET_ACTIONS.LETHARGIC_LAY]: {
    name: PET_ACTIONS.LETHARGIC_LAY,
    label: "Lethargic Lay",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 240,
    loops: true,
  },
  [PET_ACTIONS.LAY_DOWN]: {
    name: PET_ACTIONS.LAY_DOWN,
    label: "Lay Down",
    group: PET_ANIMATION_GROUPS.AUTONOMOUS,
    frameCount: 8,
    frameDurationMs: 180,
    loops: true,
  },
  [PET_ACTIONS.TURN_WALK_LEFT]: {
    name: PET_ACTIONS.TURN_WALK_LEFT,
    label: "Turn Walk Left",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 6,
    frameDurationMs: 90,
    loops: false,
  },
  [PET_ACTIONS.TURN_WALK_RIGHT]: {
    name: PET_ACTIONS.TURN_WALK_RIGHT,
    label: "Turn Walk Right",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 6,
    frameDurationMs: 90,
    loops: false,
  },
  [PET_ACTIONS.BARK]: {
    name: PET_ACTIONS.BARK,
    label: "Bark",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 6,
    frameDurationMs: 85,
    loops: false,
  },
  [PET_ACTIONS.SCRATCH]: {
    name: PET_ACTIONS.SCRATCH,
    label: "Scratch",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 95,
    loops: false,
  },
  [PET_ACTIONS.SIT]: {
    name: PET_ACTIONS.SIT,
    label: "Sit",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 130,
    loops: false,
  },
  [PET_ACTIONS.WAG]: {
    name: PET_ACTIONS.WAG,
    label: "Wag",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 90,
    loops: false,
  },
  [PET_ACTIONS.EAT]: {
    name: PET_ACTIONS.EAT,
    label: "Eat",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 110,
    loops: false,
  },
  [PET_ACTIONS.DRINK]: {
    name: PET_ACTIONS.DRINK,
    label: "Drink",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 110,
    loops: false,
  },
  [PET_ACTIONS.GATE_WATCH_LIGHT]: {
    name: PET_ACTIONS.GATE_WATCH_LIGHT,
    label: "Gate Watch Light",
    group: PET_ANIMATION_GROUPS.CONTEXTUAL,
    frameCount: 8,
    frameDurationMs: 150,
    loops: false,
  },
  [PET_ACTIONS.JUMP]: {
    name: PET_ACTIONS.JUMP,
    label: "Jump",
    group: PET_ANIMATION_GROUPS.TRICK,
    frameCount: 8,
    frameDurationMs: 80,
    loops: false,
  },
  [PET_ACTIONS.FETCH_BAG]: {
    name: PET_ACTIONS.FETCH_BAG,
    label: "Fetch Bag",
    group: PET_ANIMATION_GROUPS.TRICK,
    frameCount: 8,
    frameDurationMs: 100,
    loops: false,
  },
  [PET_ACTIONS.PAW_SHAKE]: {
    name: PET_ACTIONS.PAW_SHAKE,
    label: "Paw Shake",
    group: PET_ANIMATION_GROUPS.TRICK,
    frameCount: 8,
    frameDurationMs: 95,
    loops: false,
  },
  [PET_ACTIONS.HIGH_FIVE]: {
    name: PET_ACTIONS.HIGH_FIVE,
    label: "High Five",
    group: PET_ANIMATION_GROUPS.TRICK,
    frameCount: 8,
    frameDurationMs: 90,
    loops: false,
  },
  [PET_ACTIONS.DANCE]: {
    name: PET_ACTIONS.DANCE,
    label: "Dance",
    group: PET_ANIMATION_GROUPS.TRICK,
    frameCount: 8,
    frameDurationMs: 85,
    loops: false,
  },
});

export const AUTONOMOUS_PET_ACTIONS = Object.freeze(
  Object.values(PET_ANIMATIONS)
    .filter((animation) => animation.group === PET_ANIMATION_GROUPS.AUTONOMOUS)
    .map((animation) => animation.name)
);

export const ONE_SHOT_PET_ACTIONS = Object.freeze(
  new Set(
    Object.values(PET_ANIMATIONS)
      .filter((animation) => !animation.loops)
      .map((animation) => animation.name)
  )
);

export function getPetAnimation(action) {
  return PET_ANIMATIONS[action] || PET_ANIMATIONS[PET_ACTIONS.IDLE];
}

export function getPetAnimationDurationMs(action) {
  const animation = getPetAnimation(action);
  return animation.frameCount * animation.frameDurationMs;
}

export function isOneShotPetAction(action) {
  return ONE_SHOT_PET_ACTIONS.has(action);
}
