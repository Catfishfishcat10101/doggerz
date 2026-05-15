# Doggerz

Doggerz is a mobile-first virtual pet dog simulator built with React, Vite, Redux Toolkit, Firebase, Tailwind CSS, and Capacitor Android.

The game is centered on one dog per user: a Jack Russell Terrier-inspired companion with needs, mood, training, potty habits, memories, progression, cloud save, weather-aware behavior, day/night presentation, and Android support through Capacitor.

Doggerz currently targets:

- Web and installable PWA-style browser builds through Vite
- Android through the checked-in Capacitor project in `android/`

## Current Status

Doggerz is an active in-progress project. The repository contains working gameplay systems, Firebase integration, local persistence, Android build wiring, real dog assets, and ongoing 3D/sprite rendering work.

Some product systems are still evolving, especially release automation, monetization, store content, and final Play Store operations.

## Gameplay

Doggerz is designed as a realistic long-running pet simulation rather than a static pet screen.

Implemented or actively wired systems include:

- Adoption and one-dog-per-user flow
- Core needs and stats: hunger, thirst, energy, happiness, cleanliness, health, affection, mental stimulation, and potty pressure
- Moodlets and behavior cues driven by needs, training state, cleanliness, age, and recent care
- Feeding, watering, bathing, petting, playing, resting, potty care, and training actions
- Potty training with progress, accidents, cleanup, and training gates
- Obedience and trick training with success/failure/perfect outcomes, mastery, and reactions
- Offline progression and absence handling
- Life-stage progression from puppy toward adult and senior stages
- Memory, dream, temperament, personality, and progression systems
- Day/night and weather-aware scene presentation
- Firebase-backed cloud save when a signed-in user and Firebase config are available
- Local device storage through localStorage and Capacitor Preferences helpers
- Mobile-first UI with a full-screen game route and app-shell routes for menus and secondary screens

## Tech Stack

- React 18
- Vite 7
- React Router 6
- Redux Toolkit and React Redux
- TanStack Query
- Firebase Auth, Firestore, Analytics, and Remote Config wiring
- Tailwind CSS 3
- Three.js, React Three Fiber, and Drei
- Pixi.js support
- Capacitor 8 for Android
- Vitest, Jest, ESLint, Prettier, and TypeScript type checking

## App Entry And Routing

The active browser entry is:

- `index.html`
- `src/app/main.jsx`
- `src/app/AppRouter.jsx`

`index.html` loads `/src/app/main.jsx`. That bootstrap mounts React, Redux, TanStack Query, Firebase/auth effects, cloud save sync, reminders, modal providers, toast providers, and `AppRouter`.

There is also a simpler `src/main.jsx` entry that imports `./app/AppRouter.jsx`, but the current `index.html` script points at `src/app/main.jsx`.

Routing lives in `src/app/AppRouter.jsx` and route constants live in `src/app/routes.js`.

Important routing details:

- `/game` is intentionally outside `AppShell` for the full-screen yard experience.
- `/` uses `AppShell` and renders the start screen by default.
- Dog-related routes such as `/skill-tree`, `/store`, `/memories`, `/dreams`, `/potty`, `/temperament-reveal`, and `/rainbow-bridge` are grouped under `DogRouteShell`.
- Several routes are protected by `ProtectedRoute` and wait for auth resolution through `AuthReadyGate`.

## State And Persistence

Redux setup is in `src/store/store.js`.

Configured slices:

- `dog` from `src/store/dogSlice.js`
- `progression` from `src/features/progression/progressionSlice.js`
- `user` from `src/store/userSlice.js`
- `settings` from `src/store/settingsSlice.js`
- `weather` from `src/store/weatherSlice.js`
- `workflows` from `src/store/workflowSlice.js`

Configured middleware:

- `dogTickMiddleware`
- `trainingReactionMiddleware`
- progression event middleware
- optional debug logging middleware

Cloud save is coordinated by `src/components/system/CloudSaveSync.jsx` and `src/store/dogThunks.js`. Local persistence helpers live under `src/lib/storage/` and `src/utils/nativeStorage.js`.

## Firebase

Firebase initialization lives in `src/lib/firebase/index.js`.

Required Vite environment variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional Firebase value:

```bash
VITE_FIREBASE_MEASUREMENT_ID=
```

Firebase-backed features degrade when Firebase config is missing. Auth and cloud save require valid Firebase configuration.

Firestore rules are in `firestore.rules`. Firebase Hosting is configured in `firebase.json` to serve `dist/` with SPA rewrites.

## Weather And Day/Night

Weather and time presentation are handled across:

- `src/lib/weatherApi.js`
- `src/features/weather/RealTimeWeatherFetcher.js`
- `src/store/weatherSlice.js`
- `src/hooks/environment/useDayNightBackground.js`
- `src/hooks/useDayNight.js`
- `src/utils/weather.js`
- `src/utils/timeWeather.js`

Optional weather environment variable:

```bash
VITE_OPENWEATHER_API_KEY=
```

The code also uses Open-Meteo/ZIP lookup helpers and local fallbacks, depending on available inputs.

## Assets

Current asset folders include:

- `public/assets/models/dog/` - Jack Russell GLB models for puppy, adult, senior, and Doggerz variants
- `public/assets/sprites/jr/` - Jack Russell sprite frames and variants
- `public/assets/icons/` - app icons used by the web manifest
- `public/assets/scene/backyard/` - backyard scene assets and notes
- `public/backgrounds/` - day/night backyard SVG backgrounds
- `public/audio/` - ambient loops and bark audio
- `src/features/audio/jrAudio.json` - Jack Russell audio manifest
- `assets/` - source logo and icon files
- `store-assets/` - store listing graphics and screenshots

