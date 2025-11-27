#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const spritesDir = path.join(
  repoRoot,
  "src",
  "assets",
  "sprites",
  "jackrussell",
);
const backupDir = path.join(
  repoRoot,
  "src",
  "assets",
  "sprites",
  "unused-backup",
);
const auditPath = path.join(repoRoot, "tmp", "sprite-audit.json");

function loadAudit() {
  if (!fs.existsSync(auditPath)) {
    console.error(
      "Audit file not found. Run `node scripts/audit-sprites.js` first.",
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(auditPath, "utf8"));
}

function doMove(files) {
  fs.mkdirSync(backupDir, { recursive: true });
  files.forEach((file) => {
    const src = path.join(spritesDir, file);
    const dest = path.join(backupDir, file);
    if (!fs.existsSync(src)) {
      console.warn("Source not found, skipping", src);
      return;
    }
    console.log(
      `Moving ${path.relative(repoRoot, src)} -> ${path.relative(repoRoot, dest)}`,
    );
    fs.renameSync(src, dest);
  });
}

function main() {
  const audit = loadAudit();
  const unused = (audit.unusedList || []).map((u) => u.name);
  if (!unused.length) {
    console.log("No unused sprites reported by audit. Nothing to do.");
    return;
  }
  console.log("Found", unused.length, "unused sprite(s):");
  unused.forEach((u) => console.log(" -", u));
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  if (!apply) {
    console.log(
      "\nTo actually move these files into `src/assets/sprites/unused-backup`, re-run with `--apply`",
    );
    return;
  }
  doMove(unused);
  console.log(
    "\nMove complete. Please review changes and commit them with git.",
  );
}

main();
