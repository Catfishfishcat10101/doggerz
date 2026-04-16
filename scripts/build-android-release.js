#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const ANDROID_DIR = path.join(ROOT, "android");
const DEFAULT_AAB_PATH = path.join(
  ROOT,
  "android",
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab"
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    const hasValue = next && !next.startsWith("--");
    options[key] = hasValue ? next : true;
    if (hasValue) index += 1;
  }
  return options;
}

function printHelp() {
  console.log(`Doggerz Android release builder

Usage:
  node scripts/build-android-release.js [options]

Options:
  --bump                     Run scripts/bump-version.js first
  --upload                   Upload to Google Play after building
  --track <track>            Play track (default: internal)
  --status <status>          completed | draft | halted | inProgress
  --user-fraction <0-1>      Required for inProgress releases
  --credentials <path>       Service account JSON path
  --aab <path>               Override AAB path for upload
  --release-name <label>     Override Play release name
  --release-notes-dir <dir>  Override release notes directory
  --skip-build               Skip npm run build
  --skip-sync                Skip npx cap sync android
  --help                     Show this message
`);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    stdio: "inherit",
    shell: process.platform === "win32" && options.shell !== false,
    env: process.env,
  });

  if (result.status !== 0) {
    fail(
      `Command failed: ${[command, ...args].join(" ")} (exit ${result.status ?? "unknown"})`
    );
  }
}

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} not found: ${filePath}`);
  }
}

function parsePropertiesFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, "utf8");
  return text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (key) acc[key] = value;
      return acc;
    }, {});
}

function resolveMaybeRelative(rawPath, bases = [ROOT, ANDROID_DIR]) {
  if (!rawPath) return null;
  if (path.isAbsolute(rawPath)) return rawPath;
  for (const base of bases) {
    const candidate = path.resolve(base, rawPath);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(ROOT, rawPath);
}

function validateSigningConfig() {
  const props = parsePropertiesFile(
    path.join(ANDROID_DIR, "keystore.properties")
  );
  const storeFileRaw =
    process.env.DOGGERZ_ANDROID_KEYSTORE_PATH || props.storeFile || "";
  const storePassword =
    process.env.DOGGERZ_ANDROID_KEYSTORE_PASSWORD || props.storePassword || "";
  const keyAlias =
    process.env.DOGGERZ_ANDROID_KEY_ALIAS || props.keyAlias || "";
  const keyPassword =
    process.env.DOGGERZ_ANDROID_KEY_PASSWORD || props.keyPassword || "";
  const storeFile = resolveMaybeRelative(storeFileRaw);

  const missing = [];
  if (!storeFileRaw) missing.push("DOGGERZ_ANDROID_KEYSTORE_PATH/storeFile");
  if (!storePassword)
    missing.push("DOGGERZ_ANDROID_KEYSTORE_PASSWORD/storePassword");
  if (!keyAlias) missing.push("DOGGERZ_ANDROID_KEY_ALIAS/keyAlias");
  if (!keyPassword) missing.push("DOGGERZ_ANDROID_KEY_PASSWORD/keyPassword");
  if (storeFileRaw && !fs.existsSync(storeFile)) {
    missing.push(`keystore file missing at ${storeFile}`);
  }

  if (missing.length) {
    fail(
      `Android release signing is not configured. Missing: ${missing.join(", ")}`
    );
  }

  return { storeFile, keyAlias };
}

function validateReleaseAssets() {
  [
    [path.join(ROOT, "version.json"), "version.json"],
    [path.join(ROOT, "index.html"), "index.html"],
    [path.join(ROOT, "public", "manifest.webmanifest"), "Web manifest"],
    [path.join(ROOT, "public", "assets", "icons", "icon-192.png"), "192 icon"],
    [path.join(ROOT, "public", "assets", "icons", "icon-512.png"), "512 icon"],
    [path.join(ANDROID_DIR, "app", "build.gradle"), "Android app build.gradle"],
  ].forEach(([filePath, label]) => assertFileExists(filePath, label));

  const gradleWrapper = path.join(
    ANDROID_DIR,
    process.platform === "win32" ? "gradlew.bat" : "gradlew"
  );
  assertFileExists(gradleWrapper, "Gradle wrapper");
}

function buildUploadArgs(cliOptions, aabPath) {
  const args = ["scripts/upload-play-release.js"];
  const passthroughKeys = [
    "credentials",
    "track",
    "status",
    "user-fraction",
    "release-name",
    "release-notes-dir",
    "package",
  ];

  passthroughKeys.forEach((key) => {
    if (cliOptions[key] == null) return;
    args.push(`--${key}`);
    if (cliOptions[key] !== true) {
      args.push(String(cliOptions[key]));
    }
  });

  args.push("--aab", aabPath);
  return args;
}

function main() {
  const cliOptions = parseArgs(process.argv.slice(2));
  if (cliOptions.help) {
    printHelp();
    return;
  }

  validateReleaseAssets();
  const signing = validateSigningConfig();

  console.log("[Doggerz] Release checks passed.");
  console.log(`- Signing keystore: ${signing.storeFile}`);
  console.log(`- Key alias: ${signing.keyAlias}`);

  if (cliOptions.bump) {
    runCommand(process.execPath, [path.join("scripts", "bump-version.js")]);
  }

  if (!cliOptions["skip-build"]) {
    runCommand("npm", ["run", "build"]);
  }

  if (!cliOptions["skip-sync"]) {
    runCommand("npx", ["cap", "sync", "android"]);
  }

  const gradleWrapper =
    process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  runCommand(gradleWrapper, ["bundleRelease"], {
    cwd: ANDROID_DIR,
    shell: process.platform === "win32",
  });

  const aabPath = resolveMaybeRelative(cliOptions.aab || DEFAULT_AAB_PATH, [
    ROOT,
  ]);
  assertFileExists(aabPath, "Android App Bundle");
  console.log(`[Doggerz] AAB ready: ${aabPath}`);

  if (cliOptions.upload) {
    runCommand(process.execPath, buildUploadArgs(cliOptions, aabPath));
  }

  console.log("[Doggerz] Android release flow complete.");
}

main();
