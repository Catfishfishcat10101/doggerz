#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  ".git",
  "android",
  "coverage",
  "dist",
  "node_modules",
]);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const bannedDirective = `@ts-${"nocheck"}`;
const offenders = walk(ROOT).filter((filePath) =>
  fs.readFileSync(filePath, "utf8").includes(bannedDirective)
);

if (offenders.length) {
  console.error(`Remove ${bannedDirective} before release:`);
  offenders
    .map((filePath) => path.relative(ROOT, filePath))
    .sort()
    .forEach((filePath) => console.error(`- ${filePath}`));
  process.exit(1);
}

console.log(`[Doggerz] No ${bannedDirective} directives found.`);
