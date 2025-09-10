// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      VitePWA({
        // service worker registration
        registerType: "autoUpdate",
        injectRegister: "auto",
        devOptions: { enabled: isDev },

        // files copied from /public at build (put these paths under /public)
        includeAssets: [
          "/favicon.png",
          "/icons/icon-192.png",
          "/icons/icon-192-maskable.png",
          "/icons/icon-512.png",
          "/icons/icon-512-maskable.png",
          "/offline.html"
        ],

        // inlined manifest (no external file needed)
        manifest: {
          name: "Doggerz",
          short_name: "Doggerz",
          description: "Adopt a pixel pup and shape its behavior.",
          start_url: "/",
          display: "standalone",
          background_color: "#0b0d10",
          theme_color: "#12161b",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable any" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable any" }
          ]
        },

        // Workbox config
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          globPatterns: ["**/*.{js,css,html,svg,png,webp,jpg,woff2,mp3}"],
          navigateFallback: "/index.html",

          runtimeCaching: [
            // images: keep fast & fresh
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-images",
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 },
                cacheableResponse: { statuses: [0, 200] }
              }
            },

            // audio (barks/FX)
            {
              urlPattern: ({ request }) => request.destination === "audio",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-audio",
                expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 3600 }
              }
            },

            // app pages (game shell)
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin &&
                (url.pathname === "/" || url.pathname.startsWith("/game")),
              handler: "NetworkFirst",
              options: {
                cacheName: "doggerz-pages",
                networkTimeoutSeconds: 3
              }
            },

            // Google Fonts
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts",
                expiration: { maxEntries: 36, maxAgeSeconds: 365 * 24 * 3600 }
              }
            }
          ]
        }
      })
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@components": path.resolve(__dirname, "src/components"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@redux": path.resolve(__dirname, "src/redux"),
        "@features": path.resolve(__dirname, "src/features")
      }
    },

    base: "/"
  };
});