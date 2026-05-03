#!/usr/bin/env node
// scripts/bump-version.js
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = process.cwd();
const VERSION_FILE = path.join(ROOT, "version.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseVersionName(versionName) {
  const match = String(versionName || "")
    .trim()
    .match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    versionName: `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}`,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareVersions(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function versionCodeFromVersionName(versionName) {
  const digits = String(versionName).replace(/\./g, "");
  const parsed = Number(digits);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function parseArgs(argv) {
  const hasMajor = argv.includes("--major");
  const hasMinor = argv.includes("--minor");
  const hasPatch = argv.includes("--patch");
  const isDryRun = argv.includes("--dry-run");

  const bumpFlags = [hasMajor, hasMinor, hasPatch].filter(Boolean).length;
  if (bumpFlags > 1) {
    fail("Use only one of --major, --minor, or --patch.");
  }

  if (hasMajor) return { type: "major", dryRun: isDryRun };
  if (hasMinor) return { type: "minor", dryRun: isDryRun };
  return { type: "patch", dryRun: isDryRun };
}

function readVersionFile() {
  if (!fs.existsSync(VERSION_FILE)) {
    fail("version.json not found in repository root.");
  }

  let raw;
  try {
    raw = fs.readFileSync(VERSION_FILE, "utf8");
  } catch {
    fail("Unable to read version.json.");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("version.json is not valid JSON.");
  }

  const versionName = String(parsed.versionName || "").trim();
  const versionCode = Number(parsed.versionCode);

  const parsedVersion = parseVersionName(versionName);
  if (!parsedVersion) {
    fail(`Invalid versionName "${versionName}". Expected format: x.y.z`);
  }
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    fail(
      `Invalid versionCode "${parsed.versionCode}". Expected positive integer.`
    );
  }

  return {
    versionName: parsedVersion.versionName,
    versionCode,
    major: parsedVersion.major,
    minor: parsedVersion.minor,
    patch: parsedVersion.patch,
  };
}

function latestTagVersion() {
  try {
    const output = execSync('git tag --list "v*" --sort=-v:refname', {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const tags = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    for (const tag of tags) {
      const parsed = parseVersionName(tag.replace(/^v/, ""));
      if (parsed) return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function resolveBaseVersion(current) {
  const latestTag = latestTagVersion();
  if (!latestTag) return { ...current, healedFromTag: false };

  if (compareVersions(current, latestTag) >= 0) {
    return { ...current, healedFromTag: false };
  }

  const healedVersionCode = Math.max(
    current.versionCode,
    versionCodeFromVersionName(latestTag.versionName)
  );

  return {
    ...latestTag,
    versionCode: healedVersionCode,
    healedFromTag: true,
  };
}

function bumpVersion(parts, type) {
  let { major, minor, patch } = parts;
  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function main() {
  const { type, dryRun } = parseArgs(process.argv.slice(2));
  const current = readVersionFile();
  const base = resolveBaseVersion(current);
  const nextVersionName = bumpVersion(base, type);
  const nextVersionCode = base.versionCode + 1;

  const next = {
    versionName: nextVersionName,
    versionCode: nextVersionCode,
  };

  if (!dryRun) {
    fs.writeFileSync(
      VERSION_FILE,
      `${JSON.stringify(next, null, 2)}\n`,
      "utf8"
    );
  }

  console.log(`Bump type: ${type}`);
  if (base.healedFromTag) {
    console.log(
      `Healed base from latest tag: ${base.versionName} (${base.versionCode})`
    );
  }
  console.log(`Old: ${current.versionName} (${current.versionCode})`);
  console.log(
    `New: ${nextVersionName} (${nextVersionCode})${dryRun ? " [dry-run]" : ""}`
  );
}

main();
