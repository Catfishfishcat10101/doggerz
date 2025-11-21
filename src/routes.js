// src/routes.js

// Central place for all route paths so components don't hard-code strings.
export const PATHS = {
  // Landing / marketing
  HOME: "/", // you can point this to <SplashPage /> or <Home /> in your router
  SPLASH: "/splash", // optional separate splash if you want both

  // Core game flows
  ADOPT: "/adopt",
  GAME: "/game",
  PLAY: "/play", // reserved for minigames / playground if you use it later

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",

  // Info / meta
  ABOUT: "/about",
  CONTACT: "/contact",
  SETTINGS: "/settings",
  LEGAL: "/legal",
  GUIDE: "/guide", // "Read the full care guide →" link on Home/Splash

  // Dog systems
  MEMORY: "/memory", // future dog journal / memory log page
  POTTY: "/potty",
  AFFECTION: "/affection",
  TEMPERAMENT_REVEAL: "/temperament",
};

export default PATHS;
