/** @format */

// src/routes.js
// Centralized path constants + route metadata (kept JSX-free so it can be imported anywhere).

export const PATHS = Object.freeze({
  HOME: '/',
  ADOPT: '/adopt',
  GAME: '/game',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ABOUT: '/about',
  SETTINGS: '/settings',
  CONTACT: '/contact',
  LEGAL: '/legal',
  PRIVACY: '/privacy',
  POTTY: '/potty',
  TEMPERAMENT_REVEAL: '/temperament-reveal',
  DEVELOPERS: '/developers',
  FAQ: '/faq',
  HELP: '/help',

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
  { path: PATHS.ADOPT, name: 'Adopt', meta: { title: 'Adopt a Pup' } },
  { path: PATHS.LOGIN, name: 'Login', meta: { title: 'Login' } },
  { path: PATHS.SIGNUP, name: 'Signup', meta: { title: 'Sign up' } },

  { path: PATHS.ABOUT, name: 'About', meta: { title: 'About Doggerz' } },
  { path: PATHS.FAQ, name: 'FAQs', meta: { title: 'FAQs' } },
  { path: PATHS.HELP, name: 'Help', meta: { title: 'Help' } },
  { path: PATHS.CONTACT, name: 'Contact', meta: { title: 'Contact' } },
  { path: PATHS.DEVELOPERS, name: 'Developers', meta: { title: 'Developers' } },

  { path: PATHS.SETTINGS, name: 'Settings', meta: { title: 'Settings' } },
  { path: PATHS.POTTY, name: 'Potty', meta: { title: 'Potty' } },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    name: 'Temperament Reveal',
    meta: { title: 'Temperament' },
  },

  // Policy/legal
  { path: PATHS.LEGAL, name: 'Legal', meta: { title: 'Legal' } },
  { path: PATHS.PRIVACY, name: 'Policy', meta: { title: 'Policy' } },
]);

/**
 * Primary nav links (matches current header: Game/About/FAQs/Contact/Help/Developers/Policy).
 * NOTE: We intentionally exclude Adopt here per current UX direction.
 */
export const PRIMARY_NAV = Object.freeze([
  { path: PATHS.GAME, label: 'Game' },
  { path: PATHS.ABOUT, label: 'About' },
  { path: PATHS.FAQ, label: 'FAQs' },
  { path: PATHS.CONTACT, label: 'Contact Us' },
  { path: PATHS.HELP, label: 'Help' },
  { path: PATHS.DEVELOPERS, label: 'Developers' },
  { path: PATHS.PRIVACY, label: 'Policy' },
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
