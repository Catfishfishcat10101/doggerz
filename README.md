# 🐶 Doggerz

## 🗂️ Project Structure & Onboarding (2025 Migration)

Doggerz now uses a **feature-based folder structure** for scalability and maintainability. All domain logic, UI, hooks, Redux, and utils are grouped by feature:

````text
src/
  features/
    game/
      components/      # Game-specific UI (sprites, HUD, cards)
      hooks/           # Game logic hooks (lifecycle, animation, backgrounds)
      redux/           # Dog state, thunks, selectors
      utils/           # Game-related helpers (sprite, lifecycle, weather)
      MainGame.jsx     # Main game screen
      DogAIEngine.jsx  # AI/persistence orchestrator
      ...
    dashboard/
      components/      # Dashboard widgets (if present)
      ...
    settings/
      components/      # Settings panels (if present)
      ...
  components/          # Shared UI (used across features)
  pages/               # Route-level screens (Home, Adopt, Login, etc.)
  constants/           # Game config, thresholds, enums
  redux/               # User/global Redux (non-dog)
  utils/               # Shared helpers (non-game)

Path aliases use `@/` for imports (see `vite.config.js`). Example:

```js
import EnhancedDogSprite from "@/features/game/components/EnhancedDogSprite.jsx";
import { selectDog } from "@/features/game/redux/dogSlice.js";
````

### Migration Steps (Nov 2025)

1. **All game logic/UI/hooks/redux/utils moved to `src/features/game/`**
2. **Imports updated** in all files to use new feature-based paths
3. **Shared UI/components** remain in `src/components/`
4. **Global Redux/user logic** remains in `src/redux/`
5. **Onboarding:** New contributors should add new features by creating a folder under `src/features/` and grouping all related files inside

#### Why Feature-Based?

- Easier scaling for multi-dog, dashboard, settings, etc.
- Clear separation of concerns
- Faster onboarding for new devs
- Reduces import path confusion

For details, see `.github/copilot-instructions.md`.

> Adopt a pixel pup and make choices that shape its behavior. Built with **React**, **Redux Toolkit**, **Vite**, **Tailwind**, and **Firebase**. Offline-ready PWA.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%2FFirestore-ffca28)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-success)](https://github.com/Catfishfishcat10101/doggerz/pulls)

**Core loop:** feed → play → train → rest → level up  
**Feature pillars:** one-dog-per-user · needs & mood system · sprite animations · responsive UI · installable PWA · offline gameplay

---

## 📸 Screenshots

> Replace with real captures; these are placeholders.

| Splash / Auth                        | Game Screen                      | Shop                             |
| ------------------------------------ | -------------------------------- | -------------------------------- |
| ![Splash](public/screens/splash.png) | ![Game](public/screens/game.png) | ![Shop](public/screens/shop.png) |

---

## 🧱 Tech Stack

- **Frontend:** React 18, React Router, Redux Toolkit, TailwindCSS, Vite
- **Backend:** Firebase Auth + Firestore (emulator support)
- **PWA:** `vite-plugin-pwa` (offline page, runtime caches, update toast)
- **DX:** ES Modules, fast HMR, strict env gating, Windows-friendly scripts

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone git@github.com:Catfishfishcat10101/doggerz.git
cd doggerz
npm install
```

### 2. Configure Firebase

Create `.env.local` from the provided `.env.example` and paste your Firebase web
app credentials (Project settings → General → Your apps → SDK setup). The app
will disable auth/cloud features until every required key is present to prevent
runtime crashes.

### 3. (Optional) Enable live weather

Grab a free OpenWeather API key, add `VITE_OPENWEATHER_API_KEY` to `.env.local`,
and (optionally) set `VITE_WEATHER_DEFAULT_ZIP`. Once set, the in-game weather
widget auto-refreshes conditions every 30 minutes and tints the yard based on
the current time of day.

### 4. Day/Night Backgrounds (by ZIP)

- Add background images to `public/backgrounds/` named:
  - `backyard-day.png`
  - `backyard-night.png`
- Optional variants for more vibe:
  - `backyard-dawn.png`
  - `backyard-dusk.png`
- If these files are missing, the game gracefully falls back to a stylized
  gradient so you can play without assets.
- Time-of-day is derived from your ZIP's local time using OpenWeather's
  timezone offset (no geolocation required). If `VITE_OPENWEATHER_API_KEY` is
  not set, we fall back to your device clock.

Fallback rules:

- If only `backyard-split.png` exists (day|night in one image), it's cropped
  left/right automatically.
- If `dawn`/`dusk` variants are missing, we fall back to `day`/`night` with a
  tinted gradient overlay.

Environment variables used:

- `VITE_OPENWEATHER_API_KEY` – required for ZIP-based local time.
- `VITE_WEATHER_DEFAULT_ZIP` – default ZIP (e.g., `10001`) if the player
  hasn't provided one elsewhere.

### 5. Spritesheets (Jack Russell Terrier)

- Format: `2048x2048` PNG, `16x16` grid of `128x128` frames.
- Files expected in `public/sprites/`:
  - `jack_russell_puppy.png`
  - `jack_russell_adult.png`
  - `jack_russell_senior.png`
- Row/animation mapping lives in `public/sprites/manifest.json`.
- Optional cleanliness variants: append suffix `_dirty`, `_fleas`, `_mange` to each stage filename.

Generate labeled placeholder sheets for testing:

```powershell
npm run sprites:generate
```

Replace the generated files with real art while keeping the same grid. The game can map specific rows to actions/directions using the manifest.

---

## 🙏 Attribution

If you use the LPC dog art:

- Source: <https://opengameart.org/content/lpc-cats-and-dogs>
- Author: bluecarrot16
- License: CC-BY 3.0
- Attribution: "[LPC] Cats and Dogs" by bluecarrot16 — CC-BY 3.0 via OpenGameArt.org

See `CREDITS.md` for the full list of third‑party credits and links.
