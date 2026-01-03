/** @format */

// src/utils/prefetch.js

// Central place for optional P1 prefetches.
// These imports create separate chunks that can be warmed on hover/idle.

export function prefetchGameRoute() {
  return import('@/pages/Game.jsx');
}

export function prefetchDogAIEngine() {
  return import('@/features/game/DogAIEngine.jsx');
}
