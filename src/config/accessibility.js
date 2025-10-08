// Accessibility affordances and key mapping centralization.
export const ARIA = Object.freeze({
  nav: "Primary Navigation",
  gameCanvas: "Game Canvas",
  statsBar: "Pup Stats",
});

export const KEYS = Object.freeze({
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  interact: ["KeyE"],
  pause: ["KeyP"],
  action: ["Space"],
});

// Utility: check if an event matches a logical key
export function isKey(evt, logical) {
  const list = KEYS[logical] || [];
  return list.includes(evt.code) || list.includes(evt.key);
}
