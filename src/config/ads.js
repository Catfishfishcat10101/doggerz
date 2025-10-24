/**
 * Doggerz – Ads config & helpers (web)
 * Keeps all ad toggles & placements in one place.
 * Uses Google AdSense style slots; safe no-op in dev or when disabled.
 */

const isDev = import.meta.env.DEV;
const ENABLE_ADS = String(import.meta.env.VITE_ENABLE_ADS || "").toLowerCase() === "true" && !isDev;
const ADS_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || ""; // e.g. ca-pub-xxxxxxxxxxxxxxx

// Central place to name your placements
export const AD_PLACEMENTS = {
  HOME_TOP: { slot: import.meta.env.VITE_ADSENSE_SLOT_HOME_TOP || "" },
  GAME_FOOTER: { slot: import.meta.env.VITE_ADSENSE_SLOT_GAME_FOOTER || "" },
  SHOP_SIDEBAR: { slot: import.meta.env.VITE_ADSENSE_SLOT_SHOP_SIDEBAR || "" },
};

// Simple frequency cap per route (localStorage)
const CAP_KEY = "doggerz:adCap";
const CAP_WINDOW_MIN = 8; // minimum minutes between serving same placement

function nowMin() {
  return Math.floor(Date.now() / 60000);
}

function readCap() {
  try {
    return JSON.parse(localStorage.getItem(CAP_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCap(cap) {
  try {
    localStorage.setItem(CAP_KEY, JSON.stringify(cap));
  } catch {}
}

export function canServe(placementKey) {
  if (!ENABLE_ADS || !ADS_CLIENT) return false;
  const cap = readCap();
  const last = cap[placementKey] || 0;
  return nowMin() - last >= CAP_WINDOW_MIN;
}

export function markServed(placementKey) {
  const cap = readCap();
  cap[placementKey] = nowMin();
  writeCap(cap);
}

let scriptInjected = false;

export function initAds() {
  if (!ENABLE_ADS || !ADS_CLIENT || scriptInjected) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADS_CLIENT)}`;
  document.head.appendChild(s);
  scriptInjected = true;
}

/**
 * Mount an AdSense slot into a container element.
 * Example usage in a component:
 *   const ref = useRef(null);
 *   useEffect(() => mountAdSlot(ref.current, "GAME_FOOTER"), []);
 */
export function mountAdSlot(container, placementKey) {
  if (!container) return;
  if (!ENABLE_ADS || !ADS_CLIENT) {
    // keep layout stable
    container.innerHTML = '<div style="min-height:90px"></div>';
    return;
  }
  if (!canServe(placementKey)) {
    container.innerHTML = ""; // skip for frequency cap
    return;
  }

  const placement = AD_PLACEMENTS[placementKey] || {};
  const slot = placement.slot || "";

  const ad = document.createElement("ins");
  ad.className = "adsbygoogle";
  ad.style.display = "block";
  ad.setAttribute("data-ad-client", ADS_CLIENT);
  if (slot) ad.setAttribute("data-ad-slot", slot);
  ad.setAttribute("data-ad-format", "auto");
  ad.setAttribute("data-full-width-responsive", "true");

  container.innerHTML = "";
  container.appendChild(ad);

  // queue render
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    markServed(placementKey);
  } catch {
    // ignore
  }
}

/**
 * Global “should we even show ads?” gate for UI logic.
 * Example: hide ads for pro users/PWA/fullscreen game, etc.
 */
export function shouldShowAds({ isProUser = false, isStandalonePWA = false } = {}) {
  if (isProUser) return false;
  if (isStandalonePWA) return false;
  return ENABLE_ADS && !!ADS_CLIENT;
}

/**
 * Minimal CSS you might want (put these in your global.css if desired):
 *
 * .ad-wrap { min-height: 90px; }
 */
