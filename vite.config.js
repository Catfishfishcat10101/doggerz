// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer"; // optional

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep this EXACTLY in sync with files inside /public
const PWA_INCLUDE_ASSETS = [
  "offline.html",
  "favicon.ico",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// Set ANALYZE=true npm run build to emit dist/stats.html
const withViz = process.env.ANALYZE === "true";

export default defineConfig({
  base: "/",
  plugins: [
    react({ fastRefresh: true }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
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
        display: "standalone",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      devOptions: { enabled: false },
    }),
    withViz &&
      visualizer({
        filename: "dist/stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },

  server: { host: true, port: 5173, open: false },
  preview: { host: true, port: 4173, open: false },

  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    cssTarget: "chrome90",
    chunkSizeWarningLimit: 900, // hush the noise; we’re also splitting vendors
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        // Smarter vendor slicing -> better caching + smaller initial payload
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react")) return "react";
          if (id.includes("@reduxjs") || id.includes("react-redux")) return "redux";
          if (id.includes("firebase")) return "firebase";
        },
      },
    },
    // Trim console/debugger in prod builds (optional, small win)
    minify: "esbuild",
  },

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
      "firebase/storage",
    ],
  },

  worker: { format: "es" },
});
