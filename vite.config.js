import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // we'll supply /public/manifest.webmanifest
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}"]
      }
    })
  ],
  // For Firebase Hosting at site root, leave base as "/"
  // base: "/",
});
