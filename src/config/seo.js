import * as ENV from "./env.js";

export const SITE_NAME = ENV.APP_NAME || "Doggerz";
export const ORIGIN = import.meta.env.VITE_SITE_ORIGIN || "http://localhost:5173";
export const DEFAULT_TITLE = "Adopt your pixel pup | Doggerz";
export const DEFAULT_DESC =
  "Raise a pixel pup. Feed, play, train, and make choices that shape behavior. Offline-ready PWA.";
export const DEFAULT_IMAGE = `${ORIGIN}/icons/icon-512.png`;
export const TWITTER = "@Doggerz_app"; // update when you own it

export const ROBOTS = ENV.PROD ? "index,follow" : "noindex,nofollow";

export function metaForRoute({ title, description, image, url, canonical } = {}) {
  const t = title ? `${title} • ${SITE_NAME}` : DEFAULT_TITLE;
  const d = description || DEFAULT_DESC;
  const i = image || DEFAULT_IMAGE;
  const u = url || ORIGIN;

  return {
    title: t,
    description: d,
    og: { title: t, description: d, image: i, url: u, site_name: SITE_NAME, type: "website" },
    twitter: { card: "summary_large_image", site: TWITTER, title: t, description: d, image: i },
    robots: ROBOTS,
    canonical: canonical || u,
  };
}
