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

## 2026-03-02 - Dead-code + native-storage sweep

- Audited candidate deletions (`prefetch.js`, `weather.js`, `runtimeLogging.js`, `debugInfo.js`, `deepMerge.js`).
- `prefetch.js` and `debugInfo.js` were already removed.
- Kept `weather.js` and `deepMerge.js` because both are still imported by active runtime/redux paths.
- Migrated `userSlice` persistence to `nativeStorage` (`setStoredValue`/`removeStoredValue`) with debounced writes.
- Migrated `settingsSlice` persistence to `nativeStorage` with debounced writes and removed direct `localStorage` use.
- Added `src/components/system/AppStorageHydrator.jsx` for async startup hydration of user/settings from native storage.
- Updated `main.jsx` to mount `AppStorageHydrator` and disable runtime logging in production by default.
- Updated `store.js` middleware flags to use `import.meta.env.PROD` and keep serializable checks off for simulation-heavy updates.

### Validation

- `npx eslint src/redux/userSlice.js src/redux/settingsSlice.js src/components/system/AppStorageHydrator.jsx src/main.jsx src/redux/store.js` (pass)
- `npm run build` (fails due pre-existing missing module: `./pwa/PwaProvider.jsx` imported by `src/main.jsx`)

## 2026-03-02 - Build unblock follow-up

- Removed `PwaProvider` import/wrapper from `src/main.jsx` (Android-first app path).
- Restored missing `src/redux/workflowSlice.js` with the action/selector surface used by `Adopt.jsx`.
- Inlined nav config in `src/components/layout/Header.jsx` to remove stale import from deleted `src/nav.js`.
- Validation:
  - `npx eslint src/redux/workflowSlice.js src/redux/store.js src/pages/Adopt.jsx src/components/layout/Header.jsx` (pass)
  - `npm run build` (pass)

## 2026-03-02 - PWA artifact cleanup

- Removed remaining service-worker/PWA logic from `src/pages/Help.jsx`.
  - deleted service-worker/cache action handlers and PWA diagnostics fields.
  - removed "Install & offline (PWA)" FAQ section and related PWA copy.
- Simplified web notification fallback in `src/utils/notifications.js` to skip service-worker registration checks.
- Removed web-app capability/Apple PWA meta tags from `index.html`.
- Validation:
  - `npx eslint src/pages/Help.jsx src/utils/notifications.js src/main.jsx` (pass)
  - `npm run build` (pass)

## 2026-03-02 - Native storage migration pass

- Migrated remaining direct local-storage usage to `nativeStorage` flows:
  - `src/pages/Login.jsx` remembered-email state now hydrates/saves with `getStoredValue` / `setStoredValue`.
  - `src/pages/Help.jsx` diagnostics/reset paths now use key listing + remove helpers from `nativeStorage`.
  - `src/pages/Settings.jsx` export/import/reset paths now use `nativeStorage` APIs.
  - `src/utils/reminders.js` now persists through `nativeStorage` with async hydration + in-memory cache (no direct `localStorage` calls).
- Added helper APIs in `src/utils/nativeStorage.js`:
  - `listStoredKeys()`
  - `removeStoredValues(keys)`
  - `removeStoredValuesByPrefix(prefixes)`
- Updated `src/components/environment/CheckInReminders.jsx` to await reminder-state hydration before scheduling checks.
- Validation:
  - `npx eslint src/utils/nativeStorage.js src/utils/reminders.js src/pages/Login.jsx src/pages/Help.jsx src/pages/Settings.jsx src/components/environment/CheckInReminders.jsx` (pass)
  - `npm run build` (pass)

## 2026-03-02 - Custom sprite strip grid detection + test hooks

- Updated src/components/dog/DogPixiView.jsx to slice custom animation sheets using manifest frame size when possible (supports 1-row/1-column strips) and broadened grid estimation to include 1–12 rows/cols.
- Added window.render_game_to_text + window.advanceTime in src/main.jsx for the Playwright test loop.

### Validation

- Playwright client run failed: http://localhost:5175/game refused connection (dev server not running).


## 2026-03-02 - Custom anim mapping passthrough

- Updated DogPixiView to request anim-specific sheets using the requested animation key (not just manifest-resolved), so custom anim names can load when mapped.
- Added additional anim filename mappings in getDogAnimSpriteUrl for walk_left/right and jump/front_flip to use existing assets (e.g., dult-walk-left.png).

### Validation

- Playwright client run: timed out clicking Play button (element located but click never completed).
- Playwright client run: http://localhost:5175/game refused connection (dev server not running).

