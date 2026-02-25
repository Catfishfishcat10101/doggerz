// src/config/assets.js

const withSlash = (value) => {
  const v = String(value || "");
  if (!v) return v;
  return v.startsWith("/") ? v : `/${v}`;
};

export const BACKGROUNDS = Object.freeze({
  backyardDay: "/backgrounds/backyard-day.svg",
  backyardNight: "/backgrounds/backyard-night.svg",
  backyardDayWide: "/backgrounds/backyard-day-wide.svg",
  backyardNightWide: "/backgrounds/backyard-night-wide.svg",
});

export const DOGS = Object.freeze({
  staticFallback: "/assets/sprites/puppy-idle.png",
  walkLeft: "/assets/sprites/walk-left.png",
  walkLeftAlt: "/assets/sprites/walk-left-2.png",
});

export function getAsset(map, key, fallback = "") {
  if (!map || typeof map !== "object") return withSlash(fallback);
  const value = map[key];
  return withSlash(value || fallback);
}

export default { BACKGROUNDS, DOGS, getAsset };
