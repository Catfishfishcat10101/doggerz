// vite.config.js
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// For GitHub Pages: base must be "/<repo>/". Locally it's "/".
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "doggerz";
const base = process.env.GITHUB_ACTIONS ? `/${repo}/` : "/";

export default {
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["offline.html", "favicon.png", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Adopt a pixel pup and raise it!",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "offline.html",
        cleanupOutdatedCaches: true
      }
      // devOptions: { enabled: true }, // only if you *really* want SW in dev
    })
  ],
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") }
  },
  server: {
    port: 5173,
    open: false,
    hmr: { protocol: "ws", host: "localhost", port: 5173, clientPort: 5173 }
  }
};
