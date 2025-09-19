import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

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
      workbox: {
        navigateFallback: "/offline.html",
        globPatterns: ["**/*.{js,css,html,svg,png,mp3,woff2}"]
      }
    })
  ]
});
