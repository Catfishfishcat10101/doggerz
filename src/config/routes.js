// Central definition of routes and simple metadata.
export const PATHS = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  GAME: "/game",
  SHOP: "/shop",
  SETTINGS: "/settings",
  NOT_FOUND: "/404",
});

export const META = Object.freeze({
  [PATHS.HOME]: { title: "Home", public: true },
  [PATHS.LOGIN]: { title: "Login", public: true, guestOnly: true },
  [PATHS.SIGNUP]: { title: "Create Account", public: true, guestOnly: true },
  [PATHS.GAME]: { title: "Game", auth: true },
  [PATHS.SHOP]: { title: "Shop", auth: true },
  [PATHS.SETTINGS]: { title: "Settings", auth: true },
  [PATHS.NOT_FOUND]: { title: "Not Found", public: true },
});

// Small helper to read titles safely
export function titleFor(pathname) {
  return META[pathname]?.title ?? "Doggerz";
}

