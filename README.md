# 🐶 Doggerz

Adopt a pixel pup and make choices that shape its behavior. **Doggerz** is a **React 18 + Vite** PWA with **Redux Toolkit** state, a headless time-based “brain loop”, and optional **Firebase** cloud sync.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Optional-ffca28)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Core loop:** feed → play → train → bond → level up

### What makes it different

- **Headless game loop:** `src/features/game/DogAIEngine.jsx` ticks over time and persists state (keeps UI effects out of the engine).
- **Offline-first:** custom service worker (`public/sw.js`) + `/offline.html` fallback.
- **Firebase is optional:** if env vars are missing, the app runs in a safe local-only mode.

---

## ✨ Preview

Add screenshots/GIFs once you have them (recommended for store listings and contributors).

| Home             | Game             | Settings         |
| ---------------- | ---------------- | ---------------- |
| _Add screenshot_ | _Add screenshot_ | _Add screenshot_ |

Tip: store assets can live under `public/docs/` (ignored by the runtime, but easy to link from GitHub).

---

## 🧱 Tech stack

- **Frontend:** React 18, React Router, Redux Toolkit, TailwindCSS, Vite
- **Game rendering:** Pixi (`pixi.js`, `@pixi/react`)
- **Cloud (optional):** Firebase Auth + Firestore
- **PWA:** `public/manifest.webmanifest`, `public/sw.js`

---

## 🚀 Quick start

### 1) Install

```bash
git clone git@github.com:Catfishfishcat10101/doggerz.git
cd doggerz
npm install
```

### 2) Environment variables

- Keep `.env.example` in the repo as the template (safe to commit).
- Put real keys in `.env.local` (ignored by git via `.gitignore`).

Required for Firebase features (Auth/Firestore):

| Variable                            | Required | Notes                          |
| ----------------------------------- | :------: | ------------------------------ |
| `VITE_FIREBASE_API_KEY`             |    ✅    | Firebase web config            |
| `VITE_FIREBASE_AUTH_DOMAIN`         |    ✅    | e.g. `yourapp.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`          |    ✅    | project id                     |
| `VITE_FIREBASE_STORAGE_BUCKET`      |    ✅    | storage bucket                 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` |    ✅    | sender id                      |
| `VITE_FIREBASE_APP_ID`              |    ✅    | app id                         |

Optional:

| Variable                   | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | Enables weather integration                 |
| `VITE_SITE_URL`            | Used for absolute URLs in some tooling/docs |

To see what’s missing:

- `npm run env:check`

### 3) Run dev

```bash
npm run dev
```

---

## 🧪 Quality gates

- Lint: `npm run lint`
- Build: `npm run build`
- PWA sanity: `npm run preflight`
- Local CI sweep: `npm run ci:verify`

---

## 🔥 Firebase: do you need `firebase.json` and `src/firebase.js`?

### `src/firebase.js`

Yes — **keep it** unless you plan to remove Firebase from the app entirely.

It’s imported across the codebase (Auth/UI gating + Firestore thunks). It also intentionally supports **local-only mode** by exporting `null` instances when config is missing.

### `firebase.json`

Keep it if you deploy using **Firebase Hosting**.

- It contains **no secrets**.
- It configures SPA rewrites + caching headers for built assets.

If you are 100% sure you will never use Firebase Hosting (e.g., Vercel/Netlify only), you _can_ remove it — it won’t affect the runtime app — but you’ll lose an easy, reproducible hosting config.

---

## 🧠 Architecture map

- Routing: `src/AppRouter.jsx` (paths in `src/routes.js`)
- Game UI: `src/features/game/MainGame.jsx`
- Game engine loop: `src/features/game/DogAIEngine.jsx`
- Redux store: `src/redux/store.js` (slices live under `src/redux/`)
- PWA: `public/sw.js`, `public/manifest.webmanifest`, `src/pwa/PwaProvider.jsx`

---

## 🐾 Assets & tooling

Useful scripts (optional):

- PWA icons: `npm run icons:generate`
- Sprite checklist: `npm run sprites:jrt:checklist`
- Validate frames: `npm run sprites:jrt:validate`
- Build sprite strips: `npm run sprites:jrt:build`

---

## 🧯 Troubleshooting

### Firebase features look disabled

- Confirm `.env.local` exists and contains all required `VITE_FIREBASE_*` keys.
- Restart dev server after editing env vars.
- Check the console for: `[Doggerz] Firebase disabled...` (this is expected if keys are missing).

### Service worker caching feels “stuck”

- In dev, the app unregisters old SWs by default.
- In prod, bump `CACHE_VERSION` in `public/sw.js` when you change precached assets.

---

## 🔐 Privacy

- In-app privacy policy route: `/privacy`
- Static legacy URL (if shared): `/privacy-policy.html` redirects to `/privacy`

---

## 📄 License

MIT (see `LICENSE`).
