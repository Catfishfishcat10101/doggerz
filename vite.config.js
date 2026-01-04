/** @format */

// vite.config.js (CommonJS)
// Note: some Vite plugins (e.g. @vitejs/plugin-react) are ESM-only.
// Requiring them from CJS can trigger Node's experimental "require(ESM)" warning.
// To keep a single config file *and* avoid the warning, we use dynamic import
// and export an async config factory.

const path = require('node:path');
const pkg = require('./package.json');

function Visualizer() {
  if (process.env.ANALYZE !== '1') return null;

  // Lazy-load so normal builds don't pay the require cost (and to avoid dependency issues if removed).
  const vizImport = require('rollup-plugin-visualizer');
  const visualizer = vizImport.visualizer || vizImport;

  return visualizer({
    filename: 'dist/stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
    open: false,
  });
}

/** @returns {Promise<import('vite').UserConfig>} */
module.exports = async () => {
  const reactModule = await import('@vitejs/plugin-react');
  const react = reactModule.default || reactModule;

  return {
    plugins: [react(), Visualizer()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id || !id.includes('node_modules')) return;

            // Keep heavyweight libraries in stable, cacheable chunks.
            if (id.includes('react-dom') || id.includes('/react/'))
              return 'vendor-react';
            if (id.includes('react-router') || id.includes('react-router-dom'))
              return 'vendor-router';
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux'))
              return 'vendor-redux';
            if (id.includes('/firebase/')) return 'vendor-firebase';

            return 'vendor';
          },
        },
      },
    },
  };
};
