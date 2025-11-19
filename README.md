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

| Splash / Auth | Game Screen | Shop |
|---|---|---|
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
