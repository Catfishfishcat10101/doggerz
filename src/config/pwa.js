// PWA-specific tuning shared between code and docs.
export const OFFLINE_URL = "/offline.html";
export const PRECACHE = Object.freeze([
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]);

// Runtime cache policies (descriptive, actual logic lives in your SW)
export const RUNTIME = Object.freeze({
  imageMaxEntries: 60,
  imageMaxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  apiMaxAgeSeconds: 60,                 // 1 minute for live game state, if you ever fetch
});
export const OFFLINE_FALLBACKS = Object.freeze({
  document: OFFLINE_URL,
  image: "/icons/icon-192.png",
});
export const OFFLINE_PAGE_TITLE = "Offline";
export const OFFLINE_PAGE_CONTENT = `
  <h1>You are offline</h1>
  <p>Sorry, but it seems you are not connected to the internet.</p>
  <p>Please check your connection and try again.</p>
`;
export const OFFLINE_PAGE_NAVIGATION_PROMPT = `
  <p>To navigate, please reconnect to the internet and try again.</p>
`;
export const OFFLINE_PAGE_STYLE = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue
", sans-serif;
    text-align: center;
    padding: 1em;
    color: #333;
    background-color: #f9f9f9;
  }
  h1 {
    color: #d32f2f;
  }
  a {
    color: #1976d2;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;