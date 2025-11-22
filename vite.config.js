import { defineConfig } from "vite";
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { createRequire } from 'node:module';

// Use createRequire to load JSON in ESM compatibly across Node versions
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Disable SW in dev to avoid intercepting Vite assets
      devOptions: { enabled: false },
      manifest: false, // use public/manifest.webmanifest
      includeAssets: ['icons/*.svg', 'sprites/*', 'audio/*'],
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/sprites/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'doggerz-sprites',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'doggerz-audio',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) =>
              /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|ttf|otf)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'doggerz-static' },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { host: true, port: 5173, open: true, cors: true },
});
