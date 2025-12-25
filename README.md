# 🐶 Doggerz

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
| ![Splash](public/screens/splash.svg) | ![Game](public/screens/game.svg) | ![Shop](public/screens/shop.svg) |

---

## 🧱 Tech Stack

- **Frontend:** React 18, React Router, Redux Toolkit, TailwindCSS, Vite
- **Backend:** Firebase Auth + Firestore (emulator support)
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

- Add background images to `public/assets/backgrounds/` named:
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
