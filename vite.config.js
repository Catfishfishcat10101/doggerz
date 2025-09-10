// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "/favicon.png",
        "/icons/icon-192.png",
        "/icons/icon-512.png"
      ],
      // Supply a manifest (keep it simple for now)
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Adopt a pixel pup and raise it!",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      // Use Workbox only for runtime stuff and provide a safe offline fallback.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/offline.html", // served when offline
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "doggerz-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],

  // IMPORTANT: do NOT add build.rollupOptions.input here.
  // Vite will treat ONLY /index.html as the app entry.

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  // Optional: quiet some noisy warnings
  server: { port: 5173, open: false }
});