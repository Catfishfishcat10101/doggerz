Original prompt: yes. and remove all teh placeholders too. we are way past that!!!

## 2026-02-25 - Public assets cleanup pass

- Confirmed canonical runtime sprite sheets are in `public/assets/sprites/jr/*.png` (dog sheets).
- Confirmed rainbow text sheets are stale Android asset copies, not public runtime.
- Removed placeholder/legacy files from public runtime:
  - deleted `public/assets/frames/jr/**`
  - deleted `public/icons/PixiDog.jsx`
- Normalized icon references to existing canonical icon files:
  - `index.html`, `public/sw.js`, `public/offline.html`, `src/utils/notifications.js`, `src/components/CheckInReminders.jsx`
  - switched from `doggerz-*.png` to `icon-192.png` / `icon-512.png` or favicon.
- Removed stale runtime refs to missing imports/frames assets:
  - `src/utils/dogSpritePaths.js`
  - `src/utils/lifecycle.js`
  - `src/pages/About.jsx`
  - `src/components/CheckInReminders.jsx`
  - `src/pages/SpriteTest.jsx`
- Updated sprite fallback image targets to a real sheet (`/assets/sprites/jr/pup_clean.png`).
- Updated SW precache list to only include assets that exist.
- Updated `scripts/generate-jr-pixi-sheets.js` source path to `assets-src/frames/jr` (non-public source location).
- Updated workflow asset trigger path from old imports directory to `public/assets/sprites/jr/**`.

## TODO for next pass

- Run `npm run lint`, `npm run build`, `npm run preflight` and fix any fallout.
- Run Playwright web-game loop and inspect latest screenshot + console for runtime warnings.
- If Android app still shows rainbow sheets, run `npx cap copy android` after confirming web assets are correct.

## Verification

- `npm run lint` passed.
- `npm run build` passed.
- `npm run preflight` passed, including `assets:verify` sprite/icon decode checks.
- Attempted `develop-web-game` Playwright client run, but it failed because `playwright` package is not installed in the skill runtime path.

## Current public footprint

- `public/` now contains 34 files total.
- Removed 133 placeholder/legacy files from public runtime (`public/assets/frames/jr/**` + `public/icons/PixiDog.jsx`).

## 2026-02-25 - Manual reorg follow-up (no script file found)

- `reorganize.js` was not found in repo root, so automated move script could not run.
- Applied requested path migration manually:
  - moved `src/components/useYardSfx.js` -> `src/hooks/useYardSfx.js`
  - moved `src/components/useSleepAudio.js` -> `src/hooks/useSleepAudio.js`
  - moved `src/components/toastContext.js` -> `src/state/toastContext.js`
  - moved `src/components/toastStore.js` -> `src/state/toastStore.js`
- Updated all imports that pointed to old locations.
- Verified with `npm run lint` (pass).
- `reorganize.js` deletion step is not applicable because file is absent.

## 2026-02-25 - Ambient yard pass

- Implemented ambient wildlife/dynamics directly in `EnvironmentScene`:
  - day butterfly fly-by event with random cadence
  - butterfly mid-flight callback hook (`onButterflySpotted`)
  - seasonal leaf drift (fall has higher intensity)
  - night owl perch event on tree silhouette
  - existing clouds/rain/snow/shooting star retained
- Wired butterfly callback in `MainGame` to dispatch `triggerManualAction({ action: "wag" })` so dog reacts to wildlife.
- Added manifest aliases for unsupported animation keys (`trick`, `jump`, `front_flip`, `play_dead`) to existing rows so animation requests degrade to real rows instead of idling.
- Verification: lint/build/preflight all pass.

## 2026-02-25 - Living idle + continuous aging + real weather hook

- Added `src/hooks/useLivingIdle.js`:
  - randomized blink cadence (2s-6s)
  - randomized micro-idle actions (`sniff`, `ear_twitch`, `tail_wag`) while not moving/sleeping
  - requestAnimationFrame breathing loop with sleep/low-energy profiles
- Added `src/hooks/useContinuousAging.js`:
  - continuous floating-point game age from `adoptedAt`
  - growth scale mapping from puppy base to adult target
  - refresh every 10s
- Added `src/hooks/useRealWeather.js`:
  - OpenWeather ZIP polling hook
  - maps condition code to `clear|clouds|rain|snow`
  - supports `VITE_WEATHER_API_KEY` and fallback `VITE_OPENWEATHER_API_KEY`
- Updated `src/features/game/MainGame.jsx`:
  - wires `useRealWeather` directly into `EnvironmentScene`
  - wires `useLivingIdle` + `useContinuousAging` into live Pixi render transform
  - adds energy/sleep-driven ambient cadence props for `EnvironmentScene`
  - adds continuous grime overlay from cleanliness stat
  - preserves dark Doggerz visual theme
- Updated `src/utils/lifecycle.js`:
  - changed `GAME_DAYS_PER_REAL_DAY` from `24` to `2` (12 real hours = 1 game day)

## Verification

- `npm run lint` passed.
- `npm run build` passed.
- `npm run preflight` passed.
- Tried `develop-web-game` Playwright client, but it failed due missing `playwright` package in the skill runtime path.

## 2026-02-25 - 2.5D fullscreen yard refactor

- Reworked `src/features/game/MainGame.jsx` into a true fullscreen yard renderer.
- Added `src/features/game/Yard.css` for stable layout and overlay styling.
- Implemented 2.5D depth math:
  - dog Y position mapped to screen depth and z-index
  - final render scale = age/breath scale x depth multiplier
- Added walkable area controls (up/left/right/down) and smooth dog movement transitions.
- Kept dark neon Doggerz theme while removing rigid centered card layout.
- Preserved existing ambient scene system and live weather wiring.
- Verification passed: lint, build, preflight.

## 2026-02-25 - Tap-to-ground movement (anti-spam)

- Replaced directional pad movement with tap-to-ground input on a dedicated yard tap layer.
- Added anti-spam tap coalescing:
  - rapid taps are debounced (`TAP_COMMIT_DEBOUNCE_MS`)
  - only the latest tap becomes active destination
  - no queued multi-tap path following
- Added smooth frame-driven locomotion toward target with arrival epsilon and movement speed cap.
- Kept 2.5D depth mapping + age/breath scaling composition intact.
- Validation passed: lint, build, preflight.
