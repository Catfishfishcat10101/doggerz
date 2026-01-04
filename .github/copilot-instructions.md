# Copilot instructions for Doggerz

## Big picture (architecture you must preserve)

- Doggerz is a **React 18 + Vite** PWA with **Redux Toolkit** state and a headless “brain loop”.
- The core loop is **headless + time-based**: `src/features/game/DogAIEngine.jsx` hydrates/saves and dispatches ticks (don’t block it; keep UI effects out of it).
- Game UI lives in `src/features/game/MainGame.jsx` (Pixi/canvas overlays, sprite renderer components).
- Routing is centralized in `src/AppRouter.jsx` using `PATHS` from `src/routes.js` (JSX-free so it can be imported anywhere).

## Key files to start from

- App bootstrap/providers: `src/main.jsx` (PWA provider, toast provider, error boundary, lazy engine prefetch).
- Redux store: `src/redux/store.js` (slices: `dog`, `user`, `settings`, `weather`, `workflows`).
- Dog state logic: `src/redux/dogSlice.js` (tick/decay, derived state, and features like `setVacationMode`).
- Settings & UX gating: `src/redux/settingsSlice.js` + `src/pages/Settings.jsx` (use `reduceMotion`, `batterySaver`, `perfMode` to gate heavy effects).

## Dev workflows (use repo scripts)

- Dev: `npm run dev` (or `dev:host`).
- Lint (0 warnings): `npm run lint` (fix: `npm run lint:fix`).
- Build: `npm run build` (bundle report: `ANALYZE=1`).
- PWA sanity: `npm run preflight` (validates `public/manifest.webmanifest` + `public/sw.js` `CORE_ASSETS`).
- CI locally: `npm run ci:verify` (lint + build + preflight).
- Env check: `npm run env:check` (supports strict flags; see `scripts/check-env.js`).

## PWA/service worker rules

- When changing precached assets, update `public/sw.js` (`CACHE_VERSION` / `CORE_ASSETS`) and rerun preflight.
- Dev on localhost unregisters old SWs in `src/pwa/PwaProvider.jsx` (escape hatch: `localStorage.DG_KEEP_SW_DEV='1'`).

## Project conventions & UI patterns

- Import alias: `@` → `src` (see `vite.config.js` + `jsconfig.json`).
- Code-splitting is intentional; don’t pull heavy game code into global UI (use `src/utils/prefetch.js`).
- Toasts: canonical provider/hooks are `src/components/ToastProvider.jsx` (`useToast()`). `src/components/toast/ToastProvider.jsx` is a **deprecated shim**.
- “Reduce decision fatigue” patterns: use `src/components/EmptySlate.jsx` for empty states (one next step) and `src/components/BackPill.jsx` for consistent back navigation.
- Some large files opt out of JS checking with `// @ts-nocheck`; don’t remove without fixing underlying issues.
