import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Capacitor Android runs inside the system WebView, which can lag behind
    // desktop evergreen browsers. Transpile below ES2020 so parse-time
    // features like optional chaining do not blank-screen older phones.
    target: "es2019",
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom")) return "router-vendor";
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux"))
              return "state-vendor";
            if (id.includes("@tanstack/react-query")) return "query-vendor";
            if (id.includes("firebase")) return "firebase-vendor";
            if (id.includes("pixi.js") || id.includes("@pixi/react"))
              return "pixi-vendor";
            if (
              id.includes("@capacitor") ||
              id.includes("@revenuecat/purchases-capacitor")
            ) {
              return "mobile-vendor";
            }
            if (id.includes("react") || id.includes("react-dom"))
              return "react-vendor";
          }
          return undefined;
        },
      },
    },
  },
});
