// src/accessibility/axeSetup.js
// Dev-only accessibility auditing setup for Doggerz.
// This file is dynamically imported in main.jsx during development.
// If you want to use axe-core, install it and uncomment the code below.

// Example setup (uncomment if axe-core is installed):
// import axe from 'axe-core';
// axe.run(document, {}, (err, results) => {
//   if (err) throw err;
//   console.log('[a11y] axe results:', results);
// });

// For now, this is a stub to prevent import errors.
export default function setupA11y() {
  // No-op
}
