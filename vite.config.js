import path from "path";
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Doggerz',
        short_name: 'Doggerz',
        description: 'Adopt a pixel pup and shape its life with your choices!',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220', // match your :root --bg
        theme_color: '#fbbf24', // amber-400 (you use this a lot)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // for Android/iOS adaptive icons
          },
        ],
      },
      devOptions: {
        enabled: true, // enables service worker in dev for testing
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
