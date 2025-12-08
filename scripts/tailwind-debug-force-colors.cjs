const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");

const cfgPath = path.resolve(__dirname, "..", "tailwind.config.cjs");
console.log("Loading config from", cfgPath);
const cfg = require(cfgPath);
const twColors = require("tailwindcss/colors");

// Ensure top-level theme.colors exists and includes zinc/emerald
cfg.theme = cfg.theme || {};
// Start with the canonical tailwind colors, then apply any extend.colors
cfg.theme.colors = Object.assign(
  {},
  twColors,
  (cfg.theme.extend && cfg.theme.extend.colors) || {}
);

console.log(
  "Forced top-level theme.colors keys:",
  Object.keys(cfg.theme.colors).slice(0, 20)
);

const INPUT = "src/index.css";
const OUTPUT = "tmp.force-output.css";

try {
  const css = fs.readFileSync(INPUT, "utf8");
  postcss([tailwind({ config: cfg }), autoprefixer()])
    .process(css, { from: INPUT })
    .then((result) => {
      fs.writeFileSync(OUTPUT, result.css, "utf8");
      console.log(
        "Force-colors Tailwind processing succeeded — output written to",
        OUTPUT
      );
      // quick grep for .bg-zinc-950
      const out = result.css;
      if (out.indexOf(".bg-zinc-950") !== -1) {
        console.log("Found .bg-zinc-950 in output");
        process.exit(0);
      } else {
        console.log("Did NOT find .bg-zinc-950 in output");
        process.exit(2);
      }
    })
    .catch((err) => {
      console.error(
        "Force-colors run failed:",
        err && err.stack ? err.stack : err
      );
      process.exit(3);
    });
} catch (e) {
  console.error("Failed to read input or run postcss:", e.stack || e);
  process.exit(4);
}
