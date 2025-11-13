// src/features/game/index.js

// Core game screen & layout
export { default as GameScene } from "./GameScene.jsx";
export { default as GameScreen } from "./GameScene.jsx"; // alias, in case something imports GameScreen

// HUD / UI
export { default as NeedsHUD } from "./NeedsHUD.jsx";

// World rendering
export { default as BackgroundScene } from "./BackgroundScene.jsx";
export { default as DogSpriteView } from "./DogSpriteView.jsx";

// Systems / logic
export { default as DogAIEngine } from "./DogAIEngine.jsx";
