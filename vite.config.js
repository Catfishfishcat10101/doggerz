// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

// __dirname is undefined in ESM, reconstruct it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",

        // Use paths relative to /public and the final /dist
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
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
          ]
        },

        workbox: {
          // Add mp3 for your bark SFX and friends
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,mp3}"],
          navigateFallback: "offline.html",
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // images (sprites, backgrounds)
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-images",
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            },
            {
              // audio (barks, SFX)
              urlPattern: ({ request }) => request.destination === "audio",
              handler: "CacheFirst",
              options: {
                cacheName: "doggerz-audio",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
          ]
        },

        // Flip on if you want to test SW behavior during dev
        // devOptions: { enabled: false }
      })
    ],

    resolve: {
      // ESM-safe alias
      alias: { "@": path.resolve(__dirname, "src") }
    },

    server: { port: 5173, open: false, strictPort: true },

    preview: { port: 5173 },

    build: {
      sourcemap: isDev ? true : false,
      outDir: "dist"
    }
  };
});
// vite.config.js