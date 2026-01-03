# 🐶 Doggerz

> Adopt a pixel pup and make choices that shape its behavior. Built with **React**, **Redux Toolkit**, **Vite**, **Tailwind**, and **Firebase**. Offline-ready PWA.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
<<<<<<< HEAD
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
=======
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)
>>>>>>> master
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%2FFirestore-ffca28)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-success)](https://github.com/Catfishfishcat10101/doggerz/pulls)

<<<<<<< HEAD
**Core loop:** feed → play → train → rest → level up
**Feature pillars:** one-dog-per-user · needs & mood system · sprite animations · responsive UI · installable PWA · offline gameplay
=======
**Core loop:** feed → play → train → bond → level up
**Feature pillars:** needs & mood system · sprite animations · responsive UI · installable PWA · offline gameplay
>>>>>>> master

---

## 📸 Screenshots

<<<<<<< HEAD
> Replace with real captures; these are placeholders.

| Splash / Auth                        | Game Screen                      | Shop                             |
| ------------------------------------ | -------------------------------- | -------------------------------- |
| ![Splash](public/screens/splash.svg) | ![Game](public/screens/game.svg) | ![Shop](public/screens/shop.svg) |
=======
Add real captures for your store listing. (This repo doesn’t ship with placeholder screenshots.)
>>>>>>> master

---

## 🧱 Tech Stack

- **Frontend:** React 18, React Router, Redux Toolkit, TailwindCSS, Vite
- **Backend:** Firebase Auth + Firestore (emulator support)
<<<<<<< HEAD
- **PWA:** `vite-plugin-pwa` (offline page, runtime caches, update toast)
- **DX:** ES Modules, fast HMR, strict env gating, Windows-friendly scripts

**Note — placeholders**

The three images above are lightweight SVG placeholders stored in `public/screens/`.
To replace them with real PNG captures, drop files named `splash.png`, `game.png`, and
`shop.png` into `public/screens/` (these will take precedence). Example export commands:

ImageMagick:

```bash
magick convert public/screens/splash.svg public/screens/splash.png
```

Inkscape (headless):

```bash
inkscape public/screens/game.svg --export-type=png --export-filename=public/screens/game.png
```

Node + Sharp (project already includes `sharp` as a devDependency):

```bash
node -e "require('sharp')('public/screens/shop.svg').png().toFile('public/screens/shop.png')"
```

If you prefer automated captures, run the app (`npm run dev`) and take screenshots from the running UI; then save them into `public/screens/` with the filenames above.

---

=======
- **PWA:** custom Service Worker (`public/sw.js`) + installable manifest
- **DX:** ES Modules, fast HMR, strict env gating, Windows-friendly scripts

---

## 📋 Performance & PWA checklist

See `docs/perf-checklist.md` for what to measure (first load/return load, /game transition timing, FPS/jank), and how to validate installability + service worker update safety.

## 💾 Persistence & cloud sync policy

See `docs/persistence-and-sync.md` for where the “source of truth” lives (local vs cloud), what metadata we persist, and how we avoid clobbering newer local saves with older cloud saves.

## ✅ Launch Definition (v1)

This section defines the minimum bar for shipping Doggerz. If any requirement below is not met, the release is not launch-ready.

### Supported platforms (must work)

- Chrome / Edge (Chromium)
  - Desktop (Windows/macOS)
  - Mobile (Android Chrome)
- Safari (iOS)
  - Mobile Safari + Add to Home Screen (PWA install expectations)

Notes:

- Firefox is a best-effort target unless explicitly promoted to supported.
- Users with prefers-reduced-motion enabled must have a good experience (no critical UX gated behind heavy animation).

### Minimum device (floor)

- Mobile: iPhone 11-class device or equivalent mid-range Android
- Desktop: typical integrated-GPU laptop (no discrete GPU assumed)

### Target performance (ship criteria)

- Time to interactive: < 3 seconds on a mid device on a typical connection
- Smoothness: no frequent jank spikes; avoid > 100ms main-thread stalls during normal play
- Sustained play: game remains responsive after 10+ minutes (no progressive slowdown)

### Offline behavior expectations

- App shell must load (no white screen / broken routing) when offline after a prior successful visit.
- If offline:
  - Gameplay is allowed to be limited, but must remain usable and clearly communicate limitations.
  - Network-only features must fail gracefully (clear UI state, no infinite loader).

### Data durability expectations

- Doggerz must not silently wipe local progress.
- Any reset/destructive action must be explicit:
  - A clear Reset Save Data option in Settings
  - Confirmation step (with a short explanation)
- App updates must not corrupt existing saves; if a migration fails, show recovery options.

### Golden flows (must succeed 100%)

1) First visit: Landing → Adopt → Game

