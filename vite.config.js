// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  // Load only env vars that start with VITE_ or DOGGERZ_ (both allowed)
  const env = loadEnv(mode, process.cwd(), ["VITE_", "DOGGERZ_"]);

  return {
    plugins: [react(), tailwind()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@features": path.resolve(__dirname, "src/features"),
        "@components": path.resolve(__dirname, "src/components"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@redux": path.resolve(__dirname, "src/redux"),
      },
      // Avoid “Invalid hook call” by ensuring a single React instance
      dedupe: ["react", "react-dom"],
    },

    base: "/", // ✅ Firebase Hosting at domain root. (For GitHub Pages use '/doggerz/')

    css: {
      devSourcemap: true, // easier debugging in dev
    },

    server: {
      host: true,
      port: 5173,
      strictPort: true,
      open: true,
    },

    preview: {
      host: true,
      port: 5174,
    },

    build: {
      target: "es2020",
      outDir: "dist",
      sourcemap: true, // handy for prod error traces
      rollupOptions: {
        output: {
          // Split big deps for better long-term caching with your immutable headers
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
            "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore"],
          },
        },
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@reduxjs/toolkit",
        "react-redux",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
      ],
    },

    // Expose both prefixes so you can keep using VITE_* now,
    // and DOGGERZ_* later if you want cleaner env names.
    envPrefix: ["VITE_", "DOGGERZ_"],

    // Example: use __APP_VERSION__ inside your app footer/debug HUD
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});