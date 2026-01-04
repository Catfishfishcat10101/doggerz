/** @format */

// src/utils/resolveBackground.js
import { BACKGROUNDS } from "@/config/assets.js";

/**
 * @param {object} opts
 * @param {"yard"} [opts.scene]
 * @param {"day"|"night"} [opts.timeOfDay]
 * @param {boolean} [opts.wide]
 */
export function resolveBackground({
  scene = "yard",
  timeOfDay = "day",
  wide = false,
} = {}) {
  if (scene !== "yard") scene = "yard";
  if (timeOfDay !== "night") timeOfDay = "day";

  const yard = BACKGROUNDS.yard;

  if (wide) return timeOfDay === "night" ? yard.nightWide : yard.dayWide;
  return timeOfDay === "night" ? yard.night : yard.day;
}
