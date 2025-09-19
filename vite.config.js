// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // expose VITE_* vars if needed

  return {
    plugins: [
      react(),

      // --- PWA (optional but recommended) ---
      // Keep manifest in /public/manifest.webmanifest so we set manifest:false.
      // Icons should live under /public/icons/.
      VitePWA({
        registerType: "autoUpdate",
        manifest: false,
        includeAssets: [
          "favicon.png",
          "icons/icon-192.png",
          "icons/icon-512.png",
        ],
        workbox: {
          // Cache typical asset types; tweak as needed
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webp,txt}"],
          // Don’t aggressively cache index/manifest; your firebase.json headers handle no-cache
        },
        devOptions: {
          enabled: false, // set true to test SW in dev (rarely needed)
        },
      }),
    ],

    // Nice-to-have define: use in app via __APP_VERSION__
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.0"),
    },

    resolve: {
      alias: {
        "@": "/src",
      },
    },

    server: {
      port: 5173,
      open: true,
      strictPort: false, // let Vite auto-bump if TIME_WAIT grabs 5173
      host: true,        // enable LAN access if you want to test on phone
    },

    preview: {
      port: 4173,
      host: true,
      open: true,
    },

    build: {
      target: "esnext",
      sourcemap: true,   // helpful for prod debugging; flip to false if you want smaller bundles
      outDir: "dist",
      assetsDir: "assets",
    },

    // Helps avoid first-run “re-optimizing” churn on Windows
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
      ],
    },
  };
});
