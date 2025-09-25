// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

<<<<<<< Updated upstream
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
=======
const repoName =
  process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split("/")[1]
    ? process.env.GITHUB_REPOSITORY.split("/")[1]
    : "doggerz"; // fallback
// If running in GitHub Actions, serve from /repo/; otherwise use root.
const isCI = !!process.env.GITHUB_ACTIONS;
const base = isCI ? `/${repoName}/` : "/";
>>>>>>> Stashed changes

// Important: use the same base for PWA manifest start_url/scope
const pwaScope = base;
const pwaStartUrl = base;

<<<<<<< Updated upstream
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "offline.html",
          "favicon.png",
          "icons/icon-192.png",
          "icons/icon-512.png"
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
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2,mp3}"],
          navigateFallback: "offline.html",
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-images",
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            },
            {
              urlPattern: ({ request }) => request.destination === "audio",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-audio",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            },
            {
              // HTML/doc navigations: stay fresh but resilient
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "doggerz-pages",
                networkTimeoutSeconds: 4
              }
            }
          ]
        },
        // Enable if you want SW active in dev (rarely needed):
        // devOptions: { enabled: true }
      })
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") }
    },
    server: { port: 5173, open: false, strictPort: true },
    preview: { port: 5173 },
    build: { sourcemap: isDev, outDir: "dist" }
  };
});
=======
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        `${base}offline.html`,
        `${base}favicon.png`,
        `${base}icons/icon-192.png`,
        `${base}icons/icon-512.png`,
      ],
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Adopt a pixel pup and raise it!",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        start_url: pwaStartUrl,
        scope: pwaScope,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${base}icons/icon-512.png`, sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: `${base}offline.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "doggerz-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      // devOptions: { enabled: true },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, open: false },
});
>>>>>>> Stashed changes
