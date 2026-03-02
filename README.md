# 🐶 Doggerz

**Adopt. Train. Bond.** A realistic pet simulation focused on unpredictable AI behaviors and deep companionship. **Doggerz** is a high-performance **React 18 + Vite** mobile app (via Capacitor) featuring a **PixiJS** rendering engine for smooth, 2D-perspective gameplay.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-8.0-ff3e81)](https://pixijs.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile-119eff)](https://capacitorjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Optional-ffca28)](https://firebase.google.com/)

---

## ✨ What makes it different?

- **Perspective Rendering:** A custom "Depth" engine in PixiJS that scales your pup and adjusts Z-indexing based on yard position (Gate vs. Screen).
- **Reactive AI Brain:** Uses a presentation-layer state machine to handle realistic transitions (e.g., `Sleep` -> `Alert` -> `Walk`) triggered by user interaction.
- **Mobile-First UX:** Anchored "Thumb-Zone" navigation and large tactile buttons designed for the Google Play Store.
- **Hybrid Storage:** Local-first state management with optional Firebase Firestore synchronization for cross-device play.

---

## 🧱 Tech Stack

- **Frontend:** React 18 (Vite), TailwindCSS, Framer Motion (for UI animations)
- **Game Engine:** PixiJS (`@pixi/react`) for the Backyard & Sprite rendering
- **Mobile Bridge:** CapacitorJS (Android Support)
- **State:** Redux Toolkit (Logic) & Firebase (Cloud Sync)
- **Architecture:** Headless AIEngine + Pixi Presentation Layer

---

## 🚀 Mobile Development (Android)

Since Doggerz is targeted for the Play Store, ensure you have the Android SDK installed.

### Syncing to Android Studio

```powershell
# Build the web assets
npm run build

# Sync assets to the Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```
