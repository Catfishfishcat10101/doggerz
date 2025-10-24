// src/config/routes.js
export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  GAME: "/game",
  NEW_DOG: "/new-dog",
  PROFILE: "/profile",
  SHOP: "/shop",
  SETTINGS: "/settings",
  LEGAL_TOS: "/legal/tos",
  LEGAL_PRIVACY: "/legal/privacy",
  NOT_FOUND: "*",
};

// Where “Start Game” should go after auth
export function startRouteAfterAuth({ hasDog }) {
  return hasDog ? PATHS.GAME : PATHS.NEW_DOG;
}
