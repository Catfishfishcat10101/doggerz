#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const CORE_DIRS = ["src/features/game", "src/redux", "src/components"];
const SOURCE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx"]);

const ALLOWED_NO_CHECK = new Set([
  "src/components/layout/Header.jsx",
  "src/components/ui/LongTermProgressionCard.jsx",
  "src/components/dog/DogPixiView.jsx",
  "src/components/environment/WeatherFXCanvas.jsx",
]);

function walk(dir, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      walk(rel, out);
      continue;
    }
    if (SOURCE_EXTS.has(path.extname(entry.name))) out.push(rel);
  }
  return out;
}

function hasNoCheck(relFile) {
  const text = fs.readFileSync(path.join(ROOT, relFile), "utf8");
  return /@ts-nocheck/.test(text);
}

function main() {
  const files = CORE_DIRS.flatMap((dir) => walk(dir));
  const offenders = files.filter(hasNoCheck).sort();
  const unexpected = offenders.filter((f) => !ALLOWED_NO_CHECK.has(f));

  if (unexpected.length) {
    const msg = [
      "Unexpected @ts-nocheck in core paths:",
      ...unexpected.map((f) => `- ${f}`),
      "",
      "Allowed temporary list:",
      ...[...ALLOWED_NO_CHECK].sort().map((f) => `- ${f}`),
    ].join("\n");
    throw new Error(msg);
  }

  console.log(
    `[ts-nocheck] OK - ${offenders.length} allowed file(s) still use @ts-nocheck.`
  );
}

try {
  main();
} catch (error) {
  console.error(`[ts-nocheck] FAILED\n${error.message}`);
  process.exit(1);
}
