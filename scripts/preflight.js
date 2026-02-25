#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const REQUIRED_PATHS = [
  "package.json",
  "src/main.jsx",
  "public/manifest.webmanifest",
  "src/features/game/MainGame.jsx",
  "src/features/game/EnvironmentScene.jsx",
];

function exists(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  try {
    return fs.existsSync(absolutePath);
  } catch {
    return false;
  }
}

function main() {
  const missing = REQUIRED_PATHS.filter((relativePath) => !exists(relativePath));

  if (missing.length > 0) {
    console.error("[preflight] FAIL");
    missing.forEach((relativePath) => {
      console.error(` - missing: ${relativePath}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log("[preflight] OK");
  console.log(` - checked ${REQUIRED_PATHS.length} required paths`);
}

main();
