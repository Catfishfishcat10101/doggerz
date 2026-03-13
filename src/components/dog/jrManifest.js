import baseManifest from "@/components/dog/jrManifest.json";
import {
  getManifestAnimMeta,
  normalizeDogAnimKey,
  resolveManifestAnimKey,
} from "@/components/dog/dogAnimationEngine.js";
import { withBaseUrl } from "@/utils/assetUtils.js";

const DEFAULT_FRAME = baseManifest?.frame || {};
const DEFAULT_FRAME_WIDTH = Math.max(1, Number(DEFAULT_FRAME.width || 256));
const DEFAULT_FRAME_HEIGHT = Math.max(1, Number(DEFAULT_FRAME.height || 256));
const DEFAULT_FPS = Math.max(1, Number(baseManifest?.defaultFps || 8));
const MASTER_TRICK_ACTIONS = new Set([
  "sit",
  "speak",
  "shake",
  "sit_pretty",
  "roll_over",
  "spin",
  "crawl",
  "play_dead",
  "backflip",
]);

const STAGE_FILE_MAP = Object.freeze({
  adult: Object.freeze({
    idle: "adult_idle.png",
    walk: "adult_walk.png",
    walk_left: "adult_walk_left.png",
    walk_right: "adult_walk_right.png",
    turn_walk_left: "adult_turn_walk_left.png",
    turn_walk_right: "adult_turn_walk_right.png",
    bark: "adult_bark.png",
    speak: "adult_speak.png",
    bow: "adult_bow.png",
    sit: "adult_sit.png",
    shake: "adult_shake.png",
    sit_pretty: "adult_sit_pretty.png",
    roll_over: "adult_roll_over.png",
    spin: "adult_spin.png",
    crawl: "adult_crawl.png",
    play_dead: "adult_play_dead.png",
    wag: "adult_wag.png",
    fetch: "adult_fetch.png",
    deep_rem_sleep: "adult_deep_rem_sleep.png",
    drink: "adult_drink.png",
    dance: "adult_dance.png",
    idle_resting: "adult_idle_resting.png",
    tornado: "adult_tornado.png",
    backflip: "adult_backflip.png",
    handstand: "adult_handstand.png",
    army_crawl: "adult_army_crawl.png",
    clean: "adult_clean.png",
  }),
  pup: Object.freeze({
    idle: "pup_idle.png",
    walk: "pup_walk.png",
    walk_left: "pup_walk_left.png",
    walk_right: "pup_walk_right.png",
    turn_walk_left: "pup_turn_walk_left.png",
    turn_walk_right: "pup_turn_walk_right.png",
    bark: "pup_bark.png",
    speak: "pup_speak.png",
    bow: "pup_bow.png",
    sit: "pup_sit.png",
    shake: "pup_shake.png",
    sit_pretty: "pup_sit_pretty.png",
    roll_over: "pup_roll_over.png",
    spin: "pup_spin.png",
    crawl: "pup_crawl.png",
    play_dead: "pup_play_dead.png",
    backflip: "pup_backflip.png",
    wag: "pup_wag.png",
    fetch: "pup_fetch.png",
    deep_rem_sleep: "pup_deep_rem_sleep.png",
    drink: "pup_drink.png",
    dance: "pup_dance.png",
    idle_resting: "pup_idle_resting.png",
    puppy_idle_pack: "pup_puppy_idle_pack.png",
    puppy_sleeping_pack: "pup_puppy_sleeping_pack.png",
    puppy_potty_success: "pup_puppy_potty_success.png",
    puppy_confused: "pup_puppy_confused.png",
    clean: "pup_clean.png",
  }),
  senior: Object.freeze({
    golden_years_idle: "senior_golden_years_idle.png",
    golden_years_sleeping: "senior_golden_years_sleeping.png",
  }),
});

const ACTION_FILE_ALIASES = Object.freeze({
  interact: "bark",
  bark: "bark",
  speak: "speak",
  sit_pretty: "sit_pretty",
  backflip: "backflip",
  eat: "drink",
  feed: "drink",
  drink: "drink",
  sleep: "deep_rem_sleep",
  sleeping: "deep_rem_sleep",
  deep_sleep: "deep_rem_sleep",
  dream: "deep_rem_sleep",
  tornado: "tornado",
  handstand: "handstand",
  army_crawl: "army_crawl",
  puppy_idle_pack: "puppy_idle_pack",
  puppy_sleeping_pack: "puppy_sleeping_pack",
  puppy_potty_success: "puppy_potty_success",
  puppy_confused: "puppy_confused",
  golden_years_idle: "golden_years_idle",
  golden_years_sleeping: "golden_years_sleeping",
  rest: "idle_resting",
  scratch: "wag",
  sniff: "wag",
  sit: "sit",
  trick: "bow",
  jump: "backflip",
  spin: "spin",
  point_position: "bark",
  territorial_bark: "bark",
  gate_watch: "idle_resting",
  limping: "walk",
  shivering: "idle",
  lethargic_lay: "idle_resting",
  light_sleep: "deep_rem_sleep",
  thrashing: "dance",
  run: "walk",
});

