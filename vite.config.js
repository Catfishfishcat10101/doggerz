// vite.config.js
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

<<<<<<< HEAD
// Determine base path (needed for GitHub Pages under /<repo>/)
const repoName =
  process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split("/")[1]
    ? process.env.GITHUB_REPOSITORY.split("/")[1]
    : "doggerz";
const isCI = !!process.env.GITHUB_ACTIONS;
const base = isCI ? `/${repoName}/` : "/";

// Keep PWA scope aligned with base
const pwaScope = base;
const pwaStartUrl = base;

export default defineConfig({
=======
// If you deploy to GitHub Pages, keep this. Otherwise "/" is fine.
const repo =
  process.env.GITHUB_REPOSITORY?.split("/")[1] || "doggerz";
const base = process.env.GITHUB_ACTIONS ? `/${repo}/` : "/";

export default {
>>>>>>> 9fc84e4b (updated)
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
<<<<<<< HEAD
      includeAssets: [
        // these are served from /public; base is applied at build time
        "offline.html",
        "favicon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
      ],
=======
      includeAssets: ["offline.html", "favicon.png", "icons/icon-192.png", "icons/icon-512.png"],
>>>>>>> 9fc84e4b (updated)
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
<<<<<<< HEAD
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
=======
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
>>>>>>> 9fc84e4b (updated)
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "offline.html",
<<<<<<< HEAD
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
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: { port: 5173, open: false },
});
=======
        cleanupOutdatedCaches: true
      }
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
>>>>>>> 9fc84e4b (updated)
