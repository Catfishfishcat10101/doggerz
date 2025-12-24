/** @format */

// scripts/gen-pwa-icons.mjs
// Generate PWA icons from public/favicon.ico
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');

const srcIco = path.join(publicDir, 'favicon.ico');

const out192 = path.join(iconsDir, 'icon-192x192.png');
const out512 = path.join(iconsDir, 'icon-512x512.png');
const outMask = path.join(iconsDir, 'icon-512x512-maskable.png');

if (!fs.existsSync(srcIco)) {
  console.error('Missing:', srcIco);
  process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

// sharp can read .ico and pick an embedded size; we resize to the targets
await sharp(srcIco).resize(192, 192, { fit: 'cover' }).png().toFile(out192);
await sharp(srcIco).resize(512, 512, { fit: 'cover' }).png().toFile(out512);

// Simple maskable: duplicate 512 for now (good enough for dev; replace with padded maskable art later)
fs.copyFileSync(out512, outMask);

console.log('Generated:');
console.log(' -', path.relative(root, out192));
console.log(' -', path.relative(root, out512));
console.log(' -', path.relative(root, outMask));
