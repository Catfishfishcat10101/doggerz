#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const scriptPath = path.join(__dirname, "scripts", "bump-version.js");

const result = spawnSync(process.execPath, [scriptPath, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (result.error) {
  console.error("[bump-version] Failed to run scripts/bump-version.js");
  console.error(result.error.message || result.error);
  process.exit(1);
}

process.exit(Number.isInteger(result.status) ? result.status : 1);
