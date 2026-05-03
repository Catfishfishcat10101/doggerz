#!/usr/bin/env node
// scripts/validate-dog-glb.js
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const MODEL_DIR = path.join(ROOT, "public", "assets", "models", "dog");
const REQUIRED_STAGE_MODELS = Object.freeze([
  "jackrussell-puppy.glb",
  "jackrussell-adult.glb",
  "jackrussell-senior.glb",
]);
const REQUIRED_CLIPS = Object.freeze([
  "Idle",
  "Walk",
  "Sit",
  "Bark",
  "Sleep",
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

function formatRelPath(absPath) {
  return path.relative(ROOT, absPath).replace(/\\/g, "/");
}

function createError(filePath, message) {
  return `[${formatRelPath(filePath)}] ${message}`;
}

function parseGlb(buffer, filePath) {
  if (buffer.length < 20) {
    throw new Error(
      createError(filePath, "File is too small to be a valid GLB.")
    );
  }

  const magic = buffer.toString("utf8", 0, 4);
  if (magic !== "glTF") {
    throw new Error(createError(filePath, "Invalid GLB magic header."));
  }

  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    throw new Error(
      createError(filePath, `Unsupported GLB version ${version}. Expected 2.`)
    );
  }

  const declaredLength = buffer.readUInt32LE(8);
  if (declaredLength !== buffer.length) {
    throw new Error(
      createError(
        filePath,
        `Declared GLB length ${declaredLength} does not match file size ${buffer.length}.`
      )
    );
  }

  let offset = 12;
  let jsonChunk = null;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.toString("utf8", offset + 4, offset + 8);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkEnd > buffer.length) {
      throw new Error(
        createError(filePath, "GLB chunk length exceeds file size.")
      );
    }

    if (chunkType === "JSON") {
      jsonChunk = buffer
        .slice(chunkStart, chunkEnd)
        .toString("utf8")
        .replace(/\0+$/g, "");
    }

    offset = chunkEnd;
  }

  if (!jsonChunk) {
    throw new Error(createError(filePath, "Missing JSON chunk in GLB."));
  }

  try {
    return JSON.parse(jsonChunk);
  } catch (error) {
    throw new Error(
      createError(filePath, `Unable to parse GLB JSON chunk: ${error.message}`)
    );
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

function validateDocument(documentJson, filePath) {
  const errors = [];
  const warnings = [];
  const meshes = Array.isArray(documentJson.meshes) ? documentJson.meshes : [];
  const materials = Array.isArray(documentJson.materials)
    ? documentJson.materials
    : [];
  const skins = Array.isArray(documentJson.skins) ? documentJson.skins : [];
  const animations = Array.isArray(documentJson.animations)
    ? documentJson.animations
    : [];
  const cameras = Array.isArray(documentJson.cameras)
    ? documentJson.cameras
    : [];
  const nodes = collectNodes(documentJson);

  if (!meshes.length) errors.push("No meshes found.");
  if (!materials.length) errors.push("No materials found.");
  if (!skins.length) errors.push("No skin/rig found.");
  if (!animations.length) errors.push("No animation clips found.");
  if (cameras.length)
    errors.push("Cameras are exported. Remove them from the GLB.");
  if (
    Array.isArray(documentJson.extensionsUsed) &&
    documentJson.extensionsUsed.includes("KHR_lights_punctual")
  ) {
    errors.push(
      "Lights are exported via KHR_lights_punctual. Remove them from the GLB."
    );
  }

  if (skins.length > 1) {
    warnings.push(`Expected 1 primary skin/rig. Found ${skins.length}.`);
  }

  const primarySkin = skins[0] || {};
  const jointCount = Array.isArray(primarySkin.joints)
    ? primarySkin.joints.length
    : 0;
  if (skins.length && !jointCount) errors.push("Primary skin has no joints.");
  if (jointCount > 80) {
    warnings.push(
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
    errors.push(`Missing required clips: ${missingClips.join(", ")}.`);
  }

  const unexpectedClips = clipNames.filter(
    (clip) => !REQUIRED_CLIPS.includes(clip)
  );
  if (unexpectedClips.length) {
    warnings.push(
      `Unexpected extra clips found: ${unexpectedClips.join(", ")}.`
    );
  }

  if (meshes.length > 3) {
    warnings.push(
      `Expected a minimal dog mesh set. Found ${meshes.length} meshes.`
    );
  }

  const skinnedMeshNodes = nodes.filter(
    ({ node }) => Number.isInteger(node?.mesh) && Number.isInteger(node?.skin)
  );
  if (!skinnedMeshNodes.length) {
    errors.push(
      "No node combines a mesh with a skin. Expected a skinned dog mesh."
    );
  }

  const suspiciousNames = nodes
    .map(({ name }) => name)
    .filter((name) => JUNK_NAME_PATTERNS.some((pattern) => pattern.test(name)));
  if (suspiciousNames.length) {
    warnings.push(
      `Suspicious exported node names: ${suspiciousNames.join(", ")}.`
    );
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
      warnings.push(
        `Root node "${name}" has non-identity scale ${scale.join(", ")}.`
      );
    }

    if (Math.abs(translation[0]) > 0.25 || Math.abs(translation[2]) > 0.25) {
      warnings.push(
        `Root node "${name}" is offset from origin on X/Z (${translation.join(", ")}).`
      );
    }
  });

  return {
    errors: errors.map((message) => createError(filePath, message)),
    warnings: warnings.map((message) =>
      createError(filePath, `Warning: ${message}`)
    ),
    summary: {
      filePath,
      meshCount: meshes.length,
      materialCount: materials.length,
      skinCount: skins.length,
      jointCount,
      clipNames,
      skinnedMeshNodeNames: skinnedMeshNodes.map(({ name }) => name),
    },
  };
}

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      errors: [createError(filePath, "Required GLB is missing.")],
      warnings: [],
      summary: null,
    };
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const documentJson = parseGlb(buffer, filePath);
    return validateDocument(documentJson, filePath);
  } catch (error) {
    return {
      errors: [error.message],
      warnings: [],
      summary: null,
    };
  }
}