const FILE_LOOKUP = Object.freeze(
  Object.entries(STAGE_FILE_MAP).reduce((acc, [stage, files]) => {
    Object.entries(files).forEach(([action, fileName]) => {
      acc[fileName.toLowerCase()] = { stage, action };
    });
    return acc;
  }, {})
);

export function normalizeJrLifeStage(value, fallback = "adult") {
  const key = String(value || "")
    .trim()
    .toLowerCase();

  if (!key) return fallback;
  if (key.startsWith("pup")) return "pup";
  if (key.startsWith("adult")) return "adult";
  if (key.startsWith("senior")) return "senior";
  return fallback;
}

export function resolveJrAction(value, fallback = "idle") {
  const normalized = normalizeDogAnimKey(value || fallback);
  const resolved = resolveManifestAnimKey(normalized || fallback);
  const aliased = normalizeDogAnimKey(
    ACTION_FILE_ALIASES[resolved] || ACTION_FILE_ALIASES[normalized] || resolved
  );
  return aliased || fallback;
}

function getStageFiles(stageLike) {
  const stage = normalizeJrLifeStage(stageLike, "adult");
  return STAGE_FILE_MAP[stage] || STAGE_FILE_MAP.adult;
}

function getFileAction(stageLike, actionLike) {
  const stageFiles = getStageFiles(stageLike);
  const requested = resolveJrAction(actionLike, "idle");
  if (stageFiles[requested]) return requested;
  if (stageFiles.idle_resting && requested === "idle") return "idle_resting";
  return "idle";
}

function buildFramePositions(entry) {
  const positions = [];
  const frames = Math.max(1, Number(entry?.frames || 1));
  const columns = Math.max(1, Number(entry?.columns || 1));
  const frameWidth = Math.max(
    1,
    Number(entry?.frameWidth || DEFAULT_FRAME_WIDTH)
  );
  const frameHeight = Math.max(
    1,
    Number(entry?.frameHeight || DEFAULT_FRAME_HEIGHT)
  );

  for (let index = 0; index < frames; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    positions.push({
      index,
      x: -(col * frameWidth),
      y: -(row * frameHeight),
    });
  }

  return positions;
}

export function getJrSpriteFramePosition(entry, frameIndex = 0) {
  const frames = Math.max(1, Number(entry?.frames || 1));
  const columns = Math.max(1, Number(entry?.columns || 1));
  const frameWidth = Math.max(
    1,
    Number(entry?.frameWidth || DEFAULT_FRAME_WIDTH)
  );
  const frameHeight = Math.max(
    1,
    Number(entry?.frameHeight || DEFAULT_FRAME_HEIGHT)
  );
  const index = Math.max(0, Math.floor(Number(frameIndex) || 0)) % frames;
  const col = index % columns;
  const row = Math.floor(index / columns);

  const x = -(col * frameWidth);
  const y = -(row * frameHeight);

  return {
    index,
    col,
    row,
    x: Object.is(x, -0) ? 0 : x,
    y: Object.is(y, -0) ? 0 : y,
  };
}

function buildStaticEntry(stageLike) {
  const stage = normalizeJrLifeStage(stageLike, "adult");
  const fileName = getStageFiles(stage).clean;
  return {
    id: `${stage}:clean`,
    stage,
    requestedAction: "clean",
    action: "clean",
    fileName,
    url: withBaseUrl(`/assets/sprites/jr/${fileName}`),
    frameWidth: DEFAULT_FRAME_WIDTH,
    frameHeight: DEFAULT_FRAME_HEIGHT,
    frames: 1,
    columns: 1,
    rows: 1,
    fps: DEFAULT_FPS,
    durationMs: 1000,
    sheetWidth: DEFAULT_FRAME_WIDTH,
    sheetHeight: DEFAULT_FRAME_HEIGHT,
    framePositions: [{ index: 0, x: 0, y: 0 }],
  };
}

