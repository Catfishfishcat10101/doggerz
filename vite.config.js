import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/favicon.png", "/icons/icon-192.png", "/icons/icon-512.png"],
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        theme_color: "#0b1220",
        background_color: "#0b1220",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "doggerz-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 3600 }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/game"),
            handler: "NetworkFirst",
            options: { cacheName: "doggerz-pages" }
          }
        ]
      }
    })
  ]
});