Dog model validation scripts live in `scripts/validate-dog-glb.js` and `scripts/validate-dog-model.mjs`.

## Requirements

- Node `24.13.0` is pinned in `.node-version`
- `package.json` requires Node `>=22.0.0`
- npm
- Android Studio and a JDK compatible with the Android Gradle setup for native Android work

## Setup

Install dependencies:

```bash
npm install
```

Create local environment files as needed. This checkout has `.env` and `.env.local`, but no `.env.example`; use the Firebase and weather variable names listed above.

Start the Vite dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

For device testing on the local network:

```bash
npm run dev:host
```

## Development Commands

```bash
npm run dev              # Vite dev server
npm run dev:host         # Vite on host/port 5173 with strict port
npm run preview          # Preview the production build
npm run preview:host     # Preview on 127.0.0.1:4173
```

Quality and verification:

```bash
npm run lint             # ESLint with zero warnings
npm run lint:fix         # ESLint autofix
npm run format           # Prettier write
npm run format:check     # Prettier check
npm run typecheck        # TypeScript no-emit check
npm run test             # Vitest run
npm run test:watch       # Vitest watch
npm run test:jest        # Jest run
npm run build            # Vite production build
npm run assets:verify    # Validate dog GLB assets
npm run preflight        # ts-nocheck guard and asset verification
npm run ci:verify        # lint, typecheck, build, and preflight
npm run check            # format check, lint, and build
```

## Android Workflow

Capacitor config is in `capacitor.config.json`.

Current Android app settings:

- App ID: `com.doggerz.app`
- App name: `Doggerz`
- Web output directory: `dist`
- Android project: `android/`
- min SDK: `24`
- compile SDK: `35`
- target SDK: `35`

Build and sync the web app into Android:

```bash
npm run android:sync
```

Open Android Studio:

```bash
npm run android:open
```

Run on a connected Android device or emulator:

```bash
npm run android:run
```

Run with Capacitor live reload:

```bash
npm run android:live
```

The Android manifest is at `android/app/src/main/AndroidManifest.xml`. Current permissions include internet, notifications, and coarse/fine location.

## Android Versioning

Android versioning is driven by `version.json`, not by `package.json`.

Current shape:

```json
{
  "versionName": "3.5.7",
  "versionCode": 357
}
```

`android/app/build.gradle` reads `version.json` and fails the Gradle build if `versionName` or `versionCode` is invalid.

Bump the release version:

```bash
npm run release:bump
```

By default this bumps the patch version. The underlying script also supports:

```bash
node scripts/bump-version.js --patch
node scripts/bump-version.js --minor
node scripts/bump-version.js --major
node scripts/bump-version.js --dry-run
```

## Android Release Build

The guarded Android release builder is:

```bash
node scripts/build-android-release.js
```

Common release build:

```bash
node scripts/build-android-release.js --bump
```

The script validates release assets, validates Android signing config, optionally bumps `version.json`, runs the web build, syncs Capacitor, and runs Gradle `bundleRelease`.

Release signing can be provided through environment variables:

```bash
DOGGERZ_ANDROID_KEYSTORE_PATH=
DOGGERZ_ANDROID_KEYSTORE_PASSWORD=
DOGGERZ_ANDROID_KEY_ALIAS=
DOGGERZ_ANDROID_KEY_PASSWORD=
```

Or through `android/keystore.properties`:

```properties
storeFile=
storePassword=
keyAlias=
keyPassword=
```

Expected AAB output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

The release builder contains an optional `--upload` path for Google Play, but this checkout does not currently include `scripts/upload-play-release.js`. Use the generated AAB for manual Play Console upload unless that upload script is added.

## Project Structure

```text
android/                       Capacitor Android project
assets/                        Source logo and icon assets
docs/                          Project documentation and asset specs
public/                        Static web assets served by Vite
public/assets/icons/           Web/PWA icons
public/assets/models/dog/      Jack Russell GLB dog models
public/assets/sprites/jr/      Jack Russell sprite assets
public/backgrounds/            Day/night backyard backgrounds
public/audio/                  Ambient and dog audio
scripts/                       Asset, version, and Android release scripts
src/app/                       Bootstrap, router, route constants, app config
src/components/                UI, layout, dog renderers, game screens, system providers
src/features/                  Gameplay systems: dog, training, weather, audio, progression, billing
src/hooks/                     UI, dog, audio, and environment hooks
src/lib/                       Firebase, storage, analytics, notifications, performance helpers
src/pages/                     Route-level screens
src/store/                     Redux store, slices, thunks, middleware, hooks
src/utils/                     Runtime, storage, weather, lifecycle, debug, and helper utilities
store-assets/                  Store listing images and screenshots
```

## PWA And Web Build

The web manifest is `public/manifest.webmanifest` and is linked from `index.html`.

Vite builds to `dist/`:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The current codebase includes a web manifest and mobile-first browser UI. No service worker registration was found in the current source tree.

## Notes For Contributors

- Prefer `src/app/main.jsx` and `src/app/AppRouter.jsx` when changing app bootstrap or routing.
- Keep `/game` full-screen and outside the normal app shell unless intentionally changing the mobile game layout.
- Keep dog state changes in Redux slices, thunks, middleware, or feature modules rather than directly mutating UI-only state.
- Run `npm run ci:verify` before opening a release PR or preparing an Android build.
- Run `npm run assets:verify` after changing GLB dog models.
- Do not commit local secrets, keystores, Firebase credentials, or generated signing files.

## License

No license file is currently present in this checkout.
