// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    host: true, // allows LAN / Android device access
  },

  build: {
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
  },
});