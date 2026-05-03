// src/features/game/rendering/dogAnimationMap.js
import jrManifest from "@/components/dog/manifests/jrManifest.json";
import {
  isKnownDogAnimation as isKnownLegacyDogAnimation,
  resolveDogAnimation as resolveLegacyDogAnimation,
} from "@/animation/dogAnimationMap.js";
import {
  getDogAnimSpriteUrl,
  normalizeDogStageId,
} from "@/utils/dogSpritePaths.js";
import { DOG_ACTIONS } from "./DogAction.js";

const STABLE_DOG_LAYOUT = Object.freeze({
  anchorX: 0.5,
  anchorY: 0.98,
  scaleMultiplier: 1,
  groundOffsetPx: 0,
});

const DEFAULT_FRAME = Object.freeze({
  width: Math.max(1, Number(jrManifest?.frame?.width || 256)),
  height: Math.max(1, Number(jrManifest?.frame?.height || 256)),
});
const DEFAULT_COLUMNS = Math.max(1, Number(jrManifest?.columns || 4));
const DEFAULT_FPS = Math.max(1, Number(jrManifest?.defaultFps || 8));
const DEFAULT_DOG_STAGE = "PUPPY";
const DEFAULT_DOG_ACTION = DOG_ACTIONS.idle;
const ROWS = [
  ...(Array.isArray(jrManifest?.rows) ? jrManifest.rows : []),
  ...(Array.isArray(jrManifest?.customRows) ? jrManifest.customRows : []),
];

const EXPLICIT_LOOP_CLIPS = new Set([
  "idle",
  "walk",
<<<<<<< HEAD
=======
  "walk_left",
  "walk_right",
  "turn_walk_left",
  "turn_walk_right",
  "sit",
>>>>>>> 10f88903 (chore: remove committed backup folders)
  "sleep",
  "eat",
  "drink",
  "scratch",
  "wag",
  "sniff",
  "gate_watch",
  "idle_resting",
  "light_sleep",
  "deep_rem_sleep",
  "limping",
  "lethargic_lay",
  "puppy_idle_pack",
  "puppy_sleeping_pack",
  "golden_years_idle",
  "golden_years_sleeping",
]);
const CRITICAL_NEED_LOOP_CLIPS = new Set([
  DOG_ACTIONS.sleep,
  DOG_ACTIONS.eat,
  DOG_ACTIONS.drink,
  DOG_ACTIONS.scratch,
  "light_sleep",
  "deep_rem_sleep",
  "lethargic_lay",
  "puppy_sleeping_pack",
  "golden_years_sleeping",
]);

const SHEET_NAME_OVERRIDES = Object.freeze({
  [DOG_ACTIONS.idle]: "idle_resting",
  [DOG_ACTIONS.walk]: "walk",
  [DOG_ACTIONS.bark]: "bark",
  [DOG_ACTIONS.dig]: "scratch",
  [DOG_ACTIONS.sleep]: "sleep",
  [DOG_ACTIONS.paw]: "paw",
  [DOG_ACTIONS.eat]: "eat",
  [DOG_ACTIONS.drink]: "drink",
  [DOG_ACTIONS.scratch]: "scratch",
});

function normalizeActionKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

const ROW_BY_ANIM = new Map(
  ROWS.map((row) => [normalizeActionKey(row?.anim || ""), row]).filter(
    ([key]) => key
  )
);

const KNOWN_DIRECT_CLIPS = new Set([
  ...Object.values(DOG_ACTIONS),
  ...ROW_BY_ANIM.keys(),
]);

const CATALOG_CACHE = new Map();

function getSheetNameForClip(clipKey) {
  return SHEET_NAME_OVERRIDES[clipKey] || clipKey || DEFAULT_DOG_ACTION;
}

function getRowMeta(sheetName) {
  const row = ROW_BY_ANIM.get(sheetName) || null;
  const frameCount = Math.max(
    1,
    Number(row?.frames || row?.frameCount || DEFAULT_COLUMNS)
  );
  const columns = Math.max(1, Number(row?.columns || DEFAULT_COLUMNS));
  const rows = Math.max(1, Math.ceil(frameCount / columns));

  return {
    frameCount,
    columns,
    rows,
    fps: Math.max(1, Number(row?.fps || DEFAULT_FPS)),
    frameWidth: Math.max(1, Number(row?.frameWidth || DEFAULT_FRAME.width)),
    frameHeight: Math.max(1, Number(row?.frameHeight || DEFAULT_FRAME.height)),
  };
}

function isLoopClip(clipKey) {
  return EXPLICIT_LOOP_CLIPS.has(normalizeActionKey(clipKey));
}

