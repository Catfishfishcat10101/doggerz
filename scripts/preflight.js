#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { builtinModules } = require("node:module");

const ROOT = process.cwd();
const SRC_DIRS = ["src"];
const SOURCE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

function walk(dir, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(rel, out);
      continue;
    }
    if (SOURCE_EXTS.has(path.extname(entry.name))) out.push(rel);
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function collectBareImports(sourceText) {
  const results = new Set();
  const importLike = [
    /(?:import|export)\s+[^'"]*?from\s+["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const rx of importLike) {
    let m;
    while ((m = rx.exec(sourceText))) {
      const spec = String(m[1] || "").trim();
      if (!spec || spec.startsWith(".") || spec.startsWith("/")) continue;
      if (spec.startsWith("@/")) continue;
      results.add(spec);
    }
  }
  return results;
}

function packageNameFromSpecifier(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
  }
  return spec.split("/")[0];
}

function isBuiltin(pkg) {
  if (builtinModules.includes(pkg)) return true;
  if (pkg.startsWith("node:")) return true;
  return false;
}

function assertFilesExist(files) {
  const missing = files.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) {
    throw new Error(
      `Missing required files:\n${missing.map((f) => `- ${f}`).join("\n")}`
    );
  }
}

function extractViteKeys(text) {
  const keys = new Set();
  const rx = /VITE_[A-Z0-9_]*[A-Z0-9]/g;
  let m;
  while ((m = rx.exec(text))) keys.add(m[0]);
  return keys;
}

function collectRuntimeEnvKeysFromSource(text) {
  const keys = new Set();
  const patterns = [
    /import\.meta\.env\.(VITE_[A-Z0-9_]+)\b/g,
    /getEnv\(\s*["'](VITE_[A-Z0-9_]+)["']\s*\)/g,
  ];
  for (const rx of patterns) {
    let m;
    while ((m = rx.exec(text))) keys.add(m[1]);
  }
  return keys;
}

function ensureEnvExampleCoverage() {
  const envExamplePath = path.join(ROOT, ".env.example");
  if (!fs.existsSync(envExamplePath)) {
    throw new Error("Missing .env.example");
  }
  const envText = fs.readFileSync(envExamplePath, "utf8");
  const declared = extractViteKeys(envText);
  const files = walk("src");
  const discovered = new Set();

  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const k of collectRuntimeEnvKeysFromSource(text)) discovered.add(k);
  }

  const missing = [...discovered].filter((k) => !declared.has(k)).sort();
  if (missing.length) {
    throw new Error(
      `.env.example is missing VITE_* keys used in source:\n${missing
        .map((k) => `- ${k}`)
        .join("\n")}`
    );
  }
}

function ensureTopLevelRouteRenderHealth() {
  const mainPath = path.join(ROOT, "src/main.jsx");
  const routerPath = path.join(ROOT, "src/AppRouter.jsx");
  const mainText = fs.readFileSync(mainPath, "utf8");
  const routerText = fs.readFileSync(routerPath, "utf8");

  const checks = [
    {
      ok: /<AppRouter\s*\/>/.test(mainText),
      msg: "src/main.jsx must render <AppRouter /> at top level.",
    },
    {
      ok: /createBrowserRouter/.test(routerText),
      msg: "src/AppRouter.jsx must define createBrowserRouter routes.",
    },
    {
      ok:
        /path:\s*PATHS\.HOME/.test(routerText) &&
        /path:\s*PATHS\.GAME/.test(routerText),
      msg: "src/AppRouter.jsx must include PATHS.HOME and PATHS.GAME route roots.",
    },
  ];

  const failed = checks.filter((c) => !c.ok).map((c) => c.msg);
  if (failed.length) {
    throw new Error(
      `Top-level route health checks failed:\n${failed.map((m) => `- ${m}`).join("\n")}`
    );
  }
}

async function verifyRuntimeModules(checks) {
  const failures = [];
  for (const check of checks) {
    try {
      const mod = await import(check.pkg);
      if (check.exportName && !(check.exportName in mod)) {
        failures.push(`${check.pkg} missing export "${check.exportName}"`);
      }
    } catch (error) {
      failures.push(
        `${check.pkg} failed to load (${error?.message || "unknown error"})`
      );
    }
  }
  if (failures.length) {
    throw new Error(
      `Runtime module checks failed:\n${failures.map((x) => `- ${x}`).join("\n")}`
    );
  }
}

async function main() {
  assertFilesExist([
    "package.json",
    "src/redux/store.js",
    "src/features/game/DogAIEngine.jsx",
  ]);
  ensureEnvExampleCoverage();
  ensureTopLevelRouteRenderHealth();

  const pkg = readJson("package.json");
  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  const files = SRC_DIRS.flatMap((d) => walk(d));
  const imports = new Set();
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const spec of collectBareImports(text)) {
      imports.add(packageNameFromSpecifier(spec));
    }
  }

  const missingDeps = [...imports]
    .filter((pkgName) => !isBuiltin(pkgName))
    .filter((pkgName) => !declared.has(pkgName))
    .sort();

  if (missingDeps.length) {
    throw new Error(
      `Undeclared package imports found:\n${missingDeps.map((d) => `- ${d}`).join("\n")}`
    );
  }

  await verifyRuntimeModules([
    { pkg: "@capacitor/app", exportName: "App" },
    { pkg: "@capacitor/preferences", exportName: "Preferences" },
    { pkg: "@reduxjs/toolkit", exportName: "configureStore" },
  ]);

  console.log(
    `[preflight] OK - scanned ${files.length} source files; dependency + runtime checks passed.`
  );
}

main().catch((error) => {
  console.error(`[preflight] FAILED\n${error.message}`);
  process.exit(1);
});
