// vite.config.js
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

<<<<<<< Updated upstream
// For GitHub Pages: base must be "/<repo>/". Locally it's "/".
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "doggerz";
const base = process.env.GITHUB_ACTIONS ? `/${repo}/` : "/";

export default {
=======
const repoName =
  process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split("/")[1]
    ? process.env.GITHUB_REPOSITORY.split("/")[1]
    : "doggerz"; // fallback
// If running in GitHub Actions, serve from /repo/; otherwise use root.
const isCI = !!process.env.GITHUB_ACTIONS;
const base = isCI ? `/${repoName}/` : "/";

// Important: use the same base for PWA manifest start_url/scope
const pwaScope = base;
const pwaStartUrl = base;

export default defineConfig({
>>>>>>> Stashed changes
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
<<<<<<< Updated upstream
      includeAssets: ["offline.html", "favicon.png", "icons/icon-192.png", "icons/icon-512.png"],
=======
      includeAssets: [
        `${base}offline.html`,
        `${base}favicon.png`,
        `${base}icons/icon-192.png`,
        `${base}icons/icon-512.png`,
      ],
>>>>>>> Stashed changes
      manifest: {
        name: "Doggerz",
        short_name: "Doggerz",
        description: "Adopt a pixel pup and raise it!",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
<<<<<<< Updated upstream
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
=======
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
