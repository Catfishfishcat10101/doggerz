#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const spritesDir = path.join(
  repoRoot,
  "src",
  "assets",
  "sprites",
  "jackrussell",
);
const outPath = path.join(repoRoot, "tmp", "sprite-audit.json");

function listFiles(dir) {
  return fs.readdirSync(dir).filter((f) => !f.startsWith("."));
}

function getAllSearchFiles(root) {
  const exts = [".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css"];
  const files = [];
  function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((ent) => {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) return walk(p);
      if (exts.includes(path.extname(ent.name))) files.push(p);
    });
  }
  walk(root);
  return files;
}

function runAudit() {
  if (!fs.existsSync(spritesDir)) {
    console.error("Sprites dir not found:", spritesDir);
    process.exit(1);
  }
  const sprites = listFiles(spritesDir);
  const searchFiles = getAllSearchFiles(path.join(repoRoot, "src"));

  const results = sprites.map((name) => ({ name, usedIn: [] }));

  for (const f of searchFiles) {
    const content = fs.readFileSync(f, "utf8");
    for (const r of results) {
      if (
        content.includes(r.name) ||
        content.includes(path.join("jackrussell", r.name))
      ) {
        r.usedIn.push(path.relative(repoRoot, f));
      }
    }
  }

  const used = results.filter((r) => r.usedIn.length > 0);
  const unused = results.filter((r) => r.usedIn.length === 0);

  const report = {
    generatedAt: new Date().toISOString(),
    spritesDir: path.relative(repoRoot, spritesDir),
    total: results.length,
    used: used.length,
    unused: unused.length,
    usedList: used,
    unusedList: unused,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log("Audit complete. Report written to", outPath);
  console.log(
    `Total: ${report.total}  Used: ${report.used}  Unused: ${report.unused}`,
  );
  if (unused.length) {
    console.log("\nUnused files:");
    unused.forEach((u) => console.log(" -", u.name));
  }
}

runAudit();
