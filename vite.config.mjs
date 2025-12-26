/** @format */

// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Vite config runs in Node. When this file is treated as ESM, __dirname is not defined.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  const plugins = [react()];

  if (process.env.ANALYZE === '1') {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: false,
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
