/** @format */

/**
 * scripts/check-env.js
 *
 * Checks that required Vite env vars for Firebase exist in .env / .env.local.
 *
 * Usage:
 *   node scripts/check-env.js
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
  const envPath = path.join(ROOT, '.env');
  const envLocalPath = path.join(ROOT, '.env.local');

  const env = {
    ...readEnvFile(envPath),
    ...readEnvFile(envLocalPath),
    // also allow real environment for CI
    ...process.env,
  };

  const missing = REQUIRED_VITE_FIREBASE_VARS.filter((k) => !env[k]);

  console.log(`\n[env:check] Checked required Firebase VITE_* keys: ${REQUIRED_VITE_FIREBASE_VARS.length}`);
  console.log(`[env:check] Sources: ${fs.existsSync(envPath) ? '.env' : '(no .env)'} + ${
    fs.existsSync(envLocalPath) ? '.env.local' : '(no .env.local)'
  } + process.env`);

  if (!missing.length) {
    console.log('[env:check] OK: Firebase env vars appear configured.');
    return;
  }

  console.error(`\n[env:check] FAIL: Missing ${missing.length} key(s):`);
  for (const k of missing) console.error(`- ${k}`);

  console.error('\nFix: add them to .env.local (recommended) or .env.');
  console.error('Tip: placeholders are provided in the repo .env file.');

  process.exitCode = 1;
}

main();
