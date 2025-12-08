const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const cfgPath = path.resolve(__dirname, "..", "tailwind.config.cjs");
const cfg = require(cfgPath);

const file = path.resolve(__dirname, "..", "src", "index.css");
const bak = file + ".bak.unknown-apply";
if (!fs.existsSync(bak)) fs.writeFileSync(bak, fs.readFileSync(file, "utf8"));
let src = fs.readFileSync(file, "utf8");

// Find all @apply(...) or @apply ...; occurrences
const applyRegex = /@apply([^;]+);/g;

async function tokenWorks(token) {
  const css = `@tailwind utilities;\n.__tw_test__{ @apply ${token}; }`;
  try {
    await postcss([tailwind({ config: cfg }), autoprefixer]).process(css, {
      from: "inline",
    });
    return true;
  } catch (err) {
    return false;
  }
}

(async () => {
  let changed = false;
  const out = [];
  let lastIndex = 0;
  applyRegex.lastIndex = 0;
  for (;;) {
    const match = applyRegex.exec(src);
    if (!match) break;
    const start = match.index;
    const end = applyRegex.lastIndex;
    out.push(src.slice(lastIndex, start));
    const inner = match[1].trim();
    const parts = inner.split(/\s+/).filter(Boolean);
    const keep = [];
    const removed = [];
    // Test tokens sequentially to avoid heavy parallel runs
    for (const p of parts) {
      if (!p) continue;
      try {
        // eslint-disable-next-line no-await-in-loop
        const ok = await tokenWorks(p);
        if (ok) keep.push(p);
        else removed.push(p);
      } catch (e) {
        removed.push(p);
      }
    }
    if (removed.length > 0) {
      changed = true;
      console.log("Removed unknown @apply tokens:", removed.join(", "));
    }
    if (keep.length) out.push(`@apply ${keep.join(" ")};`);
    // if nothing kept, just remove the whole @apply
    lastIndex = end;
  }
  out.push(src.slice(lastIndex));
  const newSrc = out.join("");
  if (changed) {
    fs.writeFileSync(file, newSrc, "utf8");
    console.log("Wrote cleaned", file, "; backup at", bak);
  } else {
    console.log("No unknown @apply tokens found/removed.");
  }
})();
