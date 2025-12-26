// src/nav.js
export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Adopt', to: '/adopt' },
  { label: 'Play', to: '/game' },
  { label: 'Help', to: '/help' },
  { label: 'Settings', to: '/settings' },
  { label: 'About', to: '/about' },
];

// Back-compat: some components import the nav array as a default export.
export default NAV;
