<<<<<<< HEAD
=======
// src/features/game/rendering/dogAssets.js
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
import { DOGS } from "@/app/config/assets.js";
import {
  getDogAnimSpriteUrl,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";

export const DOG_RENDER_SHEET_NAMES = Object.freeze({
  idle: "idle_resting",
  walk: "walk",
  bark: "bark",
  dig: "scratch",
  sleep: "sleep",
  paw: "paw",
  eat: "eat",
  drink: "drink",
  scratch: "scratch",
});

export const DOG_RENDERER_ASSETS = Object.freeze({
  staticFallback: DOGS.staticFallback,
});

export function resolveDogAnimationSheetName(actionLike) {
  const key = String(actionLike || "idle")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return DOG_RENDER_SHEET_NAMES[key] || DOG_RENDER_SHEET_NAMES.idle;
}

export function resolveDogAnimationSrc(actionLike, { stage = "PUPPY" } = {}) {
  return getDogAnimSpriteUrl(stage, resolveDogAnimationSheetName(actionLike));
}

export function resolveDogRendererFallbackSrc({
  stage = "PUPPY",
  staticSpriteUrl = "",
} = {}) {
  const explicit = String(staticSpriteUrl || "").trim();
  if (explicit) return explicit;

  const stageStatic = String(getDogStaticSpriteUrl(stage) || "").trim();
  if (stageStatic) return stageStatic;

  return DOG_RENDERER_ASSETS.staticFallback;
}

export default DOG_RENDERER_ASSETS;
