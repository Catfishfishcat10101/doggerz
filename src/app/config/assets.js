// src/config/assets.js

import { withBaseUrl } from "@/utils/assetUtils.js";

const withSlash = (value) => {
  const v = String(value || "");
  if (!v) return v;
  return v.startsWith("/") ? v : `/${v}`;
};

export const BACKGROUNDS = Object.freeze({
  backyardDay: withBaseUrl("/backgrounds/backyard-day.svg"),
  backyardNight: withBaseUrl("/backgrounds/backyard-night.svg"),
  backyardDayWide: withBaseUrl("/backgrounds/backyard-day-wide.svg"),
  backyardNightWide: withBaseUrl("/backgrounds/backyard-night-wide.svg"),
});

export const DOGS = Object.freeze({
  staticFallback: withBaseUrl("/assets/sprites/jr/pup_idle.png"),
  walkLeft: withBaseUrl("/assets/sprites/jr/pup_walk_left.png"),
  walkLeftAlt: withBaseUrl("/assets/sprites/jr/pup_walk_right.png"),
});

export function getAsset(map, key, fallback = "") {
  if (!map || typeof map !== "object") return withSlash(fallback);
  const value = map[key];
  return withSlash(value || fallback);
}

export default { BACKGROUNDS, DOGS, getAsset };
