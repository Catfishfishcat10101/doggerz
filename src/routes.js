/** @format */

// src/routes.js
// Centralized path constants + route metadata (kept JSX-free so it can be imported anywhere).

export const PATHS = Object.freeze({
  HOME: "/",
  ADOPT: "/adopt",
  GAME: "/game",
  MENU: "/menu",
  SKILL_TREE: "/skill-tree",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ABOUT: "/about",
  SETTINGS: "/settings",
  STORE: "/store",
  CONTACT: "/contact",
  LEGAL: "/legal",
  PRIVACY: "/privacy",
  POTTY: "/potty",
  TEMPERAMENT_REVEAL: "/temperament-reveal",
  DEVELOPERS: "/developers",
  FAQ: "/faq",
  HELP: "/help",

  MEMORIES: "/memories",
  DREAMS: "/dreams",

  // Story / scenes
  RAINBOW_BRIDGE: "/rainbow-bridge",

  // Explicit not-found route for redirects and direct links.
  NOT_FOUND: "/404",
});

/**
 * Route metadata for UI (menus, document titles, etc).
 * This file is intentionally JSX-free so it can be imported anywhere.
 */
export const routes = Object.freeze([
  { path: PATHS.HOME, name: "Home", meta: { title: "Doggerz" } },
  { path: PATHS.GAME, name: "Game", meta: { title: "Your Yard" } },
  {
    path: PATHS.MENU,
    name: "Menu",
    meta: { title: "Menu", description: "Settings, help, and account links." },
  },
  {
    path: PATHS.SKILL_TREE,
    name: "Skill Tree",
    meta: { title: "Skill Tree", description: "Train lifelong perks." },
  },
  { path: PATHS.ADOPT, name: "Adopt", meta: { title: "Adopt a Pup" } },
  { path: PATHS.LOGIN, name: "Login", meta: { title: "Login" } },
  { path: PATHS.SIGNUP, name: "Signup", meta: { title: "Sign up" } },

  {
    path: PATHS.ABOUT,
    name: "About",
    meta: { title: "About Doggerz", description: "How Doggerz works." },
  },
  {
    path: PATHS.FAQ,
    name: "FAQs",
    meta: { title: "FAQs", description: "Quick answers to common questions." },
  },
  {
    path: PATHS.HELP,
    name: "Help",
    meta: { title: "Help", description: "Support and troubleshooting." },
  },

  // Scenes
  {
    path: PATHS.RAINBOW_BRIDGE,
    name: "Rainbow Bridge",
    meta: {
      title: "Rainbow Bridge",
      description: "A calm place for remembrance.",
    },
  },
  {
    path: PATHS.CONTACT,
    name: "Contact",
    meta: { title: "Contact", description: "Reach the Doggerz team." },
  },
  {
    path: PATHS.DEVELOPERS,
    name: "Developers",
    meta: { title: "Developers", description: "Docs and integration notes." },
  },

  {
    path: PATHS.SETTINGS,
    name: "Settings",
    meta: { title: "Settings", description: "Personalize your pup." },
  },
  {
    path: PATHS.STORE,
    name: "Store",
    meta: { title: "Store", description: "Cosmetics and streak rewards." },
  },
  {
    path: PATHS.MEMORIES,
    name: "Memory Reel",
    meta: { title: "Memory Reel", description: "Moments and milestones." },
  },
  {
    path: PATHS.DREAMS,
    name: "Dream Journal",
    meta: { title: "Dream Journal", description: "What your pup dreams." },
  },
  {
    path: PATHS.POTTY,
    name: "Potty",
    meta: { title: "Potty", description: "Train habits and log progress." },
  },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    name: "Temperament Reveal",
    meta: { title: "Temperament", description: "Discover your pup's nature." },
  },

  // Policy/legal
  {
    path: PATHS.LEGAL,
    name: "Legal",
    meta: { title: "Legal", description: "Terms and policies." },
  },
  {
    path: PATHS.PRIVACY,
    name: "Privacy",
    meta: { title: "Privacy Policy", description: "How data is handled." },
  },
]);

/**
 * Primary nav links (header).
 * UX:
 * - Keep header minimal.
 * - Put FAQs in the footer.
 * - Put Help under Developers (footer).
 * NOTE: We intentionally exclude Adopt here per current UX direction.
 */
export const PRIMARY_TABS = Object.freeze([
  { path: PATHS.GAME, label: "Yard", icon: "yard" },
  { path: PATHS.SKILL_TREE, label: "Train", icon: "train" },
  { path: PATHS.STORE, label: "Store", icon: "store" },
  { path: PATHS.MEMORIES, label: "Memories", icon: "memories" },
  { path: PATHS.MENU, label: "Menu", icon: "menu" },
]);

export const MENU_DESTINATIONS = Object.freeze([
  {
    path: PATHS.SETTINGS,
    label: "Settings",
    detail: "Preferences and care tuning",
  },
  { path: PATHS.HELP, label: "Help", detail: "Support and troubleshooting" },
  { path: PATHS.ABOUT, label: "About", detail: "What Doggerz is building" },
  { path: PATHS.CONTACT, label: "Contact", detail: "Reach the Doggerz team" },
  { path: PATHS.PRIVACY, label: "Privacy", detail: "How data is handled" },
  { path: PATHS.LEGAL, label: "Legal", detail: "Terms and policies" },
  {
    path: PATHS.DEVELOPERS,
    label: "Developers",
    detail: "Dev notes and integration",
  },
  { path: PATHS.ADOPT, label: "Adopt", detail: "Start with a new pup" },
]);

export const PRIMARY_NAV = PRIMARY_TABS;

/** Fast lookups by path. */
export const ROUTE_BY_PATH = Object.freeze(
  routes.reduce((acc, r) => {
    acc[r.path] = r;
    return acc;
  }, {})
);

export function getRouteMeta(pathname) {
  return ROUTE_BY_PATH[pathname]?.meta || null;
}

export default routes;
