// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpful: keep this in sync with your actual "public/" assets
const PWA_INCLUDE_ASSETS = [
  "offline.html",
  "favicon.ico",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

export default defineConfig({
  // If you deploy under a subpath (e.g. /doggerz/ on GitHub Pages), change base accordingly.
  base: "/",
  plugins: [
    react({
      // Recommended flags for React 18; keeps dev overlay fast
      jsxImportSource: "react",
      babel: {
        // keep defaults; plugin handles the JSX transform
      },
      fastRefresh: true,
    }),

    // Progressive Web App
    VitePWA({
      registerType: "autoUpdate",
      // Generate a Workbox service worker at build time
      workbox: {
        // Ensure HTML/CSS/JS and common assets are picked up; this avoids your prior "non-precached-url" issues
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        sourcemap: false,
      },
      includeAssets: PWA_INCLUDE_ASSETS,
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Adopt a pixel pup and raise it!",
        start_url: "/",
        scope: "/",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          // optional maskable version if you have it:
          // { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      // Keep the SW off in dev; let Vite preview serve your built SW
      devOptions: { enabled: false },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // Vite defaults are fine; explicit extensions help editor tooling
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },

  // Dev server ergonomics
  server: {
    host: true, // listen on LAN
    port: 5173,
    open: false,
  },

  // Preview server (after `npm run build && npm run preview`)
  preview: {
    host: true,
    port: 4173,
    open: false,
  },

  // Build ergonomics
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    cssTarget: "chrome90",
    // Tighten chunking if you want smaller initial payloads later
    rollupOptions: {
      output: {
        // manualChunks: { firebase: ["firebase/app","firebase/auth","firebase/firestore"] },
      },
    },
  },

  // Optimize deps for faster cold starts
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
    ],
  },

  // Use modern JS in workers if you ever add them
  worker: {
    format: "es",
  },
});