function createAnimationContract(clipKey, stageId = DEFAULT_DOG_STAGE) {
  const normalizedClipKey = normalizeActionKey(clipKey) || DEFAULT_DOG_ACTION;
  const resolvedStage = normalizeDogStageId(stageId || DEFAULT_DOG_STAGE);
  const sheetName = getSheetNameForClip(normalizedClipKey);
  const meta = getRowMeta(sheetName);
  const loop = isLoopClip(normalizedClipKey);

  return Object.freeze({
    action: normalizedClipKey,
    sheetName,
    src: getDogAnimSpriteUrl(resolvedStage, sheetName),
    fps: meta.fps,
    loop,
    oneShot: !loop,
    frameCount: meta.frameCount,
    columns: meta.columns,
    rows: meta.rows,
    frameWidth: meta.frameWidth,
    frameHeight: meta.frameHeight,
    ...STABLE_DOG_LAYOUT,
  });
}

function resolveLegacyClipOrNull(value) {
  const normalized = normalizeActionKey(value);
  if (!normalized || !isKnownLegacyDogAnimation(normalized)) {
    return null;
  }

  const resolved = normalizeActionKey(resolveLegacyDogAnimation(normalized));
  return resolved && KNOWN_DIRECT_CLIPS.has(resolved) ? resolved : null;
}

export function resolveDogAnimationClipKey(
  actionLike,
  fallback = DEFAULT_DOG_ACTION
) {
  const normalized = normalizeActionKey(actionLike);
  if (!normalized) return fallback;
  if (KNOWN_DIRECT_CLIPS.has(normalized)) return normalized;

  const legacyResolved = resolveLegacyClipOrNull(normalized);
  if (legacyResolved) return legacyResolved;

  return fallback;
}

export function getDogAnimationCatalog(stageLike = DEFAULT_DOG_STAGE) {
  const stageId = normalizeDogStageId(stageLike || DEFAULT_DOG_STAGE);
  const cached = CATALOG_CACHE.get(stageId);
  if (cached) return cached;

  const clipIds = new Set([
    ...Object.values(DOG_ACTIONS),
    ...ROW_BY_ANIM.keys(),
  ]);
  const catalog = Object.freeze(
    Object.fromEntries(
      [...clipIds].map((clipKey) => [
        clipKey,
        createAnimationContract(clipKey, stageId),
      ])
    )
  );

  CATALOG_CACHE.set(stageId, catalog);
  return catalog;
}

export const DOG_ANIMATION_MAP = getDogAnimationCatalog(DEFAULT_DOG_STAGE);
export const DEFAULT_DOG_CLIP = DEFAULT_DOG_ACTION;
export const DOG_LOOP_RENDER_CLIPS = Object.freeze(
  new Set([...EXPLICIT_LOOP_CLIPS])
);
export const DOG_CRITICAL_NEED_RENDER_CLIPS = Object.freeze(
  new Set([...CRITICAL_NEED_LOOP_CLIPS])
);
export const STABLE_DOG_ACTIONS = Object.freeze(
  new Set([...KNOWN_DIRECT_CLIPS])
);
export const ONE_SHOT_RENDER_ACTIONS = Object.freeze(
  new Set(
    Object.values(DOG_ANIMATION_MAP)
      .filter((contract) => contract?.oneShot === true)
      .map((contract) => String(contract.action || ""))
      .filter(Boolean)
  )
);
export const LOOPING_RENDER_ACTIONS = Object.freeze(
  new Set(
    Object.values(DOG_ANIMATION_MAP)
      .filter((contract) => contract?.oneShot !== true)
      .map((contract) => String(contract.action || ""))
      .filter(Boolean)
  )
);
export const STABLE_DOG_ANIMATION_CONTRACT = DOG_ANIMATION_MAP;

export function resolveDogAnimationContract(
  actionLike,
  stageLike = DEFAULT_DOG_STAGE
) {
  const stageId = normalizeDogStageId(stageLike || DEFAULT_DOG_STAGE);
  const catalog = getDogAnimationCatalog(stageId);
  const clipKey = resolveDogAnimationClipKey(actionLike, DEFAULT_DOG_ACTION);
  return catalog[clipKey] || catalog[DEFAULT_DOG_ACTION];
}

export function resolveContractClipKey(actionLike) {
  return resolveDogAnimationClipKey(actionLike, DEFAULT_DOG_ACTION);
}

export function resolveStableDogAction(
  actionLike,
  fallback = DEFAULT_DOG_ACTION
) {
  return resolveDogAnimationClipKey(actionLike, fallback);
}

export function isContractOneShot(actionLike) {
  return resolveDogAnimationContract(actionLike).oneShot === true;
}

export function isContractLoop(actionLike) {
  return !isContractOneShot(actionLike);
}

export function isKnownDogRenderClip(actionLike) {
  const normalized = normalizeActionKey(actionLike);
  return Boolean(
    normalized &&
    (KNOWN_DIRECT_CLIPS.has(normalized) ||
      isKnownLegacyDogAnimation(normalized))
  );
}

export { DEFAULT_DOG_ACTION };

export default DOG_ANIMATION_MAP;
