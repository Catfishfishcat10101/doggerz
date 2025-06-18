<<<<<<< HEAD
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
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> bc8e0e3 (Current updated project)
