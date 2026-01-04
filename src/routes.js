/** @format */

// src/routes.js
// Centralized path constants + route metadata (kept JSX-free so it can be imported anywhere).

export const PATHS = Object.freeze({
  HOME: '/',
  ADOPT: '/adopt',
  GAME: '/game',
  SKILL_TREE: '/skill-tree',
  SPRITE_TEST: '/sprite-test',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ABOUT: '/about',
  SETTINGS: '/settings',
  STORE: '/store',
  CONTACT: '/contact',
  LEGAL: '/legal',
  PRIVACY: '/privacy',
  POTTY: '/potty',
  TEMPERAMENT_REVEAL: '/temperament-reveal',
  DEVELOPERS: '/developers',
  FAQ: '/faq',
  HELP: '/help',

  BADGES: '/badges',
  MEMORIES: '/memories',
  DREAMS: '/dreams',

  // Story / scenes
  RAINBOW_BRIDGE: '/rainbow-bridge',

  // Optional explicit not-found route (AppRouter currently uses "*"; this is useful for redirects)
  NOT_FOUND: '/404',
});

/**
 * Route metadata for UI (menus, document titles, etc).
 * This file is intentionally JSX-free so it can be imported anywhere.
 */
export const routes = Object.freeze([
  { path: PATHS.HOME, name: 'Home', meta: { title: 'Doggerz' } },
  { path: PATHS.GAME, name: 'Game', meta: { title: 'Your Yard' } },
  { path: PATHS.SKILL_TREE, name: 'Skill Tree', meta: { title: 'Skill Tree' } },
  { path: PATHS.ADOPT, name: 'Adopt', meta: { title: 'Adopt a Pup' } },
  { path: PATHS.LOGIN, name: 'Login', meta: { title: 'Login' } },
  { path: PATHS.SIGNUP, name: 'Signup', meta: { title: 'Sign up' } },

  { path: PATHS.ABOUT, name: 'About', meta: { title: 'About Doggerz' } },
  { path: PATHS.FAQ, name: 'FAQs', meta: { title: 'FAQs' } },
  { path: PATHS.HELP, name: 'Help', meta: { title: 'Help' } },

  // Scenes
  {
    path: PATHS.RAINBOW_BRIDGE,
    name: 'Rainbow Bridge',
    meta: { title: 'Rainbow Bridge' },
  },
  { path: PATHS.CONTACT, name: 'Contact', meta: { title: 'Contact' } },
  { path: PATHS.DEVELOPERS, name: 'Developers', meta: { title: 'Developers' } },

  { path: PATHS.SETTINGS, name: 'Settings', meta: { title: 'Settings' } },
  { path: PATHS.STORE, name: 'Store', meta: { title: 'Store' } },
  { path: PATHS.BADGES, name: 'Badges', meta: { title: 'Badges' } },
  { path: PATHS.MEMORIES, name: 'Memory Reel', meta: { title: 'Memory Reel' } },
  {
    path: PATHS.DREAMS,
    name: 'Dream Journal',
    meta: { title: 'Dream Journal' },
  },
  { path: PATHS.POTTY, name: 'Potty', meta: { title: 'Potty' } },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    name: 'Temperament Reveal',
    meta: { title: 'Temperament' },
  },

  // Policy/legal
  { path: PATHS.LEGAL, name: 'Legal', meta: { title: 'Legal' } },
  { path: PATHS.PRIVACY, name: 'Privacy', meta: { title: 'Privacy Policy' } },
]);

/**
 * Primary nav links (header).
 * UX:
 * - Keep header minimal.
 * - Put FAQs in the footer.
 * - Put Help under Developers (footer).
 * NOTE: We intentionally exclude Adopt here per current UX direction.
 */
export const PRIMARY_NAV = Object.freeze([
  { path: PATHS.GAME, label: 'Game' },
  { path: PATHS.SKILL_TREE, label: 'Skill Tree' },
  { path: PATHS.ABOUT, label: 'About' },
  { path: PATHS.CONTACT, label: 'Contact Us' },
  // Secondary links (policy/dev) are in the footer now.
]);

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
