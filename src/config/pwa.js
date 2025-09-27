import { APP_NAME, DEFAULT_DESCRIPTION } from "./constants.js";
export const PWA = Object.freeze({
  name: APP_NAME,
  shortName: APP_NAME,
  description: DEFAULT_DESCRIPTION,
  startUrl: "/",
  scope: "/",
  display: "standalone",
  themeColor: "#0f172a",
  backgroundColor: "#0f172a",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
});
