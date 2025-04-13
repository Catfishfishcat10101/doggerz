# 🐾 Doggerz - Virtual Pet Dog Simulator

**Doggerz** is a pixel-style, virtual pet simulation game built in **React** with Redux. You start with a puppy that grows over time, can be trained to do tricks, and requires regular care like feeding, playing, and potty training. Built for web and mobile browsers, Doggerz brings Tamagotchi vibes with modern state management, smooth animations, and a clean React architecture.

---

## 🚧 Status: In Development

> This repo is part of an ongoing build that will be deployed on  
> 💻 [https://bigslickgames.com](https://bigslickgames.com)  
> 🛠️ Built by: William "Catfish" Johnson & Brent Sinclair (visuals/graphics)

---

## 🎮 Features (Implemented & Upcoming)

- ✅ Real-time **dog aging** (1 minute = 1 game age unit)
- ✅ **Energy**, **happiness**, and **XP** tracked via Redux
- ✅ Puppy **learns tricks** using time + XP
- ✅ **Potty training** mechanic
- ✅ Sprite-based **dog animations** using a pixel-art Jack Russell Terrier
- ✅ Idle **random walking** behavior on screen
- ✅ Responsive UI for **mobile** & desktop
- 🔜 Firebase integration for **saved progress** and **sign-in**
- 🔜 Expanded backgrounds, weather cycles, and seasonal effects

---

## 🧠 Game Logic

Doggerz uses a central Redux slice `dogSlice.js` to control:
- Dog stats (energy, happiness, XP, age)
- Trick progress
- Sound toggles and potty training status
- Time-based updates using `useEffect`

Sprite animations are managed in canvas via a custom utility `spriteAnimator.jsx`.

---

## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Catfishfishcat10101/doggerz.git
cd doggerz/doggerz-app
