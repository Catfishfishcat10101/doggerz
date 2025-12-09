const fs = require("fs");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const autoprefixer = require("autoprefixer");

const cfg = {
  theme: {
    colors: {
      zinc: {
        950: "#0b0b0b",
      },
    },
  },
};

const mini = "@tailwind utilities;";

postcss([tailwind({ config: cfg }), autoprefixer()])
  .process(mini, { from: "inline" })
  .then((res) => {
    fs.writeFileSync("tmp.simple-colors.css", res.css, "utf8");
    console.log("Wrote tmp.simple-colors.css");
    if (res.css.indexOf(".bg-zinc-950") !== -1) {
      console.log("FOUND .bg-zinc-950 in simple colors output");
      process.exit(0);
    } else {
      console.log("Did NOT find .bg-zinc-950 in simple colors output");
      console.log(res.css.slice(0, 2000));
      process.exit(2);
    }
  })
  .catch((err) => {
    console.error(
      "Simple colors run failed:",
      err && err.stack ? err.stack : err,
    );
    process.exit(3);
  });
