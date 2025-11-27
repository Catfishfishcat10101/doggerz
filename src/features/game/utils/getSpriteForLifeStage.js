// Re-export the central sprite lookup so feature code can import from
// `@/features/game/utils/getSpriteForLifeStage.js` while keeping a
// single implementation in `src/utils/getSpriteForLifeStage.js`.
export { getSpriteForLifeStage } from "@/utils/getSpriteForLifeStage.js";

export default getSpriteForLifeStage;
