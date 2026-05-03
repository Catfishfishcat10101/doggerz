#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const DEFAULT_GLB_PATH = path.join(
  ROOT,
  "public",
  "assets",
  "models",
  "dog",
  "jackrussell-doggerz.glb"
);

const REQUIRED_CLIPS = Object.freeze([
  "Idle",
  "Sit",
  "Bark",
  "Sleep",
  "Walk",
  "Wag",
]);

const JUNK_NAME_PATTERNS = [
  /\bcamera\b/i,
  /\blight\b/i,
  /\bempty\b/i,
  /\bcube\b/i,
  /\bplane\b/i,
  /\bsphere\b/i,
  /\bsuzanne\b/i,
  /\bbezier\b/i,
  /\bnurbs\b/i,
  /\btest\b/i,
  /\bbackup\b/i,
  /\btemp\b/i,
];

function fail(message) {
  console.error(`[Dog GLB] ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`[Dog GLB] Warning: ${message}`);
}

function parseGlb(buffer) {
  if (buffer.length < 20) fail("File is too small to be a valid GLB.");

  const magic = buffer.toString("utf8", 0, 4);
  if (magic !== "glTF") fail("Invalid GLB magic header.");

  const version = buffer.readUInt32LE(4);
  if (version !== 2) fail(`Unsupported GLB version ${version}. Expected 2.`);

  const declaredLength = buffer.readUInt32LE(8);
  if (declaredLength !== buffer.length) {
    fail(
      `Declared GLB length ${declaredLength} does not match file size ${buffer.length}.`
    );
  }

  let offset = 12;
  let jsonChunk = null;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.toString("utf8", offset + 4, offset + 8);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd > buffer.length) fail("GLB chunk length exceeds file size.");

    if (chunkType === "JSON") {
      jsonChunk = buffer
        .slice(chunkStart, chunkEnd)
        .toString("utf8")
        .replace(/\0+$/g, "");
    }

    offset = chunkEnd;
  }

  if (!jsonChunk) fail("Missing JSON chunk in GLB.");

  try {
    return JSON.parse(jsonChunk);
  } catch (error) {
    fail(`Unable to parse GLB JSON chunk: ${error.message}`);
  }
}

function numberTriplet(node, key, fallback) {
  const value = Array.isArray(node?.[key]) ? node[key] : fallback;
  return value.map((entry) => Number(entry));
}

function magnitudeFromIdentity(triplet, identity) {
  return Math.max(
    ...triplet.map((value, index) => Math.abs(Number(value) - identity[index]))
  );
}

function collectNodes(documentJson) {
  const nodes = Array.isArray(documentJson.nodes) ? documentJson.nodes : [];
  return nodes.map((node, index) => ({
    index,
    name: String(node?.name || `node_${index}`),
    node,
  }));
}

function validateDocument(documentJson) {
  const meshes = Array.isArray(documentJson.meshes) ? documentJson.meshes : [];
  const skins = Array.isArray(documentJson.skins) ? documentJson.skins : [];
  const animations = Array.isArray(documentJson.animations)
    ? documentJson.animations
    : [];
  const cameras = Array.isArray(documentJson.cameras)
    ? documentJson.cameras
    : [];
  const nodes = collectNodes(documentJson);

  if (!meshes.length) fail("No meshes found.");
  if (!skins.length) fail("No skin/rig found.");
  if (!animations.length) fail("No animation clips found.");
  if (cameras.length) fail("Cameras are exported. Remove them from the GLB.");
  if (
    Array.isArray(documentJson.extensionsUsed) &&
    documentJson.extensionsUsed.includes("KHR_lights_punctual")
  ) {
    fail(
      "Lights are exported via KHR_lights_punctual. Remove them from the GLB."
    );
  }

  if (skins.length !== 1) {
    warn(`Expected 1 skin/rig. Found ${skins.length}.`);
  }

  const primarySkin = skins[0] || {};
  const jointCount = Array.isArray(primarySkin.joints)
    ? primarySkin.joints.length
    : 0;
  if (!jointCount) fail("Primary skin has no joints.");
  if (jointCount > 80) {
    warn(
      `Primary rig has ${jointCount} joints. This may be heavier than necessary.`
    );
  }

  const clipNames = animations.map((animation, index) =>
    String(animation?.name || `animation_${index}`)
  );
  const missingClips = REQUIRED_CLIPS.filter(
    (clip) => !clipNames.includes(clip)
  );
  if (missingClips.length) {
    fail(`Missing required clips: ${missingClips.join(", ")}.`);
  }

  const unexpectedClips = clipNames.filter(
    (clip) => !REQUIRED_CLIPS.includes(clip)
  );
  if (unexpectedClips.length) {
    warn(`Unexpected extra clips found: ${unexpectedClips.join(", ")}.`);
  }

  if (meshes.length > 3) {
    warn(`Expected a minimal dog mesh set. Found ${meshes.length} meshes.`);
  }

  const skinnedMeshNodes = nodes.filter(
    ({ node }) => Number.isInteger(node?.mesh) && Number.isInteger(node?.skin)
  );
  if (!skinnedMeshNodes.length) {
    fail("No node combines a mesh with a skin. Expected a skinned dog mesh.");
  }

  const suspiciousNames = nodes
    .map(({ name }) => name)
    .filter((name) => JUNK_NAME_PATTERNS.some((pattern) => pattern.test(name)));
  if (suspiciousNames.length) {
    warn(`Suspicious exported node names: ${suspiciousNames.join(", ")}.`);
  }

  const rootNodes = nodes.filter(({ index }) => {
    const parented = nodes.some(
      ({ node }) =>
        Array.isArray(node?.children) && node.children.includes(index)
    );
    return !parented;
  });

  rootNodes.forEach(({ name, node }) => {
    const scale = numberTriplet(node, "scale", [1, 1, 1]);
    const translation = numberTriplet(node, "translation", [0, 0, 0]);

    if (magnitudeFromIdentity(scale, [1, 1, 1]) > 0.001) {
      warn(`Root node "${name}" has non-identity scale ${scale.join(", ")}.`);
    }

    if (Math.abs(translation[0]) > 0.25 || Math.abs(translation[2]) > 0.25) {
      warn(
        `Root node "${name}" is offset from origin on X/Z (${translation.join(", ")}).`
      );
    }
  });

  return {
    meshCount: meshes.length,
    skinCount: skins.length,
    jointCount,
    clipNames,
    skinnedMeshNodeNames: skinnedMeshNodes.map(({ name }) => name),
  };
}

function main() {
  const inputPath = process.argv[2]
    ? path.resolve(ROOT, process.argv[2])
    : DEFAULT_GLB_PATH;

  if (!fs.existsSync(inputPath)) {
    fail(`GLB not found at ${inputPath}`);
  }

  const buffer = fs.readFileSync(inputPath);
  const documentJson = parseGlb(buffer);
  const summary = validateDocument(documentJson);

  console.log("[Dog GLB] Validation passed.");
  console.log(`[Dog GLB] File: ${inputPath}`);
  console.log(`[Dog GLB] Meshes: ${summary.meshCount}`);
  console.log(`[Dog GLB] Skins: ${summary.skinCount}`);
  console.log(`[Dog GLB] Joints: ${summary.jointCount}`);
  console.log(`[Dog GLB] Clips: ${summary.clipNames.join(", ")}`);
  console.log(
    `[Dog GLB] Skinned mesh nodes: ${summary.skinnedMeshNodeNames.join(", ")}`
  );
}

main();
