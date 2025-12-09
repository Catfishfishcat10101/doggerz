const fs = require("fs");
const path = require("path");
const colors = require("tailwindcss/colors");

const file = path.resolve(__dirname, "..", "src", "index.css");
const bak = file + ".bak";
if (!fs.existsSync(bak)) fs.writeFileSync(bak, fs.readFileSync(file, "utf8"));
let src = fs.readFileSync(file, "utf8");

const map = {
  "bg-zinc-950": `background-color: ${colors.zinc["950"]};`,
  "text-zinc-50": `color: ${colors.zinc["50"]};`,
  "border-zinc-800": `border-color: ${colors.zinc["800"]};`,
  "ring-offset-zinc-950": `--tw-ring-offset-color: ${colors.zinc["950"]};`,
  "ring-emerald-400": `--tw-ring-color: ${colors.emerald["400"]};`,
  "bg-emerald-500": `background-color: ${colors.emerald["500"]};`,
  "text-zinc-950": `color: ${colors.zinc["950"]};`,
  "bg-emerald-400": `background-color: ${colors.emerald["400"]};`,
  "text-emerald-400": `color: ${colors.emerald["400"]};`,
  "text-emerald-300": `color: ${colors.emerald["300"]};`,
  "text-zinc-400": `color: ${colors.zinc["400"]};`,
  "border-emerald-500/60": `border-color: ${colors.emerald["500"]} / 0.6;`,
  "shadow-emerald-500/40": `box-shadow: 0 0 25px ${colors.emerald["500"]} / 0.4;`,
  // opacity variants: approximate using `/ <alpha>` CSS color syntax
  "bg-zinc-900/60": `background-color: ${colors.zinc["900"]} / 0.6;`,
  "bg-zinc-900/80": `background-color: ${colors.zinc["900"]} / 0.8;`,
  "border-zinc-700/80": `border-color: ${colors.zinc["700"]} / 0.8;`,
  "bg-emerald-500/10": `background-color: ${colors.emerald["500"]} / 0.1;`,
};

// Replace occurrences within @apply statements
src = src.replace(/@apply([^;]+);/g, (m, inner) => {
  const parts = inner.trim().split(/\s+/).filter(Boolean);
  const keep = [];
  const inserts = [];
  for (const p of parts) {
    if (map[p]) inserts.push(map[p]);
    else keep.push(p);
  }
  const keepStr = keep.length ? `@apply ${keep.join(" ")};` : "";
  const insertStr = inserts.length ? `\n    ${inserts.join("\n    ")}` : "";
  return `${keepStr}${insertStr}`;
});

fs.writeFileSync(file, src, "utf8");
console.log("Patched src/index.css; backup at", bak);
