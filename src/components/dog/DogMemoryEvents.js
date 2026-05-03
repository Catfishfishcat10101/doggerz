// src/components/dog/DogMemoryEvents.js
/** @format */

function fallbackId() {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createMemoryEvent(type, data = {}) {
  let id = fallbackId();

  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      id = crypto.randomUUID();
    }
  } catch {
    // Fallback id already set.
  }

  return {
    id,
    type,
    timestamp: Date.now(),
    ...data,
  };
}
