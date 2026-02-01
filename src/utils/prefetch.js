/** @format */

// src/utils/prefetch.js

// Central place for optional P1 prefetches.
// These imports create separate chunks that can be warmed on hover/idle.

const IDLE_TIMEOUT_MS = 2500;

function canPrefetch() {
  if (typeof window === "undefined") return false;
  const connection = window.navigator?.connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  const effectiveType = String(connection.effectiveType || "");
  return !effectiveType.includes("2g");
}

export function prefetchOnIdle(
  task,
  { timeout = IDLE_TIMEOUT_MS, force = false } = {}
) {
  if (typeof task !== "function") return Promise.resolve(null);
  if (!force && !canPrefetch()) return Promise.resolve(null);

  if (typeof window === "undefined") return Promise.resolve(task());
  if (typeof window.requestIdleCallback === "function") {
    return new Promise((resolve) => {
      window.requestIdleCallback(() => resolve(task()), { timeout });
    });
  }

  return new Promise((resolve) => {
    window.setTimeout(() => resolve(task()), 1);
  });
}

export function prefetchGameRoute() {
  return import("@/pages/Game.jsx");
}

export function prefetchDogAIEngine() {
  return import("@/features/game/DogAIEngine.jsx");
}

export function prefetchSkillTreeRoute() {
  return import("@/pages/SkillTree.jsx");
}

export function prefetchSettingsRoute() {
  return import("@/pages/Settings.jsx");
}

export function prefetchStoreRoute() {
  return import("@/pages/Store.jsx");
}

export function prefetchPottyRoute() {
  return import("@/pages/Potty.jsx");
}

export function prefetchDreamsRoute() {
  return import("@/pages/Dreams.jsx");
}

export function prefetchBadgesRoute() {
  return import("@/pages/Badges.jsx");
}

export function prefetchFaqRoute() {
  return import("@/pages/Faq.jsx");
}

export function prefetchRainbowBridgeRoute() {
  return import("@/pages/RainbowBridge.jsx");
}