export function getJrSpriteSheet(stageLike = "adult", actionLike = "idle") {
  const stage = normalizeJrLifeStage(stageLike, "adult");
  const requestedAction = normalizeDogAnimKey(actionLike || "idle") || "idle";
  const action = getFileAction(stage, requestedAction);
  const stageFiles = getStageFiles(stage);
  const fallbackFiles =
    stage === "senior" ? STAGE_FILE_MAP.adult : STAGE_FILE_MAP.pup;
  const fileName =
    stageFiles[action] ||
    fallbackFiles[action] ||
    stageFiles.idle ||
    fallbackFiles.idle ||
    stageFiles.clean ||
    fallbackFiles.clean;
  const animMeta = getManifestAnimMeta(action);
  const frames = Math.max(1, Number(animMeta?.frames || 1));
  const columns = Math.max(
    1,
    Math.min(frames, Number(animMeta?.columns || frames))
  );
  const rows = Math.max(1, Math.ceil(frames / columns));
  const fps = Math.max(1, Number(animMeta?.fps || DEFAULT_FPS));
  const entry = {
    id: `${stage}:${action}`,
    stage,
    requestedAction,
    action,
    fileName,
    url: withBaseUrl(`/assets/sprites/jr/${fileName}`),
    frameWidth: Math.max(
      1,
      Number(animMeta?.frameWidth || DEFAULT_FRAME_WIDTH)
    ),
    frameHeight: Math.max(
      1,
      Number(animMeta?.frameHeight || DEFAULT_FRAME_HEIGHT)
    ),
    frames,
    columns,
    rows,
    fps,
    durationMs: Math.max(350, Math.round((frames / fps) * 1000)),
    sheetWidth:
      Math.max(1, Number(animMeta?.frameWidth || DEFAULT_FRAME_WIDTH)) *
      columns,
    sheetHeight:
      Math.max(1, Number(animMeta?.frameHeight || DEFAULT_FRAME_HEIGHT)) * rows,
  };

  const stageFrameSize =
    MASTER_TRICK_ACTIONS.has(action) ||
    MASTER_TRICK_ACTIONS.has(requestedAction)
      ? stage === "pup"
        ? 32
        : 64
      : null;

  const resolvedEntry = {
    ...entry,
    frameWidth: stageFrameSize || entry.frameWidth,
    frameHeight: stageFrameSize || entry.frameHeight,
    sheetWidth: (stageFrameSize || entry.frameWidth) * columns,
    sheetHeight: (stageFrameSize || entry.frameHeight) * rows,
  };

  return {
    ...resolvedEntry,
    framePositions: buildFramePositions(resolvedEntry),
  };
}

export function findJrSpriteSheetBySrc(
  src,
  fallbackStage = "adult",
  fallbackAction = "idle"
) {
  const raw = String(src || "").trim();
  if (!raw) return getJrSpriteSheet(fallbackStage, fallbackAction);

  const clean = raw
    .replace(/[?#].*$/, "")
    .replace(/\\/g, "/")
    .toLowerCase();
  const fileName = clean.split("/").pop() || "";

  if (FILE_LOOKUP[fileName]) {
    const match = FILE_LOOKUP[fileName];
    return getJrSpriteSheet(match.stage, match.action);
  }

  if (/_(clean)\.png$/i.test(fileName)) {
    const stage = fileName.startsWith("adult_")
      ? "adult"
      : fileName.startsWith("senior_")
        ? "senior"
        : "pup";
    return buildStaticEntry(stage);
  }

  return getJrSpriteSheet(fallbackStage, fallbackAction);
}

export const jrManifest = Object.freeze({
  version: Number(baseManifest?.version || 1),
  frame: Object.freeze({
    width: DEFAULT_FRAME_WIDTH,
    height: DEFAULT_FRAME_HEIGHT,
  }),
  defaultFps: DEFAULT_FPS,
  stages: Object.freeze({
    adult: Object.freeze({
      idle: getJrSpriteSheet("adult", "idle"),
      walk: getJrSpriteSheet("adult", "walk"),
      interact: getJrSpriteSheet("adult", "interact"),
      bark: getJrSpriteSheet("adult", "bark"),
      wag: getJrSpriteSheet("adult", "wag"),
      eat: getJrSpriteSheet("adult", "eat"),
      sleep: getJrSpriteSheet("adult", "sleep"),
      dance: getJrSpriteSheet("adult", "dance"),
      bow: getJrSpriteSheet("adult", "bow"),
    }),
    pup: Object.freeze({
      idle: getJrSpriteSheet("pup", "idle"),
      walk: getJrSpriteSheet("pup", "walk"),
      interact: getJrSpriteSheet("pup", "interact"),
      bark: getJrSpriteSheet("pup", "bark"),
      wag: getJrSpriteSheet("pup", "wag"),
      eat: getJrSpriteSheet("pup", "eat"),
      sleep: getJrSpriteSheet("pup", "sleep"),
      dance: getJrSpriteSheet("pup", "dance"),
      bow: getJrSpriteSheet("pup", "bow"),
    }),
  }),
});

export default jrManifest;
