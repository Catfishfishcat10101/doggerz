const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");

const cfgPath = path.resolve(__dirname, "..", "tailwind.config.cjs");
const cfg = require(cfgPath);

// If the config doesn't define top-level theme.colors, inject tailwindcss/colors
if (!cfg.theme || !cfg.theme.colors) {
  const twColors = require("tailwindcss/colors");
  cfg.theme = cfg.theme || {};
  cfg.theme.colors = Object.assign(
    {},
    twColors,
    (cfg.theme.extend && cfg.theme.extend.colors) || {},
  );
  console.log("Injected top-level theme.colors for utilities generation");
}

const mini = "@tailwind utilities;";

postcss([tailwind({ config: cfg }), autoprefixer()])
  .process(mini, { from: "inline" })
  .then((res) => {
    fs.writeFileSync("tmp.utilities.css", res.css, "utf8");
    console.log("Wrote tmp.utilities.css");
    if (res.css.indexOf(".bg-zinc-950") !== -1) {
      console.log("FOUND .bg-zinc-950 in utilities output");
      process.exit(0);
    } else {
      console.log("Did NOT find .bg-zinc-950 in utilities output");
      // write a small snippet of first 5000 chars for inspection
      console.log(res.css.slice(0, 5000));
      process.exit(2);
    }
  })
  .catch((err) => {
    console.error(
      "Utilities generation failed:",
      err && err.stack ? err.stack : err,
    );
    process.exit(3);
  });
