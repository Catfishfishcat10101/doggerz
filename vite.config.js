//vite.config.js
/** @format */

const path = require("node:path");
const pkg = require("./package.json");

async function loadVisualizer() {
  if (process.env.ANALYZE !== "1") return null;

  const candidates = ["rollup-plugin-visualizer", "@rollup/plugin-visualizer"];
  for (const pkgName of candidates) {
    try {
      const mod = await import(pkgName);
      const visualizer = /** @type {any} */ (
        mod?.visualizer || mod?.default || mod
      );
      if (typeof visualizer === "function") {
        return visualizer({
          filename: "dist/stats.html",
          template: "treemap",
          gzipSize: true,
          brotliSize: true,
          open: false,
        });
      }
    } catch {
      // try next candidate
    }
  }

  console.warn(
    "[vite] Visualizer plugin not installed; skipping bundle report."
  );
  return null;
}

/**
 * @returns {Promise<import('vite').UserConfig>}
 * @typedef {import('vite').UserConfig} ViteUserConfig
 */
module.exports = async () => {
  let react;
  try {
    const reactModule = await import("@vitejs/plugin-react");
    react = /** @type {any} */ (reactModule.default || reactModule);
  } catch {
    throw new Error(
      "Cannot find module '@vitejs/plugin-react'. Please install it with 'npm install @vitejs/plugin-react' or 'yarn add @vitejs/plugin-react'."
    );
  }

  const visualizer = await loadVisualizer();

  const inNodeModules = (id) =>
    typeof id === "string" && id.includes("node_modules");
  const hasPkg = (id, pkg) =>
    id.includes(`/node_modules/${pkg}/`) ||
    id.includes(`\\node_modules\\${pkg}\\`);
  const hasAnyPkg = (id, pkgs) => pkgs.some((p) => hasPkg(id, p));

  return {
    plugins: [react(), visualizer].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!inNodeModules(id)) return;

            // Avoid circular chunk graphs by keeping React's internal deps together.
            if (
              hasAnyPkg(id, [
                "react",
                "react-dom",
                "scheduler",
                "use-sync-external-store",
                "react-is",
              ])
            ) {
              return "vendor-react";
            }

            // Keep common heavy libs in stable chunks.
            if (hasAnyPkg(id, ["react-router", "react-router-dom"])) {
              return "vendor-router";
            }
            if (hasAnyPkg(id, ["@reduxjs/toolkit", "react-redux", "redux"])) {
              return "vendor-redux";
            }
            if (hasAnyPkg(id, ["firebase"])) return "vendor-firebase";
            if (hasAnyPkg(id, ["pixi.js", "@pixi/react"])) return "vendor-pixi";

            return "vendor";
          },
        },
      },
    },
  };
};
