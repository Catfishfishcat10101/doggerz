// src/nav.js
export const NAV = [
  { label: "Home", to: "/" },
  { label: "Skill Tree", to: "/skill-tree" },
  { label: "Back to Yard", to: "/game" },
  { label: "Settings", to: "/settings" },
];

// Back-compat: some components import the nav array as a default export.
export default NAV;
