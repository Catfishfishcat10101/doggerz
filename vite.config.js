import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reconstruct __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "offline.html",
          "favicon.png",
          "icons/icon-192.png",
          "icons/icon-512.png",
        ],
        manifest: {
          name: "Doggerz",
          short_name: "Doggerz",
          description: "Adopt a pixel pup and raise it!",
          theme_color: "#111827",
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
      }),
    ],
    server: { open: true, port: 5173 },
  };
});
