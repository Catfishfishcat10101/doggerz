#!/usr/bin/env node
// scripts/check-jsx-syntax.mjs
// Parse all .jsx files in src/ using @babel/parser to detect syntax errors

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import parser from "@babel/parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.resolve(__dirname, "../src");

function collectJsxFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...collectJsxFiles(full));
    } else if (e.isFile() && full.endsWith(".jsx")) {
      results.push(full);
    }
  }
  return results;
}

function checkFile(file) {
  const code = fs.readFileSync(file, "utf8");
  try {
    parser.parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "classProperties",
        "optionalChaining",
        "nullishCoalescingOperator",
      ],
    });
    return null;
  } catch (err) {
    return err.message;
  }
}

const files = fs.existsSync(SRC) ? collectJsxFiles(SRC) : [];

if (!files.length) {
  console.log("No .jsx files found under src/");
  process.exit(0);
}

let errors = 0;
for (const f of files) {
  const msg = checkFile(f);
  if (msg) {
    errors++;
    console.error(
      `SYNTAX ERROR in ${path.relative(process.cwd(), f)}:\n  ${msg}\n`,
    );
  }
}

if (errors === 0) {
  console.log("All .jsx files parsed successfully.");
  process.exit(0);
} else {
  console.error(`Found ${errors} file(s) with syntax errors.`);
  process.exit(2);
}
