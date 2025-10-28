import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    // PWA: generates sw + manifest; enables virtual:pwa-register
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Virtual dog simulator — train, play, collect.",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache common static assets; adjust as needed
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallbackDenylist: [/^\/__/, /\/api\//],
      },
      devOptions: {
        enabled: true, // allow SW in dev for testing; set false if it annoys you
      },
    }),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },

  envPrefix: "VITE_",

  server: {
    host: true,
    port: 5173,
    open: false,
  },

  preview: {
    host: true,
    port: 4173,
  },

  optimizeDeps: {
    include: [
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/analytics",
    ],
  },

  build: {
    target: "es2022",
    sourcemap: false,
    outDir: "dist",
    assetsDir: "assets",
  },

  // Some libs probe process.env; keep it benign
  define: {
    "process.env": {},
  },
});
