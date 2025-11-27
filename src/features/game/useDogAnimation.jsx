// Re-export the real hook from `hooks/useDogAnimation.jsx` to avoid accidental
// imports of a fallback shim that returns an empty `spriteSrc`.
export { default } from "./hooks/useDogAnimation.jsx";
