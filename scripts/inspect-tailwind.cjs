const path = require("path");
const cfgPath = path.resolve(__dirname, "..", "tailwind.config.cjs");
console.log("Loading tailwind config from", cfgPath);
try {
  const cfg = require(cfgPath);
  console.log("Export keys on config:", Object.keys(cfg));
  console.log("\ncontent:", cfg.content);
  console.log(
    "\nHas safelist:",
    !!cfg.safelist,
    "safelist length:",
    (cfg.safelist || []).length,
  );
  // Attempt to print theme.colors if present
  const theme = cfg.theme || cfg;
  console.log("\nTop-level theme keys:", Object.keys(theme));
  if (theme.colors) {
    const keys = Object.keys(theme.colors).slice(0, 40);
    console.log("\nColors keys (first 40):", keys.join(", "));
    if (theme.colors.zinc) {
      console.log(
        "\nzinc.950 (theme.colors):",
        theme.colors.zinc[950] || theme.colors.zinc["950"],
      );
    }
  } else {
    console.log(
      "\nNo theme.colors in config (colors likely inherited or not set)",
    );
  }

  if (theme.extend && theme.extend.colors) {
    const extKeys = Object.keys(theme.extend.colors).slice(0, 40);
    console.log("\nextend.colors keys (first 40):", extKeys.join(", "));
    if (theme.extend.colors.zinc) {
      console.log(
        "\nzinc.950 (extend.colors):",
        theme.extend.colors.zinc[950] || theme.extend.colors.zinc["950"],
      );
    }
  } else {
    console.log("\nNo extend.colors in config");
  }
} catch (e) {
  console.error("Failed to load config:", e && (e.stack || e));
  process.exit(2);
}
