// src/nav.js
export const NAV = [
  { label: "Home", to: "/" },
  { label: "Skill Tree", to: "/skill-tree" },
  { label: "Back to Yard", to: "/game" },
  { label: "Settings", to: "/settings" },
  { label: "Store", to: "/store" },
  { label: "Badges", to: "/badges" },
];

export const NAV_FOOTER = [
  { label: "FAQ", to: "/faq" },
  { label: "Privacy", to: "/privacy" },
  { label: "Legal", to: "/legal" },
  { label: "Contact", to: "/contact" },
];

export function getNavByLabel(label) {
  const key = String(label || "").toLowerCase();
  return NAV.find((item) => String(item.label || "").toLowerCase() === key) || null;
}

// Back-compat: some components import the nav array as a default export.
export default NAV;
