#!/usr/bin/env node
// scripts/find-undeclared.mjs
// Heuristic scanner to find UPPER_CASE identifiers that may be used but not imported/declared.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(__filename, "..", "..");
const srcDir = path.join(repoRoot, "src");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (st.isFile() && /\.(js|jsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function extractImports(content) {
  const imports = new Set();
  const re = /^\s*import\s+([^'";]+)\s+from\s+['"][^'"]+['"];?/gm;
  let m;
  while ((m = re.exec(content))) {
    const spec = m[1].trim();
    // default import or named imports or namespace
    if (/^\w+$/.test(spec)) {
      imports.add(spec);
    } else if (/^\{/.test(spec)) {
      // { A, B as C }
      const names = spec
        .replace(/[{}]/g, "")
        .split(",")
        .map((s) => s.trim());
      for (const n of names) {
        const parts = n.split(/\s+as\s+/i).map((p) => p.trim());
        imports.add(parts[1] || parts[0]);
      }
    } else if (/^\*\s+as\s+/.test(spec)) {
      const ns = spec.split(/\s+as\s+/)[1].trim();
      imports.add(ns);
    }
  }
  return imports;
}

function extractDeclared(content) {
  const decl = new Set();
  const re = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m;
  while ((m = re.exec(content))) decl.add(m[1]);
  const re2 = /function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = re2.exec(content))) decl.add(m[1]);
  const re3 = /class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = re3.exec(content))) decl.add(m[1]);
  const re4 =
    /export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = re4.exec(content))) decl.add(m[1]);
  return decl;
}

function extractUpperTokens(content) {
  // sanitize content by stripping string literals, template literals, and comments
  let sanitized = content
    .replace(/\/\/.*$/gm, "") // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/(['"])(?:\\.|(?!\1).)*\1/g, "") // single/double quoted strings
    .replace(/`(?:\\.|[^`])*`/g, ""); // template literals

  // Remove JSX text nodes between tags (e.g. >TBD< or >ZIP<)
  sanitized = sanitized.replace(/>[^<>]*</g, "><");

  const re = /\b([A-Z][A-Z0-9_]{2,})\b/g;
  const out = new Set();
  let m;
  while ((m = re.exec(sanitized))) out.add(m[1]);
  return out;
}

const KNOWN_GLOBALS = new Set([
  "Date",
  "Math",
  "JSON",
  "Promise",
  "Array",
  "Object",
  "console",
  "window",
  "document",
  "self",
  "navigator",
  "fetch",
  "import",
  "require",
  "module",
  "process",
  "URL",
]);

// Collect exported identifiers from src/constants and src/config so they're not flagged
function collectExportsFromDir(dir) {
  const out = new Set();
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!fs.statSync(full).isFile()) continue;
    if (!/\.(js|jsx)$/.test(name)) continue;
    const src = fs.readFileSync(full, "utf8");
    // export const NAME =
    const re1 = /export\s+(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let m;
    while ((m = re1.exec(src))) out.add(m[1]);
    // export function NAME(
    const re2 = /export\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    while ((m = re2.exec(src))) out.add(m[1]);
    // export class NAME
    const re3 = /export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    while ((m = re3.exec(src))) out.add(m[1]);
    // export { A, B as C }
    const re4 = /export\s*\{([^}]+)\}/g;
    while ((m = re4.exec(src))) {
      const names = m[1].split(",").map((s) => s.trim());
      for (const n of names) {
        const parts = n.split(/\s+as\s+/i).map((p) => p.trim());
        out.add(parts[1] || parts[0]);
      }
    }
    // export default NAME (we'll not try to infer default names)
  }
  return out;
}

const CONST_EXPORTS = collectExportsFromDir(path.join(srcDir, "constants"));
const CONFIG_EXPORTS = collectExportsFromDir(path.join(srcDir, "config"));

const files = walk(srcDir);
const report = [];
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const imports = extractImports(content);
  const decl = extractDeclared(content);
  const uppers = extractUpperTokens(content);
  const suspects = [];
  for (const token of uppers) {
    if (KNOWN_GLOBALS.has(token)) continue;
    // ignore Vite/env style keys (import.meta.env.VITE_*) and other env-style tokens
    if (/^VITE_/.test(token) || /^VITE/.test(token)) continue;
    // ignore tokens exported from src/constants or src/config
    if (CONST_EXPORTS.has(token) || CONFIG_EXPORTS.has(token)) continue;
    if (imports.has(token)) continue;
    if (decl.has(token)) continue;
    // also allow tokens that are present as properties like SOME_CONST.SOMETHING -> skip if file contains 'SOME_CONST.'? we'll still flag
    suspects.push(token);
  }
  if (suspects.length) report.push({ file: f, suspects });
}

if (!report.length) {
  console.log("No suspicious undeclared UPPER_CASE tokens found.");
  process.exit(0);
}

console.log("Potential undeclared UPPER_CASE tokens (heuristic):");
for (const r of report) {
  console.log("\n", path.relative(repoRoot, r.file));
  console.log("  ", r.suspects.join(", "));
}

console.log(
  "\nReview the listed tokens in each file — they may be constants expected to be imported or defined elsewhere.",
);
process.exit(0);