function resolveInputPaths() {
  const explicitInputs = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith("-"));

  if (explicitInputs.length) {
    return explicitInputs.map((inputPath) => path.resolve(ROOT, inputPath));
  }

  return REQUIRED_STAGE_MODELS.map((fileName) =>
    path.join(MODEL_DIR, fileName)
  );
}

function main() {
  const inputPaths = resolveInputPaths();
  const results = inputPaths.map(validateFile);
  const errors = results.flatMap((result) => result.errors);
  const warnings = results.flatMap((result) => result.warnings);
  const summaries = results
    .map((result) => result.summary)
    .filter((summary) => summary);

  warnings.forEach((warning) => console.warn(`[Dog GLB] ${warning}`));

  if (errors.length) {
    console.error("[Dog GLB] Validation failed.");
    errors.forEach((error) => console.error(`[Dog GLB] ${error}`));
    process.exit(1);
  }

  console.log("[Dog GLB] Validation passed.");
  summaries.forEach((summary) => {
    console.log(`[Dog GLB] File: ${formatRelPath(summary.filePath)}`);
    console.log(`[Dog GLB] Meshes: ${summary.meshCount}`);
    console.log(`[Dog GLB] Materials: ${summary.materialCount}`);
    console.log(`[Dog GLB] Skins: ${summary.skinCount}`);
    console.log(`[Dog GLB] Joints: ${summary.jointCount}`);
    console.log(`[Dog GLB] Clips: ${summary.clipNames.join(", ")}`);
    console.log(
      `[Dog GLB] Skinned mesh nodes: ${summary.skinnedMeshNodeNames.join(", ")}`
    );
  });
}

main();
