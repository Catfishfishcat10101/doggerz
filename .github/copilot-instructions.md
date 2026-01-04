# Copilot instructions for Doggerz

## Big picture

- Doggerz is a **React 18 + Vite** app with **Redux Toolkit** state, a **Pixi.js**-driven game screen, and a custom **offline-first PWA** (service worker in `public/sw.js`).
- Routing is centralized in `src/AppRouter.jsx` using `PATHS` from `src/routes.js` (kept **JSX-free** so it can be imported anywhere).
- The “brain” loop is headless: `src/features/game/DogAIEngine.jsx` hydrates/saves and ticks state; the UI lives in `src/features/game/MainGame.jsx`.

## Key entry points & structure

- App bootstrap: `src/main.jsx` (providers + error boundary + lazy “engine” prefetch).
- Router/layout: `src/AppRouter.jsx`, `src/layout/AppShell.jsx`.
- Game page shell: `src/pages/Game.jsx` → `src/features/game/MainGame.jsx`.
- Game state loop: `src/features/game/DogAIEngine.jsx` (localStorage hydrate/save, optional cloud sync, weather polling, 60s tick).
- Redux store: `src/redux/store.js` (slices: `dog`, `user`, `settings`, `weather`, `workflows`).

## Dev workflows (use these exact scripts)

- Dev server: `npm run dev` (or `dev:host` for fixed host/port).
- Lint (strict, 0 warnings): `npm run lint` (fix: `npm run lint:fix`).
- Build: `npm run build` (bundle analysis: set `ANALYZE=1` → emits `dist/stats.html`, see `vite.config.js`).
- PWA sanity: `npm run preflight` (strict mode supported; checks `public/manifest.webmanifest`, `public/sw.js` CORE_ASSETS, icons).
- CI locally: `npm run ci:verify` (lint + build + preflight).
- Play Store/TWA gate: `npm run ci:playstore` (requires Firebase env + real `public/.well-known/assetlinks.json`). See `.github/workflows/ci.yml`.

## Env + feature gating conventions

- Start from `.env.example` → `.env.local`. Node >= 18 (`package.json`).
- **Firebase is optional**: `src/firebase.js` exports `auth/db/googleProvider` as `null` when not configured.
  - Guard cloud/auth features with `firebaseReady` or use `assertFirebaseReady('feature name')`.
  - Required Vite keys are defined in `src/config/env.js` and checked by `node scripts/check-env.js`.
- Weather is optional (`VITE_OPENWEATHER_API_KEY`); the game polls gently in `DogAIEngine.jsx`.

## PWA / service worker gotchas

- When changing precached assets, update `CACHE_VERSION` and/or `CORE_ASSETS` in `public/sw.js` and run `npm run preflight`.
- In dev on localhost, `src/pwa/PwaProvider.jsx` **unregisters old service workers** to avoid “stale cache” bugs.
  - Debug escape hatch: set `localStorage.DG_KEEP_SW_DEV = '1'`.
- Updates are applied via `postMessage({type:'SKIP_WAITING'})` + `controllerchange` hard reload.

## Project conventions (don’t fight them)

- Import alias: `@` → `src` (see `vite.config.js` + `jsconfig.json`).
- Code-splitting is intentional: keep Landing fast and avoid importing heavy game code in global UI; use the prefetch helpers in `src/utils/prefetch.js`.
- This repo uses `checkJs: true` but some large files opt out with `// @ts-nocheck`; don’t remove those without fixing the underlying JS-check errors.
- Some scripts are destructive only with `--yes` (e.g. `repo:prune:yes`, `sprites:jrt:prune:yes`); prefer dry runs first.
