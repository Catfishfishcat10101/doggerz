#!/usr/bin/env node
// scripts/find-duplicate-exports.mjs
// Scan source files for duplicate `export const NAME` declarations within the same file.
// Run without arguments to print a report. Run with `--fix` to remove exact duplicate
// declarations (keeps the first occurrence).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(__filename, '..', '..');
const srcDir = path.join(repoRoot, 'src');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (st.isFile() && /\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

function findDuplicatesInFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const re = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([^;]+);/g;
  const items = [];
  let m;
  while ((m = re.exec(src))) {
    items.push({ name: m[1], value: m[2].trim(), index: m.index });
  }
  const groups = {};
  for (const it of items) {
    groups[it.name] = groups[it.name] || [];
    groups[it.name].push(it);
  }
  const duplicates = Object.entries(groups)
    .filter(([, arr]) => arr.length > 1)
    .map(([name, arr]) => ({ name, occurrences: arr }));
  return duplicates;
}

const files = walk(srcDir);
const report = [];
for (const f of files) {
  const dups = findDuplicatesInFile(f);
  if (dups.length) report.push({ file: f, dups });
}

if (!report.length) {
  console.log('No duplicate `export const` declarations found within files.');
  process.exit(0);
}

console.log('Duplicate export declarations report:');
for (const r of report) {
  console.log('\n' + path.relative(repoRoot, r.file));
  for (const d of r.dups) {
    console.log('  ', d.name, '(', d.occurrences.length, 'occurrences)');
    for (const occ of d.occurrences) {
      console.log('    value:', occ.value);
    }
  }
}

if (process.argv.includes('--fix')) {
  console.log('\nAttempting to auto-fix exact duplicate declarations (keeps first).');
  for (const r of report) {
    let src = fs.readFileSync(r.file, 'utf8');
    let patched = src;
    // For each duplicate group, remove later occurrences if value is identical to the first
    for (const d of r.dups) {
      const first = d.occurrences[0];
      for (let i = 1; i < d.occurrences.length; i++) {
        const occ = d.occurrences[i];
        if (occ.value === first.value) {
          // Remove the occurrence line
          const reLine = new RegExp('export\\s+const\\s+' + d.name + '\\s*=\\s*' + escapeRegExp(occ.value) + '\\s*;\\s*\\n?', '');
          patched = patched.replace(reLine, '');
        }
      }
    }
    if (patched !== src) {
      fs.writeFileSync(r.file, patched, 'utf8');
      console.log('Fixed', path.relative(repoRoot, r.file));
    } else {
      console.log('No safe fixes for', path.relative(repoRoot, r.file));
    }
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
