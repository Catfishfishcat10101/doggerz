/* @format */
// validate-sprites.js
// Audit dog sprite folders for missing/undersized frame counts.

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_DIR = path.join(__dirname, "public", "assets", "imports", "jr");

const REQUIRED_ANIMS = {
  idle: 16,
  walk_right: 12,
  walk_left: 12,
  sleep: 8,
  front_flip: 16,
  wag: 8,
};

const spriteDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_DIR;

console.log("🔍 Starting Jack Russell Asset Audit...");
console.log(`Sprite root: ${spriteDir}\n`);

let issuesFound = 0;

Object.entries(REQUIRED_ANIMS).forEach(([anim, targetCount]) => {
  const folderPath = path.join(spriteDir, anim);

  if (!fs.existsSync(folderPath)) {
    console.error(
      `❌ MISSING FOLDER: ${anim} (Expected ${targetCount} frames)`
    );
    issuesFound += 1;
    return;
  }

  const frames = fs
    .readdirSync(folderPath)
    .filter((file) => file.toLowerCase().endsWith(".png"));

  if (frames.length === 0) {
    console.error(`⚠️ EMPTY FOLDER: ${anim}`);
    issuesFound += 1;
  } else if (frames.length < targetCount) {
    console.warn(
      `🟡 UNDER-STUFFED: ${anim} has ${frames.length}/${targetCount} frames.`
    );
    issuesFound += 1;
  } else {
    console.log(`✅ OK: ${anim} (${frames.length} frames)`);
  }
});

console.log(`\nAudit Complete. Issues found: ${issuesFound}`);
if (issuesFound > 0) process.exit(1);
