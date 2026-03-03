// src/features/game/jrAtlasAssets.js
// Jack Russell atlas + frame URL registry for preload and tooling.

import { withBaseUrl } from "@/utils/gameUtils.js";
import { getDogAnimSpriteUrl, getDogPixiSheetUrl } from "@/utils/dogSpritePaths.js";

const STAGES = Object.freeze(["pup", "adult", "senior"]);
const CONDITIONS = Object.freeze(["clean", "dirty", "fleas", "mange"]);

export const JR_ATLAS_FRAME_SIZE = Object.freeze({ width: 256, height: 256 });
export const JR_ATLAS_SHEET_SIZE = Object.freeze({ width: 3072, height: 768 });

const ATLAS_COLUMNS = JR_ATLAS_SHEET_SIZE.width / JR_ATLAS_FRAME_SIZE.width; // 12
const ATLAS_ROWS = JR_ATLAS_SHEET_SIZE.height / JR_ATLAS_FRAME_SIZE.height; // 3

const STAGE_ROW = Object.freeze({
  pup: 0,
  adult: 1,
  senior: 2,
});

export const JR_ATLAS_SPECS = Object.freeze({
  growth: Object.freeze({
    id: "growth",
    url: withBaseUrl("/assets/atlas/jr_growth_sheet.png"),
  }),
  action: Object.freeze({
    id: "action",
    url: withBaseUrl("/assets/atlas/jr_action_sheet.png"),
  }),
  breedFeatures: Object.freeze({
    id: "breed_features",
    url: withBaseUrl("/assets/atlas/jr_breed_features_sheet.png"),
  }),
});

export const JR_ANIMATIONS = Object.freeze([
  "idle",
  "walk",
  "walk_left",
  "walk_right",
  "turn_walk_right",
  "bark",
  "scratch",
  "sleep",
  "sit",
  "wag",
  "jump",
  "front_flip",
  "trick",
  "eat",
]);

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function buildAtlasFrameUrls(spec) {
  const frames = [];
  STAGES.forEach((stage) => {
    const row = STAGE_ROW[stage] ?? 0;
    for (let col = 0; col < ATLAS_COLUMNS; col++) {
      frames.push(
        `${spec.url}#sheet=${spec.id}&stage=${stage}&row=${row}&col=${col}&w=${JR_ATLAS_FRAME_SIZE.width}&h=${JR_ATLAS_FRAME_SIZE.height}`
      );
    }
  });
  return frames;
}

export const JR_GROWTH_FRAME_URLS = Object.freeze(
  buildAtlasFrameUrls(JR_ATLAS_SPECS.growth)
);
export const JR_ACTION_FRAME_URLS = Object.freeze(
  buildAtlasFrameUrls(JR_ATLAS_SPECS.action)
);
export const JR_BREED_FEATURES_FRAME_URLS = Object.freeze(
  buildAtlasFrameUrls(JR_ATLAS_SPECS.breedFeatures)
);

function buildSheetSources() {
  const urls = [];

  STAGES.forEach((stage) => {
    CONDITIONS.forEach((condition) => {
      urls.push(getDogPixiSheetUrl(stage, condition));
    });
  });

  STAGES.forEach((stage) => {
    JR_ANIMATIONS.forEach((anim) => {
      urls.push(getDogAnimSpriteUrl(stage, anim));
    });
  });

  urls.push(JR_ATLAS_SPECS.growth.url);
  urls.push(JR_ATLAS_SPECS.action.url);
  urls.push(JR_ATLAS_SPECS.breedFeatures.url);

  return unique(urls);
}

export const JR_ALL_SPRITE_SHEET_URLS = Object.freeze(buildSheetSources());

function buildAnimationFrameUrls() {
  const urls = [];
  STAGES.forEach((stage) => {
    JR_ANIMATIONS.forEach((anim) => {
      const base = getDogAnimSpriteUrl(stage, anim);
      for (let i = 0; i < ATLAS_COLUMNS; i++) {
        urls.push(`${base}#stage=${stage}&anim=${anim}&frame=${i}`);
      }
    });
  });
  return unique(urls);
}

export const JR_ALL_ANIMATION_FRAME_URLS = Object.freeze(
  buildAnimationFrameUrls()
);

export const JR_ALL_FRAME_URLS = Object.freeze(
  unique([
    ...JR_GROWTH_FRAME_URLS,
    ...JR_ACTION_FRAME_URLS,
    ...JR_BREED_FEATURES_FRAME_URLS,
    ...JR_ALL_ANIMATION_FRAME_URLS,
  ])
);

let preloadPromise = null;

function stripFrameFragment(url) {
  return String(url || "").split("#")[0];
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.onload = () => resolve({ url, ok: true });
    img.onerror = () => resolve({ url, ok: false });
    img.src = stripFrameFragment(url);
  });
}

export function preloadJackRussellSheets() {
  if (preloadPromise) return preloadPromise;
  const sources = JR_ALL_SPRITE_SHEET_URLS;
  preloadPromise = Promise.all(sources.map((url) => preloadImage(url)));
  return preloadPromise;
}

