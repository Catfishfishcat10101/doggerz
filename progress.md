Original prompt: Review every PNG file and sprite sheet, locate puppy idle assets, and fix idle rendering plus autonomous idle walking.

- Implemented anim-specific sprite sheet selection and dynamic sheet sizing in `src/components/dog/SpriteSheetDog.jsx`.
- Updated idle manifest row to 14 frames (and 14 columns) in `src/features/game/jrManifest.json`.
- Replaced `src/components/dog/DogPixiView.jsx` with a sprite-sheet renderer that supports autonomous idle wandering.
- Attempted Playwright run via develop-web-game workflow; blocked by execution policy when starting `npm run dev`.
- Updated sprite sheet renderer to support multi-row frame grids and set idle to 16 frames / 4x4 at 4 fps in `src/features/game/jrManifest.json`, matching the new 1024x1024 idle sheet.
- Removed unused `src/pixi/DogAnimationController.js` and `src/components/dog/PuppyPassport.jsx` after confirming no remaining references.
- Removed unused `src/components/layout/GameTopBar.jsx` after confirming no remaining references.
- Refactored `applyDecay` in `src/redux/dogSlice.js` into an explicit 5-stage rule pipeline: compute degradation -> environment modifiers -> compounding -> thresholds -> legacy events.
- Added personality profile derivation in src/logic/personalityProfile.js (core temperament, dynamic states, learned traits).\n- Added selectDogPersonalityProfile selector in src/features/game/dogSelectors.js.\n- Playwright run failed: dev server on 5173 responded to HTTP, but web_game_playwright_client.js timed out waiting for DOMContentLoaded (localhost and 127.0.0.1). Stopped the dev server process; no screenshots captured.
- Added live Personality Intel panel to MainGame using selectDogPersonalityProfile (core temperament, dynamic states, learned traits, Big Five, trust behavior, stress signals).\n- Tuned personality formulas and thresholds in src/logic/personalityProfile.js for trust tiers: 0-20 standoff, 20-40 look-and-return, 40-60 middle-yard, 60-80 fence-run-wag-bark, 80-100 jump/paw/ignore-distractions.\n- Added Big Five outputs, explicit stress signals (whaleEye, destructiveOutlets, standOff), and model version marker.\n- Persisted computed profile in Redux (state.dog.personalityProfile) by syncing in inalizeDerivedState; selectors now read persisted profile first with fallback derivation.
- Removed player-facing personality HUD approach.
- Added a one-time in-game Temperament milestone popup card in MainGame when reveal becomes ready.
- Temperament reveal timing updated from 3 days to 14 days in dogSlice.updateTemperamentReveal and useDogLifecycle.
- Kept Big Five internal-only in model logic; no UI surface renders Big Five now.
- UI cleanup audit completed; removed unused UI files and dead UI branch.
- Deleted: src/components/environment/PawPrintsBackground.jsx, src/components/ui/LongTermProgressionCard.jsx, src/App.css.
- Deleted unused branch: src/features/game/MechanicsPanel.jsx, src/features/game/TrainingPanel.jsx, src/features/game/useDogLifecycle.jsx, src/components/ui/VoiceCommandButton.jsx.
- Fixed hook dependency lint warnings in src/components/dog/DogPixiView.jsx.
- Validation after cleanup: npm run lint PASS, npm run build PASS.
