// scripts/verify-web-assets.js
// Validates sprite + manifest icon assets for Doggerz web runtime.

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const SPRITE_DIR = path.join(ROOT, "public", "assets", "sprites", "jr");
const MANIFEST_PATH = path.join(ROOT, "public", "manifest.webmanifest");

const REQUIRED_SPRITES = [
  "pup_clean.png",
  "pup_dirty.png",
  "pup_fleas.png",
  "pup_mange.png",
  "adult_clean.png",
  "adult_dirty.png",
  "adult_fleas.png",
  "adult_mange.png",
  "senior_clean.png",
  "senior_dirty.png",
  "senior_fleas.png",
  "senior_mange.png",
];

function exists(absPath) {
  try {
    return fs.existsSync(absPath);
  } catch {
    return false;
  }
}

async function assertDecodableImage(absPath) {
  const meta = await sharp(absPath).metadata();
  if (!meta || !meta.width || !meta.height) {
    throw new Error(`Invalid image metadata: ${absPath}`);
  }
  return meta;
}

function readManifest() {
  if (!exists(MANIFEST_PATH)) {
    throw new Error(`Manifest missing: ${MANIFEST_PATH}`);
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

function resolveManifestAsset(src) {
  const clean = String(src || "").trim();
  const relative = clean.replace(/^\//, "");
  return path.join(ROOT, "public", relative);
}

async function main() {
  const failures = [];

  if (!exists(SPRITE_DIR)) {
    failures.push(`Missing sprite dir: ${SPRITE_DIR}`);
  } else {
    for (const name of REQUIRED_SPRITES) {
      const abs = path.join(SPRITE_DIR, name);
      if (!exists(abs)) {
        failures.push(`Missing sprite: ${name}`);
        continue;
      }
      try {
        await assertDecodableImage(abs);
      } catch (err) {
        failures.push(`Undecodable sprite: ${name} (${err.message})`);
      }
    }
  }

  let manifest = null;
  try {
    manifest = readManifest();
  } catch (err) {
    failures.push(err.message);
  }

  if (manifest) {
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const shortcutIcons = (
      Array.isArray(manifest.shortcuts) ? manifest.shortcuts : []
    ).flatMap((s) => (Array.isArray(s?.icons) ? s.icons : []));

    const allIconEntries = [...icons, ...shortcutIcons];
    for (const entry of allIconEntries) {
      const src = String(entry?.src || "").trim();
      if (!src) {
        failures.push("Manifest icon entry missing src");
        continue;
      }
      const abs = resolveManifestAsset(src);
      if (!exists(abs)) {
        failures.push(`Manifest icon missing: ${src}`);
        continue;
      }
      try {
        await assertDecodableImage(abs);
      } catch (err) {
        failures.push(`Manifest icon undecodable: ${src} (${err.message})`);
      }
    }
  }

  if (failures.length) {
    console.error("[verify-web-assets] FAIL");
    failures.forEach((f) => console.error(` - ${f}`));
    process.exitCode = 1;
    return;
  }

  console.log("[verify-web-assets] OK");
  console.log(` - sprites checked: ${REQUIRED_SPRITES.length}`);
  const iconCount = Array.isArray(manifest?.icons) ? manifest.icons.length : 0;
  const shortcutCount = Array.isArray(manifest?.shortcuts)
    ? manifest.shortcuts.length
    : 0;
  console.log(
    ` - manifest icons checked: ${iconCount} + shortcut icons from ${shortcutCount} shortcuts`
  );
}

main().catch((err) => {
  console.error("[verify-web-assets] Unexpected failure:", err);
  process.exitCode = 1;
});