2) Returning visit: Game loads correctly (and routes correctly if adoption is required)

3) Auth (if enabled): Login/Signup must not break core play
   - If auth is unavailable/misconfigured, users should still be able to play in a safe local-only mode (or be clearly gated with a friendly message).

4) Settings: Settings changes persist and take effect immediately
   - If a setting cannot apply instantly, the UI must say so and provide the next step.

### Launch blockers (P0)

Any of the following is a release blocker:

- Crash that prevents play or navigation
- Blank/white screen
- Infinite loader without a timeout + recovery UI
- Auth lockout that prevents access to core play (when auth is enabled)

>>>>>>> master
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

<<<<<<< HEAD
=======
Tip: you can run `npm run env:check` to see what keys are missing. Add `-- --strict --require firebase` if you want CI/builds to fail when Firebase is not configured.

>>>>>>> master
### 3. (Optional) Enable live weather

Grab a free OpenWeather API key, add `VITE_OPENWEATHER_API_KEY` to `.env.local`,
and (optionally) set `VITE_WEATHER_DEFAULT_ZIP`. Once set, the in-game weather
widget auto-refreshes conditions every 30 minutes and tints the yard based on
the current time of day.

### 4. Day/Night Backgrounds (by ZIP)

<<<<<<< HEAD
- Add background images to `public/assets/backgrounds/` named:
  - `backyard-day.png`
  - `backyard-night.png`
- Optional variants for more vibe:
  - `backyard-dawn.png`
  - `backyard-dusk.png`
=======
- Add background images to `public/backgrounds/` named:
  - `backyard-day.webp`
  - `backyard-night.webp`
- Optional variants for more vibe:
  - `backyard-dawn.webp`
  - `backyard-dusk.webp`
- Optional wide variants for large screens:
  - `backyard-day-wide.webp`
  - `backyard-night-wide.webp`
>>>>>>> master
- If these files are missing, the game gracefully falls back to a stylized
  gradient so you can play without assets.
- Time-of-day is derived from your ZIP's local time using OpenWeather's
  timezone offset (no geolocation required). If `VITE_OPENWEATHER_API_KEY` is
  not set, we fall back to your device clock.

Fallback rules:

<<<<<<< HEAD
- If only `backyard-split.png` exists (day|night in one image), it's cropped
=======
- If only `backyard-split.webp` (or `backyard-split.png`) exists (day|night in one image), it's cropped
>>>>>>> master
  left/right automatically.
- If `dawn`/`dusk` variants are missing, we fall back to `day`/`night` with a
  tinted gradient overlay.

Environment variables used:

- `VITE_OPENWEATHER_API_KEY` – required for ZIP-based local time.
- `VITE_WEATHER_DEFAULT_ZIP` – default ZIP (e.g., `10001`) if the player
  hasn't provided one elsewhere.
<<<<<<< HEAD

---

## 🧰 Asset tooling (optional)

Doggerz includes a few small Node scripts under `scripts/` to generate assets.
They are **optional** and intended to make iteration easier.

### PWA icons

Generates `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, and a
maskable variant from `public/favicon.ico`.

- Run: `npm run icons:gen`

### Sprite sheet pipeline (JR placeholder sheets)

The Pixi renderer expects animated sheets at:

- `public/assets/sprites/jr/pup_clean.png`
- `public/assets/sprites/jr/adult_clean.png`
- `public/assets/sprites/jr/senior_clean.png`

These are simple placeholder sheets you can regenerate locally:

- Generate intermediate atlases into `public/assets/atlas/`:
  - `npm run sprites:gen`
- Pack atlases into the runtime sheets above:
  - `npm run sprites:pack`
- Or do both:
  - `npm run sprites:build`

> Note: `public/assets/atlas/` is an intermediate format; the game only needs the
> packed sheets in `public/assets/sprites/jr/`.

### Backyard split helper

If you have a combined `backyard-split.png` (day on the left, night on the right)
you can split it into the expected filenames:

- Run: `npm run split:backyard`
=======
>>>>>>> master
