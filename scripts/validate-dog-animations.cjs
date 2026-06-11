const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const glbPath = path.join(
  rootDir,
  "public",
  "assets",
  "models",
  "dog",
  "jackrussell-doggerz.glb"
);
const mapPath = path.join(
  rootDir,
  "src",
  "features",
  "game",
  "stage3d",
  "dog",
  "dogAnimationMap.js"
);

function normalize(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function readGlbAnimationNames(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing GLB: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  if (buffer.toString("utf8", 0, 4) !== "glTF") {
    throw new Error("Not a valid GLB file.");
  }

  const jsonLength = buffer.readUInt32LE(12);
  const jsonType = buffer.toString("utf8", 16, 20);
  if (jsonType.trim() !== "JSON") {
    throw new Error("Could not find JSON chunk in GLB.");
  }

  const jsonText = buffer.toString("utf8", 20, 20 + jsonLength);
  const gltf = JSON.parse(jsonText);

  return (gltf.animations || [])
    .map((animation) => animation.name)
    .filter(Boolean);
}

function parseStringArray(source, exportName) {
  const pattern = new RegExp(
    `(?:export\\s+)?const\\s+${exportName}\\s*=\\s*Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`,
    "m"
  );
  const match = source.match(pattern);
  if (!match) return [];

  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function parseClipEntries(source) {
  const entries = [];
  const entryPattern =
    /(\w+):\s*clipEntry\(\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|(FEED_LOOP_CLIP|FEED_START_CLIP|NEUTRAL_FEED_FALLBACK_CLIP))\s*,\s*\{([\s\S]*?)\n\s*\}\),/g;
  const constants = {
    FEED_LOOP_CLIP: "Eat_loop",
    FEED_START_CLIP: "EatDrink_start",
    NEUTRAL_FEED_FALLBACK_CLIP: "Idle_1",
  };

  for (const match of source.matchAll(entryPattern)) {
    const [, key, action, literalClip, constantClip, body] = match;
    const clip = literalClip || constants[constantClip] || "";
    const aliasesMatch = body.match(/aliases:\s*\[([\s\S]*?)\]/);
    const fallbackMatch = body.match(/fallbacks:\s*\[([\s\S]*?)\]/);
    const aliases = aliasesMatch
      ? [...aliasesMatch[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])
      : [];
    const fallbacks = fallbackMatch
      ? [...fallbackMatch[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])
      : [];

    entries.push({ key, action, clip, aliases, fallbacks });
  }

  return entries;
}

function findDuplicateAliases(entries) {
  const seen = new Map();
  const duplicates = [];

  entries.forEach((entry) => {
    [entry.action, entry.clip, ...entry.aliases].forEach((alias) => {
      const key = normalize(alias);
      if (!key) return;

      const previous = seen.get(key);
      if (previous && previous.action !== entry.action) {
        duplicates.push({
          alias,
          normalized: key,
          first: previous.action,
          second: entry.action,
        });
        return;
      }

      seen.set(key, entry);
    });
  });

  return duplicates;
}

try {
  const rawClipNames = readGlbAnimationNames(glbPath);
  const rawClipSet = new Set(rawClipNames);
  const source = fs.readFileSync(mapPath, "utf8");
  const requiredClips = parseStringArray(source, "REQUIRED_DOG_MODEL_CLIPS");
  const rawRegistryClips = parseStringArray(source, "RAW_DOG_MODEL_CLIPS");
  const entries = parseClipEntries(source);
  const mappedClips = [...new Set(entries.flatMap((entry) => [entry.clip, ...entry.fallbacks]))];
  const missingMapped = mappedClips.filter((clip) => !rawClipSet.has(clip));
  const brokenRequired = requiredClips.filter((clip) => !rawClipSet.has(clip));
  const duplicateAliases = findDuplicateAliases(entries);
  const mappedRawSet = new Set([
    ...rawRegistryClips,
    ...entries.flatMap((entry) => [entry.clip, ...entry.fallbacks]),
  ]);
  const unusedRawClips = rawClipNames.filter((clip) => !mappedRawSet.has(clip));

  console.log("Doggerz animation validation");
  console.log("-----------------------------");
  console.log(`GLB clips: ${rawClipNames.length}`);
  console.log(`Canonical mapped entries: ${entries.length}`);
  console.log(`Mapped clip references: ${mappedClips.length}`);
  console.log("");

  console.log(`Missing mapped clips: ${missingMapped.length}`);
  missingMapped.forEach((clip) => console.log(`  - ${clip}`));
  console.log("");

  console.log(`Duplicate aliases: ${duplicateAliases.length}`);
  duplicateAliases.forEach((item) =>
    console.log(
      `  - ${item.alias} (${item.normalized}) used by ${item.first} and ${item.second}`
    )
  );
  console.log("");

  console.log(`Unused raw GLB clips: ${unusedRawClips.length}`);
  unusedRawClips.forEach((clip) => console.log(`  - ${clip}`));
  console.log("");

  if (brokenRequired.length) {
    console.error(`Broken required mappings: ${brokenRequired.join(", ")}`);
    process.exit(1);
  }

  console.log("Required dog animation mappings are valid.");
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
