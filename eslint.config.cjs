module.exports = [
  // Minimal flat config to satisfy ESLint v9+ expectation and ignore snapshots
  {
    ignores: ["node_modules/**", "audit-snapshots/**"],
  },
  // Treat tailwind config as module so ESM-style exports parse correctly
  {
    files: ["tailwind.config.cjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
];
