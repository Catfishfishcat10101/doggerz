/** @format */

// src/utils/badges.js
// Shared helpers for earned badges across UI surfaces.
// Keep this file JSX-free so it can be imported from anywhere.

function titleCase(s) {
  return String(s || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function humanizeBadgeId(id) {
  const raw = String(id || "").trim();
  if (!raw) return "";

  if (raw === "temperament_unlocked") return "Personality Unlocked";

  if (raw.startsWith("trick_")) {
    const name = raw.slice("trick_".length);
    const spaced = name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ");
    return `${titleCase(spaced)}`;
  }

  if (raw.startsWith("collar_"))
    return `${titleCase(raw.slice("collar_".length))} Collar`;
  if (raw.startsWith("tag_"))
    return `${titleCase(raw.slice("tag_".length))} Tag`;
  if (raw.startsWith("backdrop_"))
    return `${titleCase(raw.slice("backdrop_".length))} Backdrop`;

  return titleCase(raw);
}

export function badgeStyleClass(id) {
  const raw = String(id || "");
  if (raw === "temperament_unlocked") {
    return "border-emerald-400/25 bg-emerald-500/15 text-emerald-100";
  }
  if (raw.startsWith("trick_")) {
    return "border-violet-400/25 bg-violet-500/15 text-violet-100";
  }
  if (raw.startsWith("collar_")) {
    return "border-emerald-400/25 bg-emerald-500/15 text-emerald-100";
  }
  if (raw.startsWith("tag_")) {
    return "border-amber-400/25 bg-amber-500/15 text-amber-100";
  }
  if (raw.startsWith("backdrop_")) {
    return "border-sky-400/25 bg-sky-500/15 text-sky-100";
  }
  return "border-white/15 bg-white/5 text-zinc-200";
}

export function normalizeBadges(badges) {
  const arr = Array.isArray(badges) ? badges : [];
  const out = [];
  const seen = new Set();

  for (let i = 0; i < arr.length; i += 1) {
    const b = arr[i];
    const id = typeof b === "string" ? b : b?.id;
    const key = String(id || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);

    out.push({
      key,
      id: key,
      label: humanizeBadgeId(key),
      className: badgeStyleClass(key),
    });
  }

  return out;
}

export function collectEarnedBadgeIds(dog) {
  const cosmeticIds = Array.isArray(dog?.cosmetics?.unlockedIds)
    ? dog.cosmetics.unlockedIds
    : [];

  const obedience =
    dog?.skills?.obedience && typeof dog.skills.obedience === "object"
      ? dog.skills.obedience
      : {};

  const trickIds = Object.entries(obedience)
    .filter(([, skill]) => (skill?.level || 0) >= 1)
    .map(([id]) => `trick_${id}`);

  const temperamentBadge = dog?.temperament?.revealedAt
    ? ["temperament_unlocked"]
    : [];

  const out = [];
  const seen = new Set();
  for (const id of [...cosmeticIds, ...trickIds, ...temperamentBadge]) {
    const key = String(id || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
