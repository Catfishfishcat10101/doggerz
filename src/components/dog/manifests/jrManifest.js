<<<<<<< HEAD
=======
// src/components/dog/manifests/jrManifest.js
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
import baseManifest from "@/components/dog/manifests/jrManifest.json";
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
const PUPPY_ACTION_FILE_MAP = Object.freeze({
  idle: "pup_idle.png",
  walk: "pup_walk.png",
  walk_left: "pup_walk_left.png",
  walk_right: "pup_sniff.png",
  turn_walk_left: "pup_turn_walk_left.png",
  turn_walk_right: "pup_turn_walk_right.png",
  bark: "pup_bark.png",
  sit: "pup_sit.png",
  shake: "pup_shake.png",
  wag: "pup_wag.png",
  eat: "pup_eat.png",
  sleep: "pup_sleep.png",
  dance: "pup_dance.png",
  idle_resting: "pup_idle_resting.png",
  beg: "pup_beg.png",
  fetch: "pup_fetch.png",
  deep_rem_sleep: "pup_deep_rem_sleep.png",
  drink: "pup_drink.png",
  jump: "pup_jump.png",
  lay_down: "pup_lay_down.png",
  gate_watch: "pup_gate_watch.png",
  lethargic_lay: "pup_lethargic_lay.png",
  light_sleep: "pup_light_sleep.png",
  paw: "pup_paw.png",
  scratch: "pup_scratch.png",
  sniff: "pup_sniff.png",
  highfive: "pup_highfive.png",
});

const STAGE_STATIC_FILE_MAP = Object.freeze({
  adult: "adult_clean.png",
  pup: "pup_clean.png",
  senior: "senior_clean.png",
});

const ACTION_FILE_ALIASES = Object.freeze({
  interact: "bark",
  bark: "bark",
  speak: "bark",
  bow: "beg",
  sit_pretty: "beg",
  backflip: "jump",
  eat: "eat",
  feed: "eat",
  drink: "drink",
  sleep: "sleep",
  sleeping: "sleep",
  deep_sleep: "deep_rem_sleep",
  dream: "deep_rem_sleep",
  rest: "idle_resting",
  scratch: "scratch",
  sniff: "sniff",
  sit: "sit",
  trick: "sit",
  jump: "jump",
  spin: "dance",
  roll_over: "lay_down",
  play_dead: "lay_down",
  crawl: "walk",
  point_position: "gate_watch",
  territorial_bark: "bark",
  gate_watch: "gate_watch",
  limping: "walk",
  shivering: "idle",
  lethargic_lay: "lethargic_lay",
  light_sleep: "light_sleep",
  thrashing: "dance",
  run: "walk",
  clean: "clean",
});

const FILE_LOOKUP = Object.freeze(
  Object.entries(PUPPY_ACTION_FILE_MAP).reduce(
    (acc, [action, fileName]) => {
      acc[fileName.toLowerCase()] = { stage: "pup", action };
      return acc;
    },
    {
      "adult_clean.png": { stage: "adult", action: "clean" },
      "pup_clean.png": { stage: "pup", action: "clean" },
      "puppy_clean.png": { stage: "pup", action: "clean" },
      "senior_clean.png": { stage: "senior", action: "clean" },
    }
  )
);

export function normalizeJrLifeStage(value, fallback = "pup") {
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
  if (!aliased) return fallback;
  if (aliased === "clean") return "clean";
  return PUPPY_ACTION_FILE_MAP[aliased] ? aliased : fallback;
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
  const stage = normalizeJrLifeStage(stageLike, "pup");
  const fileName = STAGE_STATIC_FILE_MAP[stage] || STAGE_STATIC_FILE_MAP.pup;
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

export function getJrSpriteSheet(stageLike = "pup", actionLike = "idle") {
  const stage = normalizeJrLifeStage(stageLike, "pup");
  const requestedAction = normalizeDogAnimKey(actionLike || "idle") || "idle";
  const action = resolveJrAction(requestedAction, "idle");
  if (action === "clean") {
    return buildStaticEntry(stage);
  }

  const fileName = PUPPY_ACTION_FILE_MAP[action] || PUPPY_ACTION_FILE_MAP.idle;
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

  return {
    ...entry,
    framePositions: buildFramePositions(entry),
  };
}

export function findJrSpriteSheetBySrc(
  src,
  fallbackStage = "pup",
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
    if (match.action === "clean") {
      return buildStaticEntry(match.stage);
    }
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
    senior: Object.freeze({
      idle: getJrSpriteSheet("senior", "idle"),
      walk: getJrSpriteSheet("senior", "walk"),
      interact: getJrSpriteSheet("senior", "interact"),
      bark: getJrSpriteSheet("senior", "bark"),
      wag: getJrSpriteSheet("senior", "wag"),
      eat: getJrSpriteSheet("senior", "eat"),
      sleep: getJrSpriteSheet("senior", "sleep"),
      dance: getJrSpriteSheet("senior", "dance"),
      bow: getJrSpriteSheet("senior", "bow"),
    }),
  }),
});

export default jrManifest;
