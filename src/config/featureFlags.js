// Flip features without touching business logic.
// Use ONLY for non-security toggles; do NOT hide server-side rules behind flags.
export const FLAGS = Object.freeze({
  oneDogPerUser: true,         // enforced by Firestore rules too
  shopEnabled: true,
  accessoriesAtLevel: 8,
  pwaUpdateToast: true,
  analyticsEnabled: false,     // wire when you add GA/PLAUSIBLE
  debugHUD: false,             // in-game overlay for stats while tuning decay
});

export const isEnabled = (key) => !!FLAGS[key];
export const isDisabled = (key) => !FLAGS[key];
export default FLAGS;