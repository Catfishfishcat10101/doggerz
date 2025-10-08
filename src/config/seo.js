// src/config/seo.js
export const APP_COPYRIGHT = "Doggerz © 2025 — No grind. Just vibes.";
export const SUPPORT_EMAIL = "support@doggerz.app";

export function metaForRoute({ title, description, url, image } = {}) {
  const t = title ? `${title} • Doggerz` : "Doggerz";
  const d = description || "Adopt a pixel pup. Train, bond, and vibe — offline-ready PWA.";
  const i = image || "/icons/icon-512.png";
  const u = url || (typeof window !== "undefined" ? window.location.href : "");
  return {
    title: t,
    description: d,
    og: {
      title: t, description: d, image: i, url: u,
      site_name: "Doggerz", type: "website",
    },
    twitter: { card: "summary_large_image", title: t, description: d, image: i },
    canonical: u,
  };
}
