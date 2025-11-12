// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        "**/public/sprites/**",
        "**/public/assets/raw/**",
        "**/.vercel/**",
        "**/.git/**"
      ]
    },
    hmr: { overlay: false } // less noisy; fewer full reloads
  }
});