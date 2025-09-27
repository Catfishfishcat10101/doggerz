const flag = (key, def = false) => (import.meta.env[key] ?? (def ? "1" : "0")) === "1";
export const FLAGS = Object.freeze({
  showShop: flag("VITE_FLAG_SHOP", true),
  enableAnalytics: Boolean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
  lazyFirebaseActions: true,
  prefetchGameOnSplash: true,
  devDebugUI: flag("VITE_FLAG_DEBUG_UI", false),
});
