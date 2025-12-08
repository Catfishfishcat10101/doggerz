const fs = require("fs");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");

const INPUT = "src/index.css";
const OUTPUT = "tmp.tailwind.css";

try {
  const css = fs.readFileSync(INPUT, "utf8");
  // pass explicit config path to the adapter to avoid resolution edge-cases
  postcss([tailwind({ config: "./tailwind.config.cjs" }), autoprefixer()])
    .process(css, { from: INPUT })
    .then((result) => {
      fs.writeFileSync(OUTPUT, result.css, "utf8");
      console.log("Tailwind processing succeeded — output written to", OUTPUT);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Tailwind/PostCSS processing failed:");
      if (err.stack) console.error(err.stack);
      else console.error(err);

      // Try a minimal reproduction to see whether utilities can be generated at all
      const mini = "@tailwind utilities; .__tw_test__{ @apply bg-zinc-950 }";
      console.log(
        "\nAttempting minimal reproduction: processing a utilities-only CSS string...",
      );
      console.log(
        "\nAttempting minimal reproduction: processing a utilities-only CSS string for `h-full`...",
      );
      const mini1 = "@tailwind utilities; .__tw_test__{ @apply h-full }";
      postcss([tailwind({ config: "./tailwind.config.cjs" }), autoprefixer()])
        .process(mini1, { from: "inline" })
        .then((r) => {
          fs.writeFileSync("tmp.mini-hfull.css", r.css, "utf8");
          console.log("Mini-hfull run succeeded — wrote tmp.mini-hfull.css");
          // Now test the color-based apply
          console.log("Now testing color utility application `bg-zinc-950`...");
          const mini2 =
            "@tailwind utilities; .__tw_test__{ @apply bg-zinc-950 }";
          return postcss([
            tailwind({ config: "./tailwind.config.cjs" }),
            autoprefixer(),
          ]).process(mini2, { from: "inline" });
        })
        .then((r2) => {
          fs.writeFileSync("tmp.mini-bg.css", r2.css, "utf8");
          console.log("Mini-bg run succeeded — wrote tmp.mini-bg.css");
          process.exit(0);
        })
        .catch((err2) => {
          console.error("Mini run failed:");
          if (err2.stack) console.error(err2.stack);
          else console.error(err2);
          process.exit(2);
        });
    });
} catch (e) {
  console.error("Failed to read input file or run PostCSS:", e.stack || e);
  process.exit(3);
}
