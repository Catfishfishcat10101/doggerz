import { PATHS } from "@/app/routes.js";

export const HEIST_ROUTE_BY_ACTION = Object.freeze({
  store: PATHS.STORE,
  train: PATHS.SKILL_TREE,
  memories: PATHS.MEMORIES,
  menu: PATHS.MENU,
});

export function normalizeHeistActionKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

export function resolveHeistRoute(action) {
  const key = normalizeHeistActionKey(action);
  return HEIST_ROUTE_BY_ACTION[key] || null;
}

export function getHeistRouteLabel(action) {
  const key = normalizeHeistActionKey(action);
  if (key === "store") return "Store";
  if (key === "train") return "Train";
  if (key === "memories") return "Memories";
  if (key === "menu") return "Menu";
  return "route";
}

export function buildHeistMessage(action, dogName = "Fireball") {
  const key = normalizeHeistActionKey(action);
  const label = getHeistRouteLabel(key);
  const pupName = String(dogName || "Fireball").trim() || "Fireball";
  return `${pupName} ran off with the ${label.toLowerCase()} key. Play fetch to get it back.`;
}
