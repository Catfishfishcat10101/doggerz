/** @format */

/**
 * scripts/check-env.js
 *
 * Checks Vite env vars for Doggerz.
 *
 * Default behavior: informational (prints what is missing) and exits 0.
 * Strict behavior: fails (exit 1) when required groups are missing.
 *
 * Usage:
 *   node scripts/check-env.js
 *   node scripts/check-env.js --strict --require firebase
 *   node scripts/check-env.js --strict --require firebase --require weather
 */

/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const REQUIRED_VITE_FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const OPTIONAL_WEATHER_VARS = [
  'VITE_OPENWEATHER_API_KEY',
  'VITE_WEATHER_DEFAULT_ZIP',
];

function parseArgs(argv) {
  const out = {
    strict: false,
    requireGroups: new Set(),
  };

  const args = Array.isArray(argv) ? argv : [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--strict') {
      out.strict = true;
      continue;
    }
    if (a === '--require') {
      const g = String(args[i + 1] || '').trim().toLowerCase();
      if (g) out.requireGroups.add(g);
      i += 1;
      continue;
    }
    if (a === '--firebase') {
      out.requireGroups.add('firebase');
      continue;
    }
    if (a === '--weather') {
      out.requireGroups.add('weather');
      continue;
    }
  }

  return out;
}

function readEnvFile(p) {
  if (!fs.existsSync(p)) return {};

  const out = {};
  const raw = fs.readFileSync(p, 'utf8');
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Strip surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function main() {
  const { strict, requireGroups } = parseArgs(process.argv.slice(2));

  const envPath = path.join(ROOT, '.env');
  const envLocalPath = path.join(ROOT, '.env.local');
  const envExamplePath = path.join(ROOT, '.env.example');

  const env = {
    ...readEnvFile(envPath),
    ...readEnvFile(envLocalPath),
    // also allow real environment for CI
    ...process.env,
  };

  const sources = [
    fs.existsSync(envPath) ? '.env' : '(no .env)',
    fs.existsSync(envLocalPath) ? '.env.local' : '(no .env.local)',
    'process.env',
  ].join(' + ');

  console.log(`\n[env:check] Sources: ${sources}`);
  console.log(`[env:check] Mode: ${strict ? 'STRICT' : 'INFO'}${
    requireGroups.size ? ` (require: ${Array.from(requireGroups).join(', ')})` : ''
  }`);

  if (!fs.existsSync(envExamplePath)) {
    console.warn(
      `[env:check] WARN: Missing ${envExamplePath}. Create one so onboarding is smooth.`
    );
  }

  // Firebase
  const missingFirebase = REQUIRED_VITE_FIREBASE_VARS.filter((k) => !env[k]);
  const anyFirebaseSet = REQUIRED_VITE_FIREBASE_VARS.some((k) => !!env[k]);
  const requireFirebase = requireGroups.has('firebase');

  console.log(
    `[env:check] Firebase keys: required=${REQUIRED_VITE_FIREBASE_VARS.length} missing=${missingFirebase.length}`
  );

  if (missingFirebase.length === 0) {
    console.log('[env:check] OK: Firebase env vars appear configured.');
  } else if (anyFirebaseSet) {
    console.warn(
      `\n[env:check] WARN: Firebase is partially configured (missing ${missingFirebase.length}).`
    );
    for (const k of missingFirebase) console.warn(`- ${k}`);
  } else {
    console.log(
      '[env:check] INFO: Firebase is not configured (auth/cloud features will be disabled).'
    );
  }

  // Weather
  const missingWeather = OPTIONAL_WEATHER_VARS.filter((k) => !env[k]);
  const anyWeatherSet = OPTIONAL_WEATHER_VARS.some((k) => !!env[k]);
  const requireWeather = requireGroups.has('weather');

  console.log(
    `[env:check] Weather keys: optional=${OPTIONAL_WEATHER_VARS.length} missing=${missingWeather.length}`
  );
  if (!anyWeatherSet) {
    console.log(
      '[env:check] INFO: Weather is not configured (time-of-day uses device clock; no live conditions).'
    );
  } else if (missingWeather.length) {
    console.warn(`\n[env:check] WARN: Weather is partially configured:`);
    for (const k of missingWeather) console.warn(`- ${k}`);
  } else {
    console.log('[env:check] OK: Weather env vars appear configured.');
  }

  const shouldFail =
    strict &&
    ((requireFirebase && missingFirebase.length) ||
      (requireWeather && missingWeather.length));

  if (!shouldFail) {
    console.log(
      '\n[env:check] Done. (Tip: use --strict --require firebase to enforce config for CI/build pipelines.)'
    );
    return;
  }

  console.error('\n[env:check] FAIL: Required env group(s) missing.');
  console.error('Fix: add values to .env.local (recommended) or .env.');
  console.error('Tip: start from .env.example.');
  process.exitCode = 1;
}

main();
