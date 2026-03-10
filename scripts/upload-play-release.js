#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { google } = require("googleapis");

const ROOT = process.cwd();
const VERSION_FILE = path.join(ROOT, "version.json");
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
const DEFAULT_RELEASE_NOTES_DIR = path.join(ROOT, "play", "release-notes");
const DEFAULT_PACKAGE_NAME = "com.doggerz.app";
const ANDROID_PUBLISHER_SCOPE =
  "https://www.googleapis.com/auth/androidpublisher";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJsonFile(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Unable to read ${label} at ${filePath}: ${error.message}`);
  }
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
  console.log(`Doggerz Google Play uploader

Usage:
  node scripts/upload-play-release.js [options]

Options:
  --credentials <path>        Service account JSON path
  --aab <path>                Android App Bundle path
  --package <applicationId>   Defaults to com.doggerz.app
  --track <track>             Defaults to internal
  --status <status>           completed | draft | halted | inProgress
  --user-fraction <0-1>       Required when status is inProgress
  --release-name <label>      Defaults to version.json versionName
  --release-notes-dir <dir>   Defaults to play/release-notes
  --help                      Show this message
`);
}

function resolveVersionInfo() {
  if (!fs.existsSync(VERSION_FILE)) {
    fail("version.json not found in repository root.");
  }
  const versionInfo = readJsonFile(VERSION_FILE, "version metadata");
  if (!versionInfo.versionName || !versionInfo.versionCode) {
    fail("version.json must include versionName and versionCode.");
  }
  return versionInfo;
}

function resolveServiceAccountPath(cliOptions) {
  const envValue =
    cliOptions.credentials ||
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!envValue) {
    fail(
      "Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS, or pass --credentials <path>."
    );
  }

  return path.isAbsolute(envValue) ? envValue : path.join(ROOT, envValue);
}

function loadReleaseNotes(releaseNotesDir, versionName) {
  if (!fs.existsSync(releaseNotesDir)) return [];

  const locales = fs
    .readdirSync(releaseNotesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return locales
    .map((locale) => {
      const versionPath = path.join(
        releaseNotesDir,
        locale,
        `${versionName}.txt`
      );
      const latestPath = path.join(releaseNotesDir, locale, "latest.txt");
      const sourcePath = fs.existsSync(versionPath)
        ? versionPath
        : fs.existsSync(latestPath)
          ? latestPath
          : null;
      if (!sourcePath) return null;

      const text = fs.readFileSync(sourcePath, "utf8").trim();
      if (!text) return null;

      return {
        language: locale,
        text,
      };
    })
    .filter(Boolean);
}

function parseUserFraction(raw) {
  if (raw == null) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) {
    fail("--user-fraction must be a number greater than 0 and less than 1.");
  }
  return parsed;
}

function validateStatus(status, userFraction) {
  const allowed = new Set(["completed", "draft", "halted", "inProgress"]);
  if (!allowed.has(status)) {
    fail(
      `Unsupported release status "${status}". Use one of: ${[...allowed].join(
        ", "
      )}.`
    );
  }
  if (status === "inProgress" && userFraction == null) {
    fail("--user-fraction is required when --status inProgress.");
  }
}

async function main() {
  const cliOptions = parseArgs(process.argv.slice(2));
  if (cliOptions.help) {
    printHelp();
    return;
  }
  const versionInfo = resolveVersionInfo();
  const packageName = cliOptions.package || DEFAULT_PACKAGE_NAME;
  const track = cliOptions.track || "internal";
  const status = cliOptions.status || "completed";
  const userFraction = parseUserFraction(cliOptions["user-fraction"]);
  const releaseName = cliOptions["release-name"] || versionInfo.versionName;
  const releaseNotesDir = path.resolve(
    ROOT,
    cliOptions["release-notes-dir"] || DEFAULT_RELEASE_NOTES_DIR
  );
  const aabPath = path.resolve(ROOT, cliOptions.aab || DEFAULT_AAB_PATH);
  const serviceAccountPath = resolveServiceAccountPath(cliOptions);
  validateStatus(status, userFraction);

  if (!fs.existsSync(serviceAccountPath)) {
    fail(`Service account JSON not found: ${serviceAccountPath}`);
  }
  if (!fs.existsSync(aabPath)) {
    fail(
      `Android App Bundle not found: ${aabPath}. Build it first with gradlew bundleRelease.`
    );
  }

  const releaseNotes = loadReleaseNotes(
    releaseNotesDir,
    versionInfo.versionName
  );
  const credentials = readJsonFile(serviceAccountPath, "service account JSON");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [ANDROID_PUBLISHER_SCOPE],
  });
  const androidpublisher = google.androidpublisher({
    version: "v3",
    auth,
  });

  console.log(
    `Uploading ${path.basename(aabPath)} to ${packageName} track=${track} status=${status}`
  );

  const insertResponse = await androidpublisher.edits.insert({
    packageName,
    requestBody: {},
  });
  const editId = insertResponse.data.id;

  if (!editId) {
    fail("Google Play edit creation failed: missing edit id.");
  }

  try {
    const uploadResponse = await androidpublisher.edits.bundles.upload({
      packageName,
      editId,
      media: {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(aabPath),
      },
    });

    const uploadedVersionCode = uploadResponse.data.versionCode;
    if (!uploadedVersionCode) {
      fail("Bundle upload succeeded but no versionCode was returned.");
    }

    const release = {
      name: releaseName,
      status,
      versionCodes: [String(uploadedVersionCode)],
    };

    if (userFraction != null) {
      release.userFraction = userFraction;
    }
    if (releaseNotes.length) {
      release.releaseNotes = releaseNotes;
    }

    await androidpublisher.edits.tracks.update({
      packageName,
      editId,
      track,
      requestBody: {
        releases: [release],
      },
    });

    const commitResponse = await androidpublisher.edits.commit({
      packageName,
      editId,
    });

    console.log("Google Play edit committed.");
    console.log(
      JSON.stringify(
        {
          packageName,
          track,
          releaseName,
          status,
          versionCode: uploadedVersionCode,
          userFraction,
          releaseNotesLocales: releaseNotes.map((note) => note.language),
          committedEditId: commitResponse.data.id || editId,
        },
        null,
        2
      )
    );
  } catch (error) {
    const details = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message;
    fail(`Google Play upload failed.\n${details}`);
  }
}

main().catch((error) => {
  fail(error.stack || error.message);
});
