// src/components/dog/DogAIStateMachine.js
const STATE_DURATIONS_MS = Object.freeze({
  idle: 4_000,
  walk: 5_500,
  sleep: 20_000,
  rest: 9_000,
  beg: 4_000,
  scratch: 4_500,
});

export function getDogStateDurationMs(state = "idle") {
  const key = String(state || "idle").toLowerCase();
  return STATE_DURATIONS_MS[key] || STATE_DURATIONS_MS.idle;
}
