#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const auditPath = path.join(repoRoot, "tmp", "full-audit.json");
const backupDir = path.join(repoRoot, "tmp", "unused-backup");

function loadAudit() {
  if (!fs.existsSync(auditPath)) {
    console.error(
      "Audit report not found. Run `node scripts/full-audit.js` first.",
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(auditPath, "utf8"));
}

function moveFile(relPath) {
  const src = path.join(repoRoot, relPath);
  if (!fs.existsSync(src)) {
    console.warn("Source missing", relPath);
    return;
  }
  const dest = path.join(backupDir, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log("Moved", relPath, "->", path.relative(repoRoot, dest));
}

function main() {
  const audit = loadAudit();
  const toMove = new Set();

  // Move unused files
  (audit.unusedFiles || []).forEach((f) => toMove.add(f));

  // For exact duplicates: if none of them are referenced (all unused), move all but keep first
  (audit.exactDuplicates || []).forEach((group) => {
    const files = group.files;
    // check for any referenced file
    // our audit doesn't include direct reference map for duplicates, so we will conservatively keep the first
    for (let i = 1; i < files.length; i++) {
      toMove.add(files[i]);
    }
  });

  // For similar image groups, don't auto-move — only report.

  if (toMove.size === 0) {
    console.log("No candidates to move. Nothing to do.");
    return;
  }

  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  console.log("Planned moves:", Array.from(toMove));
  if (!apply) {
    console.log(
      "\nDRY RUN: no files moved. Re-run with `--apply` to perform moves.",
    );
    return;
  }

  // perform moves
  fs.mkdirSync(backupDir, { recursive: true });
  for (const f of toMove) moveFile(f);

  console.log(
    "\nMove complete. Please run `git status` and review changes, then commit.",
  );
}

main();
